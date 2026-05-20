import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientPortalTabs from "@/components/portal/ClientPortalTabs";

export default async function ClientPortalPage(
  props: PageProps<"/client/[slug]">
) {
  const { slug } = await props.params;

  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) notFound();

  await prisma.client.update({
    where: { slug },
    data: { lastActive: new Date() },
  });

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-dark-green text-cream px-4 py-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-pale-green/70 text-xs uppercase font-semibold tracking-wider">
              Momentum Restored
            </p>
            <h1 className="text-xl font-bold">{client.name}</h1>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-pale-green/60 text-xs">Your private portal</p>
            <p className="text-pale-green text-xs font-mono">/client/{client.slug}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <ClientPortalTabs slug={client.slug} clientName={client.name} />
      </main>
    </div>
  );
}
