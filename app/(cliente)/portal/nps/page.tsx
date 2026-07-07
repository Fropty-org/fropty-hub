import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { NpsForm } from "@/app/components/cliente/NpsForm";

export const metadata: Metadata = { title: "Avaliação" };

export default function NpsPage() {
  return (
    <div className="hub-page" style={{ maxWidth: 640, margin: "0 auto" }}>
      <PageHeader
        title="Como estamos indo?"
        subtitle="Leva menos de um minuto e ajuda muito a Fropty a melhorar."
      />
      <NpsForm />
    </div>
  );
}
