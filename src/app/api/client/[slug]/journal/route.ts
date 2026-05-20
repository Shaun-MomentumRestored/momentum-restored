import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/journal">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const entries = await prisma.journalEntry.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(entries);
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/journal">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const { excuse, reality, action } = await request.json();
  const entry = await prisma.journalEntry.create({
    data: {
      clientId: client.id,
      excuse: excuse || "",
      reality: reality || "",
      action: action || "",
    },
  });
  return Response.json(entry, { status: 201 });
}
