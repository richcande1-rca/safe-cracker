# Safe Cracker

A small deduction puzzle game about cracking safes with clue-keys instead of guessing.

The player sees a safe, a 1–10 dial, three code slots, and a Key Computer Module. Each key is a clue. Under the hood, each clue is a Boolean test that filters possible codes.

## v0.1 foundation

- 3-number safe code
- 1–10 dial
- no repeated numbers
- clue keys shown in a computer module
- puzzle validation checks every possible code
- a safe is considered fair only when the clues produce exactly one solution

## Core design rule

Safe Cracker is not a guessing game. It is a deduction game wearing a brass jacket.

Every clue must be:

1. readable by the player
2. testable by the engine
3. usable by the validator to prove the puzzle has one fair solution

## First puzzle

The first prototype safe uses four clue keys:

- The first and third numbers add to 11.
- The middle number is double the first.
- The third number is one click lower than the middle.
- Exactly one number is odd.

The game engine validates the clue set before the player starts.

## Files

```text
safe-cracker/
├─ index.html
├─ style.css
├─ script.js
└─ README.md
```

## Next possible upgrades

- more clue types
- generated safes
- timer / alarm mode
- flashing red-blue light layer
- difficulty levels
- clue cartridges
- lying keys for advanced puzzles
