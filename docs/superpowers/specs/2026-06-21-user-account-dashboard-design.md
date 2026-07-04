# Design: User Account + Dashboard for flolabsinternational

**Date:** 2026-06-21
**Status:** Approved
**Approach:** Direct port + adapt (Approach A)

---

## Context

The design team worked on branch `mohamedabdelmohsen` in `flolabsinternational`. That branch is already merged into `main` (it added SEO schema fields to Strapi content types and WordPress-matching gradient border UI polish).

The `flolabsinternational` site is missing the full user account + dashboard system that exists in `hephaestus-international`. This spec covers porting the complete system, adapting its UI to the flolabsinternational aesthetic, and migrating hosting from Vercel to EC2.

---

## Goals

1. Port the full user account + dashboard from `hephaestus-international` into `flolabsinternational`.
2. Adapt UI tokens/classes so the ported pages feel native to the blue gradient aesthetic.
3. Move `flolabsinternational` frontend from Vercel to the existing EC2 Docker Compose stack.
4. Delete the `vercel.json` from `flolabsinternational` and the `vercel.json.backup` from `hephaestus-international`.
5. Add a GitHub Actions deploy workflow to `flolabsinternational`.
6. Share the existing EC2 Postgres database with both sites.

---

## Architecture

### Source → Target file mapping

**App pages** — copy from `hephaestus-international/frontend/app/` → `flolabsinternational/frontend/app/`:

| Source path | Target path |
|---|---|
| `login/page.tsx` | `app/login/page.tsx` |
| `me/page.tsx` | `app/me/page.tsx` |
| `me/application/page.tsx` | `app/me/application/page.tsx` |
| `me/application/loading.tsx` | `app/me/application/loading.tsx` |
| `me/application/responses/` | `app/me/application/responses/` |
| `me/application/stages/` | `app/me/application/stages/` |
| `me/hr/` (full directory) | `app/me/hr/` |
| `profile/page.tsx` | `app/profile/page.tsx` |
| `gallery/page.tsx` | `app/gallery/page.tsx` |
| `privacy/page.tsx` | `app/privacy/page.tsx` |
| `application-data.ts` | `app/application-data.ts` |
| `STEPS.json` | `app/STEPS.json` |

**Components** — copy from `hephaestus-international/frontend/components/` → `flolabsinternational/frontend/components/`:

Auth & user:
- `login-form.tsx`, `forgot-password-form.tsx`, `reset-password-form.tsx`
- `auth-link.tsx`, `logout-button.tsx`
- `profile-menu.tsx`, `profile-editor.tsx`

Applicant dashboard:
- `applicant-chat.tsx`, `applicant-stage-content.tsx`
- `application-form.tsx`, `application-apply-card.tsx`
- `stage-completion-notice.tsx`

HR dashboard:
- `hr-dashboard-workspace.tsx`, `hr-filters.tsx`
- `hr-responses-table.tsx`, `hr-stage-controls.tsx`
- `hr-stages-workspace.tsx`, `duplicate-review-actions.tsx`

Infrastructure:
- `brand-provider.tsx`, `navigation-loading.tsx`
- `nav-loading-indicator.tsx`, `page-loading-overlay.tsx`
- `location-picker.tsx`
- `layout/` directory (Container, Section, Col, ContentColumn)
- `brand/` directory
- `gallery/` directory
- `icons/` directory
- `providers/` directory

**Lib** — copy entire `hephaestus-international/frontend/lib/` → `flolabsinternational/frontend/lib/`:

`db.ts`, `application-store.ts`, `application-db.ts`, `auth-utils.ts`, `branding.ts`,
`applicant-status.ts`, `embed-url.ts`, `hr-applicant-query.ts`, `hr-merge-options.ts`,
`hubspot-contacts-csv-sync.ts`, `mail.ts`, `merge-time-entries.ts`,
`notion-team-member-search.ts`, `openai-app-config.ts`, `openai-stage-review.ts`,
`source-options.ts`, `stage-definitions.ts`, `strapi.ts`, `team-member-directory-cache.ts`,
`team-member-search-match.ts`, `types.ts`, `utils.ts`, `chronos-sync.ts`

---

## CSS / Aesthetic Adaptation

**No font changes needed.** Both repos already use Roboto + Poppins with identical CSS variable names.

**No color token replacement needed.** Ported pages use hardcoded Tailwind values (`text-[#00349B]`, `bg-[#eef5ff]`) that match flolabsinternational's `--flo-blue: #00349b` exactly.

**`globals.css` merge:** Merge hephaestus's `@theme` block into flolabsinternational's `globals.css`, keeping flolabsinternational's `:root` variables as primary. Add missing utilities needed by ported components:
- `--color-card`, `--color-card-foreground`, `--color-border`, `--color-muted`
- `--radius-button: 0`, `--radius-card: 0`, `--radius-input: 0` (for form inputs in dashboard)
- `--spacing-section-y`, `--spacing-gutter-*` tokens
- `--breakpoint-*` tokens
- `--max-width-content: 90rem`

**Header upgrade:** Replace flolabsinternational's static `Header` component with the auth-aware version from hephaestus. Same visual (`bg-black/80 backdrop-blur-sm`). Add `ProfileMenu` and `NavigationLoadingProvider` imports. The `layout.tsx` root must pass `viewer` to `Header`.

**Layout.tsx upgrade:** Add `getSessionUser`, `markSessionUserVisited`, `BrandProvider`, `NavigationLoadingProvider`, `getServerBrand` imports. Wire viewer fetch and brand detection into `RootLayout`. Add Material Symbols stylesheet link.

---

## Dependencies to add (`frontend/package.json`)

```json
"postgres": "^3.4.9",
"bcryptjs": "^3.0.3",
"@types/bcryptjs": "*",
"openai": "^6.34.0",
"@aws-sdk/client-s3": "^3.1058.0",
"csv-parse": "5.6.0"
```

---

## next.config update

Convert `next.config.ts` to `next.config.js` (required for Docker build — the production Dockerfile copies `next.config.js`). Add S3 hostname to `remotePatterns`. Add `pushUniqueHostname` helper for `NEXT_PUBLIC_STRAPI_URL` and `CONTENT_STRAPI_URL`.

---

## Deployment

### Dockerfile
Copy `hephaestus-international/frontend/Dockerfile` verbatim into `flolabsinternational/frontend/Dockerfile`. It uses Node 22 bookworm-slim, multi-stage (deps → prod-deps → builder → runner), builds on `NEXT_PUBLIC_STRAPI_URL` build arg.

### EC2 Docker Compose
Add a `flolabs-frontend` service to the live docker-compose.yml on EC2:
```yaml
flolabs-frontend:
  image: <ECR_REPO>/flolabs-frontend:latest
  container_name: flolabs-frontend
  restart: unless-stopped
  environment:
    DATABASE_URL: ${DATABASE_URL}
    SESSION_SECRET: ${SESSION_SECRET}
    OPENAI_API_KEY: ${OPENAI_API_KEY}
    AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
    AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    S3_BUCKET: ${S3_BUCKET}
    NEXT_PUBLIC_STRAPI_URL: ${FLOLABS_STRAPI_URL}
    CONTENT_STRAPI_URL: ${FLOLABS_STRAPI_URL}
    STRAPI_API_TOKEN: ${FLOLABS_STRAPI_TOKEN}
  ports:
    - "3001:3000"
  networks:
    - app-network
```
(Port 3000 is owned by hephaestus-frontend; flolabs-frontend uses 3001.)

### nginx
Add a new `server {}` block to the nginx config on EC2:
```nginx
server {
    server_name flolabs.international www.flolabs.international;
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    # SSL via certbot
}
```

### SSL
Expand the existing Let's Encrypt certificate:
```
certbot --expand -d hephaestus.international -d flolabs.international
```

### Env vars (EC2 `.env` or SSM)
Add: `FLOLABS_STRAPI_URL`, `FLOLABS_STRAPI_TOKEN` (Railway CMS).
Shared: `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`, `AWS_*`, `S3_BUCKET`.

### GitHub Actions CI/CD
Add `.github/workflows/deploy.yml` to `flolabsinternational`, mirroring the hephaestus deploy workflow:
- On push to `main`: build Docker image, push to ECR, SSH to EC2, pull + restart `flolabs-frontend`.

### Vercel cleanup
- Delete `flolabsinternational/frontend/vercel.json`
- Delete `hephaestus-international/frontend/vercel.json.backup`

---

## Testing / Verification

After implementation, verify:
1. `npm run build` passes in `flolabsinternational/frontend/`
2. `tsc --noEmit` reports no type errors
3. Docker image builds locally without errors
4. Login page renders at `/login`; session cookie is set on successful login
5. Applicant redirected to `/me/application` with pipeline stages visible
6. HR-role account redirected to `/me/hr` with dashboard visible
7. Profile editor at `/profile` saves changes to DB
8. Header shows user avatar / logout when authenticated; shows login link when not
9. All existing pages (home, about, blogs, projects, internships) still render correctly after layout.tsx changes
