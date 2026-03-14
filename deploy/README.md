# Deploy (Docker Compose)

Zwei getrennte Setups: **Production** und **Development**, jeweils mit Traefik, Web-App und API. Auf dem Hetzner-Server entweder Prod oder Dev mit der passenden Compose-Datei starten.

## Voraussetzungen

- Docker & Docker Compose
- Domains zeigen auf die Server-IP (für LetsEncrypt)

## Erste Schritte

1. **Env-Dateien anlegen**
   ```bash
   cp .env.example .env.prod
   cp .env.example .env.dev
   ```
   In **.env.prod** eintragen: Prod-Domains, Prod-Clerk-Keys, `NODE_ENV=production`, `NEXT_PUBLIC_API_URL=https://api.kammerchor-elikuren.de` (oder eure API-URL).  
   In **.env.dev** eintragen: Dev-Domains (z. B. dev.kammerchor-elikuren.de), Dev-Clerk-Keys, `NODE_ENV=development`, passende `NEXT_PUBLIC_API_URL`.

2. **LetsEncrypt-E-Mail** in `traefik.yml` bei `certificatesResolvers.le.acme.email` setzen.

3. **Traefik-Dashboard-Passwort** (auf dem Server ändern):
   ```bash
   htpasswd -nb admin IhrPasswort > traefik-users
   ```

## Production starten

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod build
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

- Container: `traefik-prod`, `elikuren-web-prod`, `elikuren-api-prod`
- Images: `elikuren-web:prod`, `elikuren-api:prod`

## Development starten

```bash
docker compose -f docker-compose.dev.yml --env-file .env.dev build
docker compose -f docker-compose.dev.yml --env-file .env.dev up -d
```

- Container: `traefik-dev`, `elikuren-web-dev`, `elikuren-api-dev`, `watchtower-dev`
- Images: `elikuren-web:dev`, `elikuren-api:dev`
- **Watchtower** prüft alle 5 Minuten auf neue Images und startet die Container neu.

**Hinweis:** Prod und Dev nicht gleichzeitig auf demselben Host starten (beide brauchen Port 80/443). Entweder getrennte Server oder nur eine Umgebung pro Host.

## Lokal testen (vor dem Pushen)

Ohne TLS, nur HTTP – zum Durchspielen auf dem eigenen Rechner.

1. **`.env.local` anlegen**
   ```bash
   cp .env.local.example .env.local
   ```
   Clerk-Keys (am besten Test-Keys) eintragen.

2. **Hosts-Einträge** (damit die Host-Namen auf localhost zeigen):
   ```text
   127.0.0.1 elikuren.local api.elikuren.local traefik.elikuren.local
   ```
   - **macOS/Linux:** `sudo nano /etc/hosts`
   - **Windows:** `C:\Windows\System32\drivers\etc\hosts` (als Admin bearbeiten)

3. **Starten**
   ```bash
   docker compose -f docker-compose.local.yml --env-file .env.local build
   docker compose -f docker-compose.local.yml --env-file .env.local up -d
   ```

4. **Aufrufen** (mit Hosts-Eintrag wie in Schritt 2) – **Port 8081 in der URL angeben:**
   - Web: **http://elikuren.local:8081**
   - API: **http://api.elikuren.local:8081** (z. B. `/health`)
   - Traefik-Dashboard: **http://localhost:8080/dashboard/** (ohne Login)

   Ohne `:8081` funktioniert es nicht – der Browser nutzt sonst Port 80, dort läuft die lokale App nicht.

   **Clerk:** Damit Login/Sign-up mit `elikuren.local:8081` funktioniert, ist die Origin in der Web-App-Middleware erlaubt (`authorizedParties`). Details und falls es doch hakt: siehe `CLERK-LOKAL.md`.

Container: `traefik-local`, `elikuren-web-local`, `elikuren-api-local`. Kein Watchtower, keine Zertifikate.

## Dateien in diesem Ordner

| Datei | Zweck |
|-------|--------|
| `docker-compose.prod.yml` | Production: Traefik + Web + API |
| `docker-compose.dev.yml`  | Development: Traefik + Web + API + Watchtower |
| `docker-compose.local.yml` | Lokal: Traefik + Web + API (nur HTTP, kein TLS) |
| `traefik.yml`             | Traefik-Konfiguration für Prod/Dev (TLS, LetsEncrypt) |
| `traefik-local.yml`       | Traefik für lokal (nur HTTP, Dashboard auf 8080) |
| `traefik-users`           | Basic-Auth fürs Traefik-Dashboard (admin / changeme) |
| `traefik-users.example`   | Anleitung für `traefik-users` |
| `letsencrypt/`            | Persistenz für ACME-Zertifikate (nicht für local) |
| `.env.prod` / `.env.dev`  | Aus `.env.example` kopieren und anpassen |
| `.env.local`              | Aus `.env.local.example` kopieren (nur für lokal) |

## Nützliche Befehle

```bash
# Prod: Logs
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f

# Prod: Nur Web/API neu bauen und starten
docker compose -f docker-compose.prod.yml --env-file .env.prod build web api
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d web api

# Dev: alles neu bauen
docker compose -f docker-compose.dev.yml --env-file .env.dev build --no-cache
docker compose -f docker-compose.dev.yml --env-file .env.dev up -d

# Lokal: Logs
docker compose -f docker-compose.local.yml --env-file .env.local logs -f
```
