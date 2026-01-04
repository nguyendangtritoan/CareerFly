# CareerFly Design System

**Philosophy:** A minimalist, data-first interface focusing on clarity and reduced cognitive load. The design uses a strict hierarchy, ample whitespace, and a monochromatic neutral palette to create a "Clean SaaS" aesthetic.

## Overview

All design tokens are centralized in `tailwind.config.js` for easy maintenance and theme updates. This allows you to change colors, spacing, typography, and more in one place.

**Base Configuration:**
- Font Family: Inter, sans-serif
- Base Text Size: 14px (0.875rem)
- Global Background: #F9FAFB (Canvas)
- Design Language: Monochromatic neutral palette

---

## Color Palette

### Monochromatic Neutral System

| Role | Hex Code | Tailwind Class | Usage |
|------|----------|----------------|-------|
| **Canvas** | `#F9FAFB` | `bg-canvas` | App background behind main card |
| **Surface** | `#FFFFFF` | `bg-surface` | Main card/container background |
| **Primary Text** | `#101828` | `text-text-primary` | Headers, Task names, Active states |
| **Secondary Text** | `#475467` | `text-text-secondary` | Column headers, Timestamps |
| **Tertiary Text** | `#667085` | `text-text-tertiary` | Icons, Placeholders, Empty states |
| **Border (Subtle)** | `#EAECF0` | `border-border-subtle` | Dividers between log rows |
| **Border (Input)** | `#D0D5DD` | `border-border-input` | Input fields, dropdown borders |
| **Action/Primary** | `#101828` | `bg-action-primary` | Primary buttons |
| **Action Hover** | `#252D3D` | `bg-action-hover` | Button hover state |
| **Tag Background** | `#F2F4F7` | `bg-tag-bg` | Category tag background |
| **Tag Text** | `#344054` | `text-tag-text` | Category tag text |
| **Hover Background** | `#F9FAFB` | `bg-hover-bg` | Row hover state |
| **Focus Ring** | `#F2F4F7` | `shadow-focus` | Input focus ring |

**Usage Example:**
```jsx
<div className="bg-canvas">
  <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6">
    <h1 className="text-text-primary font-bold text-3xl">Clean SaaS Title</h1>
    <p className="text-text-secondary text-sm">Subtitle text</p>
  </div>
</div>
```

---

## Typography

### Font Families
- `font-sans` - Inter (all UI text)
- `font-mono` - JetBrains Mono (code, technical content)

### Font Sizes & Weights
All sizes include optimized line heights and default weights:

| Class | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 12px | 16px | 400 | Tags, small labels |
| `text-sm` | 14px | 20px | 400 | **Base text** (default) |
| `text-base` | 16px | 24px | 400 | Body text |
| `text-lg` | 18px | 28px | 500 | Subheadings |
| `text-xl` | 20px | 28px | 500 | Section titles |
| `text-2xl` | 24px | 32px | 600 | H2 headings |
| `text-3xl` | 30px | 36px | 700 | H1 headings |

### Font Weights
- `font-normal` (400) - Regular text
- `font-medium` (500) - Task titles, tags, emphasis
- `font-semibold` (600) - Subheadings
- `font-bold` (700) - Main headers

**Usage Example:**
```jsx
<h1 className="text-3xl font-bold text-text-primary">Main Header</h1>
<h2 className="text-2xl font-semibold text-text-primary">Section Title</h2>
<p className="text-sm text-text-secondary">Body text at 14px</p>
```

---

## Component Specifications

### Main Container (Card)
```jsx
<div className="bg-surface border border-border-subtle rounded-container shadow-card p-6">
  {/* Content */}
</div>
```

**Properties:**
- Background: `#FFFFFF` (`bg-surface`)
- Border: `1px solid #EAECF0` (`border-border-subtle`)
- Border Radius: `12px` (`rounded-container` or `rounded-card`)
- Shadow: `shadow-card`
- Padding: `24px` (`p-6`)

---

### Log Entry Row (List Item)
```jsx
<div className="min-h-row flex items-center border-b border-border-subtle hover:bg-hover-bg transition-colors px-4 py-3">
  {/* Row content */}
</div>
```

**Properties:**
- Min Height: `72px` (`min-h-row`)
- Layout: Flexbox, centered
- Separator: `1px solid #EAECF0` at bottom
- Hover: Background changes to `#F9FAFB`

---

### Category Tags (Pills)
```jsx
<span className="bg-tag-bg text-tag-text text-xs font-medium px-2.5 py-0.5 rounded-tag">
  Category
</span>
```

**Properties:**
- Background: `#F2F4F7` (`bg-tag-bg`)
- Text: `#344054` (`text-tag-text`)
- Font Size: `12px` (`text-xs`)
- Font Weight: `500` (`font-medium`)
- Border Radius: `999px` (`rounded-tag`) - Fully rounded
- Padding: `px-2.5 py-0.5`

---

### Primary Button
```jsx
<button className="bg-action-primary hover:bg-action-hover text-white border border-action-primary rounded-button shadow-button px-4 py-2 text-sm font-medium transition-colors">
  Start Timer
</button>
```

**Properties:**
- Background: `#101828` (`bg-action-primary`)
- Text: `#FFFFFF` (white)
- Border: `1px solid #101828`
- Hover: `#252D3D` (`bg-action-hover`)
- Border Radius: `8px` (`rounded-button`)
- Shadow: `shadow-button`

---

### Input Fields & Dropdowns
```jsx
<input 
  type="text"
  className="bg-surface border border-border-input rounded-input shadow-input px-3 py-2 text-sm text-text-primary focus:border-action-primary focus:shadow-focus focus:outline-none"
  placeholder="Enter text..."
/>
```

**Properties:**
- Background: `#FFFFFF` (`bg-surface`)
- Border: `1px solid #D0D5DD` (`border-border-input`)
- Border Radius: `8px` (`rounded-input`)
- Shadow: `shadow-input`
- Focus: Border changes to `#101828`, adds `shadow-focus`

---

## Border Radius Presets

- `rounded-container` - `12px` - Main containers (soft corners)
- `rounded-card` - `12px` - Alias for container
- `rounded-button` - `8px` - Buttons/Inputs (precise corners)
- `rounded-input` - `8px` - Input fields
- `rounded-tag` - `999px` - Tags/Pills (fully rounded)

---

## Shadows (Elevation)

- `shadow-card` - Subtle elevation for main cards
- `shadow-button` - Very subtle for buttons
- `shadow-input` - Subtle for input fields
- `shadow-focus` - Focus ring (4px outline)
- `shadow-dropdown` - Stronger for dropdowns/modals

**Usage:**
```jsx
<div className="shadow-card">Card with elevation</div>
<button className="shadow-button">Button</button>
```

---

## Layout Patterns

### Header Section
```jsx
<div className="mb-8">
  <h1 className="text-3xl font-bold text-text-primary mb-2">Page Title</h1>
  <p className="text-sm text-text-secondary">Subtitle or description</p>
</div>
```

### Table Header
```jsx
<div className="text-xs uppercase text-text-tertiary font-medium tracking-wider">
  Column Name
</div>
```

---

## Dark Mode Support

The system includes dark mode colors for future use:

```jsx
// Dark mode example (when implemented)
<div className="bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary">
  Content
</div>
```

---

## Migration Example

### Before (scattered values):
```jsx
<div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
  <h1 className="text-gray-900 font-bold text-3xl">Title</h1>
  <p className="text-gray-700 text-sm">Subtitle</p>
</div>
```

### After (Clean SaaS tokens):
```jsx
<div className="bg-surface border border-border-subtle rounded-container shadow-card p-6">
  <h1 className="text-text-primary font-bold text-3xl">Title</h1>
  <p className="text-text-secondary text-sm">Subtitle</p>
</div>
```

---

## Best Practices

1. **Use semantic tokens** - `bg-surface` instead of `bg-white`
2. **Maintain hierarchy** - Use text-primary/secondary/tertiary for clear hierarchy
3. **Consistent spacing** - Use ample whitespace (p-6, mb-8, etc.)
4. **Precise corners** - Use border radius presets for consistency
5. **Subtle elevation** - Use shadow tokens sparingly

---

## Quick Reference

**Common Patterns:**

```jsx
// Card
<div className="bg-surface border border-border-subtle rounded-card shadow-card p-6">

// Button
<button className="bg-action-primary hover:bg-action-hover text-white rounded-button shadow-button px-4 py-2">

// Input
<input className="bg-surface border border-border-input rounded-input shadow-input px-3 py-2 focus:border-action-primary focus:shadow-focus">

// Tag
<span className="bg-tag-bg text-tag-text text-xs font-medium px-2.5 py-0.5 rounded-tag">

// Row
<div className="min-h-row flex items-center border-b border-border-subtle hover:bg-hover-bg">
```
