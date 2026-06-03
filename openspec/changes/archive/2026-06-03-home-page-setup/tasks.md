# Tasks: home-page-setup

1. Install navigation dependencies
   - `@react-navigation/native`, `@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context`
   - Estimate: 10–15m

2. Create Home screen scaffold
   - `src/screens/Home/index.tsx` with tab bar and placeholder area
   - `src/components/BottomTabBar.tsx` (optional customizations)
   - Estimate: 30–45m

2.a Create `TopicCard` and grid layout
   - `src/components/TopicCard.tsx` showing title, icon, and subtitle
   - Update `src/screens/Home/index.tsx` to render a vertically scrollable two-column grid (two cards per row). First row: Addition, Subtraction; follow with the remaining topics in order.
   - Ensure responsive collapse to single-column on narrow screens
   - Estimate: 20–30m
   
2.b Use i18n for Home strings
   - Add translation keys under `topics` for all topic titles and modal text in `src/i18n/locales/*.json` (`en`, `es`, `hi` at minimum)
   - Update `src/screens/Home/index.tsx` to use `useTranslation()` for titles and modal text
   - Estimate: 15–25m

Status: [x] Implemented TopicCard and Home grid

3. Create topic placeholder screens (one per topic)
   - `src/screens/topics/Addition.tsx`, etc., each a small card with title and sample text
   - Estimate: 30–45m

4. Add `PremiumModal` placeholder
   - `src/components/PremiumModal.tsx` opens from diamond icon
   - Estimate: 15–20m

5. Integrate `LanguageSelector` into Top Bar as an icon
   - Render the `LanguageSelector` as an icon in the Top Bar (globe or language glyph). On press it must open an accessible menu (bottom sheet on mobile, dropdown on web/large screens) that lists the full language set defined by this spec.
   - The selector MUST show the following languages (display labels are recommended):
      - English (`en`) — English
      - Español (`es`) — Español
      - Português (`pt`) — Português
      - Deutsch (`de`) — Deutsch
      - Italiano (`it`) — Italiano
      - Français (`fr`) — Français
      - Русский (`ru`) — Русский
      - Indonesian (`id`) — Bahasa Indonesia
      - Melayu (`ms`) — Melayu
      - हिन्दी (`hi`) — हिन्दी
      - 한국어 (`ko`) — 한국어
   - Provide placeholder locale JSON files for each code above under `src/i18n/locales/` and wire them into `src/i18n/index.ts`. Files may contain English fallback strings and TODO markers for missing translations.
   - Add `topics` translation keys for each locale (topic titles and premium modal text). If full translations are not available, include English fallback values and add a TODO comment in the locale files.
   - Ensure selection persists via AsyncStorage and updates `i18next` using `setI18nLanguage`.
   - Estimate: 30–45m

6. Wire App entry
   - Initialize navigation in `App.tsx` and route to `Home`
   - Estimate: 10–20m

7. Developer docs
   - Update `docs/HOME_PAGE.md` with how to add topics and modify the tab bar
   - Estimate: 10–15m

8. Optional follow-ups
   - Collapse/More menu for overflow topics
   - Animated transitions and design polish

---

After review I can implement the scaffolding now (create screens and basic navigation). Would you like me to proceed with implementation? If yes, I will run `/opsx:apply home-page-setup` next.
