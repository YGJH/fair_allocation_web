# 0006: Photoreal Stills and 2D UI Replace the Three.js Dioramas

Supersedes the "3D Point & Click" presentation in the spec and the Three.js viewport decision it carried from the first edition.

Cutscenes are generated as photorealistic video (Google Flow: Veo 3.1 / Omni 1.1). Cutting from that footage to stylised Three.js dioramas would break the look, and would require a second set of 3D characters and props that can never match the generated actors. Gameplay therefore uses the same photoreal imagery: a still Scene Plate per act, Portrait Cards for the people, and a plain 2D interface on top. This is the interactive-film layout of *盛世天下：女王的權力遊戲*, with a sparer interface.

Decided together:

- **16:9 landscape, desktop first.** All video, plates, and portraits are produced at this ratio.
- **Restrained realism.** Historical-drama look: natural light, low saturation, Ming-accurate dress. The interface uses paper, ink, and vermilion rather than ornate gilded frames.
- **Narration-led cutscenes.** The elder Cheng Heng narrates; only a short list of key lines is spoken on camera. Subtitles are rendered by the game, never burned into video.
- **One fixed description per character.** Each character has a Flow Character plus a canonical English description pasted verbatim into every generation, because reference images alone do not prevent drift.

## Considered Options

- **Keep the 3D dioramas for gameplay.** Rejected: visible style break, and double the art production.
- **3D only for the Allocation Workbench.** Rejected: still two art pipelines for a small tactile gain.
- **Fully voiced on-camera dialogue.** Rejected: Mandarin lip-sync is unreliable in short generated clips and long lines do not fit an 8–10 second unit.

## Consequences

- Investigation becomes clicking Portrait Cards and a few marked spots on the Scene Plate; party reactions are portrait expression swaps rather than animation.
- `src/three/`, the scene canvas components, and the `three` dependency become removable when the campaign is reworked.
- Visual rules live in `docs/art/style-guide.zh-TW.md`; character definitions live in `docs/art/characters.zh-TW.md`.
