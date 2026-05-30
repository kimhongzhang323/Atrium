import { redirect } from "next/navigation";

import { SponsorsView } from "@/components/views/sponsors-view";
import { auth } from "@/server/auth";
import { listSponsors } from "@/server/queries/sponsors";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const sponsors = await listSponsors();
  return <SponsorsView sponsors={sponsors} />;
}
