import { prisma } from "@/lib/prisma";

export async function GET() {
  const wins = await prisma.win.findMany({
    where: { shareOk: true },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  });
  return Response.json(wins);
}
