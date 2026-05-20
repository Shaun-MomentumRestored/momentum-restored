import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/wins">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const wins = await prisma.win.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(wins);
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/wins">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const { category, headline, value, detail, shareOk } = await request.json();
  const win = await prisma.win.create({
    data: {
      clientId: client.id,
      category,
      headline,
      value: value ? Number(value) : null,
      detail: detail || null,
      shareOk: Boolean(shareOk),
    },
  });
  return Response.json(win, { status: 201 });
}
