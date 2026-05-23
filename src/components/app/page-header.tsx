import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border/60 bg-background/80 px-4 py-4 md:flex-row md:items-end md:justify-between md:px-8 md:py-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground md:mt-1 md:text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">{actions}</div>
      ) : null}
    </div>
  );
}
