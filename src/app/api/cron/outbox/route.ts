import { isAuthorizedCron } from "@/server/cron-auth";
import { processOutbox } from "@/server/workers/outbox";

export async function GET(req: Request): Promise<Response> {
  if (!isAuthorizedCron(req)) return new Response("Unauthorized", { status: 401 });
  const result = await processOutbox();
  return Response.json(result);
}
