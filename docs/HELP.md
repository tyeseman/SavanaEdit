# SavanaEdit Help

SavanaEdit is a local-first desktop video editor under active development. It combines traditional non-destructive timeline editing with optional media analysis and AI-assisted rough-cut planning. Original media files are referenced, never modified.

## Getting started

Install Node.js, FFmpeg, and FFprobe. Run `npm install`, then `npm run dev`. If SavanaEdit cannot detect FFmpeg, open **Edit → Preferences** and browse to both executables.

## Projects and media

Use **File → New Project**, **Open Project**, **Save Project**, or **Save Project As**. Import individual media files or recursively scan a folder from the File menu or Project Media panel. You can also drag media from Explorer into Project Media, then drag a card onto V1 or V2.

Project files contain media references, timeline edits, format settings, and AI edit history. They do not contain copied footage.

## Media analysis and transcription

Double-click a media card or use **Project → Analyze Selected Media**. Analyze All processes clips through a controlled background queue. Analysis detects scenes, silence, loudness, waveform peaks, and—when `SAVANAEDIT_OPENAI_API_KEY` is configured—speech transcripts.

Select **Transcripts** in the sidebar to search timestamped speech. Clicking a segment seeks Source Preview. **Add to timeline** inserts that exact source range. **Delete from timeline** removes every matching timeline range as one undoable edit and respects the Ripple toggle.

## AI Edit

Open **Assistant**, choose a strategy, duration, and aspect ratio, then enter an editing instruction. SavanaEdit retrieves only existing analyzed media and creates a structured plan. Review the duration, selected clips, and warnings before applying it. Cloud planning is optional; a deterministic local planner remains available.

## Timeline editing

- Drag clips horizontally or between compatible video tracks.
- Drag either clip edge to trim. Source limits are enforced.
- Click a clip to select it; Shift-click adds to the selection.
- Press Ctrl+B to split selected clips at the playhead.
- Press Delete to remove selected references.
- Enable Ripple to close gaps after supported deletes.
- Use Copy/Paste to duplicate timeline references at the playhead.

V1 and A1 are exclusive tracks and reject overlaps. V2 is an overlay/B-roll track and may overlap V1. Linked V1/A1 clips move and trim together.

## Snapping and zoom

The magnet button or **S** toggles snapping. Clips and trim edges snap to the playhead, timeline start, and other clip boundaries using a pixel-based tolerance. A green guide shows the active snap target. Use the zoom slider, plus/minus buttons, or Fit Timeline control.

## Remove Silence

Analyze a clip, select it, then choose **Project → Remove Silence**. Configure minimum duration, speech-safe padding, and ripple behavior. SavanaEdit merges near-adjacent ranges and previews the estimated removal before applying one undoable transaction.

## Waveforms and preview

Compact normalized waveform peaks are generated into SavanaEdit's cache and reused with cached analysis. Audio clips display the portion corresponding to their source in/out range.

Source Preview plays the selected media item. Program Preview follows the timeline, choosing V2 over V1 when B-roll is active. Space toggles playback; the ruler and scrubber seek.

## Undo, redo, and saving

Undo and redo cover timeline transactions during the current session. Autosave runs shortly after meaningful changes. Save As creates a portable `.savana` project-reference file. Source media must remain at its original location.

## Troubleshooting

- **Media engine not found:** configure paths in Preferences or set `SAVANAEDIT_FFMPEG_PATH` and `SAVANAEDIT_FFPROBE_PATH`.
- **Transcript missing:** configure `SAVANAEDIT_OPENAI_API_KEY`, then analyze the clip again after clearing stale analysis if necessary.
- **Media missing after restart:** restore the source file to its prior path or reimport it.
- **Waveform missing:** confirm the clip has audio and FFmpeg analysis completed.
- **AI plan has few clips:** analyze more media so scene and transcript evidence exists.

## Known limitations

Final rendering/export, advanced transitions, effects, color grading, keyframes, automatic reframing, multicam, and advanced audio mixing are not implemented yet. Program Preview is an HTML5 rough-cut preview rather than a final render.
