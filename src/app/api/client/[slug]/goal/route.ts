import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/goal">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const goal = await prisma.goal12Month.findUnique({
    where: { clientId: client.id },
  });
  return Response.json(goal);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/goal">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const { headline, milestone1, milestone2, milestone3, whyMatters, committed } =
    await request.json();

  const goal = await prisma.goal12Month.upsert({
    where: { clientId: client.id },
    create: {
      clientId: client.id,
      headline: headline || "",
      milestone1: milestone1 || "",
      milestone2: milestone2 || "",
      milestone3: milestone3 || "",
      whyMatters: whyMatters || "",
      committed: Boolean(committed),
    },
    update: {
      headline: headline || "",
      milestone1: milestone1 || "",
      milestone2: milestone2 || "",
      milestone3: milestone3 || "",
      whyMatters: whyMatters || "",
      committed: Boolean(committed),
    },
  });
  return Response.json(goal);
}
