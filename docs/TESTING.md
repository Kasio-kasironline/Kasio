# Testing

## Goals and scope

Verify that Kasio meets all functional, usability, performance, and security requirements prior to any public release or deployment.

### Primary Verification Objectives
- **Feature Completeness:** All features defined in [PRD.md](file:///c:/Users/LENOVO/Documents/GitHub/Kasio/docs/PRD.md) (F-01 through F-09) operate as specified.
- **Tenant Isolation:** Enforce zero cross-tenant leakage between merchants via Supabase Row Level Security (RLS) as mandated in [SECURITY.md](file:///c:/Users/LENOVO/Documents/GitHub/Kasio/docs/SECURITY.md) and [DATABASE.md](file:///c:/Users/LENOVO/Documents/GitHub/Kasio/docs/DATABASE.md).
- **Financial & Pricing Integrity:** Total order calculation must be computed authoritatively by the database; client-side price tampering must be rejected or overridden.
- **Checkout & QRIS Ergonomics:** Seamless counter cashier experience across mobile, tablet, and desktop viewports, with accurate Cash change computation and prominent static QRIS modal display.
- **Data Traceability:** Historical orders and line items must remain immutable even when menu items are edited or deleted.

---

## Test layers

### 1. Unit Tests
- **Cart & Pricing Logic:** Calculation of item subtotals, grand totals, and Cash change.
- **Formatting Utilities:** Currency formatting (`formatIDR` to `Rp 25.000`), date/time formatting, and invoice code generators (`INV-YYYYMMDD-XXXX`).
- **Validation Helpers:** Menu price checks (`price >= 0`), name length constraints, and file upload type/size checks (MIME allowlist, <= 2MB).

### 2. Integration Tests
- **Supabase Auth:** Registration, session persistence, token refresh, and sign-out flows.
- **Database & RLS Policies:** Verify that `SELECT`, `INSERT`, `UPDATE`, and `DELETE` queries are strictly limited to the authenticated user's business (`owner_id = auth.uid()`).
- **Atomic Checkout RPC (`create_order`):** Verify single-transaction execution, price lookups from `menu_items`, and rollback behavior upon invalid parameters.
- **Supabase Storage:** Upload, read, and delete operations within isolated merchant folders (`/qris/{business_id}/` and `/menu/{business_id}/`).

### 3. End-to-End (E2E) Tests
- **Merchant Onboarding:** Sign up -> fill store profile -> upload static QRIS image -> verify preview in Settings.
- **Menu Management:** Create category -> add menu items with photos and prices -> toggle availability.
- **POS Cash Checkout:** Add menu items to cart -> checkout with Cash -> enter tender amount -> verify change -> view digital receipt.
- **POS Static QRIS Checkout:** Add menu items to cart -> checkout with QRIS -> verify QRIS image modal and grand total -> confirm payment -> view digital receipt.
- **Sales Analytics:** Execute sales -> open Analytics tab -> verify daily omzet, transaction count, payment method ratio, and top 5 best sellers.

### 4. Manual & Exploratory Tests
- **Responsive Cashier Ergonomics:** Test single-thumb navigation and touch target sizes (>= 44x44px) on physical mobile devices (360px - 414px width).
- **Physical QRIS Scan Test:** Verify that mobile banking (e.g. BCA, Mandiri) and e-wallet (e.g. GoPay, OVO, Dana) apps can scan the static QRIS image rendered on the screen.
- **Print Dialog:** Verify browser print preview (`window.print()`) formats receipts cleanly for 58mm/80mm thermal receipt printers.
- **Network Resilience:** Simulate offline/flaky network during cart management and checkout; verify cart state preservation and error notification.

---

## Acceptance test matrix

| Feature / Risk | Scenario | Expected Result | Layer | Status |
| --- | --- | --- | --- | --- |
| **F-01 (Auth)** | User signs up with valid email and password | Account created in Supabase Auth, session stored, redirected to onboarding/setup | Integration / E2E | Not run |
| **F-01 (Auth)** | User signs in with wrong password | Safe error toast *"Email atau kata sandi salah"*; session not created | Unit / Integration | Not run |
| **F-02 (QRIS)** | Merchant uploads valid QRIS image (PNG, 500 KB) | File uploaded to `/qris/{business_id}/`, URL stored in `businesses`, instant preview shown | Integration / E2E | Not run |
| **F-02 (QRIS)** | Merchant uploads file > 2MB or invalid format (PDF) | Client validates and blocks upload; clear error message shown; no storage write | Unit / Manual | Not run |
| **F-03 (Menu)** | Merchant adds new menu item with valid name and price | Item saved in `menu_items`, appears immediately in POS grid | Integration / E2E | Not run |
| **F-03 (Menu)** | Merchant attempts to enter negative price (`-10000`) | Input validation prevents form submission; database constraint `price >= 0` rejects | Unit / Integration | Not run |
| **F-04 (Cart)** | Cashier taps multiple items and adjusts quantities (+/-) | Cart correctly calculates item subtotals and overall grand total | Unit / E2E | Not run |
| **F-05 (Cash)** | Cashier inputs cash amount equal to or greater than total | Change is accurately calculated; order recorded with `payment_method = 'cash'` | Unit / E2E | Not run |
| **F-05 (QRIS)** | Cashier selects QRIS payment | Modal pops up with merchant's static QRIS and total bill; clicking confirm sets `payment_method = 'qris'` | E2E / Manual | Not run |
| **F-05 (Tampering)** | Client modifies item price in payload before checkout | Database RPC recalculates total from `menu_items`; manipulated price ignored | Integration | Not run |
| **F-06 (Receipt)** | Transaction completes successfully | Digital receipt modal appears showing receipt number, item snapshots, and payment method | E2E | Not run |
| **F-07 (History)** | User views transactions with date filter | Orders filtered accurately; cancelled orders tagged accordingly | Integration / E2E | Not run |
| **F-08 (Analytics)**| User views analytics after completing orders | Total omzet, order count, top 5 items, and payment breakdown reflect completed orders | Integration / E2E | Not run |
| **F-08 (Analytics)**| Orders marked as `cancelled` exist | Cancelled orders are strictly excluded from revenue and sales aggregations | Integration | Not run |
| **F-09 (RLS)** | Merchant A attempts to query Merchant B's orders | PostgreSQL RLS returns 0 records; no data leaked across merchants | Integration | Not run |
| **F-09 (RLS)** | Merchant A attempts to update Merchant B's menu item | Update rejected by RLS (0 rows affected or permission denied) | Integration | Not run |
| **Storage RLS** | Merchant A attempts to upload to `/qris/{merchant_B_id}/` | Storage RLS policy rejects write with HTTP 403 Forbidden | Integration | Not run |

---

## Fixtures and environments

### Synthetic Test Accounts
- **Merchant Alpha (Primary Test Store):**
  - Email: `merchant.alpha@example.com`
  - Store Name: *Kopi & Roti Alpha*
  - Has uploaded static QRIS fixture (`tests/fixtures/qris-sample.png`).
  - Pre-populated with 8 menu items across 2 categories (Kopi & Cemilan).
- **Merchant Beta (Secondary Isolation Store):**
  - Email: `merchant.beta@example.com`
  - Store Name: *Warung Makan Beta*
  - Used strictly to execute cross-tenant intrusion tests against Merchant Alpha.

### Environment Setup
- **Local Dev / Testing:**
  - Supabase CLI local instance (`supabase start`) or dedicated Supabase staging project.
  - Frontend test runner running against `http://localhost:5173`.
- **Database Seed:**
  - Automated SQL seed (`supabase/seed.sql`) containing the synthetic accounts, menu fixtures, and sample orders to test analytics instantly.
- **Teardown & Reset:**
  - Run `supabase db reset` or dedicated cleanup SQL script to restore baseline state between test suites.

---

## Verified commands

*Note: The commands below represent the approved scripts to configure in `package.json` during the frontend build step.*

- **Unit & Component Tests:** `npm run test` (Vitest with React Testing Library)
- **E2E Tests:** `npm run test:e2e` (Playwright cross-browser tests)
- **Linting:** `npm run lint` (ESLint)
- **Production Build Check:** `npm run build` (Vite build)

---

## Release criteria

A release candidate is approved for staging or production deployment only when:
1. **100% of Acceptance Tests** in the matrix pass.
2. **Zero RLS Violations:** Multi-tenant isolation tests pass with zero data leakage.
3. **Zero Price Tampering:** The checkout RPC function is proven to enforce authoritative database pricing.
4. **Vite Static Build:** `npm run build` executes cleanly with zero syntax or bundling errors.
5. **Mobile Responsiveness:** Verified manually or via E2E viewport emulation down to 360px screen width.

---

## Results

| Run Date | Test Suite / Command | Total Tests | Passed | Failed | Blockers / Notes |
| --- | --- | --- | --- | --- | --- |
| *Pending* | Specification phase | - | - | - | All acceptance tests marked *Not run*. Awaiting implementation scaffolding. |
