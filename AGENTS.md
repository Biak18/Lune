# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# AGENTS.md

## Dress Shop — AI Agent Instructions

This file defines the rules and operating procedures for AI coding agents working on this repository.

The agent must follow this document before making changes to the project.

---

# 1. Project Overview

This repository contains a mobile fashion e-commerce application for a dress shop.

The application is built with:

- React Native
- Expo
- TypeScript
- Expo Router
- Supabase
- PostgreSQL
- TanStack Query
- Zustand

The primary application is a customer-facing mobile shopping experience.

The product should feel like a real premium fashion boutique rather than a generic CRUD/e-commerce application.

---

# 2. Source of Truth

Before implementing a feature, consult the appropriate documentation.

```text
AGENTS.md
    │
    ├── docs/PRD.md
    │       Product requirements
    │
    ├── docs/ARCHITECTURE.md
    │       Technical architecture
    │
    ├── docs/DATA.md
    │       Database and data model
    │
    ├── docs/SKILLS.md
    │       Technologies and implementation patterns
    │
    ├── docs/UI_UX.md
    │       Design and UX rules
    │
    └── docs/ROADMAP.md
            Development phases
```

When documentation conflicts with assumptions, follow the documentation.

If the documentation is outdated, update the relevant documentation as part of the change.

---

# 3. Core Development Principles

Follow these principles:

1. Prefer simple solutions.
2. Keep features modular.
3. Avoid unnecessary abstractions.
4. Reuse existing components.
5. Reuse existing utilities.
6. Avoid duplicate business logic.
7. Keep server state separate from client state.
8. Keep database access predictable and typed.
9. Protect user data with Supabase RLS.
10. Never expose secrets in the client.
11. Handle loading, error, empty, and success states.
12. Optimize only where there is a real performance reason.
13. Do not rewrite unrelated code.
14. Keep changes focused.
15. Verify changes before declaring them complete.

---

# 4. Before Making Changes

Before implementing a feature:

### Step 1 — Inspect

Inspect:

- Existing project structure
- Relevant screens
- Relevant components
- Existing hooks
- Existing stores
- Existing services
- Existing Supabase queries
- Existing database migrations

Do not assume the project is empty.

### Step 2 — Understand

Determine:

- Where the feature belongs
- Which existing components can be reused
- Which state belongs in TanStack Query
- Which state belongs in Zustand
- Whether database changes are required
- Whether RLS changes are required

### Step 3 — Plan

For non-trivial features, identify:

```text
UI
 ↓
Component
 ↓
Feature logic
 ↓
Query / Mutation
 ↓
Service
 ↓
Supabase
 ↓
Database
```

### Step 4 — Implement

Make the smallest clean change that satisfies the requirement.

### Step 5 — Verify

Run relevant:

- TypeScript checks
- Linting
- Tests
- Expo checks
- Database validation

Do not ignore errors.

---

# 5. Technology Rules

## React Native

Use React Native primitives and project-approved libraries.

Avoid unnecessary web-specific patterns.

Do not assume browser APIs are available.

---

## Expo

Use Expo-compatible libraries.

Prefer Expo APIs when an official Expo solution exists.

Do not eject or introduce native changes without a clear reason.

---

## Expo Router

Use Expo Router for navigation.

Keep routes organized according to the architecture defined in `docs/ARCHITECTURE.md`.

Avoid putting significant business logic directly inside route files.

---

## TypeScript

Use TypeScript throughout the project.

Rules:

- Avoid `any`.
- Prefer explicit types.
- Use generated Supabase types where appropriate.
- Keep shared types centralized.
- Do not duplicate database types manually if generated types can be used.

Use strict typing for:

- API responses
- Query functions
- Mutation functions
- Navigation parameters
- Form values
- Product variants
- Orders
- Cart items

---

# 6. State Management

## TanStack Query

Use TanStack Query for server state.

Examples:

- Products
- Categories
- Product details
- Wishlist
- Orders
- Profile
- Reviews
- Addresses
- Inventory

Server data should not be copied into Zustand without a specific reason.

Use:

- Queries
- Mutations
- Query invalidation
- Query keys
- Cache configuration

---

## Zustand

Use Zustand for client-side state.

Appropriate examples:

- Temporary UI state
- Filters
- Sort preferences
- Temporary checkout state
- Local interaction state

Do not use Zustand as the primary cache for Supabase data.

---

# 7. Supabase Rules

Supabase is the application's backend.

Use:

- Supabase Auth
- PostgreSQL
- Storage
- Row Level Security
- Database functions when appropriate
- Edge Functions when appropriate

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Never put service-role credentials inside:

- React Native source code
- `EXPO_PUBLIC_*` variables
- Git
- client configuration
- application bundles

The client may use the public Supabase URL and public/anon key according to Supabase's security model.

Authorization must be enforced at the database/API layer.

Client-side checks are not security boundaries.

---

# 8. Database Rules

Database changes must be implemented through migrations.

Do not manually modify production schema without a migration.

Migrations should:

- Be deterministic
- Be reviewable
- Be safe to apply
- Include necessary indexes
- Include appropriate constraints
- Include RLS policies

When adding a table:

1. Define primary key.
2. Define foreign keys.
3. Define required constraints.
4. Add indexes where appropriate.
5. Enable RLS.
6. Create appropriate policies.
7. Update generated types.
8. Update `docs/DATA.md`.

---

# 9. RLS Rules

Every user-owned table must have appropriate RLS.

Examples:

```text
profiles
favorites
cart_items
addresses
orders
```

Users must not be able to:

- Read another user's private data
- Modify another user's cart
- Modify another user's wishlist
- Read another user's orders
- Modify another user's addresses

Admin operations require explicit authorization.

Never rely only on:

```typescript
if (user.role === "admin")
```

for security.

---

# 10. UI Rules

Follow `docs/UI_UX.md`.

The application should feel:

- Premium
- Elegant
- Minimal
- Editorial
- Fashion-focused
- Modern

Avoid:

- Generic dashboard layouts
- Excessive cards
- Excessive shadows
- Excessive borders
- Overuse of gradients
- Clutter
- Inconsistent spacing
- Random typography

Use reusable design tokens.

---

# 11. Component Rules

Prefer small, focused components.

Bad:

```text
ProductScreen.tsx
    900 lines
    ├── UI
    ├── API
    ├── cart logic
    ├── wishlist logic
    ├── reviews
    └── navigation
```

Prefer:

```text
ProductScreen
├── ProductGallery
├── ProductInformation
├── ColorSelector
├── SizeSelector
├── ProductDescription
├── ProductReviews
└── AddToCartBar
```

Business logic should be separated where appropriate.

---

# 12. Loading, Error, and Empty States

Every asynchronous feature must consider:

```text
Loading
Empty
Error
Success
```

Do not show a blank screen when data is loading.

Prefer skeletons for content-heavy screens.

Errors should provide a recovery action when possible.

Example:

```text
Unable to load products.

Please try again.

[ Retry ]
```

---

# 13. Product Rules

Products must support variants.

Do not assume one product equals one inventory quantity.

Example:

```text
Satin Midi Dress
│
├── Black / S
├── Black / M
├── Black / L
├── Cream / S
├── Cream / M
└── Cream / L
```

Inventory belongs to the variant.

---

# 14. Cart Rules

Cart items must reference product variants.

Do not store only:

```text
product_id
```

when size/color matters.

A cart item should identify the selected variant.

Validate stock before creating an order.

Never trust the price sent by the mobile application.

Final order pricing must be calculated or verified by trusted backend logic.

---

# 15. Order Rules

Orders must preserve historical information.

An order should not depend on the current product price remaining unchanged.

When appropriate, order items should preserve:

- Product name
- Variant information
- Price at purchase
- Quantity

Order status must follow the defined state machine.

```text
pending
   ↓
confirmed
   ↓
processing
   ↓
shipped
   ↓
out_for_delivery
   ↓
delivered
```

Cancellation should only be possible in permitted states.

---

# 16. Image Rules

Product images should be optimized for mobile.

Prefer:

- WebP/modern formats where supported
- Appropriate dimensions
- Lazy loading where applicable
- Caching
- Proper placeholders

Do not load original high-resolution photography when a smaller image is sufficient.

---

# 17. Performance Rules

Use `FlashList` for large product collections when appropriate.

Avoid:

- Unnecessary renders
- Huge component state
- Fetching unused fields
- Fetching all products when pagination is sufficient
- Repeated identical requests
- Unoptimized images

Use TanStack Query caching.

Do not add memoization everywhere without evidence that it helps.

---

# 18. Security Rules

Never commit:

- API secrets
- Service-role keys
- Payment secrets
- Admin credentials
- Private tokens
- Production passwords

Use environment variables.

Never create a client-side workaround for a server-side authorization problem.

---

# 19. Dependencies

Before adding a dependency:

1. Check whether the project already has a solution.
2. Check whether Expo or React Native provides the functionality.
3. Check whether an existing installed dependency can solve it.
4. Add a new dependency only when justified.

Avoid dependency bloat.

---

# 20. Git Rules

Keep commits focused.

Prefer:

```text
feat: add product filtering
fix: prevent duplicate cart items
feat: add wishlist mutations
fix: validate variant stock
```

Avoid giant commits containing unrelated changes.

Do not commit:

- `.env`
- secrets
- credentials
- generated native artifacts unless intentionally required

---

# 21. Documentation Rules

When architecture changes, update:

```text
docs/ARCHITECTURE.md
```

When database structure changes, update:

```text
docs/DATA.md
```

When a major product requirement changes, update:

```text
docs/PRD.md
```

When implementation conventions change, update:

```text
docs/SKILLS.md
```

When UI rules change, update:

```text
docs/UI_UX.md
```

When project priorities change, update:

```text
docs/ROADMAP.md
```

Documentation is part of the implementation.

---

# 22. Feature Completion Checklist

Before considering a feature complete:

```text
[ ] Requirement understood
[ ] Existing implementation inspected
[ ] Architecture followed
[ ] UI implemented
[ ] State management implemented
[ ] Backend implemented if required
[ ] Database migration created if required
[ ] RLS reviewed
[ ] Loading state handled
[ ] Empty state handled
[ ] Error state handled
[ ] Success state handled
[ ] Types checked
[ ] Lint checked
[ ] Relevant tests/checks run
[ ] Documentation updated
```

---

# 23. Do Not

Do not:

- Rewrite the project without reason.
- Create duplicate components.
- Put database credentials in source code.
- Disable RLS to make something work.
- Use `any` to bypass TypeScript errors.
- Ignore build errors.
- Ignore lint errors.
- Hard-code production data.
- Trust client-provided prices.
- Store server state unnecessarily in Zustand.
- Add dependencies without justification.
- Implement future features before MVP requirements.
- Claim something works without verification.

---

# 24. Final Principle

Build the smallest correct solution.

Prioritize:

```text
Correctness
    ↓
Security
    ↓
Maintainability
    ↓
Performance
    ↓
UX polish
```

Do not sacrifice architecture for speed.

Do not sacrifice security for convenience.

Do not sacrifice UX for unnecessary technical complexity.
