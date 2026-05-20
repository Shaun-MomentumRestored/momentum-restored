import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  ctx: RouteContext<"/api/client/[slug]/monthly-goals">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const month = url.searchParams.get("month");

  if (month) {
    const mg = await prisma.monthlyGoal.findUnique({
      where: { clientId_month: { clientId: client.id, month } },
    });
    return Response.json(mg);
  }

  const goals = await prisma.monthlyGoal.findMany({
    where: { clientId: client.id },
    orderBy: { month: "desc" },
  });
  return Response.json(goals);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/monthly-goals">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const { month, items } = await request.json();
  const mg = await prisma.monthlyGoal.upsert({
    where: { clientId_month: { clientId: client.id, month } },
    create: { clientId: client.id, month, items: JSON.stringify(items) },
    update: { items: JSON.stringify(items) },
  });
  return Response.json(mg);
}
