# SavanaEdit Product Vision

## Mission

SavanaEdit is a professional, non-destructive desktop editor that makes user-supplied footage faster to understand and edit. It must remain a capable manual editor with AI disabled. AI accelerates search, selection, rough cuts, revisions, captions, and creative decisions; it does not replace the timeline or invent footage.

## Primary workflow

User media flows through ingestion and proxy preparation, media intelligence, optional AI understanding, validated editing decisions, a frame-safe editable timeline, real-time manual preview, creative composition, and verified export. Every AI result remains ordinary editable timeline data.

## Subsystems

- Electron owns trusted filesystem, FFmpeg, OpenAI, project, diagnostics, and export operations behind narrow IPC.
- React owns the desktop workspace and interaction surfaces.
- The timeline engine owns structural edit data and transaction history.
- A separate transport owns current time, play state, rate, and looping. Playback ticks never change project structure.
- The interactive playback engine resolves timeline time to source media and prioritizes low-latency HTML media/proxies.
- FFmpeg/FFprobe own ingest analysis, proxies, waveforms, media repair, and encoding support.
- OpenAI consumes grounded analysis and returns schema-validated plans or patches.
- Remotion owns deterministic titles, captions, graphics, procedural creative layers, and export composition—not the primary editing transport.

## Timeline and project model

Tracks are ordered layers with stable IDs and types: video, audio, overlay, text, graphics, and adjustment. Clips store frame-aligned timeline and source ranges plus non-destructive transform, audio, transition, and effect data. Projects store media references and edit decisions, never source binaries.

## Quality bar

Import, preview, append, insert, cut, trim, move, undo, multi-track playback, save/reopen, and H.264 export are release-gating workflows. A feature is not complete merely because its UI renders or its type checks pass.
