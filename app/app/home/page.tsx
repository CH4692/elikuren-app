import ChorleitungPage from "@/components/home-sections/chorleitung_section";
import ConcertPage from "@/components/home-sections/concerts_section";
import EnsemblesPage from "@/components/home-sections/ensembles_section";
import LandingPage from "@/components/home-sections/landing_section";
import SupportPage from "@/components/home-sections/support_section";
import { buildPublicPageMetadata } from "@/lib/site-content/seo";

/**
 * CMS page payload + concerts candidates use tagged unstable_cache with
 * immediate expire on mutation. No force-dynamic — invalidation is proven via
 * revalidateTag({ expire: 0 }) + revalidatePath.
 */

export async function generateMetadata() {
  return buildPublicPageMetadata("home");
}

export default function Home() {
  return (
    <main className="w-full">
      <LandingPage />
      <ChorleitungPage />
      <EnsemblesPage />
      <ConcertPage />
      <SupportPage />
    </main>
  );
}
