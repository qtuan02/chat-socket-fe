export function EmptyConversationBanner() {
  return (
    <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      <div className="w-full max-w-2xl rounded-lg border border-border/70 bg-background p-5 shadow-sm md:p-6">
        <div className="grid gap-4 rounded-md border border-muted/80 bg-muted/30 p-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-center md:gap-6">
          <img
            src="/banner-content.jpg"
            alt="Collaborative workspace with messages"
            className="h-40 w-full rounded-md object-cover md:h-full"
          />
          <div className="space-y-2 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Welcome to Chat
            </p>
            <h2 className="text-balance text-lg font-semibold text-foreground md:text-xl">
              Pick a conversation to begin
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open a conversation from the sidebar, then send messages, share
              files, and keep the chat moving.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
