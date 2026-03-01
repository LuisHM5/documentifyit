export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar — implement in next iteration */}
      <aside className="w-64 border-r border-border bg-card p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">DocumentifyIt</h2>
        </div>
        <nav className="space-y-1">
          {[
            { href: '/dashboard/documents', label: 'Documents' },
            { href: '/dashboard/templates', label: 'Templates' },
            { href: '/dashboard/search', label: 'Search' },
            { href: '/dashboard/settings', label: 'Settings' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
