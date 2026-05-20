"use client";

import { useEffect, useState } from "react";
import { Save, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Goal {
  id?: string;
  headline: string;
  milestone1: string;
  milestone2: string;
  milestone3: string;
  whyMatters: string;
  committed: boolean;
}

const empty: Goal = {
  headline: "", milestone1: "", milestone2: "", milestone3: "",
  whyMatters: "", committed: false,
};

export default function Goal12Month({ slug }: { slug: string }) {
  const [goal, setGoal] = useState<Goal>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/client/${slug}/goal`)
      .then((r) => r.json())
      .then((d: Goal | null) => {
        if (d) setGoal(d);
        setLoading(false);
      });
  }, [slug]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/client/${slug}/goal`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goal),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading…</div>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3 p-4 bg-dark-green/5 rounded-lg border border-dark-green/20">
        <Target className="h-8 w-8 text-dark-green shrink-0" />
        <div>
          <p className="font-semibold text-navy">Your 12-Month Vision</p>
          <p className="text-sm text-[var(--muted)]">Define your big goal and commit to it.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-color)] p-5 space-y-4">
        <div>
          <Label className="mb-1.5 block font-semibold">Headline Goal *</Label>
          <Input
            placeholder="In 12 months I will have…"
            value={goal.headline}
            onChange={(e) => setGoal((g) => ({ ...g, headline: e.target.value }))}
            className="text-base"
          />
        </div>

        <div>
          <Label className="mb-2 block font-semibold">3 Key Milestones</Label>
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-bright-green/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-dark-green">{n}</span>
                </div>
                <Input
                  placeholder={`Milestone ${n}`}
                  value={goal[`milestone${n}` as keyof Goal] as string}
                  onChange={(e) =>
                    setGoal((g) => ({ ...g, [`milestone${n}`]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block font-semibold">Why does this matter to you?</Label>
          <Textarea
            placeholder="Connect this goal to your deeper purpose…"
            value={goal.whyMatters}
            onChange={(e) => setGoal((g) => ({ ...g, whyMatters: e.target.value }))}
            className="min-h-[100px]"
          />
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
          goal.committed ? "bg-bright-green/10 border-bright-green" : "border-[var(--border-color)]"
        }`}>
          <div>
            <p className="font-semibold text-navy">I am committed to this goal</p>
            <p className="text-sm text-[var(--muted)]">
              {goal.committed ? "You've committed — now go make it happen! 🚀" : "Toggle to commit to your 12-month vision"}
            </p>
          </div>
          <Switch
            checked={goal.committed}
            onCheckedChange={(v) => setGoal((g) => ({ ...g, committed: v }))}
          />
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Goal"}
      </Button>
    </div>
  );
}
