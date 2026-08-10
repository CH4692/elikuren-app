/** Short admin explanations per page/section (not schema keys as UI). */
export const CMS_SECTION_HELP: Record<string, string> = {
  "global/organization":
    "Diese Angaben werden u. a. in Kontakt, Impressum und Datenschutz verwendet.",
  "global/navigation": "Hauptnavigation der öffentlichen Website.",
  "global/social": "Social-Media-Links im Footer und ggf. weiteren Bereichen.",
  "global/footer":
    "Footer-Texte. Links zu Impressum und Datenschutz sind fest hinterlegt.",
  "home/landing": "Hero der Startseite mit Titel, Tagline und Call-to-Action.",
  "home/concerts_intro":
    "Einleitungstexte für den Konzertbereich. Einzelkonzerte werden separat verwaltet.",
  "home/ensembles": "Ensemble-Karten auf der Startseite.",
  "home/chorleitung": "Chorleitungs-Teaser auf der Startseite.",
  "home/support": "Sponsoren-Logos und Support-Bereich.",
  "about/hero": "Kopfbereich der Über-uns-Seite.",
  "about/highlights": "Kurz-Highlights unter dem Hero.",
  "about/verein": "Vereins-Abschnitt mit Call-to-Actions.",
  "chorleitung/hero": "Kopfbereich der Chorleitungsseite.",
  "chorleitung/cards": "Info-Karten zur Chorleitung.",
  "chorleitung/handschrift": "Abschnitt zur musikalischen Handschrift.",
  "history/hero": "Kopfbereich der Geschichtsseite.",
  "history/intro": "Einleitender Rückblick.",
  "history/timeline": "Chronologischer Zeitstrahl.",
  "history/trips": "Chorreisen und Ausflüge.",
  "history/closing": "Abschluss mit Call-to-Action.",
  "proben/hero": "Kopfbereich der Proben-Seite.",
  "proben/cards": "Info-Karten zu Proben und Mitsingen.",
  "proben/cta": "Call-to-Action-Bereich.",
  "proben/faq": "Häufig gestellte Fragen.",
  "contact/hero": "Kopfbereich der Kontaktseite.",
  "contact/info":
    "Info-Spalte neben dem Kontaktformular. Organisationsdaten kommen aus den globalen Inhalten.",
  "ensemble_elikuren/hero": "Hero des Ensembles Elikuren.",
  "ensemble_elikuren/story": "Erzählender Abschnitt.",
  "ensemble_elikuren/profile": "Profil und Highlights.",
  "ensemble_elikuren/gallery": "Bildergalerie.",
  "ensemble_elikuren/cta": "Call-to-Action am Seitenende.",
  "ensemble_eight/hero": "Hero von Eight to the Bar.",
  "ensemble_eight/story": "Erzählender Abschnitt.",
  "ensemble_eight/profile": "Profil und Highlights.",
  "ensemble_eight/gallery": "Bildergalerie.",
  "ensemble_eight/cta": "Call-to-Action am Seitenende.",
  "ensemble_musical/hero": "Hero des Musical Teams.",
  "ensemble_musical/story": "Erzählender Abschnitt.",
  "ensemble_musical/profile": "Profil und Highlights.",
  "ensemble_musical/gallery": "Bildergalerie.",
  "ensemble_musical/cta": "Call-to-Action am Seitenende.",
};

export function cmsSectionHelp(
  pageKey: string,
  sectionKey: string,
): string | undefined {
  return CMS_SECTION_HELP[`${pageKey}/${sectionKey}`];
}
