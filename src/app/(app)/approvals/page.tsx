import { redirect } from "next/navigation";

import { ApprovalsView } from "@/components/views/approvals-view";
import { auth } from "@/server/auth";
import { listInvoices } from "@/server/queries/invoices";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const invoices = await listInvoices();
  return <ApprovalsView invoices={invoices} />;
}
