## Context

The app currently shows topic cards on the Home screen, but topic selection stops there. This change adds a second step in the learning flow: a topic-specific activity hub with a consistent top bar, a two-column activity grid, and placeholder destinations for future learning content.

The change affects navigation, screen composition, and icon-driven interactions. It also needs to fit the existing Expo + React Native + TypeScript setup and preserve the app's kid-friendly UI patterns.

## Goals / Non-Goals

**Goals:**
- Navigate from each Home topic card to a topic-specific activity hub.
- Present a reusable Topic Activity Screen with back navigation and a selected-topic title.
- Render a responsive two-column activity grid with exactly six actions.
- Use vector icons for all activity cards and avoid emoji-based iconography.
- Provide placeholder screens for each activity destination so the flow is navigable end-to-end.
- Keep the layout adaptable for phones and tablets.

**Non-Goals:**
- Building real lessons, quizzes, games, or timers.
- Designing the final visual identity of activity content.
- Persisting user progress or analytics.
- Adding backend data fetches or dynamic curriculum loading.

## Decisions

- **Use a stack navigator for topic flow**
  - Rationale: A stack route fits the "Home -> Topic Hub -> Activity Detail" flow, provides built-in back navigation, and keeps the route model simple.
  - Alternatives considered: Local state-based view switching would be lighter, but it makes deep linking, back behavior, and future expansion harder.

- **Model topic and activity as route params**
  - Rationale: A single topic hub screen plus reusable activity detail route can represent Addition, Subtraction, Multiplication, and Division without creating unrelated screen logic.
  - Alternatives considered: Separate screen files per topic/activity combination would be explicit, but it scales poorly and creates repetitive code.

- **Use a shared activity configuration map**
  - Rationale: The six cards (Learn, Practice, Quiz, Timer, Test, Play) are fixed for Phase 1 and should come from a single config object so icon choice, titles, and destinations stay consistent.
  - Alternatives considered: Hard-coding each card directly in the screen would be simpler initially, but harder to maintain when adding future topics or rearranging actions.

- **Keep destination screens as placeholder content**
  - Rationale: The first phase needs navigable endpoints, not feature-complete content. A shared placeholder layout reduces implementation cost while leaving room for future content modules.
  - Alternatives considered: Reusing the Topic Hub screen for all destinations would be faster, but it would blur the distinction between hub and activity detail.

- **Use Expo-compatible vector icons only**
  - Rationale: The UI already relies on iconography and the spec forbids emoji icons. A standard icon library keeps rendering consistent across mobile and web.
  - Alternatives considered: Emoji icons are faster to prototype, but they violate the requirement and do not scale as well visually.

## Risks / Trade-offs

- [Route growth] → Mitigate by centralizing topic/activity route generation from one config map instead of hand-writing every screen.
- [Responsive layout inconsistencies] → Mitigate by using card sizing rules based on available width and validating both phone and tablet breakpoints.
- [Icon library mismatch] → Mitigate by choosing a vector icon set already supported by Expo and mapping each activity to an approved icon name.
- [Placeholder sprawl] → Mitigate by using a reusable placeholder destination component with route params instead of unique one-off screen implementations.
- [Navigation setup complexity] → Mitigate by introducing the navigator in one place at the app root and keeping Home/topic screens isolated from navigation plumbing.
