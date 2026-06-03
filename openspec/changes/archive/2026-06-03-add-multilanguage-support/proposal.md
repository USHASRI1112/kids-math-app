# Change: add-multilanguage-support

## What

Add a multi-language (i18n) setup to the Kids Math App so UI strings can be translated and the app can switch languages at runtime.

## Why

- Make the app accessible to non-English speaking kids and caregivers.
- Support localization for future markets (e.g., Spanish, Hindi).
- Centralize strings to simplify content updates and translations.

## Scope

- Add i18n library and configuration.
- Create a translations folder with baseline `en`, `es`, and `hi` translation files.
- Initialize i18n in the app entry (`App.tsx`) with fallback & persistence of selected language.
- Add a simple `LanguageSelector` component and hooks for switching languages.
- Document developer workflow for adding/maintaining translations.

## Out of scope

- Translating all existing strings (only scaffold and sample translations provided).
- Automated extraction tooling for every string — will include guidance in `design.md`.

## Acceptance criteria

- Project contains i18n config and sample translation files.
- App initializes i18n on startup without crash on Expo.
- Language can be switched in-app and persists across launches.
- Developer docs show how to add languages and update translation strings.

## Change location

openspec change directory: `openspec/changes/add-multilanguage-support`
