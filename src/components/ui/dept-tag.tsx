import { DEPTS } from "@/lib/data";
import type { DeptId } from "@/lib/types";

export function DeptTag({ id }: { id: DeptId }) {
  const dept = DEPTS.find((d) => d.id === id);
  return <span className={`dept-tag dept-${id}`}>{dept?.name ?? id}</span>;
}
