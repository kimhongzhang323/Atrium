import { EVENTS } from "@/lib/data";
import { StubView } from "@/components/views/stub-view";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === id);
  return (
    <StubView
      title={event?.name ?? "Event"}
      subtitle={event ? `${event.code} · ${event.venue}` : "Event not found"}
      source="views-1.jsx → EventDetailView"
    />
  );
}
