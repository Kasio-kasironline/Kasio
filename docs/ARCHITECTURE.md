# Architecture

## System purpose

Kasio is a portfolio-first, web-based point-of-sale (POS) application for small food businesses. A business owner can manage menu items, process and record sales, review transaction history, and view basic sales analytics.

The first release prioritizes a usable, low-cost MVP. It is not intended to be a full accounting, inventory, restaurant-management, or payment-processing platform.

## Stack decisions

| Layer | Selected technology | Reason | Constraints |
| --- | --- | --- | --- |
| Frontend | React + Vite + JavaScript + Tailwind CSS | Fast to build, responsive, and suitable for a modern POS interface | Use JavaScript, not TypeScript, unless explicitly approved. Keep the frontend deployable as a static Vite build. |
| Backend/API | Supabase client APIs and PostgreSQL Row Level Security (RLS) for the MVP | Reduces operational work and fits a free-tier portfolio project | Do not add a separate PHP backend or framework in the MVP. Use server-side functions only when a requirement cannot safely be implemented with Supabase policies/client APIs. Any privileged operation must run server-side. |
| Database | Supabase PostgreSQL | Relational data suits businesses, products, orders, and order items | Define schema and relationships explicitly. Use migrations or documented SQL changes. Enforce tenant boundaries with RLS. |
| Authentication | Supabase Auth | Integrated with the database and supports authenticated users | Every business-owned record must be scoped to the authorized business. Never rely only on frontend route guards. |
| File storage | Supabase Storage, only if product images are included in the MVP | Keeps product image storage alongside the backend service | Limit file size and validate file type. Do not store large base64 images in database rows. |
| Hosting | Vercel Hobby for personal/noncommercial portfolio deployment; static Vite output | Simple deployment and preview workflow | Check current plan terms before public or commercial use. Do not assume unlimited usage or that overages are always billed rather than blocked. |
| Payment provider | None for MVP; simulated payment status and cash/manual payment recording only | Keeps the initial scope small and avoids payment integration complexity | Do not claim that simulated payments are real payments. Do not collect or store card details. Integrate a provider only after explicit approval. |
| Analytics | SQL queries/aggregations against completed transactions | Avoids adding a separate analytics service | Clearly define revenue and transaction metrics. Exclude cancelled transactions and handle refunds consistently. |

## System boundaries

- Client owns: UI rendering, responsive layout, form interaction, cart presentation, local input validation for usability, and displaying loading, empty, success, and error states.
- Server/database owns: authentication enforcement, authorization, business ownership checks, data validation, transaction consistency, and all privileged operations. Use PostgreSQL constraints and RLS policies wherever appropriate.
- External services own: Vercel hosting and Supabase availability, quotas, and service limits. The application must show a useful error when a service is unavailable; it must not silently pretend a write succeeded.
- Out of scope for MVP: real payment-gateway integration, accounting/tax filing, supplier management, recipe/raw-material inventory, multi-outlet management, staff payroll, loyalty programs, customer ordering/QR ordering, and advanced offline synchronization.

## Request and data flow

1. A user signs in through Supabase Auth.
2. The client requests only the business and records the signed-in user is authorized to access.
3. Supabase Auth, PostgreSQL RLS, constraints, and permitted database operations enforce access and data integrity.
4. For a sale, the client submits product identifiers and quantities; the authoritative transaction logic must verify current product prices and availability and calculate totals from trusted database values, not trust totals supplied by the browser.
5. The database stores an order and its order items with price/name snapshots so later product edits do not rewrite historical receipts.
6. The UI updates only after a successful response. On failure, preserve the cart when practical, show a clear error, and allow a safe retry without accidentally duplicating a sale.

## Interfaces

- API/data access: use the Supabase JavaScript client for approved database operations. Document table names, key fields, and expected errors alongside the schema.
- Sale creation: implement as one atomic database operation, such as a PostgreSQL function/RPC, so the order and order items cannot be partially saved. Make retries safe against duplicate submissions.
- Payment status: for MVP, support clearly labelled cash/manual payment recording or demo/simulated payment status. Do not mark a transaction as gateway-confirmed unless a real provider confirms it through a trusted server-side flow.
- Events/jobs: no background jobs or queues in the MVP unless an approved requirement needs them.

## Project structure

Proposed structure; adjust only when implementation needs justify it:

```text
kasio/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── features/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── pos/
│   │   ├── transactions/
│   │   └── analytics/
│   ├── hooks/
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── migrations/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

- Keep components focused and reusable; avoid building an elaborate abstraction system before it is needed.
- Store Supabase URL and publishable/anon key in Vite environment variables (for example, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`). These values are exposed to the browser; database security must come from RLS and safe policies.
- Never put a Supabase service-role key, payment secret, or other privileged secret in any `VITE_` variable or client-side file.

## Operations

- Environments: local development and one public demo deployment. Keep `.env` out of version control; commit `.env.example` with variable names and placeholder values only.
- Deployment: deploy the Vite static build to Vercel. Configure required environment variables in the Vercel project settings. Test authentication redirects and client-side routes after deployment.
- Database changes: track schema and policy changes in Supabase migrations or versioned SQL files. Test RLS with at least two separate users/businesses.
- Monitoring and limits: periodically check Vercel and Supabase usage dashboards. Optimize product images and paginate transaction history. The free tiers have quotas and terms that may change; zero-cost operation is a goal, not a guarantee.
- Rollback: keep changes in Git and revert the relevant commit or redeploy a known-good deployment. Back up any important demo data before destructive schema changes.

## Decisions and unknowns

### Confirmed decisions
- Project name: Kasio (working name; check domain/trademark availability before public branding).
- Primary goal: portfolio project that may be tried by other users.
- Frontend: React + Vite + JavaScript + Tailwind CSS.
- Backend/data: Supabase Auth + PostgreSQL + RLS; no separate PHP backend in the MVP.
- Hosting: Vercel static deployment, targeting a zero-cost portfolio setup within current free-tier terms.
- Payment: no real gateway integration in the MVP.

### Open questions
- Whether the first demo targets food stalls, small cafes, or another small-business segment.
- Whether product images are essential for the first release.
- Whether demo visitors use seeded demo data, a shared read-only demo, or create their own account.
- Whether cash/manual payment recording is sufficient for the initial MVP.
