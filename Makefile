.PHONY: install web migrate typecheck build

install:
	cd apps/web && npm install

migrate:
	cd apps/web && npm run db:migrate

web:
	cd apps/web && npm run dev

typecheck:
	cd apps/web && npm run typecheck

build:
	cd apps/web && npm run build
