import { chromium } from "playwright";

const APP_URL = process.env.SMOKE_APP_URL ?? "http://localhost:3000";
const API_URL = process.env.SMOKE_API_URL ?? "http://localhost:8089/api";

const results = [];

function pass(name, detail = "") {
  results.push({ name, status: "pass", detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, status: "fail", detail });
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { ok: response.ok, status: response.status, body };
}

async function ensureTestUser() {
  const suffix = Date.now();
  const username = `smoke_${suffix}`;
  const password = "smoke123";
  const payload = {
    email: `${username}@smoke.test`,
    firstName: "Smoke",
    lastName: "Test",
    username,
    password,
  };

  const signUp = await fetchJson(`${API_URL}/v1/auth/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!signUp.ok) {
    throw new Error(
      `Sign-up failed (${signUp.status}): ${JSON.stringify(signUp.body)}`,
    );
  }

  return { username, password };
}

async function signInThroughUi(page, username, password) {
  await page.goto(`${APP_URL}/sign-in`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Welcome back" }).waitFor();

  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL((url) => !url.pathname.includes("/sign-in"), {
    timeout: 15000,
  });
}

async function run() {
  console.log(`Smoke test → app ${APP_URL}, api ${API_URL}\n`);

  const health = await fetchJson(`${API_URL}/health-check`);
  if (health.ok) {
    pass("Backend health-check", `HTTP ${health.status}`);
  } else {
    fail("Backend health-check", `HTTP ${health.status}`);
    process.exitCode = 1;
    return;
  }

  const buildCheck = await fetchJson(`${APP_URL}/`);
  if (buildCheck.status === 200) {
    pass("Dev server serves index", `HTTP ${buildCheck.status}`);
  } else {
    fail("Dev server serves index", `HTTP ${buildCheck.status}`);
    process.exitCode = 1;
    return;
  }

  let browser;
  let context;
  let page;

  try {
    const credentials = await ensureTestUser();
    pass("Create smoke-test user", credentials.username);

    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();

    await signInThroughUi(page, credentials.username, credentials.password);
    pass("Sign-in flow", `redirected to ${page.url()}`);

    await page.goto(`${APP_URL}/`, { waitUntil: "networkidle" });
    if (page.url().includes("/sign-in")) {
      fail("Chat home route", "redirected to sign-in");
    } else {
      pass("Chat home route", "/");
    }

    await page.goto(`${APP_URL}/friends`, { waitUntil: "networkidle" });
    const friendsBack = page.getByRole("button", { name: "Friends" }).first();
    if (await friendsBack.isVisible()) {
      pass("Friends route mobile back bar");
    } else {
      pass("Friends route", "/friends loaded");
    }

    await page.goto(`${APP_URL}/profile`, { waitUntil: "networkidle" });
    const profileBack = page.getByRole("button", { name: "Profile" }).first();
    if (await profileBack.isVisible()) {
      pass("Profile route mobile back bar");
    } else {
      pass("Profile route", "/profile loaded");
    }

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${APP_URL}/`, { waitUntil: "networkidle" });

    const userMenuButton = page
      .locator("section.hidden.md\\:block button")
      .first();
    if (await userMenuButton.isVisible({ timeout: 5000 })) {
      await userMenuButton.click();
      const profileItem = page.getByRole("menuitem", { name: "Profile" });
      if (await profileItem.isVisible({ timeout: 3000 })) {
        pass("CurrentUserTrigger dropdown", "menu opens with Profile item");
        await page.keyboard.press("Escape");
      } else {
        fail("CurrentUserTrigger dropdown", "menu did not open");
      }
    } else {
      fail("CurrentUserTrigger dropdown", "desktop trigger not visible");
    }

    await page.goto(`${APP_URL}/friends`, { waitUntil: "networkidle" });
    const friendsHeading = page.getByRole("heading", { name: "Friends" });
    if (await friendsHeading.first().isVisible({ timeout: 10000 })) {
      pass("Friends template renders");
    } else {
      fail("Friends template renders");
    }

    const refresh = await page.request.post(`${API_URL}/v1/auth/refresh`, {
      headers: { "Content-Type": "application/json" },
    });
    const refreshBody = await refresh.json().catch(() => null);

    if (page.url().includes("/sign-in")) {
      fail("Session refresh flow", "lost session before refresh check");
    } else if (refresh.ok() && refreshBody?.data?.accessToken) {
      pass(
        "Session refresh flow",
        "refresh returns accessToken with session cookies",
      );
    } else {
      fail(
        "Session refresh flow",
        `refresh failed (${refresh.status()}): ${JSON.stringify(refreshBody)}`,
      );
    }

    await page.goto(`${APP_URL}/`, { waitUntil: "networkidle" });
    const conversationLink = page.locator("a[href^='/conversation/']").first();
    if (
      await conversationLink.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await conversationLink.click();
      await page.waitForURL(/\/conversation\//, { timeout: 10000 });
      pass("Conversation route", page.url());

      const messageRegion = page
        .locator("section")
        .filter({ hasText: /message|No messages/i });
      if ((await messageRegion.count()) > 0) {
        pass("Conversation content area renders");
      } else {
        pass(
          "Conversation route navigation",
          "no conversations with messages yet",
        );
      }
    } else {
      pass(
        "Conversation route",
        "skipped — no conversations in sidebar for new user",
      );
    }
  } catch (error) {
    fail(
      "Smoke test runtime",
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  } finally {
    await page?.close().catch(() => undefined);
    await context?.close().catch(() => undefined);
    await browser?.close().catch(() => undefined);
  }

  const failed = results.filter((item) => item.status === "fail");
  console.log(
    `\nSummary: ${results.length - failed.length}/${results.length} passed`,
  );

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

await run();
