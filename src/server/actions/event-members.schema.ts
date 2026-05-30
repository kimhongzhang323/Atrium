import { z } from "zod";

export const addEventMemberSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum([
    "director", "vice_director", "secretary", "treasurer",
    "dept_head", "protocol", "committee",
  ]),
});

export const removeEventMemberSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
});
