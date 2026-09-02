# SKILLS.md

# Dress Shop — Development Skills & Patterns

## 1. Purpose

This document defines the preferred technologies, libraries, patterns, and implementation practices for the project.

The goal is consistency.

Do not introduce a different solution for an existing problem without a good reason.

---

# 2. Core Stack

```text
React Native
    +
Expo
    +
TypeScript
    +
Expo Router
    +
TanStack Query
    +
Zustand
    +
Supabase
```

---

# 3. React Native

Use React Native for application UI.

Prefer native primitives:

```text
View
Text
Pressable
ScrollView
FlatList
Image
TextInput
KeyboardAvoidingView
```

Use specialized libraries when they provide a meaningful improvement.

---

# 4. Expo

Prefer Expo-compatible APIs and packages.

Use Expo's ecosystem where practical.

Avoid native configuration changes unless required.

When adding native dependencies, verify:

- Expo compatibility
- Android compatibility
- iOS compatibility
- Development build requirements
- EAS Build compatibility

---

# 5. Expo Router

Use file-based routing.

Recommended route organization:

```text
app/
├── (tabs)/
├── auth/
├── product/
├── category/
├── checkout/
└── orders/
```

Routes should remain thin.

---

# 6. TypeScript

Use strict TypeScript.

Prefer:

```typescript
type Product = {
  id: string;
  name: string;
  price: number;
};
```

over untyped objects.

Avoid:

```typescript
const product: any = ...
```

Use generated Supabase database types where possible.

---

# 7. TanStack Query

TanStack Query is the preferred server-state solution.

Use it for:

```text
Products
Categories
Wishlist
Orders
Profile
Addresses
Reviews
```

Use stable query keys.

Example:

```text
["products"]
["products", productId]
["categories"]
["wishlist"]
["orders"]
["orders", orderId]
```

---

# 8. Query Rules

Queries should:

- Have clear query keys
- Have typed results
- Handle loading
- Handle errors
- Cache appropriately
- Avoid duplicate requests

Do not manually refetch everything after every mutation.

Prefer targeted invalidation.

---

# 9. Mutation Rules

Mutations should:

```text
Validate
   ↓
Execute
   ↓
Handle success/error
   ↓
Invalidate or update affected queries
```

Example:

```text
Add favorite
     ↓
Supabase insert
     ↓
Invalidate ["wishlist"]
```

---

# 10. Zustand

Use Zustand for local client state.

Good use cases:

```text
filters
sort
temporary checkout state
UI preferences
```

Avoid putting:

```text
products
orders
categories
```

into Zustand as the main source of truth.

---

# 11. Supabase

Use the official Supabase client.

Keep the client in:

```text
src/lib/supabase.ts
```

Database access should be organized through feature services.

Example:

```text
src/features/products/services/productService.ts
```

---

# 12. Supabase Types

Prefer generated database types.

Example concept:

```text
Database
    ↓
Generated TypeScript types
    ↓
Services
    ↓
Hooks
    ↓
Components
```

Regenerate types after meaningful schema changes.

---

# 13. Forms

Use the project's chosen form solution consistently.

Forms should provide:

- Validation
- Error messages
- Disabled/loading states
- Submit feedback

Do not duplicate validation rules across multiple components when avoidable.

---

# 14. UI Components

Build reusable components.

Example:

```text
components/ui/
├── Button
├── TextInput
├── IconButton
├── Badge
├── Divider
├── Skeleton
├── EmptyState
├── ErrorState
└── Modal
```

Feature-specific components belong in their feature.

---

# 15. Product Components

Recommended:

```text
ProductCard
ProductGrid
ProductGallery
ProductPrice
ProductRating
ColorSelector
SizeSelector
ProductBadge
WishlistButton
AddToCartButton
```

Keep ProductCard reusable across:

- Home
- Search
- Category
- Recommendations
- Wishlist

---

# 16. Lists

For large product collections, prefer FlashList.

Lists should support:

- Stable keys
- Pagination/infinite loading
- Loading state
- Empty state
- Error state

Avoid rendering large collections using nested ScrollViews.

---

# 17. Images

Product photography is a major part of the product experience.

Use optimized images.

Prefer:

```text
small thumbnail
medium product image
large detail image
```

instead of loading the largest image everywhere.

Use caching where appropriate.

---

# 18. Reanimated

Use React Native Reanimated for meaningful animations.

Appropriate animations:

- Wishlist feedback
- Add-to-cart feedback
- Bottom sheets
- Screen transitions
- Product image transitions
- Micro-interactions

Avoid excessive animation.

---

# 19. Styling

Use a centralized design system.

Prefer:

```text
spacing
typography
radius
colors
shadows
```

as reusable tokens.

Avoid arbitrary values scattered across the application.

---

# 20. Navigation

Navigation should be predictable.

Use:

```text
router.push()
router.back()
router.replace()
```

where appropriate.

Do not duplicate navigation state unnecessarily in Zustand.

---

# 21. Error Handling

Errors should be converted into user-friendly messages.

Avoid displaying raw:

```text
PostgREST error
SQLSTATE
```

to normal users.

Log technical information appropriately during development.

---

# 22. Async Operations

Every asynchronous operation should define:

```text
idle
loading
success
error
```

The UI should react appropriately.

Buttons performing mutations should usually prevent accidental duplicate submissions while processing.

---

# 23. Security

Never expose:

```text
service role keys
payment secrets
private API keys
admin credentials
```

Do not bypass RLS.

Do not trust client-side authorization.

---

# 24. Database Queries

Prefer selecting only the required fields.

Avoid unnecessary:

```text
select("*")
```

for large or complex queries when a smaller selection is sufficient.

Use joins carefully.

Avoid N+1 network requests.

---

# 25. Caching

Use TanStack Query caching.

Cache relatively stable data such as:

```text
categories
product metadata
```

Use appropriate stale times for frequently changing data such as:

```text
inventory
cart
orders
```

Exact values should be determined based on application behavior rather than arbitrary defaults.

---

# 26. Performance

Optimize:

- Images
- Lists
- Network requests
- Re-renders
- Database queries

Do not optimize code that has no measurable problem.

---

# 27. Testing

Prioritize tests for:

```text
Cart calculations
Variant selection
Quantity changes
Filtering
Order calculations
Authentication
Wishlist behavior
```

Critical business rules should be testable without requiring the full UI.

---

# 28. Git

Use focused commits.

Examples:

```text
feat: add product search
feat: add wishlist
fix: prevent adding unavailable variants
feat: implement checkout
```

Avoid commits such as:

```text
update everything
changes
fix stuff
```

---

# 29. Agent Skills

When external agent skills are installed, use them where they improve implementation.

Relevant skill categories may include:

```text
React Native best practices
Expo development
UI/UX design
TypeScript
Supabase/PostgreSQL
Testing
Accessibility
Performance
```

The agent should not blindly follow a skill if it conflicts with this project's architecture.

Project-specific documentation takes priority.

---

# 30. Dependency Policy

Before installing a package:

```text
Can existing code solve it?
        │
        ├── Yes → reuse it
        │
        └── No
             ↓
Can Expo/React Native solve it?
             │
             ├── Yes → use official solution
             │
             └── No → evaluate dependency
```

Consider:

- Maintenance
- Bundle size
- Expo compatibility
- Security
- Community support
- API quality

---

# 31. Code Quality

Prefer:

```text
Readable
Typed
Small
Predictable
Reusable
Testable
```

Avoid:

```text
Huge components
Deep nesting
Duplicated logic
Magic values
Global state for everything
Untyped APIs
```

---

# 32. Architecture Priority

When choosing between implementations:

```text
Correctness
    ↓
Security
    ↓
Maintainability
    ↓
Performance
    ↓
Developer convenience
```

Do not choose an implementation only because it is quicker to write.

---

# 33. Definition of a Good Implementation

A good implementation:

- Fits the existing architecture
- Uses existing patterns
- Is strongly typed
- Handles failures
- Does not expose secrets
- Does not bypass RLS
- Is reasonably performant
- Is easy for another developer to understand