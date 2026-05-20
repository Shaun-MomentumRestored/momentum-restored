import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/meetings/[noteId]">
) {
  const { noteId } = await ctx.params;
  const body = await request.json();
  const note = await prisma.meetingNote.update({
    where: { id: noteId },
    data: {
      ...(body.date !== undefined && { date: body.date }),
      ...(body.sessionNumber !== undefined && {
        sessionNumber: Number(body.sessionNumber),
      }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.actions !== undefined && { actions: body.actions }),
    },
  });
  return Response.json(note);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/meetings/[noteId]">
) {
  const { noteId } = await ctx.params;
  await prisma.meetingNote.delete({ where: { id: noteId } });
  return Response.json({ ok: true });
}
