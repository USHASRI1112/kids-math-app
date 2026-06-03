# Tasks: add-multilanguage-support

1. [x] Install dependencies
   - `i18next`, `react-i18next`, `react-native-localize`, `@react-native-async-storage/async-storage`
   - Estimate: 10–15m

2. [x] Create i18n scaffold
   - Add `src/i18n/index.ts` to initialize i18next and load locales
   - Add `src/i18n/locales/en.json`, `es.json`, `hi.json` with sample keys
   - Estimate: 20–30m

3. [x] Add `useLanguage` hook and `LanguageSelector` component
   - Hook persists selection and exposes API
   - Component UI follows kid-friendly rules
   - Estimate: 30–45m

4. [x] Initialize i18n in `App.tsx`
   - Import initializer and ensure app waits for rehydration before rendering (or shows simple splash)
   - Estimate: 15–25m

5. [x] Add developer docs
   - Update README or add `docs/TRANSLATIONS.md` with how to add strings and languages
   - Estimate: 10–20m
