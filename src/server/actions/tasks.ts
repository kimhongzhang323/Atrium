"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import { defineAction } from "@/server/action";
import { taskComments, tasks } from "@/server/db/schema";

import {
  assignTaskSchema,
  commentOnTaskSchema,
  createTaskSchema,
  updateTaskStatusSchema,
} from "./tasks.schema";

export const createTask = defineAction({
  name: "task.create",
  input: createTaskSchema,
  permission: "task.create",
  async handler({ session, tx, audit, emit }, input) {
    const [row] = await tx
      .insert(tasks)
      .values({
        orgId: session.orgId,
        eventId: input.eventId,
        title: input.title,
        dept: input.dept,
        ownerId: input.ownerId,
        due: input.due,
      })
      .returning();
    if (!row) throw new Error("Failed to create task");

    await audit({ action: "task.create", targetType: "task", targetId: row.id, after: row });
    await emit({ type: "task.created", payload: { taskId: row.id, eventId: row.eventId, dept: row.dept } });

    updateTag(`dept:${session.orgId}:${row.dept}:tasks`);
    return { task: row };
  },
});

export const updateTaskStatus = defineAction({
  name: "task.update_status",
  input: updateTaskStatusSchema,
  permission: "task.update",
  async handler({ session, tx, audit, emit }, { id, status }) {
    const before = await tx.query.tasks.findFirst({ where: eq(tasks.id, id) });
    if (!before) throw new Error("Task not found");

    const [after] = await tx
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, id))
      .returning();

    await audit({ action: "task.update_status", targetType: "task", targetId: id, before, after });
    if (status === "Done") {
      await emit({ type: "task.completed", payload: { taskId: id, eventId: before.eventId } });
    }
    updateTag(`dept:${session.orgId}:${before.dept}:tasks`);
    return { task: after };
  },
});

export const assignTask = defineAction({
  name: "task.assign",
  input: assignTaskSchema,
  permission: "task.assign",
  async handler({ session, tx, audit, emit }, { id, ownerId }) {
    const before = await tx.query.tasks.findFirst({ where: eq(tasks.id, id) });
    if (!before) throw new Error("Task not found");

    const [after] = await tx
      .update(tasks)
      .set({ ownerId })
      .where(eq(tasks.id, id))
      .returning();

    await audit({ action: "task.assign", targetType: "task", targetId: id, before, after });
    if (ownerId) await emit({ type: "task.assigned", payload: { taskId: id, ownerId } });
    updateTag(`dept:${session.orgId}:${before.dept}:tasks`);
    return { task: after };
  },
});

export const commentOnTask = defineAction({
  name: "task.comment",
  input: commentOnTaskSchema,
  permission: "task.comment",
  async handler({ session, tx, emit }, { taskId, body }) {
    const [row] = await tx
      .insert(taskComments)
      .values({ orgId: session.orgId, taskId, authorId: session.userId, body })
      .returning();
    if (!row) throw new Error("Failed to add comment");

    await emit({ type: "task.commented", payload: { taskId, commentId: row.id } });
    updateTag(`task:${taskId}:comments`);
    return { comment: row };
  },
});
