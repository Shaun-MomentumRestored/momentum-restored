"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, PoundSterling, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface RevenueTask {
  name: string;
  value: number;
  done: boolean;
}

interface RevenueData {
  month: string;
  target: number;
  actual: number;
  tasks: RevenueTask[];
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(m: string) {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-GB", {
    month: "long", year: "numeric"
  });
}

export default function RevenueTracker({ slug }: { slug: string }) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [data, setData] = useState<RevenueData>({ month: getCurrentMonth(), target: 0, actual: 0, tasks: [] });
  const [loading, setLoading] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskValue, setNewTaskValue] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async (month: string) => {
    setLoading(true);
    const res = await fetch(`/api/client/${slug}/revenue?month=${month}`);
    const d: { month: string; target: number; actual: number; tasks: string } | null = await res.json();
    if (d) {
      setData({ ...d, tasks: JSON.parse(d.tasks) as RevenueTask[] });
    } else {
      setData({ month, target: 0, actual: 0, tasks: [] });
    }
    setLoading(false);
  };

  useEffect(() => { load(selectedMonth); }, [slug, selectedMonth]);

  const save = async (updates: Partial<RevenueData>) => {
    setSaving(true);
    const merged = { ...data, ...updates };
    await fetch(`/api/client/${slug}/revenue`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...merged, month: selectedMonth }),
    });
    setSaving(false);
  };

  const updateField = (field: "target" | "actual", value: string) => {
    const num = parseFloat(value) || 0;
    setData((d) => ({ ...d, [field]: num }));
  };

  const saveFields = () => save({ target: data.target, actual: data.actual, tasks: data.tasks });

  const addTask = () => {
    if (!newTaskName.trim()) return;
    const tasks = [...data.tasks, { name: newTaskName.trim(), value: parseFloat(newTaskValue) || 0, done: false }];
    setData((d) => ({ ...d, tasks }));
    save({ tasks });
    setNewTaskName("");
    setNewTaskValue("");
  };

  const toggleTask = (idx: number) => {
    const tasks = data.tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t);
    setData((d) => ({ ...d, tasks }));
    save({ tasks });
  };

  const removeTask = (idx: number) => {
    const tasks = data.tasks.filter((_, i) => i !== idx);
    setData((d) => ({ ...d, tasks }));
    save({ tasks });
  };

  const pct = data.target > 0 ? Math.min(100, Math.round((data.actual / data.target) * 100)) : 0;
  const gap = data.target - data.actual;
  const potentialValue = data.tasks.filter((t) => !t.done).reduce((s, t) => s + t.value, 0);

  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i - 3);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Month selector */}
      <div className="flex items-center gap-3">
        <TrendingUp className="h-5 w-5 text-dark-green" />
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-9 rounded-md border border-[var(--border-color)] bg-white px-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-bright-green"
        >
          {months.map((m) => (
            <option key={m} value={m}>{formatMonth(m)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[var(--muted)]">Loading…</div>
      ) : (
        <>
          {/* Target & Actual */}
          <div className="bg-white rounded-lg border border-[var(--border-color)] p-5">
            <h3 className="font-semibold text-navy mb-4">{formatMonth(selectedMonth)}</h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <Label className="mb-1.5 block">Monthly Target</Label>
                <div className="relative">
                  <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                  <Input
                    type="number"
                    min="0"
                    className="pl-8"
                    value={data.target || ""}
                    onChange={(e) => updateField("target", e.target.value)}
                    onBlur={saveFields}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Actual Revenue</Label>
                <div className="relative">
                  <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                  <Input
                    type="number"
                    min="0"
                    className="pl-8"
                    value={data.actual || ""}
                    onChange={(e) => updateField("actual", e.target.value)}
                    onBlur={saveFields}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {data.target > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-navy">{pct}% of target</span>
                  <span className={gap > 0 ? "text-[var(--muted)]" : "text-bright-green font-semibold"}>
                    {gap > 0 ? `£${gap.toLocaleString("en-GB")} to go` : "Target exceeded! 🎉"}
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            )}
          </div>

          {/* Revenue tasks */}
          <div className="bg-white rounded-lg border border-[var(--border-color)] overflow-hidden">
            <div className="px-4 py-3 bg-dark-green/5 border-b border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-navy">Revenue Tasks</h4>
                {potentialValue > 0 && (
                  <span className="text-xs text-[var(--muted)]">
                    £{potentialValue.toLocaleString("en-GB")} potential remaining
                  </span>
                )}
              </div>
            </div>

            {data.tasks.length === 0 && (
              <div className="py-6 text-center text-sm text-[var(--muted)]">
                No tasks yet — add revenue-generating activities
              </div>
            )}

            {data.tasks.map((task, idx) => (
              <div key={idx} className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] last:border-0 ${task.done ? "bg-pale-green/20" : ""}`}>
                <Checkbox checked={task.done} onCheckedChange={() => toggleTask(idx)} />
                <span className={`flex-1 text-sm ${task.done ? "line-through text-[var(--muted)]" : "text-navy"}`}>
                  {task.name}
                </span>
                {task.value > 0 && (
                  <span className={`text-sm font-semibold ${task.done ? "text-[var(--muted)]" : "text-bright-green"}`}>
                    £{task.value.toLocaleString("en-GB")}
                  </span>
                )}
                <Button
                  size="icon" variant="ghost"
                  className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeTask(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            <div className="px-4 py-3 bg-cream/50">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Task name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  className="flex-1"
                />
                <div className="relative w-28">
                  <PoundSterling className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted)]" />
                  <Input
                    type="number"
                    placeholder="Value"
                    className="pl-7"
                    value={newTaskValue}
                    onChange={(e) => setNewTaskValue(e.target.value)}
                  />
                </div>
                <Button size="sm" onClick={addTask}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
