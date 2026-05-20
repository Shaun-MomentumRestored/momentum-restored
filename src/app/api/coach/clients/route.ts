import { prisma } from "@/lib/prisma";
import { generateSlug, getWeekBounds, getMonthBounds } from "@/lib/utils";

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { lastActive: "desc" },
    include: { wins: true, weeks: { include: { tasks: true } } },
  });

  const { start: weekStart, end: weekEnd } = getWeekBounds();
  const { start: monthStart, end: monthEnd } = getMonthBounds();

  const data = clients.map((c) => {
    const thisWeekWeeks = c.weeks.filter((w) => {
      const d = new Date(w.createdAt);
      return d >= weekStart && d <= weekEnd;
    });
    const thisWeekTasks = thisWeekWeeks.flatMap((w) => w.tasks);
    const completionPct =
      thisWeekTasks.length === 0
        ? null
        : Math.round(
            (thisWeekTasks.filter((t) => t.done).length /
              thisWeekTasks.length) *
              100
          );
    const abandonedCount = thisWeekTasks.filter((t) => t.abandoned).length;
    const winsThisMonth = c.wins.filter((w) => {
      const d = new Date(w.createdAt);
      return d >= monthStart && d <= monthEnd;
    }).length;

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      slug: c.slug,
      createdAt: c.createdAt,
      lastActive: c.lastActive,
      completionPct,
      abandonedCount,
      winsThisMonth,
    };
  });

  return Response.json(data);
}

export async function POST(request: Request) {
  const { name, email } = await request.json();
  if (!name || !email) {
    return Response.json({ error: "Name and email required" }, { status: 400 });
  }

  const slug = generateSlug(name);

  try {
    const client = await prisma.client.create({
      data: { name, email, slug },
    });
    return Response.json(client, { status: 201 });
  } catch {
    return Response.json(
      { error: "Email already exists or slug collision" },
      { status: 409 }
    );
  }
}
