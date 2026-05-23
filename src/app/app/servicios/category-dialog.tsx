"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCategoryAction, type Result } from "./actions";

const PALETTE = ["#a78bfa", "#f472b6", "#fb7185", "#fb923c", "#facc15", "#a3e635", "#34d399", "#22d3ee", "#60a5fa", "#818cf8"];

export function CategoryDialog() {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(PALETTE[0]!);
  const [state, submit] = useActionState<Result | null, FormData>(createCategoryAction, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Categoría creada");
      setOpen(false);
    }
    if (state && !state.ok) toast.error(state.error);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default">
          <FolderPlus />
          Categoría
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
          <DialogDescription>Agrupá servicios similares para encontrarlos rápido.</DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <input type="hidden" name="color" value={color} />
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nombre</Label>
            <Input id="cat-name" name="name" required autoFocus placeholder="Uñas, Facial, Masajes…" />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`size-8 rounded-full transition-transform ${
                    c === color ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="brand" loading={pending}>
      Crear
    </Button>
  );
}
