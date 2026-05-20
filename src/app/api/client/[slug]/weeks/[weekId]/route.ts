import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/weeks/[weekId]">
) {
  const { weekId } = await ctx.params;
  await prisma.week.delete({ where: { id: weekId } });
  return Response.json({ ok: true });
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/weeks/[weekId]">
) {
  const { weekId } = await ctx.params;
  const body = await request.json();
  const week = await prisma.week.update({
    where: { id: weekId },
    data: { label: body.label },
  });
  return Response.json(week);
}
