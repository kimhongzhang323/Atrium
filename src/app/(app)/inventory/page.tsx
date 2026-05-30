import { redirect } from "next/navigation";

import { InventoryView } from "@/components/views/inventory-view";
import { auth } from "@/server/auth";
import { listInventoryItems } from "@/server/queries/inventory";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const items = await listInventoryItems();
  return <InventoryView items={items} />;
}
