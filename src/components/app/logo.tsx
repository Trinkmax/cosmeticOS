import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

export function Logo({ className, priority = false }: LogoProps) {
  return (
    <Image
      src="/cosmeticOS.png"
      alt="cosmeticOS"
      width={1080}
      height={166}
      priority={priority}
      sizes="(max-width: 768px) 180px, 240px"
      className={cn("h-7 w-auto select-none", className)}
    />
  );
}
