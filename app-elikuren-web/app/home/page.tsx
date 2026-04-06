import ChorleitungPage from "@/components/home-sections/chorleitung_section";
import ConcertPage from "@/components/home-sections/concerts_section";
import EnsemblesPage from "@/components/home-sections/ensembles_section";
import FooterPage from "@/components/home-sections/footer";
import LandingPage from "@/components/home-sections/landing_section";
import SupportPage from "@/components/home-sections/support_section";

export default function Home() {
  return (
    <main className="w-full">
      <LandingPage />
      <ChorleitungPage />
      <EnsemblesPage />
      <ConcertPage />
      <SupportPage />
      <FooterPage />
    </main>
  );
}
