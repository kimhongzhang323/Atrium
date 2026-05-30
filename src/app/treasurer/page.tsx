import { redirect } from "next/navigation";

import { TreasurerConsole } from "@/components/views/treasurer-console";
import { auth } from "@/server/auth";
import { listBudgetLines } from "@/server/queries/budget";
import { listInvoices } from "@/server/queries/invoices";

export default async function TreasurerPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const [invoices, budgetLines] = await Promise.all([listInvoices(), listBudgetLines()]);
  return (
    <div style={{ height: "100vh", overflow: "auto", background: "var(--bg)" }}>
      <TreasurerConsole invoices={invoices} budgetLines={budgetLines} />
    </div>
  );
}
