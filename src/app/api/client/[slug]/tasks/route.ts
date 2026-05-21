import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/tasks">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const { weekId, name, estimatedMins, repeat } = await request.json();
  const task = await prisma.task.create({
    data: { weekId, name, estimatedMins: Number(estimatedMins), repeat: repeat ?? "none" },
  });
  return Response.json(task, { status: 201 });
}
