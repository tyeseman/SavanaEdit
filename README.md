# SavanaEdit

SavanaEdit is a local-first Electron video editor combining non-destructive timeline editing, media intelligence, optional AI rough-cut planning, and Remotion composition rendering. It is under active development and is not production-ready.

## Current status

Steps 1–4 established ingestion, analysis, transcript and silence editing, an editable multi-track timeline, and project persistence. The current Step 5 development pass adds a real but deliberately bounded creative/rendering vertical slice: typed creative registries, Remotion Program Preview, procedural overlays, captions/titles, clip effects and transforms, audio gain/fades, background export, cancellation, progress, and parsed output validation.

This does not yet implement the entire long-term Step 5 vision. See Known limitations.

## Implemented features

- Imports common professional and phone media, including MOV, MP4, M4V, and HEVC/H.265 where FFmpeg can decode them.
- FFmpeg and FFprobe are bundled with SavanaEdit. A separate FFmpeg installation is normally not required.
- Calls the resolved FFmpeg/FFprobe executables directly from Electron with `child_process`; originals are never modified.
- Generates compatibility proxies, thumbnails, scenes, silence/loudness data, transcripts, summaries, and cached waveform peaks.
- Supports V2/V1/A1 timeline editing, linked A/V, snapping, trim, split, move, ripple delete, copy/paste, undo/redo, and autosave.
- Provides transcript-driven timeline cuts and automatic caption generation from mapped transcript segments.
- Uses the SavanaEdit timeline as the authority and translates it through an isolated Remotion composition adapter.
- Includes 18 renderer-backed transitions, 13 clip effects, 11 procedural overlays including 8 light-leak variants, 2 caption presets, and 1 title preset.
- Provides Inspector transform/effect controls and clip audio volume, gain, fade-in, fade-out, and mute controls.
- Program Preview uses the same Remotion composition component as export.
- Exports H.264 MP4, H.265 MP4, or VP9 WebM with presets and cancellable progress in the Electron main process.
- Parses finished exports to verify resolution, duration, and readable streams before reporting success.

## Requirements

- Windows is the current primary target
- Node.js 20 or newer and npm
- No separate FFmpeg installation is required; bundled executables handle ingestion and analysis
- Network access on first Remotion render if its managed browser is not cached

## Install and run

```bash
npm install
npm run dev
```

```text
npm run dev       Start Vite and Electron
npm run build     Type-check and build the renderer
npm run electron  Start Electron directly
npm test          Run automated tests
```

## Environment

Copy `.env.example` to `.env`, then add the key without quotes:

```text
SAVANAEDIT_OPENAI_API_KEY=sk-your-key-here
```

`OPENAI_API_KEY` is accepted as an alternative. Restart SavanaEdit after changing the environment. API keys stay in the Electron main process, `.env` is gitignored, and keys are never saved in projects or exposed through the renderer bridge. The OpenAI provider is optional; deterministic local rough-cut planning remains available.

`SAVANAEDIT_FFMPEG_PATH` and `SAVANAEDIT_FFPROBE_PATH` remain optional advanced overrides. Preferences overrides take priority, followed by these environment variables, bundled binaries, system `PATH`, and common OS locations.

## Architecture

```text
src/stores/                         Authoritative editor/timeline/creative state
src/rendering/registries.ts         Stable creative IDs and parameters
src/rendering/remotion/             Composition adapter, root, and renderer component
electron/services/render.cjs        Background Remotion render and output validation
electron/services/ffmpeg.cjs        Direct system FFmpeg/FFprobe media operations
electron/ipc/                       Validated renderer-to-main boundaries
docs/                               User help and shortcuts
tests/                              Planner and export validation tests
```

Project JSON stores edit references, effects, overlays, captions, titles, and format settings—not source footage or render intermediates. Generated files use application cache/temp locations or a user-selected export destination.

## Known limitations

- Asset-pack import/indexing, custom effect presets, paste-effects, and relinking UI are not implemented.
- Automatic ducking, beat detection/markers, beat-aligned AI editing, EQ, compression, limiting, filtering, and noise reduction are not implemented.
- Keyframe types and interpolation helpers exist, but the inspector does not yet provide keyframe authoring and all renderer parameters are not keyframe-driven.
- Transition browser drag-to-edit-point and animated hover thumbnails are not implemented; transitions are added to the selected clip.
- Overlay/title items do not yet have dedicated timeline lanes or full editing inspectors.
- H.265 and WebM were validated with small renders; the three full-resolution validation renders used H.264/AAC.
- Hardware encoder discovery/selection and explicit FFmpeg post-processing are not implemented; current export uses Remotion-managed software rendering.
- Manual proxy creation controls and automatic reframing/subject tracking are not implemented.
- AI planning currently creates grounded rough cuts but does not yet emit registry-backed creative operations.
- Program Preview adds significant bundle weight and should be lazily loaded in a later optimization pass.
- Real user-footage end-to-end projects were not available for interview, social, commercial, music-video, and event tests.

## Documentation

See [SavanaEdit Help](docs/HELP.md) and [Keyboard Shortcuts](docs/SHORTCUTS.md).

Repository: https://github.com/tyeseman/SavanaEdit
