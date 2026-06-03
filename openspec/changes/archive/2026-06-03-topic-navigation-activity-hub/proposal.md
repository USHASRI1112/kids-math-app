## Why

The Home screen currently presents topic cards, but selecting a topic does not take the user into a dedicated learning hub. Adding a topic activity hub creates the next step in the learning flow and gives each topic a clear place for learn, practice, quiz, timer, test, and play entry points.

## What Changes

- Add navigation from each Home topic card to a dedicated Topic Activity Screen.
- Introduce a Topic Activity Screen that displays the selected topic name in the top app bar with back navigation.
- Add a responsive 2-column activity grid for the topic hub with six actions: Learn, Practice, Quiz, Timer, Test, and Play.
- Add placeholder destination screens for each activity action under each topic.
- Use vector icons for activity cards and avoid emoji-based iconography.
- Keep the activity area configurable for future learning content, assessments, and game experiences.

## Capabilities

### New Capabilities
- `topic-navigation-activity-hub`: topic-to-hub navigation, activity grid, and placeholder activity screens for learning flows.

### Modified Capabilities
- None.

## Impact

- Affects Home screen navigation and topic card interactions.
- Introduces new topic activity and activity destination screens.
- Requires navigation dependencies, vector icon usage, and responsive layout handling.
- May add new app routes and shared screen composition patterns for future learning content.
