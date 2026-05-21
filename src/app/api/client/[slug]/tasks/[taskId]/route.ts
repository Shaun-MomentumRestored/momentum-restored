import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/tasks/[taskId]">
) {
  const { taskId } = await ctx.params;
  const body = await request.json();

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.estimatedMins !== undefined && {
        estimatedMins: Number(body.estimatedMins),
      }),
      ...(body.actualMins !== undefined && {
        actualMins: Number(body.actualMins),
      }),
      ...(body.sessions !== undefined && { sessions: Number(body.sessions) }),
      ...(body.abandoned !== undefined && { abandoned: body.abandoned }),
      ...(body.completedDays !== undefined && {
        completedDays: JSON.stringify(body.completedDays),
      }),
      ...(body.done !== undefined && { done: body.done }),
      ...(body.timerState !== undefined && {
        timerState:
          body.timerState === null
            ? null
            : JSON.stringify(body.timerState),
      }),
      ...(body.repeat !== undefined && { repeat: body.repeat }),
    },
  });
  return Response.json(task);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/client/[slug]/tasks/[taskId]">
) {
  const { taskId } = await ctx.params;
  await prisma.task.delete({ where: { id: taskId } });
  return Response.json({ ok: true });
}

// Called by sendBeacon on browser close
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/client/[slug]/tasks/[taskId]">
) {
  const { taskId } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad body" }, { status: 400 });
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      abandoned: true,
      ...(body.actualMins !== undefined && {
        actualMins: Number(body.actualMins),
      }),
      ...(body.sessions !== undefined && { sessions: Number(body.sessions) }),
      ...(body.timerState !== undefined && {
        timerState: JSON.stringify(body.timerState),
      }),
    },
  });
  return Response.json({ ok: true });
}
