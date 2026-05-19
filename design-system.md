# Tender Explorer — Design System

## Identity
"Confident Forest" — earthy, considered, distinctive. Procurement is about
trust and value; forest green communicates both without falling into
generic-fintech-blue territory.

## Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#15803D` | Buttons, links, active states |
| `--color-primary-hover` | `#166534` | Button hover |
| `--color-primary-active` | `#14532D` | Button press / dark headers |
| `--color-primary-light` | `#DCFCE7` | Tag/badge backgrounds |
| `--color-primary-subtle` | `#F0FDF4` | Row hover, subtle fills |
| `--color-bg` | `#FAFAF9` | Page background |
| `--color-surface` | `#FFFFFF` | Card / panel backgrounds |
| `--color-surface-hover` | `#F5F5F4` | Nav link hover |
| `--color-border` | `#E7E5E4` | All borders |
| `--color-text` | `#1C1917` | Body text |
| `--color-text-secondary` | `#44403C` | Labels, secondary text |
| `--color-text-muted` | `#57534E` | Captions, placeholders |
| `--color-success` | `#15803D` | Same as primary — wins ARE the brand |
| `--color-warning` | `#D97706` | Alerts, pending states |
| `--color-danger` | `#B91C1C` | Errors, flagged fraud |
| `--color-info` | `#0369A1` | Info banners |

## Typography
| Role | Font | Weight |
|------|------|--------|
| Body | Inter | 400 / 500 / 600 |
| Headlines (h1–h3) | Fraunces (serif) | 600 |

Size scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 40px

## Spacing Scale
4px base. Use: 4, 8, 12, 16, 24, 32, 48, 64, 96px

## Border Radius
| Name | Value |
|------|-------|
| `--radius-sm` | 6px |
| `--radius` | 10px |
| `--radius-lg` | 14px |
| `--radius-xl` | 20px |
| `--radius-full` | 9999px |

## Shadows
```
Subtle:  0 1px 3px rgba(28, 25, 23, 0.06)
Medium:  0 4px 12px rgba(28, 25, 23, 0.08)
Strong:  0 12px 24px rgba(28, 25, 23, 0.10)
```

## Component Rules
- **Buttons**: 42px height, `--color-primary` bg, white text, hover darkens to `--color-primary-hover`
- **Inputs**: 42px height, `--color-border` border, 3px focus ring in primary with `rgba(21,128,61,0.12)` offset
- **Cards**: 24px padding, `--shadow` elevation, `--color-border` outline, hover lifts 2px
- **Tables**: `--color-primary-subtle` thead, `--color-primary` header text

## Strict Rules
1. **NEVER** introduce colors outside this palette
2. **NEVER** use cool grays (no slate, no zinc) — warm stone neutrals only
3. **NEVER** add purple, pink, or neon
4. **NEVER** use scale animations on buttons — confidence = stillness
5. Generous whitespace — when in doubt, add more padding
6. Status colors are muted, never neon
7. All hardcoded colors in components must reference CSS variables
