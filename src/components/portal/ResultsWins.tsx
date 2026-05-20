"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Trophy, PoundSterling } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Win {
  id: string;
  category: string;
  headline: string;
  value: number | null;
  detail: string | null;
  shareOk: boolean;
  createdAt: string;
}

const WIN_CATEGORIES = [
  "Revenue", "Client Win", "Mindset", "Habit", "Relationship",
  "Skill", "Business", "Personal", "Health", "Other"
];

export default function ResultsWins({ slug }: { slug: string }) {
  const [wins, setWins] = useState<Win[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: "Business",
    headline: "",
    value: "",
    detail: "",
    shareOk: false,
  });

  useEffect(() => {
    fetch(`/api/client/${slug}/wins`)
      .then((r) => r.json())
      .then((d: Win[]) => { setWins(d); setLoading(false); });
  }, [slug]);

  const submit = async () => {
    if (!form.headline.trim()) return;
    const res = await fetch(`/api/client/${slug}/wins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: form.category,
        headline: form.headline,
        value: form.value ? parseFloat(form.value) : null,
        detail: form.detail || null,
        shareOk: form.shareOk,
      }),
    });
    if (res.ok) {
      const win = await res.json() as Win;
      setWins((prev) => [win, ...prev]);
      setForm({ category: "Business", headline: "", value: "", detail: "", shareOk: false });
      setShowForm(false);
    }
  };

  const deleteWin = async (id: string) => {
    await fetch(`/api/client/${slug}/wins/${id}`, { method: "DELETE" });
    setWins((prev) => prev.filter((w) => w.id !== id));
  };

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-navy">
          {wins.length} Win{wins.length !== 1 ? "s" : ""}
        </h3>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> Record Win
        </Button>
      </div>

      {wins.length === 0 && (
        <div className="text-center py-12 text-[var(--muted)]">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No wins recorded yet — celebrate every step forward!</p>
        </div>
      )}

      <div className="grid gap-3">
        {wins.map((win) => (
          <div key={win.id} className="bg-white rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="secondary">{win.category}</Badge>
                  {win.shareOk && (
                    <Badge variant="success" className="text-xs">Share OK ✓</Badge>
                  )}
                </div>
                <p className="font-semibold text-navy">{win.headline}</p>
                {win.value !== null && (
                  <p className="text-bright-green font-bold text-lg mt-1">
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
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                onClick={() => deleteWin(win.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record a Win 🏆</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <Label className="mb-1 block">Category</Label>
              <div className="flex flex-wrap gap-1.5">
                {WIN_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm((f) => ({ ...f, category: c }))}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      form.category === c
                        ? "bg-dark-green text-cream"
                        : "bg-pale-green/50 text-navy hover:bg-pale-green"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Headline *</Label>
              <Input
                placeholder="What did you achieve?"
                value={form.headline}
                onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 block">£ Value (optional)</Label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                <Input
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Details (optional)</Label>
              <Textarea
                placeholder="Tell us more…"
                value={form.detail}
                onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="shareOk"
                checked={form.shareOk}
                onCheckedChange={(v) => setForm((f) => ({ ...f, shareOk: Boolean(v) }))}
              />
              <Label htmlFor="shareOk" className="font-normal cursor-pointer">
                I&apos;m happy for this win to be used for marketing (anonymised)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submit}>Save Win</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
