import { redirect } from "next/navigation";

import { TimelineView } from "@/components/views/timeline-view";
import { auth } from "@/server/auth";
import { listEvents } from "@/server/queries/events";
import { listTasks } from "@/server/queries/tasks";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const [events, tasks] = await Promise.all([listEvents(), listTasks()]);
  return <TimelineView events={events} tasks={tasks} />;
}
