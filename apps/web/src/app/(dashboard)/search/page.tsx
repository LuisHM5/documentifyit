'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/lib/hooks/useSearch';
import { DocumentStatus } from '@documentifyit/shared';

function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: DocumentStatus.Draft, label: 'Draft' },
  { value: DocumentStatus.Submitted, label: 'Submitted' },
  { value: DocumentStatus.InReview, label: 'In Review' },
  { value: DocumentStatus.Approved, label: 'Approved' },
  { value: DocumentStatus.Rejected, label: 'Rejected' },
  { value: DocumentStatus.RevisionRequested, label: 'Revision Requested' },
  { value: DocumentStatus.Archived, label: 'Archived' },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [committed, setCommitted] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: results, isLoading, isFetching } = useSearch({
    q: committed,
    status: status || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCommitted(query.trim());
  };

  const handleClearFilters = () => {
    setStatus('');
    setFromDate('');
    setToDate('');
  };

  const hasFilters = status || fromDate || toDate;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Search</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) setCommitted('');
            }}
            placeholder="Search documents by title or content…"
            className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            Filters{hasFilters ? ' ●' : ''}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Updated after</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Updated before</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {hasFilters && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      {committed && (isLoading || isFetching) && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Searching…</p>
        </div>
      )}

      {committed && !isLoading && !isFetching && results && results.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No results for <strong>&quot;{committed}&quot;</strong>
            {hasFilters ? ' with the current filters.' : '.'}
          </p>
        </div>
      )}

      {!committed && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Enter a search term to find documents.</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {results.map((result) => (
              <button
                key={result.id}
                className="w-full px-4 py-3 text-left hover:bg-muted/50"
                onClick={() => router.push(`/documents/${result.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{result.title}</p>
                    {result.excerpt && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {result.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                      {result.status.replace('_', ' ')}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(result.updatedAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
