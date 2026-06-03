# Home Page Guide

This document explains the Home screen structure, topics, and how to add new topics or update the top bar.

## Layout

- Top Bar: Contains the selected-language icon, profile icon, premium diamond, and settings icon (left-to-right ordering may vary by platform). The language icon opens a language selection sheet.
- Main Content: Two-column vertically scrollable grid of `TopicCard` components. Collapses to a single column on narrow screens.

## Adding a Topic

1. Add a new translation key under `src/i18n/locales/*/topics.json` (or directly under `src/i18n/locales/<code>.json` in the `topics` namespace):

```json
"newtopic": "New Topic Title"
```

2. Add the topic to the `TOPICS` list in `src/screens/Home/index.tsx` with `key`, `emoji` and optionally an onPress handler.

3. Create a placeholder screen under `src/screens/topics/<YourTopic>.tsx` if you need a full-screen implementation.

## Language support

- Translations live in `src/i18n/locales/`.
- Use `useTranslation()` in new screens/components and reference strings via `t('topics.addition')`.
- The `LanguageSelector` shows the selected language icon in the Top Bar and opens a modal that lists all available languages.

## Developer notes

- Keep components under 200 lines.
- Use functional components and TypeScript strict mode.
- Persist language selection using `setI18nLanguage()` exported from `src/i18n`.

