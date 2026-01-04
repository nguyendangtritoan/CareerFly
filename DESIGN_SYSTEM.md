# CareerFly Design System

A comprehensive design token system for consistent styling across the application.

## Overview

All design tokens are centralized in `tailwind.config.js` for easy maintenance and theme updates. This allows you to change colors, spacing, typography, and more in one place.

---

## Color System

### Semantic Colors

#### Primary (Indigo)
Brand color used for primary actions, links, and emphasis.

**Usage:**
```jsx
<button className="bg-primary-600 hover:bg-primary-700">Click me</button>
```

**Shades:** 50, 100, 200, 300, 400, 500 (main), 600, 700, 800, 900, 950

---

#### Surface (Backgrounds)
Used for cards, panels, and main backgrounds.

- `surface-light` - White background (light mode)
- `surface-light-secondary` - Very light gray (light mode nested)
- `surface` (DEFAULT) - Dark zinc (dark mode)
- `surface-dark` - Darkest zinc (dark mode nested)

**Usage:**
```jsx
<div className="bg-surface-light dark:bg-surface">Card content</div>
```

---

#### Border
Consistent border colors for light/dark modes.

- `border-light` - Gray 300 (light mode)
- `border-light-subtle` - Gray 200 (light mode, subtle)
- `border` (DEFAULT) - Zinc 800 (dark mode)
- `border-dark` - Zinc 900 (dark mode, strong)

**Usage:**
```jsx
<div className="border border-border-light dark:border-border">Card</div>
```

---

#### Text (Typography Hierarchy)
Semantic text colors for different content levels.

**Light mode:**
- `text-primary-light` - Main text (zinc-900)
- `text-secondary-light` - Secondary text (zinc-600)
- `text-tertiary-light` - Tertiary/muted (zinc-500)

**Dark mode:**
- `text-primary-dark` - Main text (zinc-50)
- `text-secondary-dark` - Secondary text (zinc-300)
- `text-tertiary-dark` - Tertiary/muted (zinc-400)

**Usage:**
```jsx
<h1 className="text-text-primary-light dark:text-text-primary-dark">Title</h1>
<p className="text-text-secondary-light dark:text-text-secondary-dark">Body</p>
```

---

#### Accent (Impact Levels)
Colors for impact indicators (high/medium/low).

**High Impact:**
- `accent-high-light` - Indigo 600
- `accent-high-dark` - Indigo 400

**Medium Impact:**
- `accent-medium-light` - Sky 600
- `accent-medium-dark` - Sky 400

**Low Impact:**
- `accent-low-light` - Zinc 500
- `accent-low-dark` - Zinc 400

**Usage:**
```jsx
<span className="text-accent-high-light dark:text-accent-high-dark">High</span>
```

---

#### Status Colors
For success, warning, and error states.

- `success-light` / `success-dark` - Green
- `warning-light` / `warning-dark` - Yellow
- `error-light` / `error-dark` - Red

**Usage:**
```jsx
<div className="text-success-light dark:text-success-dark">Success!</div>
```

---

## Typography

### Font Families
- `font-sans` - Inter (body text)
- `font-mono` - JetBrains Mono (code, technical)

### Font Sizes
All include optimized line heights:
- `text-xs` - 0.75rem (12px)
- `text-sm` - 0.875rem (14px)
- `text-base` - 1rem (16px)
- `text-lg` - 1.125rem (18px)
- `text-xl` - 1.25rem (20px)
- `text-2xl` - 1.5rem (24px)
- `text-3xl` - 1.875rem (30px)

---

## Spacing

Uses Tailwind's default spacing scale (0-96) with additions:
- `spacing-18` - 4.5rem (72px)
- `spacing-22` - 5.5rem (88px)

---

## Border Radius

Component-specific presets:
- `rounded-card` - 0.75rem (12px) - Cards and panels
- `rounded-button` - 0.5rem (8px) - Buttons
- `rounded-input` - 0.5rem (8px) - Input fields
- `rounded-tag` - 0.375rem (6px) - Tags and badges

**Usage:**
```jsx
<div className="rounded-card">Card</div>
<button className="rounded-button">Button</button>
```

---

## Shadows (Elevation)

- `shadow-card` - Subtle elevation for cards
- `shadow-card-hover` - Medium elevation on hover
- `shadow-button` - Very subtle for buttons
- `shadow-dropdown` - Strong for dropdowns/modals

**Usage:**
```jsx
<div className="shadow-card hover:shadow-card-hover">Card</div>
```

---

## Animation

### Transition Durations
- `duration-250` - 250ms (smooth transitions)

---

## Migration Guide

### Before (scattered colors):
```jsx
<div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800">
  <h1 className="text-zinc-900 dark:text-zinc-50">Title</h1>
  <p className="text-zinc-600 dark:text-zinc-400">Text</p>
</div>
```

### After (semantic tokens):
```jsx
<div className="bg-surface-light dark:bg-surface border border-border-light dark:border-border">
  <h1 className="text-text-primary-light dark:text-text-primary-dark">Title</h1>
  <p className="text-text-secondary-light dark:text-text-secondary-dark">Text</p>
</div>
```

---

## Best Practices

1. **Use semantic tokens** instead of raw Tailwind colors
2. **Always provide both light and dark variants** for colors
3. **Use border radius presets** for consistency
4. **Leverage shadow tokens** for elevation
5. **Prefer semantic color names** over specific shades

---

## Updating the Design System

To change colors globally:

1. Open `tailwind.config.js`
2. Modify values in the `theme.extend` section
3. Changes apply throughout the entire app

**Example:** Change primary brand color:
```javascript
primary: {
  500: '#7c3aed', // Changed from indigo to purple
  600: '#6d28d9',
  // ... update other shades
}
```
