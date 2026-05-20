import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/journal/[entryId]">
) {
  const { entryId } = await ctx.params;
  await prisma.journalEntry.delete({ where: { id: entryId } });
  return Response.json({ ok: true });
}
