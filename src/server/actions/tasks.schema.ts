import { z } from "zod";

export const createTaskSchema = z.object({
  eventId: z.string().uuid(),
  title: z.string().min(1).max(160),
  dept: z.enum(["SPR", "PnP", "PUB", "LOGI", "MM", "TECH"]),
  ownerId: z.string().uuid().optional(),
  due: z.coerce.date().optional(),
});

export const updateTaskStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["Backlog", "In Progress", "Review", "Done"]),
});

export const assignTaskSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid().nullable(),
});

export const commentOnTaskSchema = z.object({
  taskId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});
