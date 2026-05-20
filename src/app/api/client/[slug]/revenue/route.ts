import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  ctx: RouteContext<"/api/client/[slug]/revenue">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const month = url.searchParams.get("month");

  if (month) {
    const rt = await prisma.revenueTracker.findUnique({
      where: { clientId_month: { clientId: client.id, month } },
    });
    return Response.json(rt);
  }

  const trackers = await prisma.revenueTracker.findMany({
    where: { clientId: client.id },
    orderBy: { month: "desc" },
  });
  return Response.json(trackers);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/revenue">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const { month, target, actual, tasks } = await request.json();
  const rt = await prisma.revenueTracker.upsert({
    where: { clientId_month: { clientId: client.id, month } },
    create: {
      clientId: client.id,
      month,
      target: Number(target) || 0,
      actual: Number(actual) || 0,
      tasks: JSON.stringify(tasks || []),
    },
    update: {
      target: Number(target) || 0,
      actual: Number(actual) || 0,
      tasks: JSON.stringify(tasks || []),
    },
  });
  return Response.json(rt);
}
