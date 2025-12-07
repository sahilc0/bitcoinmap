# Claude Code Guidelines

## Design System: Cash App Style

Follow Cash App's design language throughout the app:

### Colors
- **Primary**: `#00D632` (Cash App Green)
- Use the green sparingly for CTAs and highlights
- Keep backgrounds clean (white/light gray)
- **Always use Tailwind tokens** - never hardcode RGB/HSL values in components
- Use semantic tokens like `text-foreground`, `text-muted-foreground`, `bg-card`
- For opacity variations, use Tailwind modifiers: `text-foreground/90`, `bg-primary/80`

### Typography
- System fonts: SF Pro (iOS), Roboto (Android)
- Large, readable text
- Bold headlines, regular body
- **Sentence case everywhere** - "Review details" not "Review Details"

### Spacing & Layout
- Generous padding throughout
- Large touch targets (minimum 44px)
- 12px border radius (`rounded-xl`)
- Mobile-first responsive design

### Animations
- Smooth, modern transitions
- Use `motion` library (framer-motion)
- Spring animations with `stiffness: 300, damping: 30`
- Stagger children for lists
- Subtle fade-ups on load

### UX Principles
- Minimal friction - reduce steps where possible
- Auto-fill data when available
- Clear visual hierarchy
- Immediate feedback on interactions
- Clean, uncluttered interfaces

## Key Files
- `src/components/ui/animations.tsx` - Animation utilities
- `src/app/globals.css` - Theme tokens and global styles
- `src/components/add-location/` - Main form components

## Important Notes
- Always use lowercase "bitcoin" (not "Bitcoin")
- Keep the interface mobile-first
- Test touch interactions
