import { prisma } from "@/lib/prisma";

// One-time migration endpoint — adds the `repeat` column to Task table.
// POST /api/admin/migrate?secret=mr-migrate-2026
export async function POST(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  if (secret !== "mr-migrate-2026") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Task" ADD COLUMN "repeat" TEXT NOT NULL DEFAULT 'none'`
    );
    return Response.json({ ok: true, message: "Column 'repeat' added to Task table." });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.toLowerCase().includes("duplicate column") ||
      msg.toLowerCase().includes("already exists")
    ) {
      return Response.json({ ok: true, message: "Column already existed — no action needed." });
    }
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
