# Clerk für lokales Testen (elikuren.local:8081)

Damit Clerk mit **http://elikuren.local:8081** funktioniert:

## 1. Im Code (erledigt)

- **authorizedParties** in `middleware.ts`: Origins `elikuren.local:8081` und `127.0.0.1:8081` sind erlaubt.
- **Frontend-API-Proxy**: Für elikuren.local ist der Clerk-Proxy unter `/__clerk` aktiv, damit der Login-Handshake zuverlässiger durchläuft (kein Hängen auf der Clerk-Callback-Seite).
- **NEXT_PUBLIC_CLERK_PROXY_URL** in `.env.local`: `http://elikuren.local:8081/__clerk` (wird beim Docker-Build gesetzt).

## 2. Im Clerk Dashboard (wenn Login-Seite hängt)

Wenn du nach dem Login auf **poetic-swine-26.clerk.accounts.dev/.../oauth_callback** hängen bleibst:

1. **[Clerk Dashboard](https://dashboard.clerk.com/)** → **Development**-Instanz.
2. Zu **Paths** (oder **Settings** → **Paths** / **URLs**) gehen.
3. **Allowed redirect URLs** (oder vergleichbar) um folgende Einträge ergänzen:
   - `http://elikuren.local:8081`
   - `http://elikuren.local:8081/*`
   - `http://elikuren.local:8081/dashboard`
   - ggf. `http://127.0.0.1:8081`
4. Speichern und Login erneut testen.

## 3. Workaround, wenn es trotzdem hängt

- **Neuen Tab öffnen** und direkt **http://elikuren.local:8081/dashboard** aufrufen. Oft ist die Session schon gesetzt und du bist eingeloggt.
- **Hard Refresh** auf der hängenden Seite (Cmd+Shift+R / Strg+Shift+R), danach ggf. erneut zu `/dashboard` wechseln.

## Nach Änderung an der Middleware: Image neu bauen

Wenn du `middleware.ts` geändert hast, das **Web-Image neu bauen** und Container neu starten:

```bash
cd deploy
docker compose -f docker-compose.local.yml --env-file .env.local build web
docker compose -f docker-compose.local.yml --env-file .env.local up -d
```

Dann **http://elikuren.local:8081** im Browser neu laden.
