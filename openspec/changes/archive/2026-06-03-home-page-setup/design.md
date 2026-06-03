# Design: home-page-setup

## Overview

This change adds a Home screen with a bottom tab bar and topic placeholders. The UI follows existing project rules: functional components, TypeScript, accessible and kid-friendly touch targets.

## Libraries

- Use React Navigation (bottom tabs) for cross-platform navigation:
  - `@react-navigation/native`
  - `@react-navigation/bottom-tabs`
  - `react-native-screens` and `react-native-safe-area-context` as required by React Navigation
- Reuse the existing `LanguageSelector` concept for language switching (extend as needed).

## Folder structure

- `src/screens/Home/` — `index.tsx`, `TopicPlaceholder.tsx`
- `src/screens/topics/Addition.tsx`, `Subtraction.tsx`, ... (one per topic)
- `src/components/BottomTabBar.tsx` — custom tab bar (if needed)
- `src/components/PremiumModal.tsx` — modal placeholder

## Tab bar layout

- Left-to-right: [Addition] [Subtraction] [Multiplication] [Division] [More topics menu] [Diamond Icon (Premium)] [Language Selector] [Profile] [Settings]
- Given 8 topics, the tab bar will show primary topics as tabs and collapse less-used topics into a "More" menu if space is constrained (simple responsive behavior for web/mobile).

## Home screen layout

- The Home screen is divided into two areas:
  1. Top Bar: contains the `Profile` icon (static), `Settings` icon, `Diamond` icon that opens the `Premium` modal, and the `LanguageSelector` control.
  2. Main Content: a vertically scrollable two-column grid of topic cards (two items per row). The first row must contain `Addition` and `Subtraction`, then continue with `Multiplication`, `Division`, `Decimal Operation`, `Fractions`, `Percentages`, `Roots` in that reading order.

- Each topic card (`TopicCard`) shows a title, a friendly icon or emoji, and a short subtitle. Cards should be large with generous touch targets per UI rules.

- On narrow screens (small mobile widths) the grid may collapse to a single column (responsive behavior) but should remain scrollable.

## Internationalization

- All user-visible strings on the Home screen (topic titles, subtitles, modal text, top-bar labels) must use the project's i18n system (`react-i18next`) and keys defined under a `topics` namespace in the locale JSONs. Provide translations at least for `en`, `es`, and `hi` as part of this change.

## Language selection

- The `LanguageSelector` is an icon control shown in the Top Bar (use a globe or language glyph). Tapping/clicking the icon opens a language menu (on mobile: a bottom sheet or action sheet; on web/large screens: a dropdown) that lists available languages. The control must:
  - Be represented as an icon in the Top Bar — not as a text button.
  - Open an accessible menu or sheet on press that displays the full language list from this spec.
  - Show a checkmark or highlighted state next to the currently-selected language.
  - Persist the selection via AsyncStorage and call the project's `setI18nLanguage` helper.
  - Support keyboard navigation and screen readers on web.

- The available languages that MUST be offered by the selector are:
  - English
  - Español
  - Português
  - Deutsch
  - Italiano
  - Français
  - pyccknn (Russian)
  - Indonesian
  - Melayu
  - Hindi
  - Korean

- Optional UI: include a small flag or native language label beside each item. Keep labels short and use the translated display name where possible.

## Accessibility & UX

- Large touch targets, clear labels, and high-contrast icons.
- Modal and menus are keyboard accessible on web, and have accessible labels for screen readers.

## Data & State

- Topics are static placeholder screens for now — no backend integration.
- Language selection updates i18n language (reuse `setI18nLanguage`).
