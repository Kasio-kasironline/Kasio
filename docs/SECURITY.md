# Security

## Assets and trust boundaries

### Protected Assets
- **Financial & Transaction Data:** Order records, daily sales amounts, order item snapshots, payment method breakdowns, and analytics aggregations.
- **Merchant Business Data:** Store profile, business name, phone number, physical address, and custom menu catalog.
- **Merchant Authentication:** Email addresses, hashed passwords, session JWTs, and refresh tokens.
- **Media Assets:** Static QRIS barcodes and menu item images stored in Supabase Storage.

### Trust Boundaries
- **Client Application (Browser): UNTRUSTED.**
  - All input originating from the browser (menu item prices, order totals, cart calculations, submitted user/business IDs) is treated as untrusted.
  - Client-side validation is implemented strictly for user experience (UX); it does not constitute a security boundary.
- **Supabase Backend (PostgreSQL & Storage): TRUSTED.**
  - PostgreSQL Row Level Security (RLS) policies and database functions/RPC act as the primary security barrier.
  - The authoritative total price for every order is computed directly within PostgreSQL from stored menu item prices, never from client-provided subtotals.
- **External Services (Vercel, Supabase Auth): TRUSTED.**
  - Handled via secure TLS/HTTPS communication and standard token verification.

### Threats & Abuse Scenarios
- **Cross-Tenant Data Tampering:** A malicious merchant attempting to read, modify, or delete another merchant's menu items, transactions, or static QRIS.
- **Price Manipulation at Checkout:** A user modifying JavaScript state or network payloads to submit an order with reduced prices (e.g. buying a Rp 50.000 item for Rp 1).
- **Malicious Media Upload:** Uploading executable scripts, oversized files, or inappropriate content disguised as a QRIS image or product photo.
- **Credential Leakage:** Exposing administrative database credentials or the Supabase `service_role` key in public frontend repositories or client builds.

---

## Authentication and authorization

### Identity & Sessions
- **Provider:** Supabase Auth (GoTrue) using email and password authentication.
- **Session Tokens:** JSON Web Tokens (JWT) signed by Supabase. Managed automatically by `@supabase/supabase-js` using standard PKCE flow and secure browser storage.
- **Session Expiry & Refresh:** Access tokens expire periodically and are refreshed automatically using refresh tokens with rotation.

### Roles and Permissions Matrix
| Role | Access Scope | Permissions |
| --- | --- | --- |
| **Anonymous / Unauthenticated** | None (except public media assets) | Cannot read or write any table data (`businesses`, `menu_items`, `orders`, etc.). |
| **Authenticated Merchant (Owner/Cashier)** | Scoped to own `business_id` | Full CRUD on own business profile, categories, and menu items. Create and read own orders. Read own sales analytics. |
| **Service Role (Admin/Backend Only)** | Global database bypass | Strictly prohibited in client applications. Reserved exclusively for database migration scripts and automated maintenance. |

### Tenant Isolation Enforcement
- Every table containing business data (`categories`, `menu_items`, `orders`, `order_items`) has a foreign key to `businesses.id`.
- Every database row is validated using PostgreSQL Row Level Security (RLS) policies:
  ```sql
  -- Helper function returns the business ID owned by the calling authenticated user
  CREATE OR REPLACE FUNCTION get_user_business_id()
  RETURNS UUID AS $$
    SELECT id FROM businesses WHERE owner_id = auth.uid() LIMIT 1;
  $$ LANGUAGE sql STABLE SECURITY DEFINER;
  ```
- No client-side route guard or UI check is relied upon as a security boundary; all read/write queries without a valid matching `auth.uid()` are blocked directly by PostgreSQL.

---

## Secrets and configuration

### Environment Variables
| Variable Name | Environment | Exposure | Description |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Client / Frontend | **Public** | Supabase project API gateway endpoint URL. |
| `VITE_SUPABASE_ANON_KEY` | Client / Frontend | **Public** | Supabase anonymous public key. Safe to expose; all access governed by RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend / CI only | **Strictly Secret** | Privileged admin key. **NEVER** expose to Vite (`VITE_`), client bundle, or Git. |
| `SUPABASE_DB_PASSWORD` | Infrastructure only | **Strictly Secret** | Direct PostgreSQL connection password. |

### Secret Management Rules
- Store environment configuration in `.env.local` for local development. Never commit `.env.local` to Git (enforced via `.gitignore`).
- Keep `.env.example` committed with blank placeholder values only.
- In production (Vercel), configure variables via the Vercel Project Settings dashboard.
- Any environment variable intended for the browser MUST use the `VITE_` prefix and MUST NOT contain secrets.

---

## Input and output handling

### Input Validation & Integrity
- **Menu Items:**
  - `name`: Trimmed string, length between 2 and 255 characters.
  - `price`: Numeric value `>= 0` (preventing negative or nonsensical pricing).
  - `is_available`: Boolean value.
- **Atomic Checkout & Price Authoritativeness:**
  - Orders are submitted using a database RPC function (`create_order`).
  - The function iterates through the submitted `{menu_item_id, quantity}` array, fetches the current authoritative price from `menu_items`, computes subtotals, verifies that `quantity > 0`, and writes to `orders` and `order_items` in a single transaction.
  - Client-submitted totals are ignored on write operations.

### Cross-Site Scripting (XSS) & SQL Injection
- **XSS Mitigation:** React JSX automatically escapes dynamic values prior to rendering. Direct injection of unsanitized HTML (e.g. `dangerouslySetInnerHTML`) is prohibited.
- **SQL Injection:** All queries use the Supabase JavaScript client, which communicates via parameterized PostgREST calls and prepared statements. Raw SQL string concatenation is strictly forbidden.

### Media Upload Restrictions
- **Bucket:** Dedicated Supabase Storage bucket (`merchant-assets`).
- **MIME Type Allowlist:** `image/jpeg`, `image/png`, `image/webp`.
- **Maximum File Size:** 2 MB per upload.
- **Path Isolation:** Files are written to namespaced paths:
  - `/qris/{business_id}/qris-image.[ext]`
  - `/menu/{business_id}/[item-uuid].[ext]`
- **Storage RLS:** Storage policies restrict `INSERT`, `UPDATE`, and `DELETE` operations so users can only write to the folder matching their own `business_id`.

---

## Privacy

### Data Collected & Purpose
- **Merchant Email & Authentication:** Account management and recovery.
- **Store Profile (Name, Address, Phone):** Displayed on checkout headers and digital receipts.
- **Transaction Logs:** Financial accounting and sales analytics for the merchant.
- **No Customer PII:** Kasio MVP does not collect or store end-customer personal data (no customer names, phone numbers, or credit card numbers are stored).

### Retention & Deletion
- All store records, menu items, and transaction logs are retained while the merchant account remains active.
- Deletion of a user account triggers a cascading deletion of associated `businesses`, `menu_items`, and `orders`.

### Logging Redaction
- Never log passwords, JWT bearer tokens, or Supabase `service_role` keys in browser console logs or error reports.
- UI error toasts must present user-friendly messages (e.g. *"Gagal memproses transaksi. Silakan coba lagi"*), masking raw database error messages or internal PostgreSQL column structures.

---

## Dependencies and deployment

- **Auditing:** Run `npm audit` periodically to identify and patch known vulnerabilities in npm dependencies.
- **Dependencies Minimization:** Rely primarily on native browser APIs, React, Tailwind CSS, Lucide icons, and the official `@supabase/supabase-js` SDK. Avoid bloated or unvetted third-party packages.
- **Deployment Security:**
  - Production hosted on Vercel with automatic TLS/HTTPS encryption.
  - Security headers (e.g. `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`) configured via `vercel.json` or HTTP headers.

---

## Verification

Specific verification checks and test cases for permissions, tenant isolation, and price tampering are documented in [TESTING.md](file:///c:/Users/LENOVO/Documents/GitHub/Kasio/docs/TESTING.md).
