import { redirect } from "next/navigation";

import { BudgetView } from "@/components/views/budget-view";
import { auth } from "@/server/auth";
import { listBudgetLines } from "@/server/queries/budget";
import { listEvents } from "@/server/queries/events";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const [lines, events] = await Promise.all([listBudgetLines(), listEvents()]);
  return (
    <BudgetView lines={lines} events={events.map((e) => ({ id: e.id, code: e.code }))} />
  );
}
