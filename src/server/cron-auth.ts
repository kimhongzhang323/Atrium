/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Reject anything else
 * so the cron endpoints can't be triggered by the public.
 */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
