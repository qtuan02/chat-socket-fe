export function parseToJson<T>(jsonString: string) {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    console.error("Unable to parse json string.");
    return null;
  }
}
