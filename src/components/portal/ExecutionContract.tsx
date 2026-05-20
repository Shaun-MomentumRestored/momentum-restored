"use client";

import { useEffect, useState } from "react";
import { Save, FileSignature, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Contract {
  commitment1: string;
  commitment2: string;
  commitment3: string;
  commitment4: string;
  consequences: string;
  signed: boolean;
  signedAt?: string | null;
}

const empty: Contract = {
  commitment1: "", commitment2: "", commitment3: "", commitment4: "",
  consequences: "", signed: false,
};

export default function ExecutionContract({ slug }: { slug: string }) {
  const [contract, setContract] = useState<Contract>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/client/${slug}/contract`)
      .then((r) => r.json())
      .then((d: Contract | null) => {
        if (d) setContract(d);
        setLoading(false);
      });
  }, [slug]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/client/${slug}/contract`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contract),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading…</div>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3 p-4 bg-dark-green/5 rounded-lg border border-dark-green/20">
        <FileSignature className="h-8 w-8 text-dark-green shrink-0" />
        <div>
          <p className="font-semibold text-navy">Execution Contract</p>
          <p className="text-sm text-[var(--muted)]">
            Make a binding commitment to yourself and your goals.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-color)] p-5 space-y-4">
        <div>
          <h4 className="font-semibold text-navy mb-3">My 4 Core Commitments</h4>
          <div className="space-y-3">
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n}>
                <Label className="mb-1 block text-xs text-[var(--muted)] uppercase">
                  Commitment {n}
                </Label>
                <Textarea
                  placeholder={`I commit to…`}
                  value={contract[`commitment${n}`]}
                  onChange={(e) =>
                    setContract((c) => ({ ...c, [`commitment${n}`]: e.target.value }))
                  }
                  className="min-h-[60px] resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-4">
          <Label className="mb-1.5 block font-semibold">
            <Shield className="inline h-4 w-4 mr-1 text-navy" />
            Consequences if I don&apos;t follow through
          </Label>
          <Textarea
            placeholder="What happens if I don&apos;t keep these commitments? What am I willing to do / give up?"
            value={contract.consequences}
            onChange={(e) => setContract((c) => ({ ...c, consequences: e.target.value }))}
            className="min-h-[80px]"
          />
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
          contract.signed ? "bg-bright-green/10 border-bright-green" : "border-[var(--border-color)]"
        }`}>
          <div>
            <p className="font-semibold text-navy">I am signing this contract</p>
            {contract.signed && contract.signedAt && (
              <p className="text-sm text-bright-green font-medium">
                Signed on {new Date(contract.signedAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </p>
            )}
            {!contract.signed && (
              <p className="text-sm text-[var(--muted)]">Toggle to make this commitment official</p>
            )}
          </div>
          <Switch
            checked={contract.signed}
            onCheckedChange={(v) => setContract((c) => ({ ...c, signed: v }))}
          />
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Contract"}
      </Button>

      {contract.signed && (
        <div className="text-center p-6 bg-bright-green/10 rounded-lg border border-bright-green/30">
          <p className="font-bold text-dark-green text-lg">Contract Signed ✍️</p>
          <p className="text-sm text-dark-green/70 mt-1">
            You have made a commitment. Honour it.
          </p>
        </div>
      )}
    </div>
  );
}
