import { redirect } from "next/navigation";

import { EventsView } from "@/components/views/events-view";
import { auth } from "@/server/auth";
import { listEvents } from "@/server/queries/events";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const events = await listEvents();
  return <EventsView events={events} />;
}
