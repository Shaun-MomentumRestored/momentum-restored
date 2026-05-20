import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/wins/[winId]">
) {
  const { winId } = await ctx.params;
  const body = await request.json();
  const win = await prisma.win.update({
    where: { id: winId },
    data: {
      ...(body.category !== undefined && { category: body.category }),
      ...(body.headline !== undefined && { headline: body.headline }),
      ...(body.value !== undefined && {
        value: body.value ? Number(body.value) : null,
      }),
      ...(body.detail !== undefined && { detail: body.detail || null }),
      ...(body.shareOk !== undefined && { shareOk: Boolean(body.shareOk) }),
    },
  });
  return Response.json(win);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/wins/[winId]">
) {
  const { winId } = await ctx.params;
  await prisma.win.delete({ where: { id: winId } });
  return Response.json({ ok: true });
}
