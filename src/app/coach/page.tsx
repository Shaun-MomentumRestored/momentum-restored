"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Clock, Trophy, AlertTriangle, BarChart3, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AddClientDialog from "@/components/coach/AddClientDialog";
import { timeAgo } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  slug: string;
  createdAt: string;
  lastActive: string;
  completionPct: number | null;
  abandonedCount: number;
  winsThisMonth: number;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-dark-green transition-colors"
      title="Copy portal URL"
    >
      {copied ? <Check className="h-3 w-3 text-bright-green" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy URL"}
    </button>
  );
}

export default function CoachDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coach/clients")
      .then((r) => r.json())
      .then((d: Client[]) => { setClients(d); setLoading(false); });
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Clients</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">
            {clients.length} client{clients.length !== 1 ? "s" : ""} on programme
          </p>
        </div>
        <AddClientDialog onAdd={(c) => setClients((prev) => [c, ...prev])} />
      </div>

      {loading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-white animate-pulse border border-[var(--border-color)]" />
          ))}
        </div>
      )}

      {!loading && clients.length === 0 && (
        <div className="text-center py-16 text-[var(--muted)]">
          <Users className="h-14 w-14 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-navy">No clients yet</p>
          <p className="text-sm mt-1">Add your first client to get started</p>
        </div>
      )}

      <div className="grid gap-4">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/coach/client/${client.id}`}
            className="block bg-white rounded-lg border border-[var(--border-color)] p-4 hover:border-dark-green/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-navy text-lg">{client.name}</h2>
                  <span className="text-xs text-[var(--muted)]">{client.email}</span>
                </div>

                <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--muted)]">
                  <Clock className="h-3 w-3" />
                  Last active {timeAgo(client.lastActive)}
                  <span className="mx-1">·</span>
                  <span className="text-xs font-mono text-[var(--muted)]">
                    /client/{client.slug}
                  </span>
                  <CopyButton text={`${origin}/client/${client.slug}`} />
                </div>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-dark-green" />
                    <span className="text-sm font-medium text-navy">
                      {client.completionPct !== null ? `${client.completionPct}%` : "—"}
                    </span>
                    <span className="text-xs text-[var(--muted)]">tasks this week</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-bright-green" />
                    <span className="text-sm font-medium text-navy">{client.winsThisMonth}</span>
                    <span className="text-xs text-[var(--muted)]">wins this month</span>
                  </div>
                  {client.abandonedCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600">
                        {client.abandonedCount}
                      </span>
                      <span className="text-xs text-[var(--muted)]">abandoned this week</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                {client.completionPct !== null && (
                  <div className="text-2xl font-bold text-dark-green">
                    {client.completionPct}%
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
