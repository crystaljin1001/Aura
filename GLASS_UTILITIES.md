# Glass Utilities & Premium Textures

This document explains the custom Tailwind utilities added for glassmorphism effects and premium OS-like textures.

## Grain Texture

A subtle noise texture is applied globally to the body background, creating a premium, OS-like feel reminiscent of macOS and iOS.

### Global Application
The grain texture is automatically applied to the entire page via a `::before` pseudo-element on the `body` tag.

**Opacity:**
- Light mode: `3%`
- Dark mode: `5%`

### Per-Element Grain
Apply grain texture to specific elements:

```tsx
<div className="grain">
  {/* Element with subtle grain overlay */}
</div>
```

The grain texture:
- Uses SVG noise filter for crisp rendering at any scale
- Respects element's border-radius
- Non-interactive (pointer-events: none)
- Blends via overlay mode

## Glass Utilities

### Basic Glass Effect

The core glass effect with balanced opacity and blur:

```tsx
<div className="glass">
  {/* Glassmorphism element */}
</div>
```

**Properties:**
- Background: Semi-transparent white/black (70% light, 60% dark)
- Backdrop blur: 16px with 180% saturation
- Border: Subtle white border
- Shadow: Soft depth shadow

**Dark mode:** Automatically adjusts to darker background with lower opacity

---

### Glass Variants

#### `.glass-light`
Lighter, more transparent glass:

```tsx
<div className="glass-light">
  {/* More see-through */}
</div>
```

- Background opacity: 85% light / 70% dark
- Blur: 12px
- Use for: Secondary elements, less prominent cards

#### `.glass-heavy`
Stronger, more opaque glass:

```tsx
<div className="glass-heavy">
  {/* Less see-through, more solid */}
</div>
```

- Background opacity: 95% light / 90% dark
- Blur: 24px with 200% saturation
- Stronger shadow
- Use for: Primary navigation, important modals

#### `.glass-subtle`
Minimal, barely-there glass:

```tsx
<div className="glass-subtle">
  {/* Very transparent */}
</div>
```

- Background opacity: 50%
- Blur: 8px with 120% saturation
- Use for: Overlays, tooltips, minimal UI elements

---

### Colored Glass

Glass effects with color tints:

#### `.glass-blue`
```tsx
<div className="glass-blue">
  {/* Blue-tinted glass */}
</div>
```

#### `.glass-purple`
```tsx
<div className="glass-purple">
  {/* Purple-tinted glass */}
</div>
```

#### `.glass-green`
```tsx
<div className="glass-green">
  {/* Green-tinted glass */}
</div>
```

**Use cases:**
- Info banners (blue)
- Premium features (purple)
- Success states (green)

---

### Frosted Glass

Special frosted effect with brightness adjustment:

```tsx
<div className="frosted">
  {/* Frosted glass like iOS */}
</div>
```

- Background opacity: 40%
- Blur: 20px
- Brightness: 110% light mode / 90% dark mode
- Use for: Modals, overlays, popovers

---

## Premium Shadow

A multi-layered, subtle shadow for depth without harshness:

```tsx
<div className="shadow-premium">
  {/* Element with premium shadow */}
</div>
```

**Shadow layers:**
- 1px: Very subtle close shadow
- 4px: Light ambient shadow
- 8px: Medium depth shadow
- 16px: Far depth shadow

All shadows use very low opacity (2-3%) for a natural, premium look.

---

## CSS Variables

Customize glass effects globally by overriding CSS variables:

```css
:root {
  --glass-opacity: 0.7;        /* Base glass opacity */
  --glass-blur: 16px;          /* Blur amount */
  --glass-border: rgba(...);   /* Border color */
  --glass-shadow: 0 8px...;    /* Shadow */
  --grain-opacity: 0.03;       /* Grain texture opacity */
}
```

These automatically adjust for dark mode.

---

## Usage Examples

### Navigation Bar
```tsx
<nav className="glass shadow-premium">
  {/* Glassmorphic navigation */}
</nav>
```

### Card with Grain
```tsx
<div className="glass grain rounded-2xl p-6">
  {/* Card with glass effect and grain texture */}
</div>
```

### Colored Info Banner
```tsx
<div className="glass-blue grain rounded-lg p-4">
  {/* Blue-tinted glass banner with grain */}
</div>
```

### Modal Overlay
```tsx
<div className="frosted rounded-3xl p-8 shadow-premium">
  {/* iOS-style modal */}
</div>
```

### Primary CTA Button
```tsx
<button className="glass-heavy grain rounded-full px-8 py-4">
  {/* Premium glass button */}
</button>
```

---

## Best Practices

### 1. **Layering**
- Use lighter glass for background elements
- Use heavier glass for foreground elements
- This creates natural depth hierarchy

### 2. **Contrast**
- Always ensure text has sufficient contrast
- Test in both light and dark modes
- Use semi-bold or bold fonts on glass surfaces

### 3. **Performance**
- Glass effects use CSS filters which are GPU-accelerated
- Avoid nesting too many glass layers (max 2-3)
- The grain texture is optimized with SVG

### 4. **Accessibility**
- Maintain WCAG AA contrast ratios (4.5:1 for normal text)
- Glass effects automatically adjust for dark mode
- Ensure focus states are visible on glass backgrounds

### 5. **Combining Effects**
Recommended combinations:
```tsx
{/* Premium card */}
<div className="glass grain rounded-2xl shadow-premium">

{/* Info banner */}
<div className="glass-blue grain rounded-lg">

{/* Subtle overlay */}
<div className="glass-subtle">

{/* Strong modal */}
<div className="frosted grain shadow-premium">
```

---

## Browser Support

### Backdrop Filters
Glass effects use `backdrop-filter` which is supported in:
- ✅ Chrome/Edge 76+
- ✅ Safari 9+ (with `-webkit-` prefix)
- ✅ Firefox 103+
- ⚠️ Degrades gracefully in older browsers (shows solid background)

### SVG Grain Texture
- ✅ All modern browsers
- ✅ Inline SVG data URI for performance

---

## Examples in Aura

Current implementations:

1. **Navigation Bar** (`src/app/page.tsx`)
   ```tsx
   <nav className="glass shadow-premium">
   ```

2. **Repository Cards** (`RepositoryBentoGrid.tsx`)
   ```tsx
   <div className="glass grain rounded-2xl shadow-lg">
   ```

3. **Info Banners** (`RepositoryBentoGrid.tsx`)
   ```tsx
   <div className="glass-blue grain rounded-2xl shadow-premium">
   ```

4. **Hero Impact Card** (`Hero.tsx`)
   ```tsx
   <div className="glass rounded-2xl shadow-2xl p-8 grain">
   ```

5. **CTA Buttons** (`Hero.tsx`)
   ```tsx
   <button className="...shadow-premium grain">
   ```

---

## Customization

To create custom glass variants, extend the utilities in `src/app/globals.css`:

```css
@layer utilities {
  .glass-custom {
    background: rgba(255, 100, 100, 0.15);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 100, 100, 0.2);
  }
}
```

---

## Performance Tips

1. **Limit nesting**: Each glass layer requires GPU compositing
2. **Use transforms**: Prefer `transform` over `top/left` for animations
3. **Combine utilities**: `glass grain shadow-premium` is optimized
4. **Static grain**: Grain texture doesn't animate, keeping performance high
5. **Will-change**: For animated glass elements, add `will-change: transform`

---

## Troubleshooting

### Glass not showing blur
- Ensure there's content behind the element
- Check browser support for `backdrop-filter`
- Verify the element has some transparency

### Grain too strong/weak
- Adjust `--grain-opacity` in CSS variables
- Light mode: 0.02-0.05
- Dark mode: 0.04-0.08

### Performance issues
- Reduce number of glass layers
- Use `glass-subtle` for less intensive blur
- Disable grain on low-end devices

---

## Future Enhancements

Potential additions:

- [ ] Glass animation utilities
- [ ] Glassmorphic form inputs
- [ ] Glass navigation transitions
- [ ] Animated grain patterns
- [ ] Contextual glass (adjusts based on background)
