# Safe Cracker

A small deduction puzzle game about cracking safes with clue-keys instead of guessing.

The player sees a safe, a 1–10 dial, three labeled code slots, and a Key Computer Module. Each key is a clue that connects directly to one or more code slots. Under the hood, each clue is a Boolean test that filters possible codes.

## v0.1 foundation

- 3-number safe code
- slots labeled A, B, and C
- 1–10 dial
- no repeated numbers
- clue keys shown in a computer module
- active safe title shown above the dial so the player can track the current puzzle
- puzzle validation checks every possible code
- a safe is considered fair only when the clues produce exactly one solution

## Core design rule

Safe Cracker is not a guessing game. It is a deduction game wearing a brass jacket.

Every clue must be:

1. readable by the player
2. visibly connected to the safe mechanism
3. testable by the engine
4. usable by the validator to prove the puzzle has one fair solution

Flavor names are allowed later, but v0.1 uses functional key names so the player can immediately understand what each key does.

## Puzzle set

The prototype currently includes five validated safes: four training safes and one expert safe. The New Safe button cycles through the bank, and the active safe label confirms which puzzle is loaded.

## First puzzle

The first prototype safe uses four connected clue keys:

- SUM KEY: `A + C = 11`
- SCALE KEY: `B = A × 2`
- OFFSET KEY: `C = B − 1`
- PARITY KEY: exactly one of A, B, and C is odd

The game engine validates the clue set before the player starts.

## Files

```text
safe-cracker/
├─ index.html
├─ style.css
├─ visual.css
├─ script.js
├─ auto-advance.js
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
