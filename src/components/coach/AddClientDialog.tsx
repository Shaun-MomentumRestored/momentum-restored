"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

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

export default function AddClientDialog({ onAdd }: { onAdd: (c: Client) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/coach/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim() }),
    });
    if (res.ok) {
      const client = await res.json() as Client;
      onAdd({ ...client, completionPct: null, abandonedCount: 0, winsThisMonth: 0 });
      setName("");
      setEmail("");
      setOpen(false);
    } else {
      const data = await res.json() as { error?: string };
      setError(data.error || "Failed to create client");
    }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" /> Add Client
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <Label className="mb-1.5 block">Full Name</Label>
              <Input
                autoFocus
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="bg-pale-green/30 rounded-md p-3 text-sm text-navy">
              A unique portal URL will be generated automatically.
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? "Creating…" : "Create Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
