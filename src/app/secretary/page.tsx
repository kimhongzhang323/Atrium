import { redirect } from "next/navigation";

import { SecretaryConsole } from "@/components/views/secretary-console";
import { auth } from "@/server/auth";
import { listFileLinks } from "@/server/queries/files";

export default async function SecretaryPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const files = await listFileLinks();
  return (
    <div style={{ height: "100vh", overflow: "auto", background: "var(--bg)" }}>
      <SecretaryConsole files={files} />
    </div>
  );
}
