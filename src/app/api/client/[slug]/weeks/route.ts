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
  const newWeek = await prisma.week.create({
    data: { clientId: client.id, label, startDate: startDate || "" },
  });

  // Auto-copy recurring tasks from the most recent previous week
  const previousWeek = await prisma.week.findFirst({
    where: { clientId: client.id, id: { not: newWeek.id } },
    orderBy: { createdAt: "desc" },
    include: { tasks: { where: { repeat: { not: "none" } } } },
  });

  if (previousWeek && previousWeek.tasks.length > 0) {
    await Promise.all(
      previousWeek.tasks.map((t) =>
        prisma.task.create({
          data: { weekId: newWeek.id, name: t.name, estimatedMins: t.estimatedMins, repeat: t.repeat },
        })
      )
    );
  }

  const week = await prisma.week.findUnique({
    where: { id: newWeek.id },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });
  return Response.json(week, { status: 201 });
}
