import SupportLogo from "@/components/support-logo";
import { SiteLink } from "@/components/site/site-link";
import { getSectionDataPublic } from "@/lib/site-content";
import { resolveCmsMediaMany } from "@/lib/site-content/media";

type Sponsor = {
  id: string;
  label: string;
  href: string;
  image: unknown;
  sortOrder: number;
};

const SPONSOR_TEST_IDS: Record<string, string> = {
  seed_sponsor_goethe: "logo-goethe",
  seed_sponsor_sparkasse: "logo-sparkasse",
  seed_sponsor_musikschule: "logo-musik-schule",
};

export default async function SupportPage() {
  const data = await getSectionDataPublic<{
    headline: string;
    sponsors: Sponsor[];
  }>("home", "support");

  if (!data) return null;

  const sponsors = [...data.sponsors].sort((a, b) => a.sortOrder - b.sortOrder);
  const images = await resolveCmsMediaMany(
    sponsors.map((sponsor) => sponsor.image),
  );

  return (
    <section
      id="support"
      data-testid="home-support"
      className="flex w-screen items-center justify-center bg-second-background"
    >
      <div className="flex w-full flex-col items-center justify-around px-4 py-2 lg:flex-row">
        {data.headline.trim() ? (
          <h2 className="sr-only">{data.headline}</h2>
        ) : null}
        {sponsors.map((sponsor, index) => {
          const image = images[index];
          if (!image) return null;
          const logo = (
            <SupportLogo
              testId={SPONSOR_TEST_IDS[sponsor.id] ?? `logo-${sponsor.id}`}
              src={image.src}
              alt={image.alt || sponsor.label}
              width={284}
              height={88}
            />
          );
          if (sponsor.href.trim()) {
            return (
              <SiteLink key={sponsor.id} href={sponsor.href}>
                {logo}
              </SiteLink>
            );
          }
          return <div key={sponsor.id}>{logo}</div>;
        })}
      </div>
    </section>
  );
}
