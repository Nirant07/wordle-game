# Wordle Game V1

A minimalistic, browser-based **Wordle-style word guessing game** built
with plain HTML, CSS, and JavaScript.

The project was created as a personal game for casual use,
experimentation, and leisure. It focuses on a clean one-screen
interface, simple controls, a curated everyday-word database, hints,
scoring, and a continuous run system.

**Live Demo:** https://nirant07.github.io/wordle-game/

------------------------------------------------------------------------

## Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [How the Game Works](#how-the-game-works)
-   [Guess Evaluation](#guess-evaluation)
-   [Keyboard Behavior](#keyboard-behavior)
-   [Hints](#hints)
-   [Scoring System](#scoring-system)
-   [Continuous Score Run](#continuous-score-run)
-   [Game Over and Restart](#game-over-and-restart)
-   [User Interface](#user-interface)
-   [Light and Dark Mode](#light-and-dark-mode)
-   [Word Database](#word-database)
-   [Project Structure](#project-structure)
-   [Technology Stack](#technology-stack)
-   [Running the Game Locally](#running-the-game-locally)
-   [GitHub Pages Deployment](#github-pages-deployment)
-   [Design Goals](#design-goals)
-   [Implementation Notes](#implementation-notes)
-   [Accessibility and Usability](#accessibility-and-usability)
-   [Known Limitations](#known-limitations)
-   [Possible Future Improvements](#possible-future-improvements)
-   [Version](#version)
-   [License](#license)

------------------------------------------------------------------------

## Overview

Wordle Game V1 is a lightweight implementation of the familiar
five-letter word guessing format.

The player has **six attempts** to discover a hidden five-letter word.
After each submitted guess, every letter is evaluated and displayed
using a simple color-based system:

-   **Green** --- the letter is correct and is in the correct position.
-   **Yellow** --- the letter exists in the answer but is in the wrong
    position.
-   **Gray** --- the letter does not occur in the answer.

The game is intentionally designed to stay on a single screen so that
the complete playing experience is available without needing to zoom out
or navigate through multiple pages.

Unlike a traditional one-game-per-day implementation, this version is
designed for continuous personal play. Once a word is solved, the player
can move directly to another word while carrying the accumulated score
forward.

------------------------------------------------------------------------

## Features

### Core gameplay

-   Five-letter hidden words
-   Six attempts per word
-   Letter-by-letter guess evaluation
-   Green / yellow / gray feedback
-   Duplicate-letter-aware evaluation
-   New word functionality
-   Continuous play across multiple words

### Input

-   Fully functional on-screen keyboard
-   Physical keyboard support
-   Mouse/touch-friendly buttons
-   `Enter` to submit a guess
-   `Backspace` to remove the last letter
-   Alphabetic keyboard input

### Smart keyboard behavior

Once a letter has been confirmed to be absent from the answer, that
letter becomes gray on the keyboard and is no longer accepted as input.

For example, if `S` has been confirmed gray:

-   Clicking the on-screen `S` key does not add `S` to the guess.
-   Pressing the physical `S` key does not add `S` to the guess.
-   A small message can inform the player that the letter is not part of
    the word.
-   No disruptive popup is displayed.

This keeps the interface helpful without interrupting the game.

### Persistent discovered information

Known information is carried visually into subsequent rows.

For example, if a previous guess establishes that a letter is green in a
particular position, that information can remain visible on the next
attempt.

However, these carried-over letters are **not locked**.

The player can still type another letter in that position when testing a
different word.

This is intentional: the game provides information without forcing the
player's strategy.

### Hints

-   Dedicated Hint button
-   Hints reveal useful information about the answer
-   Previously discovered green positions are not unnecessarily repeated
-   Yellow information can be used to help reveal a letter's correct
    position
-   Hint usage affects the score

### Scoring

The game includes a running score.

Faster solutions earn more points, while using hints reduces the score
for that word.

### Run system

-   Solve multiple words continuously.
-   Each solved word adds to the total score.
-   The number of solved words is tracked during the run.
-   Failing a word ends the current run.
-   Giving up also ends the current run.
-   The completed run score is shown before starting again.
-   Starting a new round resets the score to zero.

### Appearance

-   Minimalistic interface
-   Light mode
-   Dark / night mode
-   Theme preference saved locally in the browser
-   Responsive layout
-   Designed to fit the game on one screen

### Help

A built-in Help dialog explains:

-   The objective
-   Green letters
-   Yellow letters
-   Gray letters
-   Hint behavior
-   The continuous score system

------------------------------------------------------------------------

## How the Game Works

The game selects a random five-letter word from the project's answer
database.

The player enters a five-letter guess.

After pressing `Enter`, the game evaluates each letter against the
answer.

### Example

Suppose the hidden answer is:

``` text
AUDIO
```

If the player enters:

``` text
RADIO
```

the game evaluates the letters individually.

The exact result depends on the positions and letter matches, but the
player can use the resulting colors to narrow down the answer.

The process continues until:

1.  The player correctly guesses the word, or
2.  All six attempts are used.

------------------------------------------------------------------------

## Guess Evaluation

Each submitted guess is evaluated in a way that accounts for repeated
letters.

The evaluation uses three states:

  State    Meaning
  -------- ----------------------------------------
  Green    Correct letter in the correct position
  Yellow   Correct letter in the wrong position
  Gray     Letter is not available in the answer

### Green

A green tile means both pieces of information are known:

-   The letter is in the answer.
-   The letter belongs in that exact position.

### Yellow

A yellow tile means:

-   The letter exists somewhere in the answer.
-   The current position is incorrect.

The player can use this information to test different positions on later
attempts.

### Gray

A gray tile means the letter has been determined to be absent from the
answer.

Once a letter is confirmed absent, the on-screen keyboard reflects that
information and the input system prevents the player from entering it
again.

This avoids wasting attempts on letters that have already been ruled
out.

------------------------------------------------------------------------

## Keyboard Behavior

The game supports both an on-screen keyboard and a physical keyboard.

### On-screen keyboard

The keyboard is displayed below the game board and can be operated with
the mouse.

It contains the standard QWERTY layout along with:

-   Enter
-   Backspace

### Physical keyboard

The same controls can be used directly from a physical keyboard.

Supported actions include:

``` text
A-Z       Enter a letter
Enter     Submit the current guess
Backspace Remove the last letter
```

### Confirmed absent letters

The keyboard tracks the strongest known state for each letter.

A letter can progress from:

``` text
unknown → absent
unknown → present
unknown → correct
```

and stronger information is preserved.

For example, a letter that has already been confirmed green should not
be downgraded to yellow or gray by a later guess.

------------------------------------------------------------------------

## Hints

Hints are designed to provide assistance without completely removing the
challenge.

The hint system keeps track of positions that have already been
discovered as green and avoids simply repeating that same information.

### Green information

If a player already knows:

``` text
_ _ _ I O
```

with `I` and `O` confirmed in their correct positions, the hint system
does not waste a hint by telling the player those same green positions
again.

### Yellow information

If a player knows that a particular letter exists but is currently in
the wrong position, the hint system can use that information to provide
a more useful positional clue.

### Hint scoring

Every hint used during a word reduces that word's score.

This creates a trade-off:

> Use a hint to make the word easier, but accept a lower score.

------------------------------------------------------------------------

## Scoring System

Each word has a base score determined by how quickly it is solved.

    Attempt   Base Score
  --------- ------------
        1st          600
        2nd          500
        3rd          400
        4th          300
        5th          200
        6th          100

Every hint costs:

``` text
100 points
```

The word score is calculated from the available attempt bonus and the
number of hints used.

The minimum successful word score is:

``` text
100
```

### Examples

Solving on the first attempt without hints:

``` text
600 points
```

Solving on the third attempt without hints:

``` text
400 points
```

Solving on the fifth attempt with one hint:

``` text
100 points
```

The exact score is calculated by the game rather than being manually
entered.

------------------------------------------------------------------------

## Continuous Score Run

The game is built around the idea of a continuous run.

After solving a word, the player is shown a result dialog containing:

-   The solved word
-   The score earned for that word
-   The updated total score

The player can then choose **Next word**.

The next word starts with:

-   A fresh six-row board
-   A fresh answer
-   Fresh hint tracking
-   Fresh keyboard state

But the running score remains.

### Example run

``` text
Word 1 → 500 points
Word 2 → 400 points
Word 3 → 600 points
Word 4 → 300 points
```

Total:

``` text
1800 points
```

The player can continue building the score for as long as they keep
solving words.

------------------------------------------------------------------------

## Game Over and Restart

A run ends when the player:

-   Uses all six attempts without finding the answer, or
-   Presses **Give up**

The game-over dialog shows:

``` text
GAME OVER

The word was XXXXX.

Words solved: N
Score: N
```

The completed run score is preserved for display in the dialog, but the
next round starts from:

``` text
Score: 0
```

The player can then choose **Play again** to begin a fresh run.

The game intentionally does not display redundant "score before ending"
and "final score after reset" values. The player sees the score that was
actually achieved during the completed run.

------------------------------------------------------------------------

## Give Up

The **Give up** button provides a way to end the current word
immediately.

Giving up:

-   Ends the current run
-   Shows the answer
-   Shows the number of words solved
-   Shows the completed run score
-   Resets the score for the next round

Giving up is therefore treated as a run-ending action rather than simply
skipping one word while keeping the score.

------------------------------------------------------------------------

## User Interface

The interface is intentionally compact.

The main screen contains:

``` text
┌─────────────────────────────────┐
│ ?          WORDLE       ☾   ↻ │
├─────────────────────────────────┤
│ SCORE                       0  │
├─────────────────────────────────┤
│                                 │
│          GAME BOARD             │
│                                 │
├─────────────────────────────────┤
│          MESSAGE                │
├─────────────────────────────────┤
│       💡 Hint   Give up         │
├─────────────────────────────────┤
│       ON-SCREEN KEYBOARD        │
├─────────────────────────────────┤
│        5 letters · 6 tries     │
└─────────────────────────────────┘
```

The layout is designed around the actual playing area rather than a
large landing page.

There are no unnecessary sections competing with the game itself.

------------------------------------------------------------------------

## Light and Dark Mode

The game supports two visual themes:

-   Light mode
-   Dark mode

The theme can be switched using the button in the top-right corner.

The selected theme is stored in browser `localStorage`, allowing the
preference to persist when the page is opened again in the same browser.

The dark theme adjusts:

-   Page background
-   Text
-   Borders
-   Keyboard keys
-   Board tiles
-   Modal backgrounds
-   Feedback colors

The goal is to keep the same visual hierarchy in both themes rather than
simply changing the page background.

------------------------------------------------------------------------

## Word Database

The game uses a local JSON file containing a curated collection of:

``` text
1,300 five-letter answer words
```

The database is stored at:

``` text
data/words.json
```

The list was intentionally curated around recognizable, everyday English
words rather than attempting to include every obscure five-letter
dictionary or Scrabble entry.

This is an important design decision for this project.

A huge dictionary may technically provide more possible answers, but
obscure words can make a casual Wordle-style game frustrating. The
purpose of this database is to keep the answer pool practical and
recognizable.

### Database format

The game loads the data from:

``` text
./data/words.json
```

Because the browser fetches this JSON file, the game should be served
through HTTP rather than opened directly using `file://`.

------------------------------------------------------------------------

## Project Structure

``` text
wordle-game/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
└── data/
    └── words.json
```

### `index.html`

Contains the structure of the application, including:

-   Header
-   Game title
-   Theme button
-   New word button
-   Score display
-   Board
-   Message area
-   Hint button
-   Give Up button
-   On-screen keyboard
-   Help dialog
-   Score/result dialog
-   Footer

### `style.css`

Contains all visual styling, including:

-   Layout
-   Board styling
-   Tile states
-   Keyboard styling
-   Buttons
-   Modals
-   Light theme
-   Dark theme
-   Responsive behavior
-   One-screen layout

### `script.js`

Contains the game's logic, including:

-   Loading the word database
-   Selecting random answers
-   Creating the board
-   Creating the keyboard
-   Reading physical keyboard input
-   Processing guesses
-   Evaluating letters
-   Tracking keyboard states
-   Handling hints
-   Calculating scores
-   Managing continuous runs
-   Managing game-over states
-   Managing theme preferences

### `data/words.json`

Contains the curated 1,300-word answer database used by the game.

------------------------------------------------------------------------

## Technology Stack

The project intentionally uses a very small technology stack.

### HTML

Used for the application structure and accessible UI elements.

### CSS

Used for:

-   Layout
-   Responsive design
-   Light/dark themes
-   Animations
-   Board and keyboard styling

### JavaScript

Used for the complete game engine and interaction logic.

### JSON

Used as the local answer database.

### No framework

The project does not depend on:

-   React
-   Vue
-   Angular
-   Node.js packages
-   A build system
-   A bundler
-   A backend server

This keeps the project easy to understand, run, modify, and deploy.

------------------------------------------------------------------------

## Running the Game Locally

Because the game loads `data/words.json` using JavaScript, it should be
run through a local web server.

### Requirements

You only need:

-   A modern web browser
-   Python 3, or another simple local HTTP server

### Step 1 --- Open a terminal

Navigate to the project directory.

Windows example:

``` cmd
cd /d path\to\wordle-game
```

### Step 2 --- Start a local server

Run:

``` cmd
python -m http.server 8000
```

### Step 3 --- Open the game

Visit:

``` text
http://localhost:8000
```

### Why not double-click `index.html`?

Opening the file directly can result in browser restrictions around
loading the JSON database.

The game expects:

``` text
index.html
    ↓
script.js
    ↓
data/words.json
```

Serving the project through HTTP ensures that this request works
correctly.

------------------------------------------------------------------------

## GitHub Pages Deployment

The project is designed to work as a static GitHub Pages website.

The repository uses:

``` text
main
```

as its primary branch, with the project files located at the repository
root.

GitHub Pages can therefore serve:

``` text
index.html
```

directly.

### Repository

Repository:

``` text
https://github.com/Nirant07/wordle-game
```

### Live website

The deployed game is available at:

``` text
https://nirant07.github.io/wordle-game/
```

### Deployment model

There is no build step.

GitHub Pages simply serves the static project files:

``` text
HTML
CSS
JavaScript
JSON
```

This makes deployment straightforward and keeps the hosting requirements
minimal.

------------------------------------------------------------------------

## Design Goals

The project was built around a few specific principles.

### 1. Keep the game simple

The player should immediately understand what to do.

The primary interaction is always:

``` text
Think → Type → Submit → Learn → Try again
```

### 2. Keep everything on one screen

The board, keyboard, controls, score, and feedback should be visible
together.

The player should not need to zoom out to play comfortably.

### 3. Provide useful information without forcing strategy

Known green letters can remain visible in future rows, but the player is
still allowed to overwrite them.

This means the game can help the player remember information without
dictating the next guess.

### 4. Reduce unnecessary frustration

Once a letter has been confirmed absent, the game prevents that letter
from being entered again.

This avoids accidental repetition while keeping the behavior quiet and
unobtrusive.

### 5. Make hints useful

Hints should provide information that helps the player make progress
rather than repeatedly revealing information they already know.

### 6. Reward better solving

The scoring system encourages solving words in fewer attempts and
avoiding unnecessary hints.

### 7. Keep the code lightweight

There is no need for a backend, database server, framework, or package
manager for this project.

The game can remain a small collection of static files.

------------------------------------------------------------------------

## Implementation Notes

### Random word selection

A word is selected from the loaded JSON array when a new word is
started.

The selected answer is stored in the game state until the word is
completed or the run ends.

### Board state

The game maintains:

-   Current row
-   Current guess
-   Answer
-   Keyboard states
-   Hint positions
-   Number of hints used
-   Total score
-   Number of words solved
-   Game-over state

### Keyboard state priority

Keyboard feedback uses the strongest available information.

Conceptually:

``` text
Correct > Present > Absent
```

This prevents a later weaker result from visually overriding stronger
information already established by the player.

### Duplicate letters

Guess evaluation is performed in stages so that duplicate letters are
not blindly treated as present when the answer does not contain enough
copies of that letter.

This makes the feedback more consistent with the intended Wordle-style
behavior.

### Theme persistence

The selected theme is stored locally using:

``` text
localStorage
```

The preference is stored under a project-specific key so that the
browser can restore the selected theme on a later visit.

------------------------------------------------------------------------

## Accessibility and Usability

The project includes several small usability considerations.

### Keyboard and mouse input

Players can choose whichever input method is more comfortable:

-   Physical keyboard
-   On-screen keyboard
-   Mouse

### Enter and Backspace

Common keyboard controls are supported directly.

### Live messages

The game has a message area used for small pieces of feedback, such as
invalid or unavailable input.

This avoids using disruptive dialogs for routine interactions.

### Modal dialogs

Dialogs are reserved for larger state changes such as:

-   Help
-   Successful completion
-   Game over

Routine keyboard feedback does not use modal dialogs.

### Responsive layout

The interface uses a responsive layout so that it can adapt to different
viewport sizes while maintaining the core one-screen experience.

------------------------------------------------------------------------

## Known Limitations

This is intentionally a small personal project, so it does not attempt
to implement every feature found in larger commercial or public
Wordle-style games.

Current limitations include:

-   No account system
-   No server-side score storage
-   No online multiplayer
-   No daily synchronized puzzle
-   No cloud-based statistics
-   No leaderboard
-   No backend
-   No user profiles
-   No external database
-   No analytics system
-   No extensive SEO configuration

These limitations are intentional rather than problems for the current
use case.

The game is primarily intended for personal casual use.

------------------------------------------------------------------------

## Possible Future Improvements

Future versions may add improvements if they become useful during
continued play.

Potential ideas include:

### Gameplay

-   Better hint presentation
-   More detailed statistics
-   Personal best score
-   Longest successful run
-   Average attempts per word
-   Best single-word score
-   Optional difficulty levels
-   Additional word categories

### User experience

-   More refined animations
-   Improved mobile layout
-   Better touch interactions
-   Additional keyboard feedback
-   Optional sound effects
-   Optional vibration feedback on supported devices

### Data

-   Expanded curated answer database
-   Separate guess dictionary
-   Difficulty metadata
-   Word frequency information
-   Custom personal word lists

### Persistence

-   Saving current run locally
-   Saving personal statistics
-   Restoring an unfinished game
-   Historical score tracking

These are possibilities rather than commitments for V1.

------------------------------------------------------------------------

## Version

Current version:

``` text
Wordle V1
```

V1 establishes the core game loop:

``` text
Choose word
    ↓
Make up to 6 guesses
    ↓
Evaluate letters
    ↓
Use hints when needed
    ↓
Score the result
    ↓
Continue the run
    ↓
Game over → reset run
```

The project can use this version as the baseline for future iterations.

------------------------------------------------------------------------

## License

No license has been added to this repository.

This project is currently maintained as a personal project for private
enjoyment and experimentation.

If the project is later intended for broader reuse or redistribution, an
appropriate open-source license can be added at that time.

------------------------------------------------------------------------

## Project Status

**Wordle V1 is complete and deployed with GitHub Pages.**

The project is intentionally kept small, dependency-free, and easy to
modify.

### Live

**Game:**\
https://nirant07.github.io/wordle-game/

**Repository:**\
https://github.com/Nirant07/wordle-game

------------------------------------------------------------------------

## Final Notes

This project is less about building a large production platform and more
about creating a polished, enjoyable personal game.

The implementation deliberately favors:

-   simplicity over unnecessary infrastructure,
-   recognizable words over obscure dictionary entries,
-   useful assistance over intrusive messages,
-   continuous play over a once-a-day format,
-   and a clean interface over unnecessary visual complexity.

The result is a compact Wordle-style game that can be opened locally or
played directly from GitHub Pages.
