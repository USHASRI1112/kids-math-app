# Change: home-page-setup

## What

Create the Home Page scaffold for the Kids Math App with a tab bar and placeholders for the primary lesson areas:

1. Addition
2. Subtraction
3. Multiplication
4. Division
5. Decimal Operation
6. Fractions
7. Percentages
8. Roots

The Home Page tab bar will also include: Profile icon (static for now), Settings icon, Diamond icon for Premium (opens modal; "coming soon"), and Language selection control with the requested languages.

## Why

- Provide the main navigation surface for learners to access topics.
- Offer a single, accessible place to switch language and access profile/settings.
- Scaffold premium entry and localization so further features can be iterated on.

## Scope

- Add a `Home` screen with a bottom tab bar containing the 8 topic tabs and the utility icons.
- Add placeholder screens for each topic; each will be a simple, kid-friendly scaffold for now.
- Add a `Premium` modal placeholder and `LanguageSelector` integration to choose app language.
- Document how to add new topics, translate strings, and expand the tab bar.

- Layout: The Home screen is divided into a Top Bar (utility icons and language selector) and a main content area. The main content area displays topic cards in a two-column grid (two items per row), scrollable vertically. The first row should contain Addition and Subtraction, followed by the other topics in order.

## Out of scope

- Implementing full lesson content for each topic (only placeholders for navigation). 
- Payment or premium gating (only a modal placeholder).

## Acceptance criteria

- `Home` screen exists and is selectable from app entry.
- Tab bar shows topic tabs and utility icons; tapping a topic opens its placeholder screen.
- Language selector lists: English, Español, Português, Deutsch, Italiano, Français, pyccknn (Russian), Indonesian, Melayu, Hindi, Korean.
- `Premium` opens a modal that reads "Premium — coming soon".

## Change location

openspec change directory: `openspec/changes/home-page-setup`
