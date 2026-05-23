import { AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { formatCents } from "@/lib/utils";
import { NewProductDialog, NewInventoryDialog } from "./stock-dialogs";

export default async function StockPage() {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: products }, { data: inventory }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sku, price_cents, cost_cents, stock_quantity, min_stock, stock_tracked, is_active")
      .order("name"),
    supabase
      .from("inventory_items")
      .select("id, name, unit, stock_quantity, min_stock, cost_cents, is_active")
      .order("name"),
  ]);

  const lowProducts = (products ?? []).filter((p) => p.stock_tracked && p.stock_quantity <= p.min_stock);
  const lowInventory = (inventory ?? []).filter((i) => Number(i.stock_quantity) <= Number(i.min_stock));

  return (
    <>
      <PageHeader
        title="Stock"
        description="Productos vendibles y los insumos que consumís en cada servicio."
        actions={
          <>
            <NewInventoryDialog />
            <NewProductDialog />
          </>
        }
      />

      <div className="container mx-auto px-4 py-6 md:px-8">
        {(lowProducts.length > 0 || lowInventory.length > 0) && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-peach-200 bg-peach-50 p-4">
            <AlertTriangle className="mt-0.5 size-4 text-peach-700" />
            <div className="text-sm">
              <strong className="text-peach-700">Alertas de stock bajo:</strong>{" "}
              <span className="text-foreground/80">
                {lowProducts.length + lowInventory.length} {lowProducts.length + lowInventory.length === 1 ? "item" : "items"} bajo el mínimo.
              </span>
            </div>
          </div>
        )}

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Productos · {products?.length ?? 0}</TabsTrigger>
            <TabsTrigger value="inventory">Insumos · {inventory?.length ?? 0}</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {(products ?? []).length === 0 ? (
              <EmptyState icon={Package} title="Sin productos cargados" description="Cargá productos que vendés en mostrador." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/60 bg-cream-100/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Producto</th>
                      <th className="px-4 py-3 text-left">SKU</th>
                      <th className="px-4 py-3 text-right">Precio</th>
                      <th className="px-4 py-3 text-right">Stock</th>
                      <th className="px-4 py-3 text-right">Mín.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {products!.map((p) => {
                      const low = p.stock_tracked && p.stock_quantity <= p.min_stock;
                      return (
                        <tr key={p.id} className={low ? "bg-peach-50/60" : ""}>
                          <td className="px-4 py-3 font-medium">{p.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{p.sku ?? "—"}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{formatCents(p.price_cents)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {p.stock_tracked ? (
                              <span className={low ? "font-semibold text-peach-700" : ""}>{p.stock_quantity}</span>
                            ) : (
                              <Badge variant="soft" className="text-[10px]">No track</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums">
                            {p.stock_tracked ? p.min_stock : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="inventory">
            {(inventory ?? []).length === 0 ? (
              <EmptyState icon={Package} title="Sin insumos cargados" description="Cargá los insumos que consumen tus servicios para descontar automáticamente." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/60 bg-cream-100/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Insumo</th>
                      <th className="px-4 py-3 text-left">Unidad</th>
                      <th className="px-4 py-3 text-right">Stock</th>
                      <th className="px-4 py-3 text-right">Mín.</th>
                      <th className="px-4 py-3 text-right">Costo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {inventory!.map((i) => {
                      const low = Number(i.stock_quantity) <= Number(i.min_stock);
                      return (
                        <tr key={i.id} className={low ? "bg-peach-50/60" : ""}>
                          <td className="px-4 py-3 font-medium">{i.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{i.unit}</td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            <span className={low ? "font-semibold text-peach-700" : ""}>{i.stock_quantity}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums">{i.min_stock}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{i.cost_cents ? formatCents(i.cost_cents) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
