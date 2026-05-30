import { redirect } from "next/navigation";

import { DrawView } from "@/components/views/draw-view";
import { auth } from "@/server/auth";
import { listDrawEntries, listDrawResults } from "@/server/queries/draw";
import { listEvents } from "@/server/queries/events";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const [results, entries, events] = await Promise.all([
    listDrawResults(),
    listDrawEntries(),
    listEvents(),
  ]);
  return (
    <DrawView
      results={results}
      entries={entries}
      events={events.map((e) => ({ id: e.id, code: e.code }))}
    />
  );
}
