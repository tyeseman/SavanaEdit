# SavanaEdit Rebuild Plan

## Milestone 1 — Stable playback

Separate transport state from timeline content, centralize timeline resolution, use HTML media/proxies for interactive playback, and keep Remotion out of playback ticks.

## Milestone 2 — Professional timeline

Introduce dynamic typed tracks, authoritative frame boundaries, deterministic layer ordering, track controls, strong zero/edge snapping, and vertical navigation.

## Milestone 3 — Manual editing

Harden append, insert, overwrite, move, linked trim, blade, ripple, duplicate, copy/paste, and transaction history with acceptance tests.

## Milestone 4 — Audio

Mix multiple timeline audio sources independently of visible video, honor mute/solo/gain/fades, and prepare Web Audio nodes for pan, EQ, dynamics, and ducking.

## Milestone 5 — Intelligence and AI

Make analysis readiness explicit, add grounded search, schema-validated timeline patches and revisions, mode-specific strategies, and safe provider diagnostics.

## Milestone 6 — Creative engine

Move text, captions, overlays, graphics, and adjustments onto timeline tracks; retain registry-backed effects and manifest-driven asset expansion.

## Milestone 7 — Export and release QA

Map the unified timeline to Remotion/FFmpeg, add hardware capability detection with software fallback, run real-footage acceptance projects, validate outputs, and package Windows builds.

Each milestone must pass build, unit tests, desktop log inspection, save/reopen, and relevant real-media acceptance checks before later visual breadth is prioritized.
