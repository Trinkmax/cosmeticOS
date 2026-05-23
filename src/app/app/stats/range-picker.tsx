"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "1 año", value: 365 },
];

export function RangePicker({ current }: { current: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const sp = useSearchParams();

  function pick(days: number) {
    const params = new URLSearchParams(sp);
    params.set("days", String(days));
    startTransition(() => router.push(`/app/stats?${params.toString()}`));
  }

  return (
    <div className="inline-flex h-9 rounded-lg bg-cream-100 p-1">
      {OPTIONS.map((o) => (
        <Button
          key={o.value}
          variant={o.value === current ? "default" : "ghost"}
          size="sm"
          disabled={pending}
          onClick={() => pick(o.value)}
          className="h-7 px-3 text-xs"
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}
