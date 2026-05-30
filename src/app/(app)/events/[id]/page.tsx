import { notFound, redirect } from "next/navigation";

import { EventDetailView } from "@/components/views/event-detail-view";
import { auth } from "@/server/auth";
import { getEventById } from "@/server/queries/events";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return <EventDetailView event={event} />;
}
