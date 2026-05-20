"use client";

import { useEffect, useState } from "react";
import { Trophy, PoundSterling } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Win {
  id: string;
  category: string;
  headline: string;
  value: number | null;
  detail: string | null;
  shareOk: boolean;
  createdAt: string;
  client: { name: string };
}

export default function MarketingWins() {
  const [wins, setWins] = useState<Win[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coach/wins")
      .then((r) => r.json())
      .then((d: Win[]) => { setWins(d); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Marketing Wins</h1>
        <p className="text-[var(--muted)] text-sm mt-0.5">
          Client wins approved for marketing use
        </p>
      </div>

      {loading && (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-white animate-pulse border border-[var(--border-color)]" />
          ))}
        </div>
      )}

      {!loading && wins.length === 0 && (
        <div className="text-center py-16 text-[var(--muted)]">
          <Trophy className="h-14 w-14 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-navy">No shareable wins yet</p>
          <p className="text-sm mt-1">Clients who check &ldquo;Share OK&rdquo; will appear here</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {wins.map((win) => (
          <div key={win.id} className="bg-white rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="secondary">{win.category}</Badge>
                  <span className="text-xs text-[var(--muted)]">{win.client.name}</span>
                </div>
                <p className="font-semibold text-navy">{win.headline}</p>
                {win.value !== null && (
                  <p className="text-bright-green font-bold text-xl mt-1">
                    £{win.value.toLocaleString("en-GB")}
                  </p>
                )}
                {win.detail && (
                  <p className="text-sm text-[var(--muted)] mt-1">{win.detail}</p>
                )}
                <p className="text-xs text-[var(--muted)] mt-2">
                  {new Date(win.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
