"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Save, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface MeetingNote {
  id: string;
  date: string;
  sessionNumber: number;
  notes: string;
  actions: string;
  createdAt: string;
}

export default function MeetingNotes({ slug }: { slug: string }) {
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    sessionNumber: 1,
    notes: "",
    actions: "",
  });

  useEffect(() => {
    fetch(`/api/client/${slug}/meetings`)
      .then((r) => r.json())
      .then((d: MeetingNote[]) => {
        setNotes(d);
        setLoading(false);
        if (d.length > 0) {
          const maxSession = Math.max(...d.map((n) => n.sessionNumber));
          setForm((f) => ({ ...f, sessionNumber: maxSession + 1 }));
        }
      });
  }, [slug]);

  const submit = async () => {
    const url = `/api/client/${slug}/meetings${editing ? `/${editing}` : ""}`;
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const note = await res.json() as MeetingNote;
      if (editing) {
        setNotes((prev) => prev.map((n) => n.id === editing ? note : n));
      } else {
        setNotes((prev) => [note, ...prev]);
        setForm((f) => ({ ...f, sessionNumber: f.sessionNumber + 1, notes: "", actions: "" }));
      }
      setShowForm(false);
      setEditing(null);
    }
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/client/${slug}/meetings/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const openEdit = (note: MeetingNote) => {
    setForm({
      date: note.date,
      sessionNumber: note.sessionNumber,
      notes: note.notes,
      actions: note.actions,
    });
    setEditing(note.id);
    setShowForm(true);
  };

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading…</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-navy">{notes.length} Session{notes.length !== 1 ? "s" : ""}</h3>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Session
        </Button>
      </div>

      {notes.length === 0 && (
        <div className="text-center py-12 text-[var(--muted)]">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No session notes yet</p>
        </div>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="bg-white rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-dark-green text-cream">
                    Session {note.sessionNumber}
                  </span>
                  <span className="text-sm text-[var(--muted)]">
                    {new Date(note.date).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(note)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon" variant="ghost"
                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => deleteNote(note.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {note.notes && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-[var(--muted)] uppercase mb-1">Notes</p>
                <p className="text-sm text-navy whitespace-pre-wrap">{note.notes}</p>
              </div>
            )}
            {note.actions && (
              <div>
                <p className="text-xs font-semibold text-[var(--muted)] uppercase mb-1">Actions Agreed</p>
                <p className="text-sm text-navy whitespace-pre-wrap">{note.actions}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Session" : "New Session Notes"}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <Label className="mb-1 block">Session #</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.sessionNumber}
                  onChange={(e) => setForm((f) => ({ ...f, sessionNumber: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Session Notes</Label>
              <Textarea
                placeholder="Key topics, insights, breakthroughs…"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label className="mb-1 block">Actions Agreed</Label>
              <Textarea
                placeholder="What will you do before the next session?"
                value={form.actions}
                onChange={(e) => setForm((f) => ({ ...f, actions: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={submit}>{editing ? "Save Changes" : "Save Session"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
