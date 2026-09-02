# ROADMAP.md

# Dress Shop — Development Roadmap

## 1. Roadmap Philosophy

Build the application incrementally.

Do not attempt to implement every planned feature at once.

The project should move through:

```text
Foundation
    ↓
Catalog
    ↓
Shopping
    ↓
Checkout
    ↓
Orders
    ↓
Polish
    ↓
Advanced Features
```

---

# Phase 0 — Project Foundation

## Goal

Create a stable technical foundation.

### Tasks

- Initialize Expo project
- Configure TypeScript
- Configure Expo Router
- Configure Supabase
- Configure TanStack Query
- Configure Zustand
- Establish source structure
- Establish design tokens
- Configure linting
- Configure formatting
- Configure environment variables
- Establish documentation

### Result

Application starts successfully with the agreed architecture.

---

# Phase 1 — Database Foundation

## Goal

Create the initial Supabase schema.

### Tasks

- Create profiles
- Create categories
- Create products
- Create product variants
- Create product images
- Create favorites
- Create cart items
- Create addresses
- Create orders
- Create order items
- Create reviews

### Security

- Enable RLS
- Add user ownership policies
- Add product read policies
- Add admin policies where required

### Result

Database is usable by the application.

---

# Phase 2 — Authentication

## Goal

Implement account functionality.

### Tasks

- Login
- Registration
- Logout
- Session persistence
- Password reset
- Profile creation
- Auth state handling

### Result

Users can securely authenticate.

---

# Phase 3 — Product Catalog

## Goal

Allow customers to discover products.

### Tasks

- Home screen
- Categories
- Shop screen
- Product grid
- Product card
- Product details
- Product gallery
- Search
- Filters
- Sorting
- Pagination

### Result

Users can browse the catalog.

---

# Phase 4 — Product Variants

## Goal

Allow customers to choose purchasable variants.

### Tasks

- Color selector
- Size selector
- Variant availability
- Stock display
- Disabled unavailable variants
- Variant validation

### Result

Users can select an exact product variant.

---

# Phase 5 — Wishlist

## Goal

Allow users to save products.

### Tasks

- Add favorite
- Remove favorite
- Wishlist screen
- Empty state
- Wishlist loading state
- Wishlist error state
- Add wishlist product to cart

### Result

Wishlist works across sessions.

---

# Phase 6 — Cart

## Goal

Implement reliable shopping cart functionality.

### Tasks

- Add to cart
- Remove item
- Quantity controls
- Variant display
- Cart subtotal
- Shipping
- Total
- Empty cart
- Stock validation

### Result

Users can prepare an order.

---

# Phase 7 — Checkout

## Goal

Create the purchase flow.

### Tasks

- Shipping address
- Address selection
- Address creation
- Order summary
- Payment abstraction
- Validation
- Order creation
- Success screen

### Result

A user can complete the checkout flow.

---

# Phase 8 — Orders

## Goal

Allow customers to manage their purchases.

### Tasks

- Order history
- Order details
- Order items
- Order status
- Order timeline
- Delivery information

### Result

Users can understand the state of their orders.

---

# Phase 9 — UX & Performance Polish

## Goal

Bring the MVP to production quality.

### Tasks

- Skeleton loading
- Error states
- Empty states
- Image optimization
- List performance
- Query caching
- Animations
- Accessibility
- Keyboard behavior
- Network failure handling

### Result

The application feels polished and reliable.

---

# Phase 10 — Reviews

## Goal

Add social proof.

### Tasks

- Product ratings
- Review list
- Review creation
- Verified purchase validation
- Review editing
- Review moderation

---

# Phase 11 — Style Finder

## Goal

Improve product discovery.

### Flow

```text
Occasion
    ↓
Style
    ↓
Preferences
    ↓
Recommended Dresses
```

### Initial implementation

Use deterministic metadata matching.

Example:

```text
occasion = party
style = elegant
```

Query products matching those attributes.

No AI required.

---

# Phase 12 — Complete the Look

## Goal

Increase product discovery and basket value.

### Tasks

- Related products
- Shoes
- Bags
- Accessories
- Outfit collections
- Add complete outfit

---

# Phase 13 — Notifications

## Goal

Keep customers informed.

### Notifications

- Order confirmed
- Order shipped
- Out for delivery
- Delivered
- Back in stock
- Price drop

Add notification preferences.

---

# Phase 14 — Admin

## Goal

Allow shop owners to manage the store.

### Features

```text
Dashboard
Products
Categories
Variants
Inventory
Orders
Customers
Promotions
Analytics
```

Admin functionality should use secure server-side authorization.

---

# Phase 15 — Advanced Recommendations

Potential features:

- Recently viewed
- Personalized recommendations
- Similar products
- Frequently purchased together
- Occasion-based recommendations
- Style-based recommendations

---

# Phase 16 — AI Fashion Assistant

Potential future experience:

```text
User:
"I need a dress for a wedding."

        ↓

Fashion Assistant

        ↓

Ask preferences

        ↓

Recommend products
```

AI should not be required for core commerce functionality.

---

# Phase 17 — Loyalty

Potential features:

- Points
- Rewards
- Member tiers
- Referral system
- Exclusive collections

---

# 2. MVP Definition

The MVP is complete when:

```text
Authentication
       ↓
Home
       ↓
Shop
       ↓
Search
       ↓
Filters
       ↓
Product Details
       ↓
Variant Selection
       ↓
Wishlist
       ↓
Cart
       ↓
Checkout
       ↓
Orders
       ↓
Profile
```

works reliably.

---

# 3. Priority System

Use:

```text
P0 = Required for MVP
P1 = Important after MVP
P2 = Nice to have
P3 = Future/experimental
```

Example:

```text
Authentication        P0
Product browsing      P0
Cart                  P0
Checkout              P0
Orders                P0

Reviews               P1
Notifications         P1
Style Finder          P1

Complete the Look     P2
Loyalty               P2

AI Stylist            P3
Virtual Try-On        P3
```

---

# 4. Development Rule

Do not start a lower-priority feature while a higher-priority feature is broken.

Prefer:

```text
Finish
   ↓
Verify
   ↓
Polish
   ↓
Document
   ↓
Next feature
```

rather than:

```text
Start everything
   ↓
Nothing is finished
```

---

# 5. Milestone Strategy

Each milestone should produce a usable application.

```text
Milestone 1
Foundation

Milestone 2
Catalog

Milestone 3
Shopping

Milestone 4
Checkout

Milestone 5
Orders

Milestone 6
Production Polish

Milestone 7
Advanced Features
```

---

# 6. Final Goal

The long-term application should become:

```text
                 DRESS SHOP
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   Discovery      Shopping      Account
       │             │             │
       ↓             ↓             ↓
 Style Finder      Cart          Orders
       │             │             │
       ↓             ↓             ↓
Recommendations   Checkout     Tracking
       │
       ↓
Complete the Look
```

The core commerce experience must remain simple even as advanced features are introduced.