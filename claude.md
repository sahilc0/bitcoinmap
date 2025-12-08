# Claude Code Guidelines

## Design Philosophy

**Token-based approach**: Never hardcode hex codes, pixel values, or HSL values in components. All values come from design tokens defined in `globals.css`.

**Cash App brand principles**:
- Balance **bold confidence** with **playful levity**
- Make money feel **immediate, approachable, and powerful**
- **Simple, legible, and functional** first; expressiveness layered on top
- Cash Green is iconic - use it sparingly, never spam it

---

## Token Mapping

Use Tailwind classes that map to CSS variables. Never use raw values.

| Tailwind Class | CSS Variable | Cash App Concept |
|----------------|--------------|------------------|
| `bg-primary` | `--primary` → `--cashapp-green` | `color.cash.green` (brand) |
| `bg-secondary` | `--secondary` | `color.surface.default` |
| `bg-card` | `--card` | `color.surface.elevated` |
| `bg-destructive` | `--destructive` | `color.state.error` |
| `text-foreground` | `--foreground` | `color.text.primary` |
| `text-muted-foreground` | `--muted-foreground` | `color.text.subtle` |
| `border-border` | `--border` | `color.border.subtle` |
| `rounded-sm/md/lg/xl` | `--radius-*` | `radius.*` tokens |

For opacity variations, use Tailwind modifiers: `text-foreground/90`, `bg-primary/80`

---

## Color

### Brand color usage
- **Cash Green** (`bg-primary`) is special:
  - Use for primary CTAs, logo, and key brand focal points
  - Never flood surfaces with green; balance with black/white
  - Don't invent "almost green" shades - use the token
- **Black & white** do heavy lifting for legibility, structure, and rhythm
- **Citron** (if added): Use sparingly as accent, not base background

### Accessibility
- Target **WCAG AA minimum** (4.5:1 for normal text)
- Prefer **WCAG AAA** (7:1) when possible
- Cash Green pairs best with black or white text
- **Never rely on color alone** to convey state - pair with icons, text, or patterns

---

## Typography

### Fonts
- **Primary**: System fonts (SF Pro on iOS, Roboto on Android)
- **Mono**: `font-mono` for numerics, codes, tabular data

### Hierarchy (use semantic sizing, not pixel values)
- **Display/Headlines**: Bold, tighter leading
- **Body**: Regular weight, comfortable reading rhythm
- **Captions/Helper**: Smaller, muted color

### Writing rules
- **Sentence case everywhere** - "Review details" not "Review Details"
- **Lowercase "bitcoin"** - never capitalize unless starting a sentence
- Lead with the most important information
- Use familiar words; avoid jargon

---

## Spacing & Layout

### Touch targets
- **Minimum 44px** (48px recommended)
- Generous padding throughout

### Mobile-first
- Design for mobile, enhance for larger screens
- Test at minimum: Mobile (375px), Tablet (768px), Desktop (1440px+)

### Border radius
- Use `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` tokens
- Buttons often use full rounding (`rounded-full`)
- Cards typically use `rounded-xl` or `rounded-2xl`

---

## Motion & Animation

### Core principles
- **Intentional**: Strong, punchy, confident movements
- **Effortless**: Smooth, not labored
- **Organic**: Grounded in real-world physics
- **Weighted**: Things feel like they have mass
- **Elastic**: Subtle overshoot/settle for delight, not chaos

### Implementation
- Use `motion` library (framer-motion)
- **Spring animations**: `{ type: "spring", stiffness: 300, damping: 30 }`
- **Timing**: Keep animations fast (200-300ms typical, never >1s)
- **Easing**: Prefer `ease-out` for entering elements
- Stagger children for lists
- Subtle fade-ups on load

### Accessibility
- Respect `prefers-reduced-motion`
- Disable transform animations for users who prefer reduced motion

---

## Voice & Tone

### Core voice pillars

**To-the-point**:
- Lead with the most important fact or action
- Prefer short, direct sentences
- Use familiar words; explain technical terms if needed
- Organize with headlines, bullets, scannable structure

**Approachable**:
- Friendly, relatable, human
- Translate jargon; don't show off
- Light playfulness where appropriate
- Humor only when stakes are low - never in error states

**Upfront**:
- Honest, direct, transparent
- Name risks and limitations plainly
- Balance enthusiasm with humility
- Explain why friction exists when slowing users down

### Tone by context
- **Marketing/hero**: High clarity, moderate playfulness, high confidence
- **Education/features**: More detail, friendly
- **In-product decisions**: Calm, specific, reassuring
- **Errors/support**: Empathetic, direct, no jokes

---

## Component Patterns (Reference)

> These are guidelines, not rules. Adapt to project needs.

### Buttons

**Principles**:
- Primary CTAs use black background with white text (or green for special emphasis)
- Full-width on mobile, generous height for touch
- Pill-shaped (fully rounded) is the default style

**Reference specs**:
- Height: Large touch target (~56px for primary)
- Font: Semibold weight
- Disabled: Reduced opacity, no hover states

### Inputs

**Principles**:
- Clear visual boundary with subtle border
- Generous padding for comfortable typing
- Focus state uses stronger border (typically black)

**Reference specs**:
- Height: Match button height for visual consistency
- Border radius: `rounded-xl` typical
- Placeholder: Muted text color

### Cards

**Principles**:
- White or light background
- Subtle or no shadow (Cash App is flat-ish)
- Generous internal padding

**Reference specs**:
- Border radius: `rounded-xl` to `rounded-2xl`
- Padding: 16-24px
- Border: Very subtle or none

### Navigation

**Principles**:
- Back/close buttons: Top-left, simple icon
- Navigation bar: Minimal, centered title if present
- Bottom tab bar: 3-5 items max

**Reference specs**:
- Icon size: 24px for nav icons
- Touch target: 44px minimum
- Active/inactive: Foreground vs muted colors

### Lists

**Principles**:
- Clear row separation (subtle divider or spacing)
- Icon containers often circular with colored background
- Chevron (>) for drill-down rows

**Reference specs**:
- Row height: 64-72px minimum
- Icon container: 40px circular
- Gap between icon and text: 12px

### States

**Loading**:
- Spinner or skeleton loading
- Skeleton uses muted background with shimmer

**Success**:
- Green checkmark (Cash Green)
- Animated scale-in with spring
- Clear headline below

**Error**:
- Red color (`destructive`)
- Clear headline describing issue
- Action to resolve

**Empty**:
- Optional illustration
- Friendly headline
- Action-oriented description and CTA

---

## Iconography

### Style
- Line/outlined style (not filled)
- Consistent stroke width (1.5-2px)
- Rounded corners, matching Cash Sans feel

### Sizes
| Size | Usage |
|------|-------|
| 16px | Inline, small UI |
| 20px | List items, buttons |
| 24px | Navigation, primary actions |
| 32px+ | Feature icons, hero elements |

### Icon containers
- Circular background (40px diameter typical)
- White icon on colored background
- Colors vary by category/meaning

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/globals.css` | Token definitions (all colors, radii, fonts) |
| `src/components/ui/animations.tsx` | Animation utilities |
| `src/components/add-location/` | Main form components |

---

## Important Notes

- Always use **lowercase "bitcoin"**
- Keep the interface **mobile-first**
- **Test touch interactions** on real devices
- Never commit CLAUDE.md files (add to .gitignore)
- **DRY**: If a token exists, use it - never hardcode values
