import { isAuthorizedCron } from "@/server/cron-auth";
import { generateSignals, snapshotEvents } from "@/server/workers/signals";

export async function GET(req: Request): Promise<Response> {
  if (!isAuthorizedCron(req)) return new Response("Unauthorized", { status: 401 });
  const snapshots = await snapshotEvents();
  const signals = await generateSignals();
  return Response.json({ ...snapshots, ...signals });
}
