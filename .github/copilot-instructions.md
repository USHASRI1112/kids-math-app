# Kids Math App Rules

## Tech Stack
- Expo
- React Native
- TypeScript

## Architecture
- Use functional components only.
- Use TypeScript strict mode.
- Keep screens under src/screens.
- Keep reusable UI under src/components.
- No inline styles except prototypes.
- Prefer composition over inheritance.

## UI Rules
- Kid-friendly design.
- Large touch targets.
- Bright colors.
- Accessible fonts.

## Code Rules
- No any types.
- Always define interfaces.
- Add JSDoc for exported functions.
- Keep components under 200 lines.

## Testing
- Test cases are not required

## Internationalization (i18n)
- Use `react-i18next` for all user-facing strings. Keep translations under `src/i18n/locales/{code}.json`.
- Use a `topics` namespace for Home screen topic titles and related modal text.
- Provide at least `en`, `es`, and `hi` translations; include placeholder locale files for other supported languages and mark TODOs for missing translations.
- Persist the selected language using `@react-native-async-storage/async-storage` and expose a helper `setI18nLanguage(lng: string)` to change language programmatically.
- Language selector UI:
	- Render a single selected-language icon in the Top Bar (flag emoji or short label). Tapping opens an accessible menu or bottom sheet listing all available languages.
	- Show a checkmark or highlighted state next to the currently selected language in the menu.
	- Menu must be keyboard accessible on web and have appropriate accessibility labels.
- When adding new screens or components, always use `useTranslation()` and translation keys rather than hard-coded strings.