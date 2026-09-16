# ARCHITECTURE.md

# LUNE (Dress Shop) — Technical Architecture

> Brand: LUNE premium boutique (see `PRODUCT.md`). Paper-and-ink palette with clay accent, Newsreader serif. Checkout is currently Cash/UPI on delivery (COD) only; payment abstraction is reserved for later.

## 1. Architecture Overview

The application follows a layered mobile architecture.

```text
┌──────────────────────────────────────┐
│             React Native             │
│                                      │
│            Expo Router               │
└──────────────────┬───────────────────┘
                   │
                   ↓
┌──────────────────────────────────────┐
│              Features                │
│                                      │
│ Auth / Products / Cart / Orders      │
│ Wishlist / Checkout / Profile        │
└───────────────┬───────────┬──────────┘
                │           │
                ↓           ↓
          TanStack Query   Zustand
                │           │
                ↓           ↓
┌──────────────────────────────────────┐
│             Data Layer               │
│                                      │
│ Services / Queries / Mutations       │
└──────────────────┬───────────────────┘
                   │
                   ↓
┌──────────────────────────────────────┐
│               Supabase               │
│                                      │
│ Auth │ PostgreSQL │ Storage           │
│ RLS  │ Functions  │ Edge Functions   │
└──────────────────────────────────────┘
```

---

# 2. Technology Stack

## Mobile

- React Native
- Expo
- TypeScript
- Expo Router

## State

- TanStack Query
- Zustand

## Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions where required

## UI

- React Native components
- React Native Reanimated where appropriate
- FlashList for large lists

---

# 3. Directory Structure

Actual structure (routes live under `src/app`):

```text
dress-shop/
│
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   │
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx
│   │   │   ├── shop.tsx
│   │   │   ├── cart.tsx
│   │   │   ├── wishlist.tsx
│   │   │   └── profile.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── _layout.tsx
│   │   │   ├── welcome.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   │
│   │   ├── product/
│   │   │   └── [id].tsx
│   │   │
│   │   ├── category/
│   │   │   └── [id].tsx
│   │   │
│   │   ├── search.tsx
│   │   ├── style-finder/index.tsx
│   │   ├── assistant/index.tsx
│   │   ├── notifications/index.tsx
│   │   ├── addresses/index.tsx
│   │   │
│   │   ├── checkout/
│   │   │   ├── index.tsx
│   │   │   └── success.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   │
│   │   └── admin/
│   │       ├── index.tsx
│   │       ├── products.tsx
│   │       ├── orders.tsx
│   │       └── inventory.tsx
│   │
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── stores/
│   ├── types/
│   ├── config/
│   ├── design/
│   ├── theme/
│   └── utils/
│
├── assets/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATA.md
│   ├── SKILLS.md
│   ├── UI_UX.md
│   └── ROADMAP.md
│
└── AGENTS.md
```

Note: there is no `checkout/address.tsx` — address selection/creation lives inside `checkout/index.tsx` plus `addresses/index.tsx`.

---

# 4. Routing Architecture

Expo Router (under `src/app`) owns navigation.

Route files should primarily:

- Compose screens
- Read route parameters
- Connect feature-level components

Avoid putting large amounts of business logic inside route files.

Example:

```text
src/app/product/[id].tsx
        │
        ↓
ProductScreen
        │
        ├── ProductGallery
        ├── ProductInfo
        ├── VariantSelector
        └── AddToCart
```

---

# 5. Feature Architecture

Features should be organized by domain (under `src/features`).

```text
src/features/
│
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── queries/
│   ├── mutations/
│   ├── services/
│   └── types.ts
│
├── products/
├── categories/
├── wishlist/
├── cart/
├── orders/
├── profile/
├── reviews/
├── addresses/
├── notifications/
├── loyalty/
├── admin/
├── assistant/
├── recommendations/
└── outfit/
```

A feature should contain its domain-specific logic rather than scattering it across unrelated folders.

---

# 6. Server State

TanStack Query is the source of truth for remote data.

Examples:

```text
useProductsQuery()
useProductQuery(id)
useCategoriesQuery()
useWishlistQuery()
useOrdersQuery()
useOrderQuery(id)
useProfileQuery()
```

Mutations:

```text
useAddToWishlistMutation()
useRemoveFromWishlistMutation()
useAddToCartMutation()
useUpdateCartMutation()
useCreateOrderMutation()
```

After mutations, invalidate or update affected queries.

Example:

```text
Add Wishlist
     ↓
Mutation
     ↓
Supabase
     ↓
Invalidate wishlist
     ↓
UI updates
```

---

# 7. Client State

Zustand should contain local state that does not need to be treated as remote server data.

Examples:

```text
Filter state
Sort state
Temporary checkout state
UI preferences
Transient interaction state
```

Avoid storing the entire product catalog in Zustand.

---

# 8. Data Access Layer

UI components should not contain complex Supabase queries.

Prefer:

```text
Component
   ↓
Hook
   ↓
Query / Mutation
   ↓
Service
   ↓
Supabase
```

Example:

```text
ProductScreen
     ↓
useProductQuery(id)
     ↓
productService.getProduct(id)
     ↓
Supabase
```

---

# 9. Supabase Client

Create a centralized Supabase client.

Example responsibility:

```text
src/lib/supabase.ts
```

The client should handle:

- Supabase URL
- Public client key
- Session persistence

Do not place privileged credentials here.

---

# 10. Authentication Architecture

Supabase Auth manages authentication.

Flow:

```text
User
 ↓
Login/Register
 ↓
Supabase Auth
 ↓
Session
 ↓
Auth State
 ↓
Application
```

The application should react to authentication state changes.

Authenticated-only features:

```text
Wishlist
Cart persistence
Addresses
Orders
Profile
Reviews
```

---

# 11. Authorization

Authorization is enforced primarily by Supabase RLS.

Example:

```text
Mobile App
     │
     │ authenticated request
     ↓
Supabase
     │
     ↓
RLS Policy
     │
     ├── allowed
     └── denied
```

The client should never be considered a trusted security boundary.

---

# 12. Product Architecture

Products are separate from variants.

```text
Product
│
├── Metadata
│
├── Images
│
└── Variants
      ├── Size
      ├── Color
      ├── SKU
      └── Inventory
```

Product-level information:

- Name
- Description
- Base price
- Category
- Style
- Occasion

Variant-level information:

- Size
- Color
- SKU
- Stock

---

# 13. Cart Architecture

Cart items reference variants.

```text
User
 ↓
Cart Item
 ↓
Product Variant
 ↓
Product
```

This prevents ambiguity around size/color.

Cart calculations should account for:

```text
quantity
×
variant price
```

Final checkout calculations should be verified by trusted backend logic.

---

# 14. Order Architecture

Orders preserve a historical purchase state.

```text
Order
│
├── Customer
├── Shipping Address
├── Status
├── Totals
│
└── Order Items
      ├── Product
      ├── Variant
      ├── Quantity
      └── Purchase Price
```

Do not calculate historical order totals from current product prices.

---

# 15. Order State Machine

Matches `PRD §18` / `DATA` / DB check (`orders_status_check`):

```text
pending
   │
   ↓
confirmed
   │
   ↓
processing
   │
   ↓
shipped
   │
   ↓
out_for_delivery
   │
   ↓
delivered

cancelled (terminal, from pending/confirmed/processing)
```

Cancellation should only occur in allowed states. The timeline UI treats `cancelled` as terminal.

---

# 16. Image Architecture

Supabase Storage stores product images.

Suggested:

```text
products/
  {product_id}/
    main.webp
    01.webp
    02.webp
    03.webp
```

The application should use appropriate image sizes.

---

# 17. Error Architecture

Errors should be handled at appropriate boundaries.

```text
Supabase Error
      ↓
Service
      ↓
Typed/normalized error
      ↓
Query/Mutation
      ↓
UI
      ↓
User-friendly message
```

Do not expose raw backend errors to users unless appropriate.

---

# 18. Loading Architecture

For product-heavy screens:

```text
Initial Load
    ↓
Skeleton UI
    ↓
Data
    ↓
Rendered Content
```

Avoid blocking the entire application when an individual section can load independently.

---

# 19. Performance Architecture

Use:

- FlashList
- Image caching
- TanStack Query caching
- Pagination
- Lazy loading
- Memoization when justified
- Optimized database queries

Product lists should not fetch unnecessary data.

Prefer selecting required columns instead of always selecting entire records.

---

# 20. Dependency Direction

Prefer this dependency direction:

```text
UI
 ↓
Features
 ↓
Hooks
 ↓
Services
 ↓
Infrastructure
```

Infrastructure should not depend on UI.

Reusable components should not contain feature-specific business logic unless intentionally designed for it.

---

# 21. Environment Configuration

Environment variables should be separated by environment.

Example:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Public variables may be included in the mobile bundle.

Private secrets must never use `EXPO_PUBLIC_`.

---

# 22. Testing Strategy

Prioritize testing of business-critical logic:

- Cart calculations
- Variant selection
- Quantity changes
- Order calculations
- Authentication behavior
- Wishlist mutations
- Filtering
- Validation

UI tests should focus on important user flows.

---

# 23. Architecture Evolution

The initial architecture should remain simple.

Future capabilities such as:

- AI recommendations
- Payment providers
- Notifications
- Admin
- Analytics
- Loyalty

should be added as separate modules rather than rewriting the core application.

---

# 24. Architectural Principle

The application should follow:

```text
Simple
   ↓
Typed
   ↓
Modular
   ↓
Secure
   ↓
Testable
   ↓
Scalable
```

Do not build enterprise complexity before the product requires it.