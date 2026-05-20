"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Play, Pause, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp, Check, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatSeconds, formatMins } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface RawTask {
  id: string;
  name: string;
  estimatedMins: number;
  actualMins: number;
  sessions: number;
  abandoned: boolean;
  completedDays: string;
  done: boolean;
  timerState: string | null;
  createdAt: string;
}

interface RawWeek {
  id: string;
  label: string;
  tasks: RawTask[];
  createdAt: string;
}

interface Task {
  id: string;
  name: string;
  estimatedMins: number;
  actualMins: number;
  sessions: number;
  abandoned: boolean;
  completedDays: number[];
  done: boolean;
  timerState: TimerState | null;
}

interface Week {
  id: string;
  label: string;
  tasks: Task[];
}

function parseTask(t: RawTask): Task {
  return {
    ...t,
    completedDays: JSON.parse(t.completedDays || "[]") as number[],
    timerState: t.timerState ? (JSON.parse(t.timerState) as TimerState) : null,
  };
}

function parseWeek(w: RawWeek): Week {
  return { id: w.id, label: w.label, tasks: w.tasks.map(parseTask) };
}

interface TimerState {
  remainingSeconds: number;
  totalElapsedSeconds: number;
}

interface ActiveTimer {
  taskId: string;
  weekId: string;
  remainingSeconds: number;
  totalElapsedSeconds: number;
  sessionStartTime: number;
  isRunning: boolean;
  estimatedSeconds: number;
}

export default function WeeklyTasks({ slug }: { slug: string }) {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);
  const [newWeekLabel, setNewWeekLabel] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskMins, setNewTaskMins] = useState("30");
  const [addingTask, setAddingTask] = useState(false);
  const [timer, setTimer] = useState<ActiveTimer | null>(null);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [moreTimeMins, setMoreTimeMins] = useState("15");
  const [showMoreTimeInput, setShowMoreTimeInput] = useState(false);
  const timerRef = useRef<ActiveTimer | null>(null);
  timerRef.current = timer;

  const load = useCallback(async () => {
    const res = await fetch(`/api/client/${slug}/weeks`);
    if (!res.ok) return;
    const data = (await res.json()) as RawWeek[];
    const parsed = data.map(parseWeek);
    setWeeks(parsed);
    if (parsed.length > 0 && !activeWeekId) setActiveWeekId(parsed[0].id);
    setLoading(false);
  }, [slug, activeWeekId]);

  useEffect(() => {
    load();
  }, [load]);

  // Tick timer every second
  useEffect(() => {
    if (!timer?.isRunning) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (!prev || !prev.isRunning) return prev;
        const elapsedSinceStart = (Date.now() - prev.sessionStartTime) / 1000;
        const remaining = Math.max(
          0,
          prev.estimatedSeconds - prev.totalElapsedSeconds - elapsedSinceStart
        );
        if (remaining <= 0) {
          clearInterval(interval);
          setShowDoneModal(true);
          return { ...prev, remainingSeconds: 0, isRunning: false };
        }
        return { ...prev, remainingSeconds: Math.ceil(remaining) };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer?.isRunning]);

  // Save timer state periodically
  useEffect(() => {
    if (!timer?.isRunning) return;
    const save = setInterval(() => {
      const t = timerRef.current;
      if (!t?.isRunning) return;
      const elapsed = (Date.now() - t.sessionStartTime) / 1000;
      const totalElapsed = t.totalElapsedSeconds + elapsed;
      fetch(`/api/client/${slug}/tasks/${t.taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timerState: {
            remainingSeconds: t.remainingSeconds,
            totalElapsedSeconds: totalElapsed,
          },
          sessions: 0,
        }),
      });
    }, 30000);
    return () => clearInterval(save);
  }, [timer?.isRunning, slug]);

  // Abandoned beacon on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const t = timerRef.current;
      if (!t?.isRunning) return;
      const elapsed = (Date.now() - t.sessionStartTime) / 1000;
      const totalElapsed = t.totalElapsedSeconds + elapsed;
      navigator.sendBeacon(
        `/api/client/${slug}/tasks/${t.taskId}`,
        new Blob(
          [
            JSON.stringify({
              abandoned: true,
              actualMins: totalElapsed / 60,
              sessions: (t as unknown as { sessions: number }).sessions + 1,
              timerState: { remainingSeconds: t.remainingSeconds, totalElapsedSeconds: totalElapsed },
            }),
          ],
          { type: "application/json" }
        )
      );
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [slug]);

  const createWeek = async () => {
    if (!newWeekLabel.trim()) return;
    const res = await fetch(`/api/client/${slug}/weeks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newWeekLabel.trim() }),
    });
    if (res.ok) {
      const raw = (await res.json()) as RawWeek;
      const parsed = parseWeek(raw);
      setWeeks((prev) => [parsed, ...prev]);
      setActiveWeekId(parsed.id);
      setNewWeekLabel("");
    }
  };

  const deleteWeek = async (weekId: string) => {
    await fetch(`/api/client/${slug}/weeks/${weekId}`, { method: "DELETE" });
    setWeeks((prev) => prev.filter((w) => w.id !== weekId));
    if (activeWeekId === weekId) setActiveWeekId(weeks.find((w) => w.id !== weekId)?.id ?? null);
  };

  const createTask = async (weekId: string) => {
    if (!newTaskName.trim()) return;
    const res = await fetch(`/api/client/${slug}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekId, name: newTaskName.trim(), estimatedMins: Number(newTaskMins) || 30 }),
    });
    if (res.ok) {
      const raw = (await res.json()) as RawTask;
      const parsed = parseTask(raw);
      setWeeks((prev) => prev.map((w) => w.id === weekId ? { ...w, tasks: [...w.tasks, parsed] } : w));
      setNewTaskName("");
      setNewTaskMins("30");
      setAddingTask(false);
    }
  };

  const deleteTask = async (weekId: string, taskId: string) => {
    if (timer?.taskId === taskId) stopTimer(false);
    await fetch(`/api/client/${slug}/tasks/${taskId}`, { method: "DELETE" });
    setWeeks((prev) => prev.map((w) => w.id === weekId ? { ...w, tasks: w.tasks.filter((t) => t.id !== taskId) } : w));
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    setWeeks((prev) =>
      prev.map((w) => ({
        ...w,
        tasks: w.tasks.map((t) => t.id === taskId ? { ...t, ...data } : t),
      }))
    );
    await fetch(`/api/client/${slug}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        ...(data.completedDays !== undefined && { completedDays: data.completedDays }),
      }),
    });
  };

  const startTimer = (task: Task, weekId: string) => {
    const savedState = task.timerState;
    const totalElapsed = savedState?.totalElapsedSeconds ?? 0;
    const estimatedSeconds = task.estimatedMins * 60;
    const remaining = Math.max(0, estimatedSeconds - totalElapsed);
    setTimer({
      taskId: task.id,
      weekId,
      remainingSeconds: Math.ceil(remaining),
      totalElapsedSeconds: totalElapsed,
      sessionStartTime: Date.now(),
      isRunning: true,
      estimatedSeconds,
    });
    updateTask(task.id, { abandoned: false });
  };

  const pauseTimer = () => {
    if (!timer) return;
    const elapsed = (Date.now() - timer.sessionStartTime) / 1000;
    const totalElapsed = timer.totalElapsedSeconds + elapsed;
    const updated = { ...timer, totalElapsedSeconds: totalElapsed, isRunning: false };
    setTimer(updated);
    fetch(`/api/client/${slug}/tasks/${timer.taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timerState: { remainingSeconds: timer.remainingSeconds, totalElapsedSeconds: totalElapsed },
      }),
    });
  };

  const stopTimer = (save = true) => {
    if (!timer) return;
    if (save) {
      const elapsed = (Date.now() - timer.sessionStartTime) / 1000;
      const totalElapsed = timer.totalElapsedSeconds + elapsed;
      fetch(`/api/client/${slug}/tasks/${timer.taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timerState: null,
          actualMins: totalElapsed / 60,
          sessions: 0,
        }),
      });
    }
    setTimer(null);
  };

  const handleTimerDone = async () => {
    if (!timer) return;
    const elapsed = (Date.now() - timer.sessionStartTime) / 1000;
    const totalElapsed = timer.totalElapsedSeconds + elapsed;
    const weekData = weeks.find((w) => w.id === timer.weekId);
    const taskData = weekData?.tasks.find((t) => t.id === timer.taskId);
    await fetch(`/api/client/${slug}/tasks/${timer.taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        done: true,
        actualMins: totalElapsed / 60,
        sessions: (taskData?.sessions ?? 0) + 1,
        timerState: null,
      }),
    });
    setWeeks((prev) =>
      prev.map((w) => ({
        ...w,
        tasks: w.tasks.map((t) =>
          t.id === timer.taskId
            ? { ...t, done: true, actualMins: totalElapsed / 60, sessions: (t.sessions) + 1, timerState: null }
            : t
        ),
      }))
    );
    setTimer(null);
    setShowDoneModal(false);
  };

  const handleNeedMoreTime = () => {
    const extra = Number(moreTimeMins) * 60 || 900;
    setTimer((prev) =>
      prev
        ? {
            ...prev,
            remainingSeconds: extra,
            estimatedSeconds: prev.estimatedSeconds + extra,
            sessionStartTime: Date.now(),
            isRunning: true,
          }
        : prev
    );
    setShowDoneModal(false);
    setShowMoreTimeInput(false);
    setMoreTimeMins("15");
  };

  const toggleDay = (task: Task, dayIdx: number) => {
    const days = task.completedDays.includes(dayIdx)
      ? task.completedDays.filter((d) => d !== dayIdx)
      : [...task.completedDays, dayIdx];
    updateTask(task.id, { completedDays: days });
  };

  const activeWeek = weeks.find((w) => w.id === activeWeekId);

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading…</div>;

  return (
    <div className="space-y-4">
      {/* Week selector + creation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label className="mb-1 block">Create new week</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. W/C 19 May"
              value={newWeekLabel}
              onChange={(e) => setNewWeekLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createWeek()}
              className="flex-1"
            />
            <Button onClick={createWeek} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Week
            </Button>
          </div>
        </div>
        {weeks.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {weeks.map((w) => (
              <button
                key={w.id}
                onClick={() => setActiveWeekId(w.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeWeekId === w.id
                    ? "bg-dark-green text-cream"
                    : "bg-pale-green/50 text-navy hover:bg-pale-green"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeWeek && (
        <div className="bg-white rounded-lg border border-[var(--border-color)] overflow-hidden">
          {/* Week header */}
          <div className="flex items-center justify-between px-4 py-3 bg-dark-green/5 border-b border-[var(--border-color)]">
            <h3 className="font-semibold text-navy">{activeWeek.label}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted)]">
                {activeWeek.tasks.filter((t) => t.done).length}/{activeWeek.tasks.length} done
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => deleteWeek(activeWeek.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] border-b border-[var(--border-color)]">
            <div className="px-4 py-2 text-xs font-semibold text-[var(--muted)] uppercase">Task</div>
            <div className="hidden sm:flex gap-1 px-3 py-2">
              {DAYS.map((d) => (
                <span key={d} className="w-7 text-center text-xs font-semibold text-[var(--muted)]">{d}</span>
              ))}
            </div>
            <div className="px-3 py-2 text-xs font-semibold text-[var(--muted)] uppercase">Timer</div>
          </div>

          {/* Tasks */}
          {activeWeek.tasks.length === 0 && (
            <div className="py-8 text-center text-[var(--muted)] text-sm">
              No tasks yet — add one below
            </div>
          )}

          {activeWeek.tasks.map((task) => {
            const isActive = timer?.taskId === task.id;
            const displaySecs = isActive ? timer.remainingSeconds : (task.timerState?.remainingSeconds ?? task.estimatedMins * 60);
            const pct = Math.round((1 - displaySecs / (task.estimatedMins * 60)) * 100);

            return (
              <div
                key={task.id}
                className={`border-b border-[var(--border-color)] last:border-0 transition-colors ${task.done ? "bg-pale-green/20" : ""} ${task.abandoned ? "bg-red-50/50" : ""}`}
              >
                <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] items-center gap-2 px-4 py-3">
                  {/* Task name + meta */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${task.done ? "line-through text-[var(--muted)]" : "text-navy"}`}>
                        {task.name}
                      </span>
                      {task.abandoned && <Badge variant="destructive" className="text-xs">Abandoned</Badge>}
                      {task.done && <Badge variant="success" className="text-xs">Done</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-[var(--muted)]">
                        Est: {task.estimatedMins}m
                        {task.actualMins > 0 && ` · Actual: ${formatMins(task.actualMins)}`}
                        {task.sessions > 0 && ` · ${task.sessions} session${task.sessions !== 1 ? "s" : ""}`}
                      </span>
                    </div>
                    {/* Day checkboxes (mobile) */}
                    <div className="flex gap-1 mt-2 sm:hidden flex-wrap">
                      {DAYS.map((d, i) => (
                        <button
                          key={d}
                          onClick={() => toggleDay(task, i)}
                          className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                            task.completedDays.includes(i)
                              ? "bg-dark-green text-cream"
                              : "bg-pale-green/40 text-navy hover:bg-pale-green"
                          }`}
                        >
                          {d[0]}
                        </button>
                      ))}
                    </div>
                    {/* Timer progress */}
                    {isActive && (
                      <div className="mt-2">
                        <Progress value={Math.max(0, Math.min(100, pct))} className="h-1.5" />
                      </div>
                    )}
                  </div>

                  {/* Day checkboxes (desktop) */}
                  <div className="hidden sm:flex gap-1 px-3">
                    {DAYS.map((d, i) => (
                      <button
                        key={d}
                        title={d}
                        onClick={() => toggleDay(task, i)}
                        className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                          task.completedDays.includes(i)
                            ? "bg-dark-green text-cream"
                            : "bg-pale-green/40 text-navy hover:bg-pale-green"
                        }`}
                      >
                        {d[0]}
                      </button>
                    ))}
                  </div>

                  {/* Timer controls */}
                  <div className="flex items-center gap-1 px-1">
                    <span className={`font-mono text-sm font-bold w-14 text-right ${isActive && timer.isRunning ? "text-bright-green timer-pulse" : "text-navy"}`}>
                      {formatSeconds(displaySecs)}
                    </span>
                    {!task.done && (
                      <>
                        {isActive && timer.isRunning ? (
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={pauseTimer}>
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-dark-green hover:bg-pale-green"
                            onClick={() => startTimer(task, activeWeek.id)}
                            disabled={timer?.isRunning && timer.taskId !== task.id}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {isActive && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-[var(--muted)] hover:text-navy"
                            onClick={() => stopTimer(true)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                    {!task.done && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-bright-green hover:bg-pale-green"
                        title="Mark done"
                        onClick={() => updateTask(task.id, { done: true })}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deleteTask(activeWeek.id, task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add task form */}
          <div className="px-4 py-3 bg-cream/50">
            {addingTask ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  autoFocus
                  placeholder="Task name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-[var(--muted)]" />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Mins"
                    value={newTaskMins}
                    onChange={(e) => setNewTaskMins(e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-[var(--muted)]">min</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => createTask(activeWeek.id)}>Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddingTask(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setAddingTask(true)} className="text-dark-green">
                <Plus className="h-4 w-4 mr-1" /> Add task
              </Button>
            )}
          </div>
        </div>
      )}

      {weeks.length === 0 && (
        <div className="text-center py-12 text-[var(--muted)]">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Create your first week to get started</p>
        </div>
      )}

      {/* Timer complete modal */}
      <Dialog open={showDoneModal} onOpenChange={setShowDoneModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">⏱ Time&apos;s up!</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center space-y-4">
            <p className="text-[var(--muted)]">Have you completed this task?</p>
            {showMoreTimeInput && (
              <div className="flex items-center gap-2 justify-center">
                <Input
                  type="number"
                  min="1"
                  value={moreTimeMins}
                  onChange={(e) => setMoreTimeMins(e.target.value)}
                  className="w-20 text-center"
                />
                <span className="text-sm text-[var(--muted)]">more minutes</span>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button onClick={handleTimerDone} variant="success" className="w-full">
              <Check className="h-4 w-4 mr-2" /> Yes, it&apos;s done!
            </Button>
            {showMoreTimeInput ? (
              <Button onClick={handleNeedMoreTime} variant="secondary" className="w-full">
                Add {moreTimeMins}m and continue
              </Button>
            ) : (
              <Button
                onClick={() => setShowMoreTimeInput(true)}
                variant="secondary"
                className="w-full"
              >
                Need more time
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
