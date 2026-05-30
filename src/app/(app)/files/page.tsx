import { redirect } from "next/navigation";

import { FilesView } from "@/components/views/files-view";
import { auth } from "@/server/auth";
import { listFileLinks } from "@/server/queries/files";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const files = await listFileLinks();
  return <FilesView files={files} />;
}
