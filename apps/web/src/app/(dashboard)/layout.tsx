'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Route } from 'next';

const navItems: Array<{ href: Route; label: string }> = [
  { href: '/documents' as Route, label: 'Documents' },
  { href: '/templates' as Route, label: 'Templates' },
  { href: '/search' as Route, label: 'Search' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-64 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold">DocumentifyIt</h2>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                pathname.startsWith(item.href as string)
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={() => void handleLogout()}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
