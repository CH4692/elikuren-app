import { Mail, MapPin, Music4, Send } from "lucide-react";

import ContactForm from "@/components/form/contact-form";
import FormContent from "@/components/form/form-content";
import { SiteLink } from "@/components/site/site-link";
import {
  getGlobalOrganizationPublic,
  getSectionDataPublic,
} from "@/lib/site-content";
import { buildPublicPageMetadata } from "@/lib/site-content/seo";

export async function generateMetadata() {
  return buildPublicPageMetadata("contact");
}

export default async function ContactPage() {
  const [hero, info, org] = await Promise.all([
    getSectionDataPublic<{
      eyebrow: string;
      title: string;
      intro: string;
    }>("contact", "hero"),
    getSectionDataPublic<{
      emailTitle: string;
      emailText: string;
      emailAddress: string;
      locationTitle: string;
      mitsingenTitle: string;
      mitsingenText: string;
      mitsingenCtaLabel: string;
      mitsingenCtaHref: string;
      formEyebrow: string;
      formTitle: string;
    }>("contact", "info"),
    getGlobalOrganizationPublic(),
  ]);

  if (!hero) {
    console.error("[site-content] contact/hero missing");
    return null;
  }

  const email =
    info?.emailAddress?.trim() || org?.email || "";
  const locationLines = [
    org?.legalName || org?.choirName,
    org ? `${org.postalCode} ${org.city}`.trim() : null,
  ].filter(Boolean);

  return (
    <main className="bg-background text-foreground">
      <section className="mt-24 bg-second-primary text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[#d4aa43]">
            {hero.eyebrow}
          </p>

          <h1 className="mt-4 text-4xl font-light leading-tight sm:text-5xl lg:text-7xl">
            {hero.title}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            {hero.intro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div
          className={
            info
              ? "grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]"
              : "mx-auto max-w-2xl"
          }
        >
          {info ? (
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-border bg-secondary/40 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-2xl font-medium">{info.emailTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {info.emailText}
                </p>

                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="mt-4 inline-block text-primary underline underline-offset-4"
                  >
                    {email}
                  </a>
                ) : null}
              </div>

              <div className="rounded-[2rem] border border-border bg-secondary/40 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-2xl font-medium">
                  {info.locationTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {locationLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>

              <div className="rounded-[2rem] border border-border bg-secondary/40 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Music4 className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-2xl font-medium">
                  {info.mitsingenTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {info.mitsingenText}
                </p>

                <SiteLink
                  href={info.mitsingenCtaHref}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted/5"
                >
                  {info.mitsingenCtaLabel}
                </SiteLink>
              </div>
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-border bg-background p-6 shadow-sm lg:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary">
                  {info?.formEyebrow || "Nachricht senden"}
                </p>
                <h2 className="mt-1 text-2xl font-medium">
                  {info?.formTitle || "Kontaktformular"}
                </h2>
              </div>
            </div>

            <ContactForm>
              <FormContent />
            </ContactForm>
          </div>
        </div>
      </section>
    </main>
  );
}
