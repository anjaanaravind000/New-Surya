# New Surya Core

Git-ready React/TypeScript application with exactly five operational dashboards:

- Admin
- Branch
- Branch Incharge
- Kitchen
- Stock Audit

## Source layout

All active application code is under:

```text
src/new-surya-core/
```

The only routable operational dashboard files are:

```text
src/new-surya-core/pages/AdminDashboard.tsx
src/new-surya-core/pages/BranchDashboard.tsx
src/new-surya-core/pages/BranchInchargeDashboard.tsx
src/new-surya-core/pages/KitchenDashboard.tsx
src/new-surya-core/pages/StockAuditDashboard.tsx
```

`src/new-surya-core/pages/Login.tsx` is the only other page file. Imported workflows are stored as non-routable modules under `src/new-surya-core/modules/` and are opened as tabs inside the five dashboards.

There are no separate customer-order, menu, tracking or QR page routes. Digital-menu and payment-QR tools remain internal dashboard features where required.

## Push to Git

Push the contents of this folder as the repository root. Do not merge it into an older application folder and do not push the ZIP file itself.

```bash
git init
git add .
git commit -m "Consolidate New Surya into five dashboards"
git branch -M main
git remote add origin YOUR_GIT_REPOSITORY_URL
git push -u origin main
```

For an existing repository, first back up the old repository, then replace its contents with this folder while keeping the old `.git` directory.

## Setup

```bash
cp env.example .env.local
npm ci
npm run test:all
npm run typecheck
npm run lint
npm run build
npm run dev
```

Required environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never place a Supabase service-role key in frontend environment variables.
