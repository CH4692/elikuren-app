import EnsembleContent from "@/components/ensemble_content";
import { loadEnsemblePublic } from "@/lib/site-content/ensemble-public";
import { buildPublicPageMetadata } from "@/lib/site-content/seo";

export async function generateMetadata() {
  return buildPublicPageMetadata("ensemble_musical");
}

export default async function MusicalTeamPage() {
  const ensemble = await loadEnsemblePublic("ensemble_musical");
  if (!ensemble) return null;

  return (
    <main className="bg-background text-foreground">
      <EnsembleContent ensemble={ensemble} />
    </main>
  );
}
