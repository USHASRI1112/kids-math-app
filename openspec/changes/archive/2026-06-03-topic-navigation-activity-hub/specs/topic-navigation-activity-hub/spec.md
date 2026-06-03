## ADDED Requirements

### Requirement: Topic cards navigate to activity hub
Selecting a topic card on the Home screen SHALL navigate to the dedicated Topic Activity Screen for that topic.

#### Scenario: Addition topic selection
- **WHEN** the user selects the Addition topic card
- **THEN** the system SHALL navigate to the Addition Topic Activity Screen

#### Scenario: Subtraction topic selection
- **WHEN** the user selects the Subtraction topic card
- **THEN** the system SHALL navigate to the Subtraction Topic Activity Screen

### Requirement: Topic activity screen top bar
The Topic Activity Screen SHALL display a top app bar with a back navigation control and the selected topic name as the title.

#### Scenario: Show topic title and back control
- **WHEN** the user opens a Topic Activity Screen
- **THEN** the system SHALL display the selected topic name in the top bar
- **AND** the system SHALL display a back navigation button

### Requirement: Topic activity grid layout
The Topic Activity Screen SHALL present a scrollable activity grid below the top bar using a two-column layout with equal-sized cards and consistent spacing.

#### Scenario: Grid renders in two columns
- **WHEN** the Topic Activity Screen is displayed on a phone or tablet
- **THEN** the system SHALL render the activity cards in two columns per row
- **AND** the system SHALL maintain equal card sizing and consistent spacing

### Requirement: Topic activity options
The Topic Activity Screen SHALL include exactly six activity options: Learn, Practice, Quiz, Timer, Test, and Play.

#### Scenario: All activity options are present
- **WHEN** the Topic Activity Screen is displayed
- **THEN** the system SHALL show cards for Learn, Practice, Quiz, Timer, Test, and Play

### Requirement: Activity cards use vector icons
Each activity card SHALL include a vector icon, a title, touch interaction, and visual press feedback. Emoji-based icons SHALL NOT be used.

#### Scenario: Activity card rendering
- **WHEN** the user views an activity card
- **THEN** the card SHALL display a vector icon and a title
- **AND** the card SHALL provide touch feedback when pressed
- **AND** the card SHALL NOT use emoji for its iconography

### Requirement: Activity cards navigate to placeholders
Selecting an activity card SHALL navigate to its corresponding destination screen for the selected topic and activity.

#### Scenario: Navigate to Learn placeholder
- **WHEN** the user selects Learn from the Addition Topic Activity Screen
- **THEN** the system SHALL navigate to an Addition - Learn screen
- **AND** the destination screen SHALL display placeholder content

#### Scenario: Navigate to Play placeholder
- **WHEN** the user selects Play from the Addition Topic Activity Screen
- **THEN** the system SHALL navigate to an Addition - Play screen
- **AND** the destination screen SHALL display placeholder content

### Requirement: Back navigation returns to Home
The back navigation control on the Topic Activity Screen SHALL return the user to the Home Screen.

#### Scenario: Return from activity hub
- **WHEN** the user taps the back button on the Topic Activity Screen
- **THEN** the system SHALL return the user to the Home Screen
