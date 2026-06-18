export function EmptyConversationBanner() {
  return (
    <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      <div className="w-full max-w-2xl rounded-3xl bg-background p-5 md:p-6">
        <div className="grid gap-4 rounded-2xl bg-muted/40 p-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-center md:gap-6">
          <img
            src="/banner-content.jpg"
            alt="Collaborative workspace with messages"
            className="h-40 w-full rounded-2xl object-cover md:h-full"
          />
          <div className="space-y-2 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Welcome to Chat
            </p>
            <h2 className="text-balance text-lg font-semibold text-foreground md:text-xl">
              Pick a conversation to begin
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open a conversation from the sidebar and start sending messages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
