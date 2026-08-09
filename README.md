# Elikuren

Web-App für den **Kammerchor Elikuren** — öffentliche Vereinswebsite und geschützter Mitglieder-/Verwaltungsbereich.

| Layer | Tech | Hosting |
|---|---|---|
| App (UI + API routes) | Next.js 16 in [`app`](app) | Vercel |
| Database | Neon PostgreSQL (Prisma) | Neon Frankfurt |
| Auth | Auth.js (Magic Link) | Resend |
| Email | Resend | Resend |
| Dateien | Cloudflare R2 | Cloudflare |

Live: [kammerchor-elikuren.de](https://kammerchor-elikuren.de)

---

## Features

### Öffentliche Website

- **Startseite** mit Hero, Chorleitung, Ensembles, Konzerten und Unterstützen-Bereich (CMS-Inhalte)
- **Über Uns:** Verein, Chorleitung, Geschichte, Proben & Mitsingen
- **Ensembles:** eigene Seiten für Kammerchor Elikuren, Musical-Team und Eight to the Bar
- **Konzerte:** veröffentlichte Auftritte mit Datum, Ort, Programm, Eintritt und optionalem Ticket-Link
- **Kontaktformular** (mit E-Mail-Zustellung an den Chor)
- **Impressum** und **Datenschutz**
- Navigation für Gäste mit **Mitglied werden** und **Mitglieder Login**

### Zugang & Authentifizierung

- **Mitglied werden:** öffentliche Mitgliedsanfrage (Name, E-Mail, optional Stimme/Nachricht)
- **Vorstand prüft Zugangsanfragen:** Freigabe oder Ablehnung, Stimme zuweisen, interne Notiz
- Bei Freigabe: aktives Mitgliedskonto + Bestätigungsmail „Zugang freigeschaltet“
- **Mitglieder Login** per Magic Link (nur für freigeschaltete, aktive Nutzer)
- Neutrale Fehlermeldungen ohne E-Mail-Enumeration
- Optional Passwort-Login nur für lokale Entwicklung / E2E (nicht in Production)
- Rollen:
  - **mitglied** — Mitgliederbereich
  - **vorstand** — volle Verwaltung
  - **kassenwart** — Mitgliederbereich + Rechnungen schreiben / Zahlungen
  - **kassenpruefer** — Mitgliederbereich + Rechnungen nur lesen

### Mitgliederbereich

- **Mitglieder-Dashboard:** Begrüßung, aktuelles Konzert, Schnellzugriff auf Noten, Audio und Profil
- **Mein Profil:** Kontaktdaten bearbeiten; Stimme und Rolle werden vom Vorstand gepflegt
- **Noten-Bibliothek:**
  - Tabs *Aktuelles Konzert* / *Katalog*
  - Filter nach Besetzung, Suche
  - PDF-Vorschau und Download
  - Zugriff nach Sichtbarkeit (alle Mitglieder / nur Stimme / nur Admin)
- **Audio-Bibliothek:** Übungs- und Konzertaufnahmen anhören (signierte URLs)
- Avatar-Menü mit Dashboard, Profil, Noten, Audio; Admins zusätzlich Admin- und Mitglieder-Dashboard
- Abmelden jederzeit über das Benutzermenü

### Verwaltung (Admin)

Eigene Admin-Shell mit berechtigungsbasierter Sidebar. Admins können jederzeit ins **Mitglieder-Dashboard** wechseln.

- **Übersicht:** Kennzahlen (offene Anfragen, Bibliothek, überfällige Rechnungen)
- **Website:** Startseiten-Inhalte pflegen (Hero, Konzerte, Ensembles, Chorleitung, Unterstützen, Footer)
- **Mitglieder:** suchen, Rollen/Stimme/Aktiv-Status und Profildaten bearbeiten
- **Zugangsanfragen:** freigeben oder ablehnen
- **Konzerte:** anlegen/bearbeiten, Website-Status (Entwurf/Veröffentlicht), Programmreihenfolge, aktives Konzert für die Bibliothek
- **Noten:** PDFs hochladen, Metadaten, Konzertzuordnung, Zugriffsrechte, Vorschau
- **Audiodateien:** Uploads, Typen (z. B. Stimmlage, Probe, Konzert), Vorschau abspielen
- **Medien:** Website-Bilder hochladen (Alt-Text, Caption), archivieren statt löschen wenn noch referenziert

### Finanzen

- **Rechnungen & Belege:**
  - Typen: Rechnung, Quittung, Ausgabe, Einnahme, Gutschrift
  - Status: Entwurf, Offen, Bezahlt, Überfällig, Storniert
  - Anlegen/Bearbeiten mit Beträgen, Daten, Empfänger, Notiz, optionalem PDF
  - Als bezahlt markieren, archivieren
  - Schreiben: Vorstand & Kassenwart · Lesen: auch Kassenprüfer

### Technik (produktrelevant)

- Hosting auf Vercel, Datenbank Neon, Auth/E-Mails über Auth.js + Resend
- Dateien (Noten, Audio, Belege, Bilder) in Cloudflare R2
- Getrennte **Production**- und **Preview**-Umgebungen (eigene DB/R2)
- Health-Check unter `/api/health`

---

## Local development

```bash
cd app
cp .env.example .env.local   # then fill secrets
# CI/Playwright use committed .env.test

npm install
npx prisma migrate deploy
npm run dev
```

Details, Auth-Flow und Tests: [`app/README.md`](app/README.md)

## Deploy (short)

1. Neon project in Frankfurt → set `DATABASE_URL` / `DATABASE_URL_UNPOOLED` on Vercel
2. Vercel project, Root Directory `app`, build: `npx prisma migrate deploy && npm run build`
3. Set `AUTH_SECRET`, `AUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`
4. Attach domain

Full guide: [`app/docs/DEPLOY.md`](app/docs/DEPLOY.md)
