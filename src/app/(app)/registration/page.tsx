import { redirect } from "next/navigation";

import { RegistrationsView } from "@/components/views/registrations-view";
import { auth } from "@/server/auth";
import { listRegistrations } from "@/server/queries/registrations";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const registrations = await listRegistrations();
  return <RegistrationsView registrations={registrations} />;
}
