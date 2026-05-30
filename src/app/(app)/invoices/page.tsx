import { redirect } from "next/navigation";

import { InvoicesView } from "@/components/views/invoices-view";
import { auth } from "@/server/auth";
import { listInvoices } from "@/server/queries/invoices";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const invoices = await listInvoices();
  return <InvoicesView invoices={invoices} />;
}
