import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blush-100 text-blush-700",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        outline: "text-foreground border-border/80",
        success: "border-transparent bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
        warning: "border-transparent bg-peach-100 text-peach-700 dark:bg-peach-900/40 dark:text-peach-200",
        soft: "border-transparent bg-cream-100 text-cream-700",
        brand: "border-transparent bg-gradient-to-br from-blush-100 to-peach-100 text-blush-700",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
