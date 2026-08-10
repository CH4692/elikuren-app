import EnsembleContent from "@/components/ensemble_content";
import { loadEnsemblePublic } from "@/lib/site-content/ensemble-public";
import { buildPublicPageMetadata } from "@/lib/site-content/seo";

export async function generateMetadata() {
  return buildPublicPageMetadata("ensemble_elikuren");
}

export default async function ElikurenPage() {
  const ensemble = await loadEnsemblePublic("ensemble_elikuren");
  if (!ensemble) return null;

  return (
    <main className="bg-background text-foreground">
      <EnsembleContent ensemble={ensemble} />
    </main>
  );
}
