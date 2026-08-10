import type {
  PublicSitePageKey,
  SitePageDef,
  SiteSectionDef,
} from "@/lib/site-content/registry";
import {
  GLOBAL_PAGE_KEY,
  isGlobalPageKey,
  isPublicSitePageKey,
  PUBLIC_SITE_PAGE_KEYS,
  publicPathForPageKey,
} from "@/lib/site-content/registry";

/** Deterministic seed IDs — never random. */
const id = {
  navAbout: "seed_nav_about",
  navAboutVerein: "seed_nav_about_verein",
  navAboutChorleitung: "seed_nav_about_chorleitung",
  navAboutHistory: "seed_nav_about_history",
  navAboutProben: "seed_nav_about_proben",
  navConcerts: "seed_nav_concerts",
  navEnsembles: "seed_nav_ensembles",
  navContact: "seed_nav_contact",
  socialYt: "seed_social_youtube",
  socialFb: "seed_social_facebook",
  socialIg: "seed_social_instagram",
  board1: "seed_board_1",
  board2: "seed_board_2",
  board3: "seed_board_3",
  board4: "seed_board_4",
  ensCard1: "seed_home_ens_eight",
  ensCard2: "seed_home_ens_elikuren",
  ensCard3: "seed_home_ens_musical",
  sponsor1: "seed_sponsor_goethe",
  sponsor2: "seed_sponsor_sparkasse",
  sponsor3: "seed_sponsor_musikschule",
} as const;

function ensembleDefaults(input: {
  name: string;
  claim: string;
  intro: string;
  storySubtitle: string;
  story: string[];
  profileSubtitle: string;
  profile: { title: string; text: string }[];
  highlights: string[];
  ctaTitle: string;
  ctaText: string;
  prefix: string;
}): Record<string, { key: string; label: string; visibilityMode: "fixed" | "toggleable"; defaults: Record<string, unknown> }> {
  return {
    hero: {
      key: "hero",
      label: "Hero",
      visibilityMode: "fixed",
      defaults: {
        name: input.name,
        eyebrow: "Ensemble",
        claim: input.claim,
        intro: input.intro,
        heroImage: null,
      },
    },
    story: {
      key: "story",
      label: "Wer wir sind",
      visibilityMode: "toggleable",
      defaults: {
        subtitle: input.storySubtitle,
        paragraphs: input.story.map((text, i) => ({
          id: `seed_${input.prefix}_story_${i + 1}`,
          text,
          sortOrder: i,
        })),
      },
    },
    profile: {
      key: "profile",
      label: "Profil",
      visibilityMode: "toggleable",
      defaults: {
        subtitle: input.profileSubtitle,
        items: input.profile.map((row, i) => ({
          id: `seed_${input.prefix}_profile_${i + 1}`,
          title: row.title,
          text: row.text,
          sortOrder: i,
        })),
        highlights: input.highlights.map((text, i) => ({
          id: `seed_${input.prefix}_hl_${i + 1}`,
          text,
          sortOrder: i,
        })),
      },
    },
    gallery: {
      key: "gallery",
      label: "Galerie",
      visibilityMode: "toggleable",
      defaults: {
        items: [1, 2, 3].map((n, i) => ({
          id: `seed_${input.prefix}_gallery_${n}`,
          image: null,
          sortOrder: i,
        })),
      },
    },
    cta: {
      key: "cta",
      label: "Call to Action",
      visibilityMode: "toggleable",
      defaults: {
        title: input.ctaTitle,
        text: input.ctaText,
      },
    },
  };
}

const elikurenSections = ensembleDefaults({
  prefix: "elikuren",
  name: "Kammerchor Elikuren",
  claim:
    "Anspruchsvolle Chormusik aus Wunstorf – mit klanglicher Tiefe, stilistischer Vielfalt und Freude am gemeinsamen Musizieren.",
  intro:
    "Der Kammerchor Elikuren ist ein Vokalensemble aus Wunstorf unter der Leitung von Christiane Kampe. Das Ensemble gestaltet regelmäßig Konzerte mit sorgfältig erarbeiteten Programmen und verbindet musikalische Präzision mit einer offenen, lebendigen Chorgemeinschaft.",
  storySubtitle:
    "Ein Chor mit musikalischem Anspruch und klarer künstlerischer Handschrift",
  story: [
    "Im Mittelpunkt der Arbeit steht die intensive Auseinandersetzung mit anspruchsvoller Chorliteratur. Der Chor widmet sich geistlicher und weltlicher Musik verschiedener Epochen und sucht in seinen Programmen immer wieder nach klanglicher Vielfalt, Ausdruck und inhaltlicher Tiefe.",
    "Dabei entstehen Konzertformate, die Bekanntes und Neues miteinander verbinden. Neben romantischer Chormusik und klassischem Repertoire finden auch moderne Werke, besondere Arrangements und thematisch gestaltete Programme ihren Platz.",
    "Was Elikuren auszeichnet, ist die Verbindung aus musikalischem Anspruch und gemeinschaftlichem Musizieren: konzentrierte Probenarbeit, Freude an feinen Klangfarben und das Ziel, Konzerte mit Atmosphäre und Ausstrahlung zu gestalten.",
  ],
  profileSubtitle: "Was den Kammerchor Elikuren auszeichnet",
  profile: [
    {
      title: "Repertoire",
      text: "Geistliche und weltliche Chormusik verschiedener Epochen – von romantischer Literatur bis zu modernen und thematisch gestalteten Programmen.",
    },
    {
      title: "Klangarbeit",
      text: "Präzision, Balance, Ausdruck und ein gemeinsamer Ensembleklang stehen im Zentrum der Probenarbeit.",
    },
    {
      title: "Gemeinschaft",
      text: "Ein engagierter Chor, der musikalischen Anspruch mit Offenheit, Verlässlichkeit und gemeinsamer Entwicklung verbindet.",
    },
  ],
  highlights: [
    "Wunstorf",
    "Leitung: Christiane Kampe",
    "Anspruchsvolle Chorliteratur",
    "Thematische Konzertprogramme",
  ],
  ctaTitle: "Interesse am Kammerchor Elikuren?",
  ctaText:
    "Wer Freude an anspruchsvoller Chormusik, konzentrierter Probenarbeit und lebendigem Ensembleklang hat, ist herzlich eingeladen, Kontakt mit uns aufzunehmen.",
});

const eightSections = ensembleDefaults({
  prefix: "eight",
  name: "Eight to the Bar",
  claim:
    "Ein kleines Ensemble mit klarem Profil, musikalischer Präsenz und Freude an stilistischer Vielfalt.",
  intro:
    "Eight to the Bar ist ein Ensemble, das musikalische Energie, präzises Zusammenspiel und lebendige Bühnenpräsenz miteinander verbindet. Im kleineren Format entstehen Programme mit Nähe zum Publikum, besonderer klanglicher Transparenz und einem eigenen Charakter.",
  storySubtitle: "Ein Ensemble mit Nähe, Präzision und eigener Farbe",
  story: [
    "Im Mittelpunkt steht das gemeinsame Musizieren in einer konzentrierten, flexiblen Besetzung. Dadurch entsteht ein Klangbild, das direkt, beweglich und ausdrucksstark wirkt – mit Raum für feine Abstimmung, Rhythmusgefühl und musikalische Persönlichkeit.",
    "Das Ensemble widmet sich stilistisch vielseitigen Programmen und bringt Musik mit Leichtigkeit, Präsenz und klarer Form auf die Bühne. Gerade die kleinere Besetzung macht es möglich, unmittelbarer zu gestalten und musikalische Details besonders hörbar werden zu lassen.",
    "Eight to the Bar steht damit für ein Format, das Qualität und Lebendigkeit verbindet: aufmerksam gearbeitet, publikumsnah präsentiert und getragen von echter Freude am gemeinsamen Auftritt.",
  ],
  profileSubtitle: "Was Eight to the Bar auszeichnet",
  profile: [
    {
      title: "Klang",
      text: "Transparent, direkt und fein abgestimmt – ein Ensembleklang, der auch in kleiner Besetzung viel Ausdruck entfalten kann.",
    },
    {
      title: "Charakter",
      text: "Lebendig, präsent und nah am Publikum – mit spürbarer Energie und einem klaren musikalischen Profil.",
    },
    {
      title: "Zusammenspiel",
      text: "Die kleinere Besetzung ermöglicht besondere Aufmerksamkeit, Flexibilität und ein intensives gemeinsames Musizieren.",
    },
  ],
  highlights: [
    "Kleine Besetzung",
    "Präsenter Ensembleklang",
    "Stilistische Vielfalt",
    "Publikumsnahes Format",
  ],
  ctaTitle: "Interesse an Eight to the Bar?",
  ctaText:
    "Wenn du mehr über das Ensemble erfahren, ein Konzert besuchen oder Kontakt aufnehmen möchtest, freuen wir uns über deine Nachricht.",
});

const musicalSections = ensembleDefaults({
  prefix: "musical",
  name: "musical team",
  claim:
    "Ein Frauen-Ensemble aus Wunstorf mit Freude an klangvoller Chormusik, stilistischer Vielfalt und lebendiger Bühnenpräsenz.",
  intro:
    "Das musical team ist ein Ensemble aus dem musikalischen Umfeld von Christiane Kampe in Wunstorf. In Konzerten tritt es gemeinsam mit anderen Ensembles und dem Kammerchor Elikuren auf und verbindet musikalische Präzision mit einer offenen, lebendigen Ausstrahlung.",
  storySubtitle: "Ein Ensemble mit Nähe, Ausdruck und eigener Farbe",
  story: [
    "Das Ensemble arbeitet in kleinerer Besetzung und gestaltet dadurch Programme mit besonderer Nähe, Transparenz und Flexibilität. Der Klang bleibt fein abgestimmt, zugleich entsteht eine unmittelbare Präsenz, die gerade in Konzerten eine besondere Wirkung entfalten kann.",
    "Öffentliche Konzertankündigungen zeigen eine stilistische Bandbreite: Neben romantischer Chormusik von Komponisten wie Mendelssohn, Brahms und Schumann stehen auch neuere Werke und populärere Titel auf dem Programm. Dadurch entsteht ein Repertoire, das musikalischen Anspruch mit Abwechslung und Lebendigkeit verbindet.",
    "Das musical team steht damit für gemeinsames Musizieren auf hohem Niveau, verbunden mit Ausdruck, Freude am Klang und einer besonderen Nähe zum Publikum.",
  ],
  profileSubtitle: "Was das musical team auszeichnet",
  profile: [
    {
      title: "Repertoire",
      text: "Von romantischer Chormusik bis zu neueren und populäreren Titeln – vielseitig, abwechslungsreich und publikumsnah.",
    },
    {
      title: "Klang",
      text: "Die kleinere Besetzung ermöglicht Transparenz, feine Abstimmung und einen direkten, präsenten Ensembleklang.",
    },
    {
      title: "Ensemblegeist",
      text: "Gemeinsame musikalische Arbeit, Verlässlichkeit und Freude am Auftritt prägen das Profil des musical team.",
    },
  ],
  highlights: [
    "Frauen-Ensemble",
    "Wunstorf",
    "Leitung: Christiane Kampe",
    "Stilistische Vielfalt",
  ],
  ctaTitle: "Interesse am musical team?",
  ctaText:
    "Wenn du mehr über das Ensemble erfahren, ein Konzert besuchen oder Kontakt aufnehmen möchtest, freuen wir uns über deine Nachricht.",
});

function sectionsFromRecord(
  record: Record<string, SiteSectionDef>,
): SiteSectionDef[] {
  return Object.values(record);
}

export const SITE_PAGE_DEFS: SitePageDef[] = [
  {
    key: GLOBAL_PAGE_KEY,
    title: "Globale Inhalte",
    description: "Organisation, Navigation, Social Links und Footer",
    previewPath: null,
    sections: [
      {
        key: "organization",
        label: "Organisation & Kontakt",
        visibilityMode: "fixed",
        defaults: {
          choirName: "Kammerchor Elikuren",
          legalName: "Kammerchor Elikuren e.V.",
          email: "kammerchor.elikuren@t-online.de",
          phone: "",
          street: "Habichthorst 2a",
          postalCode: "31315",
          city: "Wunstorf",
          country: "Deutschland",
          registerNumber: "VR 203208",
          boardLines: [
            {
              id: id.board1,
              text: "Agnes Christiane Kampe (Vorstand)",
              sortOrder: 0,
            },
            {
              id: id.board2,
              text: "Niklas Pruschinski (Vorstand)",
              sortOrder: 1,
            },
            {
              id: id.board3,
              text: "Charles Heller (Vorstand)",
              sortOrder: 2,
            },
            {
              id: id.board4,
              text: "Marc Alexender Kiel (Vorstand)",
              sortOrder: 3,
            },
          ],
          contentResponsible: "Charles Heller, Immengarten 9, 31315 Wunstorf",
        },
      },
      {
        key: "navigation",
        label: "Navigation",
        visibilityMode: "fixed",
        defaults: {
          items: [
            {
              id: id.navAbout,
              label: "Über Uns",
              visible: true,
              sortOrder: 0,
              children: [
                {
                  id: id.navAboutVerein,
                  label: "Über den Verein",
                  href: "/about",
                  visible: true,
                  sortOrder: 0,
                },
                {
                  id: id.navAboutChorleitung,
                  label: "Chorleitung",
                  href: "/chorleitung",
                  visible: true,
                  sortOrder: 1,
                },
                {
                  id: id.navAboutHistory,
                  label: "Geschichte",
                  href: "/history",
                  visible: true,
                  sortOrder: 2,
                },
                {
                  id: id.navAboutProben,
                  label: "Proben & Mitsingen",
                  href: "/proben",
                  visible: true,
                  sortOrder: 3,
                },
              ],
            },
            {
              id: id.navConcerts,
              label: "Konzerte",
              href: "/home#concerts",
              visible: true,
              sortOrder: 1,
            },
            {
              id: id.navEnsembles,
              label: "Ensembles",
              href: "/home#joinus",
              visible: true,
              sortOrder: 2,
            },
            {
              id: id.navContact,
              label: "Kontakt",
              href: "/contact",
              visible: true,
              sortOrder: 3,
            },
          ],
        },
      },
      {
        key: "social",
        label: "Social Links",
        visibilityMode: "toggleable",
        defaults: {
          items: [
            {
              id: id.socialYt,
              label: "YouTube",
              url: "https://www.youtube.com/@elikuren7330",
              visible: true,
              sortOrder: 0,
            },
            {
              id: id.socialFb,
              label: "Facebook",
              url: "https://www.facebook.com/Elikuren/",
              visible: true,
              sortOrder: 1,
            },
            {
              id: id.socialIg,
              label: "Instagram",
              url: "https://www.instagram.com/kammerchor.elikuren/",
              visible: true,
              sortOrder: 2,
            },
          ],
        },
      },
      {
        key: "footer",
        label: "Footer",
        visibilityMode: "fixed",
        defaults: {
          tagline: "Kammerchor Elikuren",
          copyrightLine:
            "Copyright © 2026 Kammerchor Elikuren e.V. All rights reserved.",
          imprintLabel: "Impressum",
          privacyLabel: "Datenschutz",
        },
      },
    ],
  },
  {
    key: "home",
    title: "Startseite",
    description: "Hero, Chorleitung, Ensembles, Konzerte und Sponsoren",
    previewPath: "/home",
    sections: [
      {
        key: "landing",
        label: "Hero / Landing",
        visibilityMode: "fixed",
        defaults: {
          title: "Kammerchor Elikuren",
          tagline: "Musik, die verbindet. Stimmen, die berühren.",
          ctaLabel: "Konzerte entdecken",
          ctaHref: "/home#concerts",
          heroImage: null,
        },
      },
      {
        key: "chorleitung",
        label: "Chorleitung (Teaser)",
        visibilityMode: "toggleable",
        defaults: {
          eyebrow: "Chorleitung",
          name: "Christiane Kampe",
          body: "Seit vielen Jahren prägt Christiane Kampe die musikalische Identität unseres Chores mit Leidenschaft, Erfahrung und musikalischer Tiefe. Sie war über Jahrzehnte als engagierte Musikpädagogin an der Musikschule Wunstorf tätig und führte zahlreiche Chöre und Ensembles zu künstlerischen Höhepunkten – von anspruchsvollen Konzerten bis hin zu festlichen Auftritten in der Region.",
          ctaLabel: "Mehr erfahren",
          ctaHref: "/chorleitung",
          portrait: null,
        },
      },
      {
        key: "ensembles",
        label: "Ensembles",
        visibilityMode: "toggleable",
        defaults: {
          headline: "Unsere Ensembles",
          cards: [
            {
              id: id.ensCard1,
              title: "Eight-to-the-Bar",
              ctaLabel: "Männerchor entdecken",
              href: "/ensembles/eight-to-the-bar",
              image: null,
              sortOrder: 0,
            },
            {
              id: id.ensCard2,
              title: "Elikuren",
              ctaLabel: "Elikuren entdecken",
              href: "/ensembles/elikuren",
              image: null,
              sortOrder: 1,
            },
            {
              id: id.ensCard3,
              title: "musical team",
              ctaLabel: "musical team entdecken",
              href: "/ensembles/musical-team",
              image: null,
              sortOrder: 2,
            },
          ],
        },
      },
      {
        key: "concerts_intro",
        label: "Konzerte (Intro)",
        visibilityMode: "toggleable",
        defaults: {
          eyebrow: "Konzerte",
          emptyMessage: "Aktuell sind keine öffentlichen Konzerte geplant.",
        },
      },
      {
        key: "support",
        label: "Sponsoren / Support",
        visibilityMode: "toggleable",
        defaults: {
          headline: "",
          sponsors: [
            {
              id: id.sponsor1,
              label: "Goethe-Institut",
              href: "",
              image: null,
              sortOrder: 0,
            },
            {
              id: id.sponsor2,
              label: "Sparkasse Wunstorf",
              href: "",
              image: null,
              sortOrder: 1,
            },
            {
              id: id.sponsor3,
              label: "Musikschule Wunstorf",
              href: "",
              image: null,
              sortOrder: 2,
            },
          ],
        },
      },
    ],
  },
  {
    key: "about",
    title: "Über uns",
    description: "Verein, Profil und Highlights",
    previewPath: "/about",
    sections: [
      {
        key: "hero",
        label: "Hero",
        visibilityMode: "fixed",
        defaults: {
          eyebrow: "Über uns",
          title: "Kammerchor Elikuren e. V.",
          intro:
            "Der Kammerchor Elikuren ist ein Vokalensemble aus Wunstorf unter der Leitung von Christiane Kampe. Seit vielen Jahren prägt der Chor das kulturelle Leben der Region – mit sorgfältig erarbeiteten Programmen, klanglicher Feinheit und Freude am gemeinsamen Musizieren.",
        },
      },
      {
        key: "highlights",
        label: "Highlights",
        visibilityMode: "toggleable",
        defaults: {
          items: [
            {
              id: "seed_about_hl_1",
              title: "Künstlerisches Profil",
              text: "Anspruchsvolle Chormusik aus Wunstorf – von romantischer Literatur über moderne Werke bis zu Musical- und Poparrangements.",
              sortOrder: 0,
            },
            {
              id: "seed_about_hl_2",
              title: "Konzerte & Reisen",
              text: "Regelmäßige Auftritte in der Region und Konzertreisen im In- und Ausland, darunter kulturelle Begegnungen wie die geplante Reise nach Como.",
              sortOrder: 1,
            },
            {
              id: "seed_about_hl_3",
              title: "Soziales Engagement",
              text: "Mit Benefizkonzerten unterstützt der Chor soziale Projekte – unter anderem den Bau einer Geburtsstation in Ghana.",
              sortOrder: 2,
            },
            {
              id: "seed_about_hl_4",
              title: "Verein & Gemeinschaft",
              text: "Als Kammerchor Elikuren e. V. (Amtsgericht Hannover, VR 203208) verbinden wir musikalischen Anspruch mit lebendiger Chorgemeinschaft.",
              sortOrder: 3,
            },
          ],
        },
      },
      {
        key: "verein",
        label: "Der Verein",
        visibilityMode: "toggleable",
        defaults: {
          title: "Der Verein",
          text: "Eingetragen beim Amtsgericht Hannover unter VR 203208. Sitz: Wunstorf. Der mehrköpfige Vorstand verantwortet Organisation, Finanzen und die Freigabe neuer Mitgliederzugänge.",
          ctas: [
            {
              id: "seed_about_cta_1",
              label: "Mitglied werden",
              href: "/auth/sign-up",
              sortOrder: 0,
            },
            {
              id: "seed_about_cta_2",
              label: "Kontakt aufnehmen",
              href: "/contact",
              sortOrder: 1,
            },
            {
              id: "seed_about_cta_3",
              label: "Zur Geschichte",
              href: "/history",
              sortOrder: 2,
            },
          ],
        },
      },
    ],
  },
  {
    key: "chorleitung",
    title: "Chorleitung",
    description: "Profilseite Christiane Kampe",
    previewPath: "/chorleitung",
    sections: [
      {
        key: "hero",
        label: "Hero",
        visibilityMode: "fixed",
        defaults: {
          eyebrow: "Chorleitung",
          name: "Christiane Kampe",
          intro:
            "Christiane Kampe prägt seit Jahrzehnten die Chorszene in Wunstorf. Als erfahrene Musikpädagogin und Chorleiterin verbindet sie künstlerischen Anspruch mit einer offenen, motivierenden Probenarbeit – im Kammerchor Elikuren ebenso wie in weiteren Ensembles.",
          portrait: null,
        },
      },
      {
        key: "cards",
        label: "Info-Karten",
        visibilityMode: "toggleable",
        defaults: {
          items: [
            {
              id: "seed_chor_card_1",
              title: "Musikschule Wunstorf",
              text: "Seit 1987 war Christiane Kampe an der Musikschule Wunstorf tätig und hat Generationen von Sängerinnen und Sängern geprägt – bis hin zur Vorbereitung auf ein Musikstudium.",
              sortOrder: 0,
            },
            {
              id: "seed_chor_card_2",
              title: "Ensembles & Produktionen",
              text: "Neben dem Kammerchor Elikuren arbeitete sie mit Formationen wie dem musical team und eight to the bar sowie in zahlreichen Musical-Produktionen.",
              sortOrder: 1,
            },
            {
              id: "seed_chor_card_3",
              title: "Konzertreisen",
              text: "Mit dem Kammerchor unternahm sie regelmäßig Konzertreisen im Ausland und öffnete den Chor für kulturelle Begegnungen über Wunstorf hinaus.",
              sortOrder: 2,
            },
          ],
        },
      },
      {
        key: "handschrift",
        label: "Musikalische Handschrift",
        visibilityMode: "toggleable",
        defaults: {
          title: "Musikalische Handschrift",
          text: "Programme unter ihrer Leitung reichen von romantischer Chormusik (u. a. Mendelssohn, Rheinberger, Schubert, Elgar) bis zu stimmungsvollen Pop- und Jazzarrangements. Im Mittelpunkt stehen klangliche Feinheit, stilistische Vielfalt und die Freude am gemeinsamen Auftritt.",
          ctas: [
            {
              id: "seed_chor_cta_1",
              label: "Aktuelle Konzerte",
              href: "/home#concerts",
              sortOrder: 0,
            },
            {
              id: "seed_chor_cta_2",
              label: "Probe besuchen",
              href: "/contact",
              sortOrder: 1,
            },
          ],
        },
      },
    ],
  },
  {
    key: "history",
    title: "Geschichte",
    description: "Zeitstrahl, Chorreisen und Rückblick",
    previewPath: "/history",
    sections: [
      {
        key: "hero",
        label: "Hero",
        visibilityMode: "fixed",
        defaults: {
          eyebrow: "Geschichte",
          title: "Die Geschichte des Kammerchors Elikuren",
          text: "Die Entwicklung des Kammerchors Elikuren ist geprägt von musikalischer Leidenschaft, langjähriger Gemeinschaft, besonderen Konzerten und vielen gemeinsamen Reisen. Diese Seite lädt dazu ein, zurückzublicken auf wichtige Stationen, Erinnerungen und Bilder aus der Geschichte des Chors.",
          backgroundImage: null,
          ctas: [
            {
              id: "seed_hist_hero_cta_1",
              label: "Aktuelle Konzerte",
              href: "/home#concerts",
              sortOrder: 0,
            },
            {
              id: "seed_hist_hero_cta_2",
              label: "Über den Chor",
              href: "/about",
              sortOrder: 1,
            },
          ],
        },
      },
      {
        key: "intro",
        label: "Rückblick",
        visibilityMode: "toggleable",
        defaults: {
          eyebrow: "Rückblick",
          title: "Erinnerungen, Entwicklung und gemeinsame Wege",
          paragraphs: [
            "Über viele Jahre hinweg ist aus gemeinsamen Proben, Konzertvorbereitungen und Begegnungen eine lebendige Chorgeschichte entstanden. Sie erzählt nicht nur von musikalischen Programmen, sondern auch von Freundschaften, Reisen, besonderen Orten und der Freude am gemeinsamen Singen.",
            "Die folgenden Stationen geben einen Einblick in die Entwicklung des Kammerchors Elikuren und zeigen mit Bildern und Texten, wie sich das Ensemble im Laufe der Zeit geprägt und verändert hat.",
          ],
          image: null,
        },
      },
      {
        key: "timeline",
        label: "Zeitstrahl",
        visibilityMode: "toggleable",
        defaults: {
          eyebrow: "Zeitstrahl",
          title: "Wichtige Stationen der Chorgeschichte",
          events: [
            {
              id: "seed_hist_ev_1",
              year: "1990er",
              title: "Die Anfänge des Kammerchors Elikuren",
              text: "Die Geschichte des Kammerchors Elikuren ist geprägt von musikalischer Leidenschaft, gemeinsamer Entwicklung und vielen besonderen Begegnungen. Von den ersten Proben an stand die Freude an anspruchsvoller Chormusik und sorgfältiger Ensemblearbeit im Mittelpunkt.",
              images: [
                { id: "seed_hist_ev_1_img_1", image: null, sortOrder: 0 },
                { id: "seed_hist_ev_1_img_2", image: null, sortOrder: 1 },
              ],
              sortOrder: 0,
            },
            {
              id: "seed_hist_ev_2",
              year: "2000er",
              title: "Wachsende Konzerttätigkeit",
              text: "Mit den Jahren entwickelte sich der Chor musikalisch weiter und gestaltete regelmäßig Konzerte mit vielseitigen Programmen. Geistliche und weltliche Chormusik verschiedener Epochen prägten das Repertoire und formten das Profil des Ensembles.",
              images: [
                { id: "seed_hist_ev_2_img_1", image: null, sortOrder: 0 },
                { id: "seed_hist_ev_2_img_2", image: null, sortOrder: 1 },
              ],
              sortOrder: 1,
            },
            {
              id: "seed_hist_ev_3",
              year: "2010er",
              title: "Besondere Programme und gemeinsame Erinnerungen",
              text: "Neben den Konzerten wurden auch Chorreisen, Begegnungen und gemeinsame Projekte zu wichtigen Bestandteilen des Chorlebens. Viele dieser Erlebnisse haben die Gemeinschaft gestärkt und die Geschichte des Chors nachhaltig geprägt.",
              images: [
                { id: "seed_hist_ev_3_img_1", image: null, sortOrder: 0 },
                { id: "seed_hist_ev_3_img_2", image: null, sortOrder: 1 },
              ],
              sortOrder: 2,
            },
            {
              id: "seed_hist_ev_4",
              year: "Heute",
              title: "Tradition und Weiterentwicklung",
              text: "Heute steht der Kammerchor Elikuren weiterhin für musikalischen Anspruch, klangliche Feinheit und lebendige Gemeinschaft. Die Geschichte des Chors lebt in seinen Konzerten, Erinnerungen und den Menschen weiter, die ihn über viele Jahre geprägt haben.",
              images: [
                { id: "seed_hist_ev_4_img_1", image: null, sortOrder: 0 },
                { id: "seed_hist_ev_4_img_2", image: null, sortOrder: 1 },
              ],
              sortOrder: 3,
            },
          ],
        },
      },
      {
        key: "trips",
        label: "Chorreisen",
        visibilityMode: "toggleable",
        defaults: {
          eyebrow: "Chorreisen",
          title: "Gemeinsame Reisen und musikalische Begegnungen",
          intro:
            "Chorreisen gehören zu den besonders prägenden Erfahrungen des Ensemblelebens. Sie verbinden Musik, Gemeinschaft und kulturelle Eindrücke und schaffen Erinnerungen, die weit über einzelne Konzerte hinausreichen.",
          items: [
            {
              id: "seed_hist_trip_1",
              year: "2004",
              location: "Chorreise nach Italien",
              text: "Eine der prägenden Reisen des Chors führte nach Italien. Gemeinsame Konzerte, intensive Begegnungen und das Erleben neuer Orte machten diese Reise zu einem wichtigen Kapitel der Chorgeschichte.",
              images: [
                { id: "seed_hist_trip_1_img_1", image: null, sortOrder: 0 },
                { id: "seed_hist_trip_1_img_2", image: null, sortOrder: 1 },
              ],
              sortOrder: 0,
            },
            {
              id: "seed_hist_trip_2",
              year: "2012",
              location: "Begegnungsreise und Konzerttour",
              text: "Auch spätere Reisen verbanden musikalische Arbeit mit Gemeinschaft und kulturellen Eindrücken. Konzerte an besonderen Orten und die gemeinsame Zeit unterwegs bleiben bis heute in Erinnerung.",
              images: [
                { id: "seed_hist_trip_2_img_1", image: null, sortOrder: 0 },
                { id: "seed_hist_trip_2_img_2", image: null, sortOrder: 1 },
              ],
              sortOrder: 1,
            },
            {
              id: "seed_hist_trip_3",
              year: "Weitere Reisen",
              location: "Viele gemeinsame musikalische Wege",
              text: "Über die Jahre hinweg haben zahlreiche Reisen das Chorleben bereichert. Sie stehen für Gemeinschaft, musikalische Offenheit und die Freude daran, Musik auch außerhalb des gewohnten Rahmens miteinander zu erleben.",
              images: [
                { id: "seed_hist_trip_3_img_1", image: null, sortOrder: 0 },
                { id: "seed_hist_trip_3_img_2", image: null, sortOrder: 1 },
              ],
              sortOrder: 2,
            },
          ],
        },
      },
      {
        key: "closing",
        label: "Abschluss",
        visibilityMode: "toggleable",
        defaults: {
          eyebrow: "Heute",
          title: "Die Geschichte geht weiter",
          text: "Die Geschichte des Kammerchors Elikuren lebt in jedem neuen Konzert, in jeder Probe und in jeder Begegnung weiter. Vergangene Jahre, Reisen und Programme prägen das Ensemble bis heute – und bilden die Grundlage für alles, was noch kommt.",
          ctaLabel: "Kontakt aufnehmen",
          ctaHref: "/home#joinus",
        },
      },
    ],
  },
  {
    key: "proben",
    title: "Proben",
    description: "Probeninfos, Einstieg und FAQ",
    previewPath: "/proben",
    sections: [
      {
        key: "hero",
        label: "Hero",
        visibilityMode: "fixed",
        defaults: {
          eyebrow: "Mitsingen",
          title: "Proben & Einstieg",
          intro:
            "Ob im Kammerchor Elikuren, im musical team oder bei eight to the bar – wir verbinden sorgfältige Probenarbeit mit der Freude am gemeinsamen Klang.",
        },
      },
      {
        key: "cards",
        label: "Info-Karten",
        visibilityMode: "toggleable",
        defaults: {
          items: [
            {
              id: "seed_proben_card_1",
              title: "Probenrhythmus",
              text: "Regelmäßige Proben in Wunstorf – intensiv vor Konzerten, mit Raum für Stimmbildung und Ensembleklang.",
              sortOrder: 0,
            },
            {
              id: "seed_proben_card_2",
              title: "Ort",
              text: "Proben und Konzerte finden in und um Wunstorf statt, häufig in Kirchen und lokalen Veranstaltungsräumen.",
              sortOrder: 1,
            },
            {
              id: "seed_proben_card_3",
              title: "Was wir suchen",
              text: "Stimmlich interessierte Sängerinnen und Sänger mit Freude an anspruchsvoller Chormusik und verlässlicher Probenarbeit.",
              sortOrder: 2,
            },
            {
              id: "seed_proben_card_4",
              title: "Einstieg",
              text: "Du kannst dich unverbindlich melden. Neue Mitglieder werden nach kurzer Absprache und Freigabe durch den Vorstand aufgenommen.",
              sortOrder: 3,
            },
          ],
        },
      },
      {
        key: "cta",
        label: "Interessiert?",
        visibilityMode: "toggleable",
        defaults: {
          title: "Interessiert?",
          text: "Stelle eine Mitgliedsanfrage. Nach Prüfung durch den Vorstand erhältst du einen Magic Link zur Anmeldung.",
          ctas: [
            {
              id: "seed_proben_cta_1",
              label: "Mitgliedschaft beantragen",
              href: "/auth/sign-up",
              sortOrder: 0,
            },
            {
              id: "seed_proben_cta_2",
              label: "Fragen stellen",
              href: "/contact",
              sortOrder: 1,
            },
          ],
        },
      },
      {
        key: "faq",
        label: "FAQ",
        visibilityMode: "toggleable",
        defaults: {
          title: "Häufige Fragen",
          items: [
            {
              id: "seed_faq_1",
              question: "Brauch ich Chorerfahrung?",
              answer:
                "Erste Chorerfahrung oder sicheres Notenlesen helfen – entscheidend sind Interesse, Verlässlichkeit und Freude am gemeinsamen Klang.",
              sortOrder: 0,
            },
            {
              id: "seed_faq_2",
              question: "Wie werde ich Mitglied?",
              answer:
                "Über „Mitglied werden“ stellst du eine Anfrage. Der Vorstand prüft sie und schaltet dich danach für den Magic-Link-Login frei.",
              sortOrder: 1,
            },
            {
              id: "seed_faq_3",
              question: "Welche Ensembles gibt es?",
              answer:
                "Den Kammerchor Elikuren sowie kleinere Formationen wie eight to the bar und das musical team – je nach Stimme und Interesse.",
              sortOrder: 2,
            },
            {
              id: "seed_faq_4",
              question: "Wo finde ich Konzerttermine?",
              answer:
                "Aktuelle Konzerte stehen auf der Startseite unter „Konzerte“. Zusätzlich informieren wir über unsere Kanäle und vor Ort.",
              sortOrder: 3,
            },
          ],
        },
      },
    ],
  },
  {
    key: "contact",
    title: "Kontakt",
    description: "Kontaktseite und Infokarten",
    previewPath: "/contact",
    sections: [
      {
        key: "hero",
        label: "Hero",
        visibilityMode: "fixed",
        defaults: {
          eyebrow: "Kontakt",
          title: "Schreib uns!",
          intro:
            "Ob Konzertanfrage, Interesse am Mitsingen oder allgemeine Fragen zum Verein – melde dich gerne bei uns. Wir freuen uns über deine Nachricht.",
        },
      },
      {
        key: "info",
        label: "Info-Spalte",
        visibilityMode: "toggleable",
        defaults: {
          emailTitle: "E-Mail",
          emailText:
            "Für allgemeine Anfragen, Konzertanfragen oder Informationen zum Mitsingen.",
          emailAddress: "",
          locationTitle: "Ort",
          mitsingenTitle: "Mitsingen",
          mitsingenText:
            "Du hast Interesse, bei einem unserer Ensembles mitzusingen? Schreib uns gern ein paar Sätze über dich und deine musikalische Erfahrung.",
          mitsingenCtaLabel: "Mehr erfahren",
          mitsingenCtaHref: "/home#joinus",
          formEyebrow: "Nachricht senden",
          formTitle: "Kontaktformular",
        },
      },
    ],
  },
  {
    key: "ensemble_elikuren",
    title: "Elikuren",
    description: "Ensemble-Seite Kammerchor Elikuren",
    previewPath: "/ensembles/elikuren",
    sections: sectionsFromRecord(elikurenSections),
  },
  {
    key: "ensemble_eight",
    title: "Eight to the Bar",
    description: "Ensemble-Seite Eight to the Bar",
    previewPath: "/ensembles/eight-to-the-bar",
    sections: sectionsFromRecord(eightSections),
  },
  {
    key: "ensemble_musical",
    title: "Musical-Team",
    description: "Ensemble-Seite musical team",
    previewPath: "/ensembles/musical-team",
    sections: sectionsFromRecord(musicalSections),
  },
];

export function getSitePageDef(pageKey: string): SitePageDef | null {
  return SITE_PAGE_DEFS.find((p) => p.key === pageKey) ?? null;
}

/** Alias for registry-driven CMS UI. */
export const getSitePageDefinition = getSitePageDef;

export function getSectionDef(
  pageKey: string,
  sectionKey: string,
): SiteSectionDef | null {
  return (
    getSitePageDef(pageKey)?.sections.find((s) => s.key === sectionKey) ?? null
  );
}

export type PublicSitePageDefinition = {
  key: PublicSitePageKey;
  title: string;
  adminDescription: string;
  publicPath: string;
};

export type GlobalSectionDefinition = {
  key: string;
  title: string;
  adminDescription: string;
};

export const GLOBAL_SECTION_KEYS = [
  "organization",
  "navigation",
  "social",
  "footer",
] as const;

export type GlobalSectionKey = (typeof GLOBAL_SECTION_KEYS)[number];

const GLOBAL_SECTION_ADMIN_DESCRIPTIONS: Record<GlobalSectionKey, string> = {
  organization: "Name, Adresse, E-Mail und Vorstand",
  navigation: "Menüpunkte der öffentlichen Website",
  social: "YouTube, Facebook, Instagram und weitere Links",
  footer: "Tagline, Copyright und Legal-Labels",
};

export function isGlobalSectionKey(key: string): key is GlobalSectionKey {
  return (GLOBAL_SECTION_KEYS as readonly string[]).includes(key);
}

export function getPublicSitePageDefinition(
  pageKey: string,
): PublicSitePageDefinition | null {
  if (!isPublicSitePageKey(pageKey)) return null;
  const def = getSitePageDef(pageKey);
  if (!def) return null;
  return {
    key: pageKey,
    title: def.title,
    adminDescription: def.description,
    publicPath: publicPathForPageKey(pageKey),
  };
}

export function getGlobalSectionDefinition(
  sectionKey: string,
): GlobalSectionDefinition | null {
  if (!isGlobalSectionKey(sectionKey)) return null;
  const section = getSectionDef(GLOBAL_PAGE_KEY, sectionKey);
  if (!section) return null;
  return {
    key: sectionKey,
    title: section.label,
    adminDescription: GLOBAL_SECTION_ADMIN_DESCRIPTIONS[sectionKey],
  };
}

export function listPublicSitePageDefinitions(): PublicSitePageDefinition[] {
  return PUBLIC_SITE_PAGE_KEYS.map((key) => {
    const def = getPublicSitePageDefinition(key);
    if (!def) throw new Error(`Missing public page definition: ${key}`);
    return def;
  });
}

export function listGlobalSectionDefinitions(): GlobalSectionDefinition[] {
  return GLOBAL_SECTION_KEYS.map((key) => {
    const def = getGlobalSectionDefinition(key);
    if (!def) throw new Error(`Missing global section definition: ${key}`);
    return def;
  });
}

/** Preview URL for admin; global falls back to /home. Paths from registry SSOT. */
export function previewPathForPageKey(pageKey: string): string | null {
  if (isGlobalPageKey(pageKey)) return "/home";
  if (!isPublicSitePageKey(pageKey)) return null;
  return publicPathForPageKey(pageKey);
}
