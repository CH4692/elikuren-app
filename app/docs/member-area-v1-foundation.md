# Mitgliederbereich V1 – Foundation

Stand: fokussierter Mitgliederbereich mit Permission-Layer, Auth/Aktivstatus, Prisma-Modelle und R2-Grundlage.

## V1 Scope (bewusst fokussiert)

- Dashboard
- Flache Bibliothek: Noten/PDFs und Audio (`/library/scores`, `/library/audio`)
- Profil
- Admin: Freigaben, Mitglieder, Noten, Audio, Rechnungen

Termine und Mitteilungen werden über Spond verwaltet und sind in der App nicht enthalten.

## 1. Permission-Layer

- Zentral in `lib/permissions.ts` (`PERMISSIONS`, Rollenmatrix, `hasPermission`).
- API-Gates: `lib/authz.ts` (`requireActiveSession`, `requirePermission`, `requireAnyPermission`).
- Proxy (`proxy.ts`) prüft Mitglieder- und Admin-Pfade gegen Permissions.

## 2. Auth & Aktivstatus

- Magic Link / Credentials nur bei `User.isActive`.
- JWT enthält `sessionVersion`; bei geschützten Serverzugriffen DB-Check auf `isActive` + `sessionVersion`.
- `lib/session-security.ts`: Deaktivierung / Rollenwechsel erhöht `sessionVersion`.
- Freigabe der Mitgliedschaft sendet Info-E-Mail mit Link zu `/auth/sign-in` (kein automatischer Magic Link).

## 3. Prisma & R2

- Modelle u. a. `StoredFile`, `SheetFile`, `AudioFile` (flach, mit Titel/Komponist/`accessScope`/`isVisible`).
- R2-Client: `lib/r2.ts` (Presigned PUT/GET, Head/Delete). Secrets nur serverseitig.
- Upload-Flow APIs:
  - `POST /api/admin/files/presign` → PENDING + Presigned PUT
  - `POST /api/files/[id]/complete` → Head-Check → READY
  - `GET /api/files/[id]/url` → AuthZ inkl. `accessScope` → Presigned GET
- Admin-Bibliothek: `POST /api/admin/scores`, `POST /api/admin/audio`; PATCH/DELETE über `/api/admin/sheets/[id]` bzw. `/api/admin/audio/[id]`.
- Mitglieder-Bibliothek: `GET /api/library/scores`, `GET /api/library/audio`.

## Env (R2)

Siehe `.env.example`: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`, `R2_REGION`, `R2_SIGNED_URL_TTL_SECONDS`.
