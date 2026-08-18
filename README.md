# SavanaEdit

SavanaEdit is a local-first desktop video editor built with Electron, React, TypeScript, Vite, Zustand, FFmpeg, and FFprobe. It is under active development and is not yet production-ready.

## Current status

The editing foundation through Step 4 is implemented: media ingestion and compatibility proxies, media intelligence, transcript and silence analysis, AI-assisted rough-cut planning, a multi-track editable timeline, cached audio waveforms, project persistence, and desktop editing menus. Final export/rendering and the advanced creative layer are intentionally not included yet.

## Features

- Imports individual files or recursively scans folders, including MOV/MP4/M4V, HEVC/H.265, common iPhone formats, and many professional or legacy containers.
- Uses system-installed FFmpeg/FFprobe directly through Electron `child_process.execFile`; no FFmpeg wrapper is used.
- Creates cached H.264/AAC compatibility proxies and attempts tolerant, read-only salvage of damaged containers. Originals are never modified.
- Extracts metadata, thumbnails, scenes, audio loudness/silence ranges, compact normalized waveforms, summaries, and optional transcripts.
- Provides Source and Program preview modes, searchable media, transcript-driven insertion/deletion, and padded silence removal.
- Supports V2/V1/A1 tracks, linked A/V clips, move, trim, split, delete, ripple delete, copy/paste, snapping, zoom, undo/redo, and autosave.
- Validates edit plans and atomic timeline patches before committing changes.

## Requirements

- Windows desktop environment (the current primary development target)
- Node.js 20 or newer and npm
- FFmpeg and FFprobe on `PATH`, or configured custom executable paths

Electron's codecs cannot decode every imported format. SavanaEdit uses FFmpeg-generated previews where possible. Encrypted media, files without recoverable headers, or files with no decodable frames may still fail.

## Installation and development

```bash
npm install
npm run dev
```

Available commands:

```text
npm run dev       Start Vite and Electron in development
npm run build     Type-check and build the renderer
npm run electron  Start Electron directly
npm test          Run automated tests
```

## Configuration

Copy `.env.example` when environment-based configuration is needed. Supported variables are:

```text
SAVANAEDIT_FFMPEG_PATH
SAVANAEDIT_FFPROBE_PATH
SAVANAEDIT_OPENAI_API_KEY
```

FFmpeg paths can also be set under **Edit → Preferences**. An OpenAI key is optional, remains in the Electron main process, and is never written into project data. Without it, deterministic local rough-cut planning remains available.

## Project structure

```text
electron/          Electron main process, secure IPC, media engine, analysis, persistence
src/components/    React editor panels and controls
src/services/      Timeline validation, patches, transcript/silence helpers
src/stores/        Zustand editor, timeline, and AI edit state
src/types/         Shared renderer types
docs/              User help and keyboard shortcuts
tests/             Automated tests
```

Project files reference source media and cached analysis; they do not embed original footage. Generated caches live outside the source folders in Electron's application data location.

## Known limitations

- No final rendering/export pipeline yet; the Export control is disabled.
- Preview uses HTML media playback and can still show a short transition on difficult codecs or slow storage.
- Ripple behavior is deliberately limited to affected base/linked tracks; overlay tracks are not shifted automatically.
- Effects, transitions, advanced audio tools, color, captions, keyframes, and multicam are future work.
- Recovery of severely damaged or encrypted media is not guaranteed.
- Automated UI tests with real footage are not yet included.

## Documentation

See [SavanaEdit Help](docs/HELP.md) and [Keyboard Shortcuts](docs/SHORTCUTS.md).

## Roadmap

Step 5 can begin the creative layer—titles, basic effects, transitions, and richer audio controls—after further real-footage validation of the Step 4 editing foundation. Rendering/export, advanced effects, grading, compositing, and proxy-management workflows remain later milestones.

Repository: https://github.com/tyeseman/SavanaEdit
