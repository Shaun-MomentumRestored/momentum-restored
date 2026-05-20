"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface JournalEntry {
  id: string;
  excuse: string;
  reality: string;
  action: string;
  createdAt: string;
}

export default function ExcuseJournal({ slug }: { slug: string }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ excuse: "", reality: "", action: "" });

  useEffect(() => {
    fetch(`/api/client/${slug}/journal`)
      .then((r) => r.json())
      .then((d: JournalEntry[]) => { setEntries(d); setLoading(false); });
  }, [slug]);

  const submit = async () => {
    if (!form.excuse.trim()) return;
    const res = await fetch(`/api/client/${slug}/journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const entry = await res.json() as JournalEntry;
      setEntries((prev) => [entry, ...prev]);
      setForm({ excuse: "", reality: "", action: "" });
      setShowForm(false);
    }
  };

  const deleteEntry = async (id: string) => {
    await fetch(`/api/client/${slug}/journal/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading…</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-start gap-3 p-4 bg-navy/5 rounded-lg border border-navy/20">
        <BookOpen className="h-6 w-6 text-navy shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-navy text-sm">Excuse vs Reality Journal</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Catch the stories you tell yourself. Name the excuse, face the reality, choose an action.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--muted)]">{entries.length} entr{entries.length !== 1 ? "ies" : "y"}</span>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Entry
        </Button>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12 text-[var(--muted)]">
          <p>No journal entries yet</p>
          <p className="text-xs mt-1">Start by naming an excuse you caught yourself making</p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-lg border border-[var(--border-color)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-dark-green/5 border-b border-[var(--border-color)]">
              <span className="text-xs text-[var(--muted)]">
                {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </span>
              <Button
                size="icon" variant="ghost"
                className="h-7 w-7 text-red-400 hover:text-red-600"
                onClick={() => deleteEntry(entry.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-red-500 uppercase mb-1">🚫 Excuse</p>
                <p className="text-sm text-navy">{entry.excuse}</p>
              </div>
              {entry.reality && (
                <div>
                  <p className="text-xs font-semibold text-navy/60 uppercase mb-1">💡 Reality</p>
                  <p className="text-sm text-navy">{entry.reality}</p>
                </div>
              )}
              {entry.action && (
                <div>
                  <p className="text-xs font-semibold text-dark-green uppercase mb-1">✅ Action</p>
                  <p className="text-sm text-navy">{entry.action}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <Label className="mb-1 block font-semibold text-red-600">🚫 The Excuse</Label>
              <Textarea
                placeholder="What story are you telling yourself? What are you avoiding?"
                value={form.excuse}
                onChange={(e) => setForm((f) => ({ ...f, excuse: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 block font-semibold text-navy/70">💡 The Reality</Label>
              <Textarea
                placeholder="What&apos;s actually true here?"
                value={form.reality}
                onChange={(e) => setForm((f) => ({ ...f, reality: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 block font-semibold text-dark-green">✅ The Action</Label>
              <Textarea
                placeholder="What will you do instead?"
                value={form.action}
                onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submit}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
