# DATA.md

# Dress Shop — Data Architecture

## 1. Database

The application uses PostgreSQL through Supabase.

Database responsibilities include:

- User profiles
- Products
- Categories
- Product variants
- Product images
- Wishlist
- Cart
- Addresses
- Orders
- Order items
- Reviews

---

# 2. Entity Relationship

```text
                    profiles
                       │
          ┌────────────┼─────────────┐
          │            │             │
          ↓            ↓             ↓
      favorites     cart_items    addresses
          │            │
          ↓            ↓
       products    variants
          │            │
          │            ↓
          │         products
          │
          ├── categories
          │
          ├── product_images
          │
          └── reviews
                      

profiles
   │
   ↓
orders
   │
   ↓
order_items
   │
   ↓
product_variants
   │
   ↓
products
```

---

# 3. Profiles

Table:

```text
profiles
```

Purpose:

Stores application-level user information.

Suggested columns:

```text
id              uuid primary key
full_name       text
avatar_url      text
role            text
created_at      timestamptz
updated_at      timestamptz
```

`id` references:

```text
auth.users.id
```

Possible roles:

```text
customer
admin
```

Role authorization must be enforced server-side.

---

# 4. Categories

Table:

```text
categories
```

Suggested columns:

```text
id              uuid primary key
name            text not null
slug            text unique not null
description     text
image_url       text
sort_order      integer
is_active       boolean
created_at      timestamptz
updated_at      timestamptz
```

Categories are data-driven.

Do not hard-code category records in the mobile application.

---

# 5. Products

Table:

```text
products
```

Suggested columns:

```text
id              uuid primary key
category_id     uuid
name            text not null
slug            text unique not null
description     text
base_price      numeric not null
style           text
occasion        text
is_active       boolean
created_at      timestamptz
updated_at      timestamptz
```

Foreign key:

```text
category_id → categories.id
```

---

# 6. Product Variants

Table:

```text
product_variants
```

Suggested columns:

```text
id                  uuid primary key
product_id          uuid not null
sku                 text unique not null
color               text
size                text
price               numeric
stock_quantity      integer
is_active           boolean
created_at          timestamptz
updated_at          timestamptz
```

Foreign key:

```text
product_id → products.id
```

Inventory belongs to the variant.

---

# 7. Product Images

Table:

```text
product_images
```

Suggested columns:

```text
id              uuid primary key
product_id     uuid not null
image_url      text not null
alt_text       text
sort_order     integer
is_primary     boolean
created_at     timestamptz
```

Foreign key:

```text
product_id → products.id
```

---

# 8. Favorites

Table:

```text
favorites
```

Suggested columns:

```text
user_id        uuid not null
product_id     uuid not null
created_at     timestamptz
```

Primary key:

```text
(user_id, product_id)
```

Foreign keys:

```text
user_id → profiles.id
product_id → products.id
```

A user can favorite a product only once.

---

# 9. Cart Items

Table:

```text
cart_items
```

Suggested columns:

```text
id              uuid primary key
user_id         uuid not null
variant_id      uuid not null
quantity        integer not null
created_at      timestamptz
updated_at      timestamptz
```

Foreign keys:

```text
user_id → profiles.id
variant_id → product_variants.id
```

Recommended constraint:

```text
quantity > 0
```

A user should not have duplicate cart rows for the same variant.

Use a unique constraint:

```text
(user_id, variant_id)
```

---

# 10. Addresses

Table:

```text
addresses
```

Suggested columns:

```text
id              uuid primary key
user_id         uuid not null
label           text
recipient_name  text not null
phone           text
address_line_1  text not null
address_line_2  text
city            text not null
state           text
postal_code     text
country         text not null
is_default      boolean
created_at      timestamptz
updated_at      timestamptz
```

Foreign key:

```text
user_id → profiles.id
```

Users can only access their own addresses.

---

# 11. Orders

Table:

```text
orders
```

Suggested columns:

```text
id                  uuid primary key
user_id             uuid not null
status              text not null
subtotal            numeric not null
shipping_amount     numeric not null
discount_amount     numeric not null
total               numeric not null
shipping_address    jsonb
created_at          timestamptz
updated_at          timestamptz
```

Foreign key:

```text
user_id → profiles.id
```

The shipping address may be stored as a snapshot so future address edits do not change historical orders.

---

# 12. Order Items

Table:

```text
order_items
```

Suggested columns:

```text
id                  uuid primary key
order_id            uuid not null
product_id          uuid
variant_id          uuid
product_name        text not null
variant_description text
unit_price           numeric not null
quantity             integer not null
created_at           timestamptz
```

Foreign keys:

```text
order_id → orders.id
product_id → products.id
variant_id → product_variants.id
```

Historical information should be preserved.

If the product is renamed later, the old order should still display the original purchased name.

---

# 13. Reviews

Table:

```text
reviews
```

Suggested columns:

```text
id              uuid primary key
user_id         uuid not null
product_id      uuid not null
order_item_id   uuid
rating          integer not null
body            text
created_at      timestamptz
updated_at      timestamptz
```

Rating constraint:

```text
rating >= 1
rating <= 5
```

Reviews should preferably be linked to verified purchases.

---

# 14. Product Metadata

Products may use controlled metadata for discovery.

Example:

```text
style:
minimal
elegant
romantic
casual
bold

occasion:
party
office
vacation
date_night
wedding
everyday
```

For MVP, simple text values are acceptable.

If filtering requirements become complex, normalize these into dedicated relational tables.

---

# 15. Inventory

Inventory belongs to:

```text
product_variants.stock_quantity
```

Do not store a separate product-level stock value unless there is a clear business requirement.

Example:

```text
Satin Dress

Black / S → 10
Black / M → 5
Black / L → 0

Cream / S → 3
Cream / M → 7
Cream / L → 2
```

---

# 16. Price Handling

The mobile client must not be trusted to determine final order prices.

Client:

```text
Product selection
      ↓
Cart
      ↓
Checkout request
```

Backend:

```text
Validate product
Validate variant
Validate stock
Validate price
Calculate subtotal
Calculate shipping
Calculate discount
Calculate total
Create order
```

The order should store the final calculated values.

---

# 17. Order Status

Allowed statuses:

```text
pending
confirmed
processing
shipped
out_for_delivery
delivered
cancelled
```

Use database constraints or an enum where appropriate.

Invalid statuses must not be accepted.

---

# 18. Indexes

Important indexes should include:

```text
products.category_id
products.slug
products.is_active

product_variants.product_id
product_variants.sku
product_variants.stock_quantity

product_images.product_id

favorites.user_id
favorites.product_id

cart_items.user_id
cart_items.variant_id

addresses.user_id

orders.user_id
orders.status
orders.created_at

order_items.order_id
order_items.product_id

reviews.product_id
reviews.user_id
```

Only add indexes that support actual query patterns.

---

# 19. RLS

Enable RLS on all application tables containing user data.

Basic ownership model:

```text
User A
  │
  ├── own favorites
  ├── own cart
  ├── own addresses
  ├── own orders
  └── own profile
```

User A must never be able to read or modify User B's private records.

---

# 20. Product Access

Product catalog data may be publicly readable if the business model requires public browsing.

Only active products should normally be shown to customers.

Admin operations require elevated authorization.

---

# 21. Storage

Recommended Supabase Storage buckets:

```text
product-images
category-images
avatars
```

Potential structure:

```text
product-images/
    products/
        {product_id}/
            main.webp
            01.webp
            02.webp

category-images/
    {category_id}/
        cover.webp

avatars/
    {user_id}/
        avatar.webp
```

Storage policies must prevent unauthorized modification.

---

# 22. Database Functions

Use database functions when an operation needs atomicity or trusted server-side behavior.

Potential functions:

```text
create_order()
reserve_inventory()
release_inventory()
```

These should only be introduced when necessary.

Avoid putting all business logic into database functions.

---

# 23. Triggers

Potential triggers:

```text
auth.users
    ↓
create profile
```

Other triggers should only be introduced when they provide a clear consistency benefit.

Avoid hidden side effects.

---

# 24. Migrations

All schema changes must be represented as migrations.

Example:

```text
supabase/migrations/
├── 001_initial_schema.sql
├── 002_add_product_variants.sql
├── 003_add_wishlist.sql
└── 004_add_orders.sql
```

Migration names should clearly describe their purpose.

Never edit an already-applied production migration to change historical behavior.

Create a new migration instead.

---

# 25. Data Integrity

Use database constraints for important invariants.

Examples:

```text
quantity > 0
stock_quantity >= 0
rating between 1 and 5
price >= 0
```

Do not rely only on TypeScript validation.

---

# 26. Data Principle

The database should be the source of truth for:

```text
Inventory
Prices
Orders
User ownership
Authorization
```

The mobile application is a client, not the authority.