# Wordle V1

Minimal Wordle-style game using the 1,300-word JSON answer database.

## Run locally

Because the game loads `data/words.json`, open it through a local web server rather than `file://`.

For example:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000

## Included

- 1,300 five-letter answer words
- 6 guesses
- On-screen keyboard
- Physical keyboard support
- Enter / Backspace
- Green / yellow / gray evaluation
- New game button
- Help modal
- Responsive one-screen layout
