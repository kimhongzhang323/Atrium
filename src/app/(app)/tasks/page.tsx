import { redirect } from "next/navigation";

import { TasksView } from "@/components/views/tasks-view";
import { auth } from "@/server/auth";
import { listTasks } from "@/server/queries/tasks";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const tasks = await listTasks();
  return <TasksView tasks={tasks} />;
}
