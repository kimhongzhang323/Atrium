import { desc, eq, isNull } from "drizzle-orm";

import { tenantRead } from "@/server/query";
import { events, tasks } from "@/server/db/schema";

export function listEvents() {
  return tenantRead((tx) =>
    tx.query.events.findMany({
      where: isNull(events.archivedAt),
      orderBy: [desc(events.createdAt)],
    }),
  );
}

export function getEventById(id: string) {
  return tenantRead((tx) =>
    tx.query.events.findFirst({
      where: eq(events.id, id),
      with: { tasks: true, members: true },
    }),
  );
}

export function listTasksForEvent(eventId: string) {
  return tenantRead((tx) =>
    tx.query.tasks.findMany({
      where: eq(tasks.eventId, eventId),
      with: { comments: true, owner: true },
      orderBy: [desc(tasks.createdAt)],
    }),
  );
}

export function getEventKpis(eventId: string) {
  return tenantRead(async (tx) => {
    const event = await tx.query.events.findFirst({ where: eq(events.id, eventId) });
    if (!event) return null;
    const allTasks = await tx.query.tasks.findMany({ where: eq(tasks.eventId, eventId) });
    const done = allTasks.filter((t) => t.status === "Done").length;
    return {
      budget: { total: event.budgetTotal, committed: event.budgetCommitted },
      sponsor: { target: event.sponsorTarget, secured: event.sponsorSecured },
      registrations: { target: event.registrationsTarget, current: event.registrationsCurrent },
      tasks: { total: allTasks.length, done },
    };
  });
}
