# 0007: Most Cutscenes Are Animatics; Seven Video Clips Remain

Refines ADR-0006, which assumed every cutscene would be generated video.

Producing CS-00 as video took a full day for about 65 seconds: eleven clips, repeated regeneration of multi-person shots, then editing and re-voicing. Scaling that to the remaining fourteen cutscenes would mean roughly 39 more clips and four to five more days, with the hardest shot types (two people talking, several people in frame, legible documents) concentrated in scenes that matter least. Each cutscene now uses one of three formats:

- **Video** — only seven clips, all single-subject shots of the kind CS-00 proved feasible: CS-07's closing line, CS-09, CS-13's closing line, CS-14, and optionally CS-10, CS-11, CS-12. Each clip's start frame is also its fallback still, so an optional clip can ship as a still and be upgraded later.
- **Animatic** — photoreal stills shown with a slow game-side push or pan, crossfades, and the script's subtitles.
- **Dialogue scene** — CS-01, CS-04, and CS-08 open on one still, then play their lines through the same Portrait Card and dialogue components used in gameplay.

Spoken on-camera lines drop from ten to five: three in CS-00, one each in CS-07 and CS-13. All other lines are subtitles or interface dialogue. Any writing a player must read (memorials, letters, registers, seals, the book cover) is overlaid by the game on paper generated as illegible.

## Considered Options

- **All video.** Rejected: about four to five more production days, with quality falling where generation is least reliable.
- **All stills, including CS-00.** Rejected: CS-00 already exists, and the climactic single-subject moments benefit most from motion.

## Consequences

- Shot lists live in `docs/art/storyboards/cs-01-14.zh-TW.md`; the style guide's cutscene table records each slot's format.
- CS-07 and CS-13 mix stills and a video clip. The cutscene player must either play a sequence of stills and video, or receive one file assembled offline (for example with ffmpeg).
- Animatic stills are 2560×1440 and live under `public/adventure/animatics/cs-XX/`; video clips stay under `public/adventure/cutscenes/`.
