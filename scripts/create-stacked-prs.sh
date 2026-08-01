#!/usr/bin/env bash
# Create the 5 stacked PRs for the membership / members-area / admin UX split.
#
# Note: the stack is already merged into `dev`. PR1 therefore targets
# `split/pr0-base` (commit before the stack) so GitHub still shows a diff.
set -euo pipefail

REPO="CH4692/elikuren-app"

if ! gh auth status -h github.com >/dev/null 2>&1; then
  echo "gh is not authenticated. Run: gh auth login"
  exit 1
fi

echo "Authenticated as: $(gh api user --jq .login)"

# Ensure review base exists (parent of PR1 tip).
if ! git rev-parse --verify origin/split/pr0-base >/dev/null 2>&1; then
  git branch -f split/pr0-base 16057bf
  git push -u origin split/pr0-base
fi

create_pr() {
  local base="$1" head="$2" title="$3" body="$4"
  echo ""
  echo "→ PR: $title"
  echo "  base=$base  head=$head"
  if gh pr list --repo "$REPO" --base "$base" --head "$head" --state all --json number,url --jq '.[0].url' | grep -q .; then
    echo "  already exists: $(gh pr list --repo "$REPO" --base "$base" --head "$head" --state all --json url --jq '.[0].url')"
    return 0
  fi
  gh pr create --repo "$REPO" --base "$base" --head "$head" --title "$title" --body "$body"
}

create_pr "split/pr0-base" "split/pr1-app-move" \
  "Move app into app/ and restore public page assets" \
  "$(cat <<'EOF'
## Summary
- Next.js app lives under `app/`
- Fix broken public page assets
- Add Playwright feature smoke tests

> Stacked PR 1/5. Already landed on `dev`; opened for review history.

## Test plan
- [ ] CI green
- [ ] Public pages render (home, ensembles, legal)
EOF
)"

create_pr "split/pr1-app-move" "split/pr2-membership-approval" \
  "Add membership approval and restrict sign-in to active members" \
  "$(cat <<'EOF'
## Summary
- Membership requests: PENDING → APPROVED / REJECTED
- One-time admin membership approval (not per magic-link login)
- Magic links only for active members
- Admin can deactivate members
- Neutral auth/membership messages
- Server-side authz for pages, actions, and API routes

> Stacked PR 2/5. Already landed on `dev`; opened for review history.

## Test plan
- [ ] Request membership → pending
- [ ] Admin approve → member can magic-link login repeatedly
- [ ] Inactive member cannot request/accept magic link
- [ ] Unknown emails get neutral messaging
EOF
)"

create_pr "split/pr2-membership-approval" "split/pr3-members-area-v1" \
  "Add focused members area V1 with permissions, R2, and Playwright coverage" \
  "$(cat <<'EOF'
## Summary
- Members area V1: dashboard, scores/PDFs, MP3s, profile, announcements
- Permissions + R2 uploads
- Playwright coverage for member flows

> Stacked PR 3/5. Already landed on `dev`; opened for review history.

## Test plan
- [ ] Active member can open dashboard/library/profile/announcements
- [ ] Guests redirected from protected routes
EOF
)"

create_pr "split/pr3-members-area-v1" "split/pr4-admin-ux-foundations" \
  "Add admin UX foundations: primitives, user menu, and admin shell" \
  "$(cat <<'EOF'
## Summary
- UI primitives (table, dialog, dropdown, skeleton, avatar)
- Member/user menu + site chrome
- Admin shell/sidebar foundations

> Stacked PR 4/5 (kept separate from PR 5). Already landed on `dev`.

## Test plan
- [ ] Admin shell loads with core nav
- [ ] User menu shows expected member/admin entries
EOF
)"

create_pr "split/pr4-admin-ux-foundations" "split/pr5-admin-ux-modules" \
  "Add admin modules: contacts, audit, CRUD tables, and extended areas" \
  "$(cat <<'EOF'
## Summary
- Admin modules: contacts, audit, scores, audio, events, invoices
- CRUD table refactors for existing admin panels
- Extended admin navigation

> Stacked PR 5/5 (kept separate from PR 4). Already landed on `dev`.

## Test plan
- [ ] Admin can open contacts/audit/events/invoices modules
- [ ] Existing member/request/piece admin flows still work
EOF
)"

echo ""
echo "Done. Open PRs:"
gh pr list --repo "$REPO" --state open --limit 10
