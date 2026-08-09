# Site-Content CMS

Internes Prisma-CMS mit festen typisierten Sektionen. Kein externes CMS, kein Page-Builder.

## Architektur (verbindlich)

| Thema | Festlegung |
|-------|------------|
| Editor | Feste `pageKey` + `sectionKey`, Zod-Validierung |
| Admin-UI | Individuelle Formulare; Zod nur Validierung/Typen |
| Cache | Tags `site-page:{pageKey}`, `concerts-public`, `public-media`; Revalidate erst nach Commit |
| Writes | Komplexe Schreibvorgänge in `prisma.$transaction` |
| Seeds | Idempotent; redaktionelle `data` nie überschreiben |

## Sichtbarkeit

- `StoredFile.visibility` (`PUBLIC` \| `MEMBERS` \| `ADMIN`) = **technischer Zugriff**
- `MediaAsset.isActive` / `isArchived` = **redaktioneller Zustand**
- Kein paralleles `MediaAsset.isVisible`

## PUBLIC-Medien

- Object-Keys unter R2-Prefix `public/…`
- Dauerhafte URL: `{R2_PUBLIC_BASE_URL}/{objectKey}`
- MEMBERS/ADMIN: nur Signed URLs + AuthZ
- Inhaltliche Bilder: Pflicht-`altText`; dekorativ: `isDecorative` → `alt=""`
- Löschen blockiert bei Referenzen → Archiv (`isArchived`)

## Konzerte (öffentlich)

- Status: `websiteStatus` (`DRAFT` | `PUBLISHED`); Publish nur mit `startsAt`
- Marketing: `subtitle`, `description`, `location`, `address`, `programInfo`, `leader`, `admissionInfo` (optional), `footer`, optional `ticketUrl` / Hero
- Sichtbarkeit: einzige Quelle `isConcertVisible()`; Zeitfenster via `concertVisibleUntil` / `endOfDayEuropeBerlin`
- Public-Query-Vorfilter: `PUBLISHED` + `startsAt != null`; Entscheidung nur über `isConcertVisible`
- Nach Writes: `revalidateTag("concerts-public")` + `revalidatePath("/home")`

## Permissions

- `SITE_MANAGE` → `/admin/site`
- `CONCERT_MANAGE` → `/admin/concerts`
- `MEDIA_MANAGE` → `/admin/pictures`

`vorstand` erhält alle drei.
