import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/contract">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const contract = await prisma.executionContract.findUnique({
    where: { clientId: client.id },
  });
  return Response.json(contract);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/contract">
) {
  const { slug } = await ctx.params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });

  const { commitment1, commitment2, commitment3, commitment4, consequences, signed } =
    await request.json();

  const contract = await prisma.executionContract.upsert({
    where: { clientId: client.id },
    create: {
      clientId: client.id,
      commitment1: commitment1 || "",
      commitment2: commitment2 || "",
      commitment3: commitment3 || "",
      commitment4: commitment4 || "",
      consequences: consequences || "",
      signed: Boolean(signed),
      signedAt: signed ? new Date() : null,
    },
    update: {
      commitment1: commitment1 || "",
      commitment2: commitment2 || "",
      commitment3: commitment3 || "",
      commitment4: commitment4 || "",
      consequences: consequences || "",
      signed: Boolean(signed),
      ...(signed && { signedAt: new Date() }),
    },
  });
  return Response.json(contract);
}
