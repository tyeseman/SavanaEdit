# SavanaEdit Architecture Audit

## History reviewed

The repository contains four development milestones: the Step 1–4 foundation, Step 5 Remotion/creative integration, bundled media-engine hardening, and the first core timeline/playback repair. The initial commit established most systems at once in highly compressed files. Step 5 made the timeline authoritative for export but also made Remotion Player the interactive program monitor. Later work fixed packaging and obvious interaction defects without changing the underlying transport model.

## What works and should remain

- Secure Electron boundary with context isolation and narrow IPC.
- Direct FFmpeg/FFprobe execution, bundled binaries, media repair, proxy generation, thumbnails, waveform, silence, and scene analysis.
- Atomic project writes and media-reference project files.
- Validated AI plan schema and source-range validation.
- Timeline-to-Remotion adapter and output validation for deterministic export.
- Registry IDs for renderer-backed creative operations.

## Broken foundations and root causes

- Playback time lives inside `TimelineModel`; every playback tick mutates the structural store, triggers autosave subscriptions, and invalidates composition-dependent React trees.
- Remotion Player is used as the interactive program transport. It is appropriate for deterministic composition but expensive for continuous editing playback and source switching.
- Tracks are a fixed `V2/V1/A1` array with a two-value type, preventing a professional layered model.
- Timeline operations mix UI snapping, data mutation, linked-media behavior, and validation inside one Zustand module. Several errors were swallowed by the UI.
- Time is stored primarily as floating-point seconds. Frame utilities exist but are not the authoritative edit representation.
- Creative overlays/titles are separate arrays rather than normal timeline clips, so they cannot share trimming, selection, and track behavior.
- AI can produce a valid plan that is semantically unsupported when analysis lacks transcripts. Recent guarding improves this but revision/patch workflows remain incomplete.
- Unit tests cover planners, export validation, and FFmpeg, but not interactive acceptance workflows.

## Systems to replace

1. Structural playhead with a dedicated transport store.
2. Remotion-based interactive program playback with a timeline resolver and HTML media/proxy monitor.
3. Fixed tracks with dynamic typed tracks and explicit track operations.
4. Ad-hoc clip mutation with tested frame-safe edit commands/transactions.

## Technical debt

Compressed one-line components impede review; some documentation contains encoding damage; source/program audio mixing is incomplete; proxy policy is codec-only; diagnostics lack subsystem context; the renderer bundle is eagerly loaded; creative items are not unified timeline objects.

## Migration strategy

Preserve project compatibility while introducing transport and typed-track fields additively. Migrate legacy projects on hydration. Move interactive preview first, then edit commands and dynamic tracks, then audio, AI patches, creative timeline objects, and export migration. Keep Remotion export working throughout.
