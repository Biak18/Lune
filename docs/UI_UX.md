# UI_UX.md

# Dress Shop — UI/UX Design System

## 1. Design Direction

The application is a premium digital fashion boutique.

The visual experience should be:

- Elegant
- Minimal
- Editorial
- Modern
- Sophisticated
- Product-focused

The interface should let fashion photography and typography carry most of the visual identity.

---

# 2. Core Principle

The product is the visual hero.

Avoid UI elements competing with product photography.

```text
Photography
     ↓
Typography
     ↓
Product Information
     ↓
Actions
```

---

# 3. Layout

Use generous spacing.

Avoid overcrowding.

Prefer:

```text
Section
    ↓
Clear heading
    ↓
Content
    ↓
Spacing
    ↓
Next section
```

---

# 4. Typography

Use a consistent typographic hierarchy.

Suggested levels:

```text
Display
Heading
Section Heading
Product Name
Body
Caption
Label
```

Typography should establish hierarchy without requiring excessive decorative elements.

---

# 5. Colors

Do not hard-code the entire visual system directly inside components.

Use semantic design tokens.

Example:

```text
background
surface
foreground
muted
border
primary
secondary
success
warning
error
```

The exact brand palette should be defined centrally.

---

# 6. Spacing

Use a consistent spacing scale.

Example:

```text
4
8
12
16
20
24
32
40
48
64
```

Do not randomly introduce spacing values throughout the project.

---

# 7. Product Cards

Product cards should prioritize photography.

Recommended structure:

```text
┌────────────────────┐
│                    │
│                    │
│     PRODUCT        │
│      IMAGE         │
│                    │
│              ♡     │
├────────────────────┤
│ Product Name       │
│ $68                │
└────────────────────┘
```

Avoid putting excessive metadata on cards.

---

# 8. Product Grid

Use a clean two-column grid for mobile unless the design clearly benefits from another layout.

Product images should maintain consistent visual proportions.

Avoid inconsistent image heights.

---

# 9. Home Screen

The home screen should feel editorial.

Recommended structure:

```text
Header
   ↓
Hero
   ↓
Categories
   ↓
New Arrivals
   ↓
Featured Collection
   ↓
Shop by Occasion
   ↓
Best Sellers
```

Do not make every section look identical.

Use visual rhythm.

---

# 10. Hero Section

Hero imagery should be strong and immersive.

Example:

```text
┌─────────────────────────────┐
│                             │
│       HERO IMAGE            │
│                             │
│    NEW COLLECTION           │
│                             │
│    Effortless elegance      │
│                             │
│       [ SHOP NOW ]          │
│                             │
└─────────────────────────────┘
```

Text should remain readable over imagery.

---

# 11. Navigation

Primary navigation:

```text
Home
Shop
Wishlist
Cart
Profile
```

Keep the navigation simple.

The current destination must be visually identifiable.

---

# 12. Search

Search should be easy to access from Home and Shop.

Search UI should support:

- Input
- Clear action
- Loading state
- Results
- Empty state

Recent searches may be added later.

---

# 13. Filters

Filters should use a bottom sheet or modal pattern where appropriate.

Example:

```text
Filters

Category
○ Dresses
○ Midi
○ Maxi

Size
○ XS
○ S
○ M
○ L
○ XL

Color
○ Black
○ Cream
○ Burgundy

Price
────────────

[ CLEAR ]       [ APPLY ]
```

Applied filters should be visible.

---

# 14. Product Details

Product detail hierarchy:

```text
Photography
     ↓
Product Name
     ↓
Price
     ↓
Rating
     ↓
Variants
     ↓
Description
     ↓
Additional Details
     ↓
Add to Bag
```

Do not hide critical purchase information.

---

# 15. Variant Selection

Size and color selection must be clear.

Selected state must be distinguishable without relying solely on color.

Unavailable variants should be visually disabled.

Example:

```text
Size

XS   S   M   L   XL
          ───
        selected
```

---

# 16. Add to Bag

The primary purchase action should be prominent.

Recommended behavior:

```text
User selects variant
        ↓
Add to Bag
        ↓
Feedback
        ↓
Cart updated
```

Prevent accidental duplicate submissions.

---

# 17. Wishlist Interaction

Wishlist actions should provide immediate visual feedback.

Example:

```text
♡ → ♥
```

The animation should be subtle.

The UI should remain responsive while the server mutation completes.

---

# 18. Cart UX

The cart should clearly display:

- Product
- Variant
- Quantity
- Price
- Subtotal
- Shipping
- Total

Do not hide the final price.

---

# 19. Checkout UX

Checkout should be linear.

```text
Cart
 ↓
Shipping
 ↓
Review
 ↓
Payment
 ↓
Success
```

Avoid unnecessary fields.

Clearly show where the user is in the process.

---

# 20. Order Tracking

Use a timeline.

Current state should be clearly identifiable.

Example:

```text
✓ Confirmed
│
✓ Processing
│
● Shipped
│
○ Delivered
```

Do not rely only on color.

---

# 21. Empty States

Empty states should be useful.

Example:

```text
Your wishlist is empty.

Save dresses you love and find them here later.

[ EXPLORE DRESSES ]
```

Avoid:

```text
No data.
```

---

# 22. Error States

Errors should explain:

1. What happened
2. What the user can do

Example:

```text
We couldn't load the dresses.

Check your connection and try again.

[ RETRY ]
```

---

# 23. Loading States

Use skeletons for:

- Product cards
- Product details
- Order lists
- Profile information

Avoid showing large blank areas.

---

# 24. Accessibility

Every interactive element should have:

- Appropriate accessibility labels
- Adequate touch target
- Clear selected state
- Clear disabled state

Do not communicate meaning through color alone.

Images should have useful accessibility descriptions where appropriate.

---

# 25. Motion

Motion should communicate:

- State changes
- Navigation
- Hierarchy
- Feedback

Use subtle motion.

Avoid:

- Excessive bouncing
- Long animations
- Distracting transitions
- Animation that delays interaction

---

# 26. Responsive Design

Although the initial target is mobile, layouts should be designed with different screen sizes in mind.

Do not assume one fixed device width.

Use flexible layouts.

---

# 27. Touch Targets

Interactive elements should be comfortable to tap.

Avoid tiny icons placed too close together.

Particular attention should be given to:

- Wishlist
- Back buttons
- Filters
- Size selectors
- Quantity controls
- Checkout actions

---

# 28. Design Tokens

Centralize:

```text
Colors
Typography
Spacing
Radius
Shadows
Animation durations
```

Example:

```text
design/
├── colors.ts
├── typography.ts
├── spacing.ts
├── radius.ts
├── shadows.ts
└── motion.ts
```

---

# 29. Visual Consistency

The following must remain consistent:

- Button styles
- Input styles
- Card spacing
- Typography
- Icons
- Border radius
- Section spacing
- Loading states
- Empty states

Do not create a new visual style for every screen.

---

# 30. Fashion Photography

Photography should be treated as a core product asset.

Prefer:

- Consistent aspect ratios
- High-quality imagery
- Consistent backgrounds where possible
- Multiple angles
- Clear product presentation

Product images should not be unnecessarily cropped.

---

# 31. UI Anti-Patterns

Avoid:

- Generic Bootstrap-like mobile UI
- Excessive cards
- Excessive borders
- Excessive gradients
- Excessive shadows
- Tiny text
- Crowded product cards
- Random colors
- Inconsistent spacing
- Too many buttons
- Decorative UI with no purpose

---

# 32. UX Principle

Every screen should answer:

```text
Where am I?
What can I do?
What happens next?
```

If the user cannot answer these questions immediately, simplify the interface.

---

# 33. Final Design Goal

The application should feel like:

```text
Fashion Magazine
       +
Boutique
       +
Modern Mobile Commerce
```

rather than:

```text
Database
    +
CRUD Screens
```

The interface should make users want to explore the products while keeping purchasing straightforward.