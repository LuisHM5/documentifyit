export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          DocumentifyIt
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          AI-powered document management platform with real-time editing,
          approval workflows, smart templates, and automated validation.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="/login"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
          >
            Get started
          </a>
          <a
            href="/dashboard/documents"
            className="rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
