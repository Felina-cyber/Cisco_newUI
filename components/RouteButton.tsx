'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function RouteButton({ query }: { query: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch('/api/agents/case-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Request failed');
      setResult(j);
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button onClick={run} disabled={loading} className="btn btn-ghost">
        <Sparkles className="h-4 w-4 mr-2" />
        {loading ? 'Routing...' : 'Route with AI'}
      </button>

      {(result || error) && (
        <div className="mt-3 rounded-xl border p-3 text-sm bg-gray-50">
          {error ? (
            <p className="text-rose-700">{error}</p>
          ) : (
            <pre className="whitespace-pre-wrap text-gray-800">
{JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
