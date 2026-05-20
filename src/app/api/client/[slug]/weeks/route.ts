import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/weeks">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const weeks = await prisma.week.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });
  return Response.json(weeks);
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/weeks">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const { label, startDate } = await request.json();
  const week = await prisma.week.create({
    data: { clientId: client.id, label, startDate: startDate || "" },
    include: { tasks: true },
  });
  return Response.json(week, { status: 201 });
}
