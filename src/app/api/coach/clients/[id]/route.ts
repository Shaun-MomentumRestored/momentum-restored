import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/coach/clients/[id]">
) {
  const { id } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(client);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/coach/clients/[id]">
) {
  const { id } = await ctx.params;
  await prisma.client.delete({ where: { id } });
  return Response.json({ ok: true });
}
