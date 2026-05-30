import { redirect } from "next/navigation";

import { OrgView } from "@/components/views/org-view";
import { auth } from "@/server/auth";
import { getOrganization, listDepartments, listMembers } from "@/server/queries/org";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const [org, departments, members] = await Promise.all([
    getOrganization(),
    listDepartments(),
    listMembers(),
  ]);
  if (!org) redirect("/api/auth/signin");

  return (
    <OrgView
      org={org}
      departments={departments}
      members={members}
      currentUserId={session.user.id}
    />
  );
}
