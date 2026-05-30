import { InventoryMoveControl } from "./inventory-move-control";

import type { listInventoryItems } from "@/server/queries/inventory";

type ItemRow = Awaited<ReturnType<typeof listInventoryItems>>[number];

export function InventoryView({ items }: { items: ItemRow[] }) {
  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">INVENTORY</div>
          <h1 className="view-title">Inventory</h1>
          <p className="view-subtitle">{items.length} tracked items</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>No inventory items yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body tight">
            {items.map((it) => (
              <div className="row-item" key={it.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{it.name}</div>
                  {it.sku && <div className="row-sub">{it.sku}</div>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, width: 60, textAlign: "right" }}>
                  {it.quantityOnHand}
                </div>
                <InventoryMoveControl itemId={it.id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
