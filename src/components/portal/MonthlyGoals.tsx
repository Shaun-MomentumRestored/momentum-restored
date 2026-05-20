"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface GoalItem {
  text: string;
  done: boolean;
}

interface MonthlyGoal {
  month: string;
  items: GoalItem[];
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

export default function MonthlyGoals({ slug }: { slug: string }) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [goal, setGoal] = useState<MonthlyGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState("");

  const load = async (month: string) => {
    setLoading(true);
    const res = await fetch(`/api/client/${slug}/monthly-goals?month=${month}`);
    const data: { month: string; items: string } | null = await res.json();
    if (data) {
      setGoal({ month: data.month, items: JSON.parse(data.items) as GoalItem[] });
    } else {
      setGoal({ month, items: [] });
    }
    setLoading(false);
  };

  useEffect(() => { load(selectedMonth); }, [slug, selectedMonth]);

  const save = async (items: GoalItem[]) => {
    await fetch(`/api/client/${slug}/monthly-goals`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: selectedMonth, items }),
    });
  };

  const addItem = () => {
    if (!newItem.trim() || !goal) return;
    const items = [...goal.items, { text: newItem.trim(), done: false }];
    setGoal({ ...goal, items });
    save(items);
    setNewItem("");
  };

  const toggleItem = (idx: number) => {
    if (!goal) return;
    const items = goal.items.map((item, i) =>
      i === idx ? { ...item, done: !item.done } : item
    );
    setGoal({ ...goal, items });
    save(items);
  };

  const removeItem = (idx: number) => {
    if (!goal) return;
    const items = goal.items.filter((_, i) => i !== idx);
    setGoal({ ...goal, items });
    save(items);
  };

  const completedCount = goal?.items.filter((i) => i.done).length ?? 0;
  const totalCount = goal?.items.length ?? 0;

  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i - 3);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-dark-green" />
        <div className="flex-1">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-9 rounded-md border border-[var(--border-color)] bg-white px-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-bright-green w-full sm:w-auto"
          >
            {months.map((m) => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        </div>
        {totalCount > 0 && (
          <span className="text-sm text-[var(--muted)]">
            {completedCount}/{totalCount} done
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-[var(--muted)]">Loading…</div>
      ) : (
        <div className="bg-white rounded-lg border border-[var(--border-color)] overflow-hidden">
          <div className="px-4 py-3 bg-dark-green/5 border-b border-[var(--border-color)]">
            <h3 className="font-semibold text-navy">{formatMonth(selectedMonth)}</h3>
            {totalCount > 0 && (
              <div className="mt-2 h-1.5 rounded-full bg-pale-green overflow-hidden">
                <div
                  className="h-full bg-bright-green transition-all"
                  style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {goal?.items.length === 0 && (
            <div className="py-8 text-center text-[var(--muted)] text-sm">
              No goals for this month yet
            </div>
          )}

          {goal?.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] last:border-0">
              <Checkbox
                checked={item.done}
                onCheckedChange={() => toggleItem(idx)}
              />
              <span className={`flex-1 text-sm ${item.done ? "line-through text-[var(--muted)]" : "text-navy"}`}>
                {item.text}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => removeItem(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          <div className="px-4 py-3 bg-cream/50">
            <div className="flex gap-2">
              <Input
                placeholder="Add a goal for this month…"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                className="flex-1"
              />
              <Button size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
