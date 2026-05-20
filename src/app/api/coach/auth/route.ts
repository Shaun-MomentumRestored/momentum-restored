import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { password } = await request.json();
  const expected = (process.env.COACH_PASSWORD || "momentum2025").replace(/^﻿/, "").trim();

  if (password !== expected) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("coach_session", "true", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("coach_session");
  return Response.json({ ok: true });
}
