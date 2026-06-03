# Design: add-multilanguage-support

## Overview

Use a lightweight, robust i18n stack for Expo + React Native + TypeScript:

- `i18next` + `react-i18next` for translation APIs and hooks.
- `react-native-localize` to detect device locale.
- `@react-native-async-storage/async-storage` to persist user language choice.

This gives runtime switching, pluralization, interpolation, and fallbacks.

## Folder structure

- `src/i18n/` — i18n init and utilities
  - `index.ts` — initializes i18next
  - `locales/en.json`, `locales/es.json`, `locales/hi.json` — translation resources
- `src/hooks/useLanguage.ts` — helper hook to get/set language
- `src/components/LanguageSelector.tsx` — simple UI to switch languages

## Initialization (high level)

1. Detect device locale via `react-native-localize`.
2. Load translation resources (inline JSON for now).
3. Initialize `i18next` with `react-i18next` adapter, set fallbackLng to `en`.
4. If a saved language exists in `AsyncStorage`, use it instead of device locale.

## Key behaviors

- Lazy-loading: For now, load all resource JSONs at startup (small app). If app grows, switch to dynamic loading.
- Persistence: Save chosen language to `AsyncStorage` and rehydrate on startup.
- Hook: `useLanguage()` exposes `language`, `setLanguage()` and `availableLanguages`.
- Components use `useTranslation()` from `react-i18next`.

## TypeScript and strings

- Define a `TranslationKeys` type for top-level translation namespaces if desired; however, start with untyped keys to keep iteration fast. Document migration path in `design.md`.

## Accessibility & UX

- `LanguageSelector` uses large touch targets and accessible labels per project UI rules.
- Ensure RTL languages are supported by checking `I18nManager` when adding RTL locales later.

## Developer workflow

- Add strings to `src/i18n/locales/en.json` as canonical source.
- Copy keys into other locale files and translate values.
- Provide a short script or instructions to extract strings later (not implemented in this change).
