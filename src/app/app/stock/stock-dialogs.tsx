"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProductAction, createInventoryAction } from "./actions";

export function NewProductDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", sku: "", price: "", cost: "", stock: "0", min: "0" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createProductAction({
        name: form.name,
        sku: form.sku || null,
        price_cents: Math.round(Number(form.price) || 0),
        cost_cents: form.cost ? Math.round(Number(form.cost)) : null,
        stock_quantity: Number(form.stock) || 0,
        min_stock: Number(form.min) || 0,
        stock_tracked: true,
        is_active: true,
      });
      if (res.ok) {
        toast.success("Producto creado");
        setOpen(false);
        setForm({ name: "", sku: "", price: "", cost: "", stock: "0", min: "0" });
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand">
          <Plus />
          Nuevo producto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input required autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>SKU <span className="text-xs text-muted-foreground font-normal">(opcional)</span></Label>
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Precio (ARS)</Label>
              <Input type="number" min="0" step="100" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Costo (ARS)</Label>
              <Input type="number" min="0" step="100" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stock</Label>
              <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Mínimo</Label>
              <Input type="number" min="0" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="brand" loading={pending}>Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewInventoryDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", unit: "unidad", stock: "0", min: "0", cost: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createInventoryAction({
        name: form.name,
        unit: form.unit,
        stock_quantity: Number(form.stock) || 0,
        min_stock: Number(form.min) || 0,
        cost_cents: form.cost ? Math.round(Number(form.cost)) : null,
      });
      if (res.ok) {
        toast.success("Insumo creado");
        setOpen(false);
        setForm({ name: "", unit: "unidad", stock: "0", min: "0", cost: "" });
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Insumo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo insumo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input required autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Esmalte rojo, cera, ampolla…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Unidad</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="ml, gr, unidad" />
            </div>
            <div className="space-y-1.5">
              <Label>Costo (ARS)</Label>
              <Input type="number" min="0" step="100" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stock actual</Label>
              <Input type="number" min="0" step="0.001" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Mínimo</Label>
              <Input type="number" min="0" step="0.001" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="brand" loading={pending}>Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
