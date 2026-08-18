# SavanaEdit Help

## Media engine

FFmpeg and FFprobe are bundled with SavanaEdit. A separate FFmpeg installation is normally not required. SavanaEdit verifies both executables by running their `-version` commands before reporting them ready. **Edit → Preferences** shows `Bundled — Ready` during normal operation and retains path fields only as advanced overrides if the bundled files cannot execute.

Advanced users may also set `SAVANAEDIT_FFMPEG_PATH` and `SAVANAEDIT_FFPROBE_PATH`. Invalid overrides do not crash the editor; SavanaEdit continues through its bundled, system-PATH, and common-location fallbacks.

SavanaEdit is a local-first, non-destructive desktop editor. It references original media and stores editing decisions separately. The application is under active development.

## Getting started and projects

Install system FFmpeg and FFprobe, run `npm install`, then `npm run dev`. Configure custom media-engine paths under **Edit → Preferences** when needed.

Use the File menu to create, open, save, or save a copy of a project. Import files or folders from File or the Media panel. SavanaEdit projects store source references, timeline data, creative settings, and AI history; they do not embed footage.

## Analysis, transcription, and AI Edit

Select a media card and use **Project → Analyze Selected Media**, or analyze all media. Analysis can generate scenes, silence ranges, loudness, waveform peaks, summaries, and optional transcripts. Transcription requires `SAVANAEDIT_OPENAI_API_KEY`.

The Assistant creates source-grounded rough-cut plans using analyzed media. Review every plan before applying it. Creative AI operations are not yet available.

## Timeline editing

Drag media to V1 or V2. Select timeline clips to move, trim, split, delete, ripple-delete, or copy/paste. V1 and A1 reject destructive same-track overlap; V2 supports B-roll over V1. Linked video/audio move and trim together.

Use **S** or the magnet control to toggle pixel-aware snapping. Green guides indicate clip edges, the playhead, or timeline start. Zoom controls change the timeline scale; Fit shows the full sequence.

## Transcript editing and captions

Select analyzed media and open Transcripts. Segment clicks seek the source. Add a segment to the timeline or remove its mapped source range without modifying the original. **Generate Captions** creates timeline captions only where that source appears on V1, preserving edits and reordering.

## Remove Silence and waveforms

Choose **Project → Remove Silence**, configure minimum duration and speech-safe padding, preview the estimate, and apply one undoable transaction. Cached normalized waveform peaks render only the source range used by each audio clip.

## Creative library and Inspector

Effects contains implemented clip effects, procedural overlays, light leaks, and titles. Transitions contains four implemented transition types. Select a clip before adding clip effects or transitions. Overlays and titles are placed at the playhead.

Open Inspector to adjust position, scale, rotation, opacity, effect parameters, enable/disable state, and removal. Creative changes are non-destructive and stored with the project.

## Audio

Select a clip and open Audio to set volume, gain, pan metadata, fade-in, fade-out, or mute. Volume, gain, fades, and mute are rendered. Pan, normalization, ducking, EQ, compression, filters, and noise reduction are not rendered yet.

## Program Preview

Source Preview displays selected media. Program Preview runs the shared Remotion composition and displays cuts, track layering, transforms, supported effects/transitions, procedural overlays, captions, titles, and rendered audio. Choose Draft, Preview, or Full quality; expensive quality reductions are not yet fully differentiated.

## Export

Click Export or choose **File → Export**. Select a preset or custom dimensions, FPS, format, CRF quality, audio bitrate, and filename. SavanaEdit asks for a destination, bundles the Remotion composition, renders outside the React renderer, reports progress, and supports cancellation.

After rendering, SavanaEdit parses the file and verifies readable video, expected dimensions, and reasonable duration. Available formats are H.264 MP4, H.265 MP4, and VP9 WebM. Current rendering is software-based; hardware encoder selection is unavailable.

## Saving, undo, and recovery

Timeline edits are undoable during the session. Autosave includes creative items. Save As creates a `.savana` project-reference file. Missing source files are marked unavailable instead of crashing, but a relink workflow is future work.

## Troubleshooting

- **Media engine not found:** configure system FFmpeg and FFprobe in Preferences.
- **First export is slow:** Remotion may prepare its managed browser once.
- **Export source unavailable:** restore or reimport the missing source file.
- **No captions:** analyze and transcribe the selected source, then place it on V1.
- **Effect Add disabled:** select a timeline clip first.
- **Large production bundle warning:** Program Preview is currently eagerly bundled; this is known.

## Known limitations

Creative asset packs, beat detection, music ducking, creative AI planning, full keyframe authoring, proxies UI, hardware encoding, automatic reframing, advanced effects/audio, and relinking are not implemented. See README for the complete current boundary.
