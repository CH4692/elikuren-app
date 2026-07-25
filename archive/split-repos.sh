#!/usr/bin/env bash
# Split monorepo paths into sibling git repositories (preserves history via subtree).
# Usage: ./scripts/split-repos.sh [/absolute/output/parent]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_PARENT="${1:-$(cd "$ROOT/.." && pwd)}"
API_OUT="$OUT_PARENT/elikuren-api"
WEB_OUT="$OUT_PARENT/elikuren-web"

cd "$ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is dirty. Commit or stash before splitting." >&2
  exit 1
fi

echo "Creating split branches..."
git branch -D split/elikuren-api >/dev/null 2>&1 || true
git branch -D split/elikuren-web >/dev/null 2>&1 || true
git subtree split --prefix=app-elikuren-api -b split/elikuren-api
git subtree split --prefix=app-elikuren-web -b split/elikuren-web

create_repo() {
  local branch="$1"
  local dest="$2"
  local name="$3"

  if [[ -e "$dest" ]]; then
    echo "Destination exists: $dest" >&2
    exit 1
  fi

  mkdir -p "$dest"
  git clone "$ROOT" "$dest" --branch "$branch" --single-branch
  cd "$dest"
  git branch -m main
  git remote remove origin || true
  echo "Created $name at $dest (no remote yet)."
  cd "$ROOT"
}

create_repo "split/elikuren-api" "$API_OUT" "elikuren-api"
create_repo "split/elikuren-web" "$WEB_OUT" "elikuren-web"

cat <<EOF

Next steps:
  1. Create empty GitHub repos elikuren-api and elikuren-web
  2. In each local repo:
       git remote add origin git@github.com:<owner>/<repo>.git
       git push -u origin main
  3. Connect Render → elikuren-api, Vercel → elikuren-web
  4. Follow app-elikuren-api/docs/DEPLOY.md and app-elikuren-web/docs/DEPLOY.md

EOF
