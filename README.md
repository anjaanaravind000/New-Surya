# New Surya Operations - Five Workspace Edition

A branch-aware bakery ERP/POS with five purpose-built workspaces: Admin, Kitchen, Branch, Branch Incharge, and Stock Audit. The attached reference project was used as a workflow source for owner controls, store/baker/packing, branch administration, branch billing, and independent stock verification.

The client-provided `New Surya Menu new Price - 2025.xlsx` is the catalog source of truth. The app imports 728 sellable SKUs across 243 named items: counter channels use the `POS Menu 2025` prices, while Swiggy, Zomato, and website channels use `Online Menu 2025` prices.

## Current Highlights

- Cleaner operations-dashboard UI with mobile/tablet navigation.
- Hidden admin modules exposed: Suppliers & Procurement and Branch Performance & P&L.
- Admin feature registry expanded to 51 market features across Petpooja, GOFRUGAL, Square and Toast style expectations.
- Demand forecasting now creates a real kitchen production request.
- Supplier GRN demo updates a real purchase order and inventory ledger.
- Branch P&L and forecast analytics are deterministic instead of random.
- Client demo actions use an in-app result banner and debug trail instead of popup alerts.
- New market feature blueprint for client explanation and handover.
- Dedicated Branch Incharge and Stock Audit roles with separate dashboards.
- Multi-branch user creation backed by a secure Supabase Edge Function.
- Branch-scoped RLS, explicit Data API grants, and maker-checker stock controls.
- Redesigned Branch POS with a service-first product and checkout layout.
- Client-supplied New Surya logo and official product photography.
- Automatic price switching between POS and online aggregator menus.
- Supabase migration with 728 products and 2,912 branch-specific channel prices.

## Routes

- `/` Admin / Owner Dashboard
- `/admin` Admin / Owner Dashboard
- `/owner` Admin / Owner Dashboard
- `/dashboard` Admin / Owner Dashboard
- `/kitchen` Central Kitchen / Production Dashboard
- `/branch` Branch Billing / POS Dashboard
- `/branch-billing` Branch Billing / POS Dashboard
- `/branch-incharge` Branch Incharge Dashboard
- `/stock-audit` Independent Stock Audit Dashboard

## Implemented app flows

### Admin / Owner
- User creation
- Role/dashboard/module/action permissions
- Product master
- Branch and aggregator price book
- Recipe/BOM costing
- Production approval before raw material deduction
- Purchase order and GRN
- Supplier procurement with GST/non-GST invoice readiness
- Raw material inventory
- Low-stock alerts
- Stock audit and variance approval
- Central dispatch control
- Branch performance and P&L
- CRM/loyalty/credit ledger
- Attendance with advance date and reason
- Promotions, demand forecasting, wastage intelligence, GST/FSSAI, label traceability and notification controls
- Reports/BI/export
- Integration hub
- In-app debug centre

### Kitchen
- Product and quantity bake planner
- Raw material requirement preview
- Food cost preview
- Admin approval waiting state
- Stage-wise KDS board
- QC, wastage and yield variance
- Finished stock batch creation
- Batch/expiry/allergen label queue
- Packing and dispatch
- Kitchen reports and debug

### Branch Billing
- Mandatory counter opening lock
- Fast billing with keyboard shortcuts
- Barcode-ready search
- Touch billing buttons
- Weight/item quantity modes
- Cart hold/recall
- Cash/card/UPI/Paytm/split/credit/online payment modes
- Stock-minus checkout
- Original and duplicate bill print queue
- Refund/return approval
- Online order queue for Swiggy/Zomato/website/QR/phone
- Online payout reconciliation model
- Advance cake/party order tracking
- Customer credit collections
- Goods receipt from central kitchen
- Branch stock batch/expiry view
- Daily closure
- Device/integration status and debug

## External integrations

The product includes adapter-ready flows for Swiggy, Zomato, Paytm/UPI, WhatsApp Business, Tally export, thermal printers, KOT printers, label printers, barcode scanner, weighing scale and Google Maps branch data. Live production operation requires official credentials and device testing.

## Run locally

```bash
npm install
npm run dev
```

## Validate production build

```bash
npm run typecheck
npm run lint
npm run build
npm run test:audit
npm audit --omit=dev
```

## Supabase

Apply all migrations in timestamp order, including:

```txt
supabase/migrations/20260717090000_five_role_branch_security.sql
```

Then add:

```txt
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Deploy `supabase/functions/admin-create-user` after the migrations. The function keeps the service-role key server-side and verifies the caller's user-management permission.

## Docs

- `docs/MARKET_FEATURE_BLUEPRINT_2026.md`
- `docs/IMPLEMENTATION_REPORT_V5.md`
- `docs/FEATURES_BY_DASHBOARD_V5.md`
- `docs/GO_LIVE_CHECKLIST.md`
- `docs/FEATURE_MATRIX.md`
- `docs/CLIENT_DATA_SOURCES.md`
- `docs/DEPLOYMENT_AND_DATABASE.md`
