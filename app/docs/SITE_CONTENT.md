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

- Felder: `startsAt`, optional `endsAt`, Marketing-Felder, `showOnWebsite`, Hero-`MediaAsset`
- `showOnWebsite` nur mit gesetztem `startsAt` (keine 00:00-Platzhalter)
- Public-Filter: `now() <= coalesce(endsAt, endOfDayEuropeBerlin(startsAt))`

## Permissions

- `SITE_MANAGE` → `/admin/site`
- `CONCERT_MANAGE` → `/admin/concerts`
- `MEDIA_MANAGE` → `/admin/pictures`

`vorstand` erhält alle drei.
