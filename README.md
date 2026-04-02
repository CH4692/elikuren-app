# elikuren-app

Monorepo for Next.js frontend, FastAPI backend, deploy and infra

Container bauen + Images

```
docker compose -f docker-compose.local.yml up --build
```

Container starten ohne bauen

```
docker compose -f docker-compose.local.yml up
```

Container stoppen

```
docker compose -f docker-compose.local.yml down
```

Was ist voll (Images, Container, Volumes, Cache) ?

```
docker system df
```

Stoppt gelöschte Container, ungenutze Images, Build Cache

```
docker system prune -a
```

Löscht Volumes. DB-Daten auch weg, vorsicht.

```
docker system prune -a --volumes
```
