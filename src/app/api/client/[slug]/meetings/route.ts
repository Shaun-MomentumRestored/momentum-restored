import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/meetings">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const notes = await prisma.meetingNote.findMany({
    where: { clientId: client.id },
    orderBy: { date: "desc" },
  });
  return Response.json(notes);
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/meetings">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const { date, sessionNumber, notes, actions } = await request.json();
  const note = await prisma.meetingNote.create({
    data: {
      clientId: client.id,
      date,
      sessionNumber: Number(sessionNumber),
      notes: notes || "",
      actions: actions || "",
    },
  });
  return Response.json(note, { status: 201 });
}
