# Translations — Developer Notes

1. Canonical source: `src/i18n/locales/en.json` is the source of truth for new keys.
2. Add new keys to `en.json`, then add translated values to other locale files (`es.json`, `hi.json`).
3. Keep keys stable; avoid changing keys that are already in use.
4. To persist a user's language choice, the app uses `AsyncStorage` under the key `app-language`.
5. To add a new language:
   - add `src/i18n/locales/<lang>.json`
   - add the language code to `src/i18n/index.ts` `resources` and `availableLanguages`
   - add translations for all keys used in the UI

Run `npm install` (or `yarn`) after adding dependencies.
