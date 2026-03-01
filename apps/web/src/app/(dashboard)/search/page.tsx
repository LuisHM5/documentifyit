export default function SearchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="relative">
        <input
          type="search"
          placeholder="Search documents..."
          className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Search results — wire up in next iteration */}
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Enter a search term to find documents.</p>
      </div>
    </div>
  );
}
