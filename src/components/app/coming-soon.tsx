import { Sparkles } from "lucide-react";
import { EmptyState } from "./empty-state";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <EmptyState
        icon={Sparkles}
        title={`${title}: próximamente`}
        description="Estamos puliendo este módulo. El schema ya está listo en la base de datos — la UI llega en breve."
      />
    </div>
  );
}
