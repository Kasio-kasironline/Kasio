# Database

## Storage model
- Database/provider: Supabase PostgreSQL (Managed PostgreSQL 15+ hosted on Supabase).
- Ownership model: Multi-tenant scoped by business (`businesses.id`). Each business is owned by an authenticated user (`auth.users.id`). All catalog items, transactions, and settings belong to exactly one business.
- Data classification:
  - Public: Active menu items (for potential digital catalog views), public static QRIS image URLs.
  - Internal: Menu cost/internal notes, business profile details, category lists.
  - Sensitive / Financial: Transaction records, order items, payment breakdown, sales revenue analytics.
  - Personal: Merchant email/account credentials (managed securely by Supabase Auth).

## Entities
| Entity | Purpose | Owner | Retention |
| --- | --- | --- | --- |
| `businesses` | Profile and store configuration of the UMKM, including business name and static QRIS image URL | User (`owner_id` -> `auth.users.id`) | Retained indefinitely while account is active. Deleted on account deletion (Cascade). |
| `categories` | Logical groupings for menu items (e.g., Makanan, Minuman, Cemilan) | Business (`business_id`) | Retained indefinitely until merchant deletes. |
| `menu_items` | Products/food items sold by the UMKM, including name, description, price, availability, and image | Business (`business_id`) | Retained indefinitely. Soft-deletion or `is_available = false` preferred to maintain transaction traceability. |
| `orders` | Sales transactions containing receipt number, total amount, payment method (Cash / Static QRIS), and payment status | Business (`business_id`) | Retained indefinitely for financial history and analytics auditability. |
| `order_items` | Individual line items within an order with price and name snapshots | Order (`order_id`) | Retained with parent order. Never modified after order completion. |

## Schema

### 1. `businesses`
Store profile for the merchant, including static QRIS image link.
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `owner_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `name`: VARCHAR(255) NOT NULL
- `address`: TEXT NULL
- `phone`: VARCHAR(50) NULL
- `qris_image_url`: TEXT NULL (Public URL in Supabase Storage for the merchant's static QRIS)
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- Constraints: UNIQUE(`owner_id`) (enforces 1 business per user for the MVP).

### 2. `categories`
Grouping for catalog management.
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `business_id`: UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE
- `name`: VARCHAR(100) NOT NULL
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- Constraints: UNIQUE(`business_id`, `name`)

### 3. `menu_items`
Catalog items managed by the UMKM merchant.
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `business_id`: UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE
- `category_id`: UUID NULL REFERENCES categories(id) ON DELETE SET NULL
- `name`: VARCHAR(255) NOT NULL
- `description`: TEXT NULL
- `price`: NUMERIC(12, 2) NOT NULL CHECK (price >= 0)
- `image_url`: TEXT NULL
- `is_available`: BOOLEAN NOT NULL DEFAULT true
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())

### 4. `orders`
POS transaction records.
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `business_id`: UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE
- `cashier_id`: UUID NOT NULL REFERENCES auth.users(id)
- `order_number`: VARCHAR(50) NOT NULL
- `total_amount`: NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0)
- `payment_method`: VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'qris'))
- `payment_status`: VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'cancelled'))
- `notes`: TEXT NULL
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- Constraints: UNIQUE(`business_id`, `order_number`)

### 5. `order_items`
Immutable transaction snapshots.
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `order_id`: UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
- `menu_item_id`: UUID NULL REFERENCES menu_items(id) ON DELETE SET NULL
- `item_name`: VARCHAR(255) NOT NULL (Snapshot at purchase time)
- `item_price`: NUMERIC(12, 2) NOT NULL CHECK (item_price >= 0) (Snapshot at purchase time)
- `quantity`: INTEGER NOT NULL CHECK (quantity > 0)
- `subtotal`: NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())

---

## Relationships
- `auth.users` 1 : 1 `businesses` (`businesses.owner_id` -> `auth.users.id`, ON DELETE CASCADE).
- `businesses` 1 : N `categories` (`categories.business_id` -> `businesses.id`, ON DELETE CASCADE).
- `businesses` 1 : N `menu_items` (`menu_items.business_id` -> `businesses.id`, ON DELETE CASCADE).
- `categories` 1 : N `menu_items` (`menu_items.category_id` -> `categories.id`, ON DELETE SET NULL).
- `businesses` 1 : N `orders` (`orders.business_id` -> `businesses.id`, ON DELETE CASCADE).
- `orders` 1 : N `order_items` (`order_items.order_id` -> `orders.id`, ON DELETE CASCADE).
- `menu_items` 1 : N `order_items` (`order_items.menu_item_id` -> `menu_items.id`, ON DELETE SET NULL) — preserving order history even if a menu item is permanently deleted.

---

## Access rules

Row Level Security (RLS) is enabled on all tables. Supabase Auth token provides `auth.uid()`.

### Helper Function
```sql
CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS UUID AS $$
  SELECT id FROM businesses WHERE owner_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### Table Policies
1. `businesses`:
   - `SELECT`: `owner_id = auth.uid()`
   - `INSERT`: `owner_id = auth.uid()`
   - `UPDATE`: `owner_id = auth.uid()`
   - `DELETE`: `owner_id = auth.uid()`
2. `categories`:
   - `ALL`: `business_id = get_user_business_id()`
3. `menu_items`:
   - `ALL`: `business_id = get_user_business_id()`
4. `orders`:
   - `SELECT`: `business_id = get_user_business_id()`
   - `INSERT`: `business_id = get_user_business_id()`
   - `UPDATE`: `business_id = get_user_business_id()` (e.g. status changes to 'cancelled')
   - `DELETE`: Disallowed by policy to protect financial integrity.
5. `order_items`:
   - `SELECT`: `order_id IN (SELECT id FROM orders WHERE business_id = get_user_business_id())`
   - `INSERT`: `order_id IN (SELECT id FROM orders WHERE business_id = get_user_business_id())`
   - `UPDATE / DELETE`: Disallowed by policy.

### Storage Buckets & Policies
- Bucket `merchant-assets` (public read, authenticated write):
  - Path `/qris/{business_id}/*`: Merchant can upload/replace their static QRIS image.
  - Path `/menu/{business_id}/*`: Merchant can upload/replace menu item photos.
  - Max file size: 2MB. Permitted MIME types: `image/png`, `image/jpeg`, `image/webp`.

---

## Queries and indexes

### Critical Queries
1. **Catalog Retrieval for POS:**
   - Filter by `business_id` and `is_available = true`, sorted by category and name.
2. **Sales Analytics - Daily Summary:**
   - Aggregation: `COUNT(id)`, `SUM(total_amount)` filtered by `business_id`, `payment_status = 'completed'`, and date range `created_at >= start_of_day`.
3. **Sales Analytics - Best Selling Items:**
   - Aggregation: Join `order_items` with `orders`, grouped by `item_name`, ordered by `SUM(quantity) DESC`, limited to top 5.
4. **Sales Analytics - Payment Method Breakdown:**
   - Aggregation: Group by `payment_method`, `COUNT(id)`, `SUM(total_amount)`.

### Indexes
```sql
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_menu_items_business ON menu_items(business_id);
CREATE INDEX idx_menu_items_available ON menu_items(business_id, is_available);
CREATE INDEX idx_orders_business_created ON orders(business_id, created_at DESC);
CREATE INDEX idx_orders_analytics ON orders(business_id, payment_status, created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

---

## Migrations and seed data

### Migrations
- Tools: Supabase CLI (`supabase/migrations/`).
- Workflow: All schema additions, functions, triggers, and RLS policies must be committed as numbered SQL files (e.g., `20261014000000_initial_schema.sql`).
- Idempotency: All DDL scripts must use `IF NOT EXISTS` and explicit constraints.

### Seed Data
- Seed data (`supabase/seed.sql`) contains:
  - 1 demo business profile ("Kopi & Snack Makmur") with a placeholder static QRIS URL.
  - 3 categories (Kopi, Non-Kopi, Makanan Ringan).
  - 8-10 sample menu items with descriptions and realistic IDR pricing (e.g., Kopi Susu Gula Aren Rp 18.000).
  - 15 sample completed orders across different dates to test analytics visualizations immediately.

### Rollback & Backup
- Supabase point-in-time recovery (PITR) or automated daily backups via Supabase dashboard.
- Migrations maintain a corresponding rollback guide or sequential down-migration script when needed.

---

## Data validation

1. **Menu Item Rules:**
   - `name`: Required, trimmed string, 2 to 255 characters.
   - `price`: Required, non-negative (`>= 0`).
   - `description`: Optional, maximum 1000 characters.
   - `image_url`: Optional, must be a valid URL string or relative storage path.

2. **Order Rules:**
   - `order_number`: Must follow format `INV-YYYYMMDD-XXXX` generated deterministically.
   - `payment_method`: Must be exactly `'cash'` or `'qris'`.
   - `total_amount`: Must equal the sum of `order_items.subtotal` calculated securely on the server/database.
   - Client-calculated totals must NEVER be trusted directly for write operations.

3. **Atomic Checkout (PostgreSQL RPC):**
   - Implement `create_order(...)` database function taking an array of `{menu_item_id, quantity}`:
     - Locks and verifies `menu_items` price and availability.
     - Calculates total authoritative sum.
     - Inserts into `orders`.
     - Inserts corresponding snapshot lines into `order_items`.
     - Returns created order details or rolls back on any violation.
