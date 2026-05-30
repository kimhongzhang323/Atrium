import { redirect } from "next/navigation";

import { TeamView } from "@/components/views/team-view";
import { auth } from "@/server/auth";
import { listMembers } from "@/server/queries/org";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const members = await listMembers();
  return <TeamView members={members} />;
}
