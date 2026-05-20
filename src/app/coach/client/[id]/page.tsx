import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClientPortalTabs from "@/components/portal/ClientPortalTabs";

export default async function CoachClientView(props: PageProps<"/coach/client/[id]">) {
  const { id } = await props.params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/coach"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
      </div>
      <div className="bg-dark-green/5 rounded-lg border border-dark-green/20 px-4 py-3">
        <p className="text-xs text-[var(--muted)] uppercase font-semibold">Viewing portal for</p>
        <p className="font-bold text-navy text-lg">{client.name}</p>
        <p className="text-xs text-[var(--muted)]">{client.email}</p>
      </div>
      <ClientPortalTabs slug={client.slug} clientName={client.name} />
    </div>
  );
}
