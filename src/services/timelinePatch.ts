import { z } from 'zod';
import type { MediaItem } from '../types/media';
import type { TimelineClip, TimelineModel } from '../types/timeline';
import { validateTimeline } from './timelineValidation';

const base = z.object({ operationId: z.string().min(1) });
const range = { sourceIn: z.number().finite().nonnegative(), sourceOut: z.number().finite().positive() };
const clipData = z.object({ id: z.string().min(1), mediaId: z.string().min(1), trackId: z.string().min(1), timelineStart: z.number().finite().nonnegative(), ...range, name: z.string().min(1), role: z.string().optional(), color: z.string().optional() });
export const timelinePatchOperationSchema = z.discriminatedUnion('type', [
  base.extend({ type: z.literal('insert'), clip: clipData }), base.extend({ type: z.literal('remove'), clipId: z.string().min(1) }),
  base.extend({ type: z.literal('move'), clipId: z.string().min(1), timelineStart: z.number().finite().nonnegative() }), base.extend({ type: z.literal('trim'), clipId: z.string().min(1), ...range }),
  base.extend({ type: z.literal('replace'), clipId: z.string().min(1), clip: clipData }), base.extend({ type: z.literal('split'), clipId: z.string().min(1), sourceTime: z.number().finite().positive() }),
  base.extend({ type: z.literal('rippleDelete'), clipId: z.string().min(1) }), base.extend({ type: z.literal('setRole'), clipId: z.string().min(1), role: z.string().min(1) }),
  base.extend({ type: z.literal('setTrack'), clipId: z.string().min(1), trackId: z.string().min(1) }),
]);
export const timelinePatchSchema = z.object({ operations: z.array(timelinePatchOperationSchema).min(1), partial: z.literal(false).optional() });
export type TimelinePatch = z.infer<typeof timelinePatchSchema>;
const clips = (timeline: TimelineModel) => timeline.tracks.flatMap(track => track.clips);
const mediaFor = (media: MediaItem[], id: string) => { const item = media.find(candidate => candidate.id === id); if (!item || item.status === 'error') throw new Error(`Source media is unavailable: ${id}`); return item; };
const trackFor = (timeline: TimelineModel, id: string) => { const track = timeline.tracks.find(candidate => candidate.id === id); if (!track) throw new Error(`Track does not exist: ${id}`); return track; };
const clipFor = (timeline: TimelineModel, id: string) => { const clip = clips(timeline).find(candidate => candidate.id === id); if (!clip) throw new Error(`Clip does not exist or was removed earlier in this patch: ${id}`); return clip; };
const remove = (timeline: TimelineModel, id: string) => { for (const track of timeline.tracks) track.clips = track.clips.filter(clip => clip.id !== id); };
function validClip(clip: TimelineClip, timeline: TimelineModel, media: MediaItem[]) { const source = mediaFor(media, clip.mediaId); trackFor(timeline, clip.trackId); if (clip.sourceOut <= clip.sourceIn || clip.sourceOut > source.duration + .001) throw new Error(`Invalid source range for clip ${clip.id}`); clip.duration = clip.sourceOut - clip.sourceIn; }

/** Atomic patch transaction: parse everything, mutate a clone, validate the result, then return it. */
export function applyTimelinePatch(current: TimelineModel, input: unknown, media: MediaItem[]): TimelineModel {
  const patch = timelinePatchSchema.parse(input), operationIds = new Set<string>(), proposed = structuredClone(current);
  for (const operation of patch.operations) { if (operationIds.has(operation.operationId)) throw new Error(`Duplicate operation ID: ${operation.operationId}`); operationIds.add(operation.operationId); }
  for (const operation of patch.operations) {
    if (operation.type === 'insert') { const clip = { ...operation.clip, duration: operation.clip.sourceOut - operation.clip.sourceIn } as TimelineClip; validClip(clip, proposed, media); if (clips(proposed).some(item => item.id === clip.id)) throw new Error(`Duplicate clip ID: ${clip.id}`); trackFor(proposed, clip.trackId).clips.push(clip); continue; }
    const clip = clipFor(proposed, operation.clipId);
    if (operation.type === 'remove' || operation.type === 'rippleDelete') { const linked = clip.linkedClipId ? clips(proposed).find(item => item.id === clip.linkedClipId) : undefined; remove(proposed, clip.id); if (linked) remove(proposed, linked.id); if (operation.type === 'rippleDelete') for (const track of proposed.tracks.filter(item => item.id === clip.trackId || item.id === linked?.trackId)) for (const item of track.clips) if (item.timelineStart >= clip.timelineStart + clip.duration - .001) item.timelineStart -= clip.duration; continue; }
    if (operation.type === 'move') { const delta = operation.timelineStart - clip.timelineStart; clip.timelineStart = operation.timelineStart; if (clip.linkedClipId) clipFor(proposed, clip.linkedClipId).timelineStart += delta; }
    if (operation.type === 'trim') { const source = mediaFor(media, clip.mediaId); if (operation.sourceOut > source.duration + .001 || operation.sourceOut <= operation.sourceIn) throw new Error(`Invalid trim range for ${clip.id}`); const delta = operation.sourceIn - clip.sourceIn; Object.assign(clip, { sourceIn: operation.sourceIn, sourceOut: operation.sourceOut, timelineStart: clip.timelineStart + delta, duration: operation.sourceOut - operation.sourceIn }); if (clip.linkedClipId) Object.assign(clipFor(proposed, clip.linkedClipId), { sourceIn: clip.sourceIn, sourceOut: clip.sourceOut, timelineStart: clip.timelineStart, duration: clip.duration }); }
    if (operation.type === 'replace') { remove(proposed, clip.id); const replacement = { ...operation.clip, duration: operation.clip.sourceOut - operation.clip.sourceIn } as TimelineClip; validClip(replacement, proposed, media); trackFor(proposed, replacement.trackId).clips.push(replacement); }
    if (operation.type === 'split') { if (operation.sourceTime <= clip.sourceIn || operation.sourceTime >= clip.sourceOut) throw new Error(`Split point is outside clip ${clip.id}`); const left = operation.sourceTime - clip.sourceIn, right = { ...clip, id: crypto.randomUUID(), sourceIn: operation.sourceTime, timelineStart: clip.timelineStart + left, duration: clip.sourceOut - operation.sourceTime, linkedClipId: undefined }; clip.sourceOut = operation.sourceTime; clip.duration = left; clip.linkedClipId = undefined; trackFor(proposed, clip.trackId).clips.push(right); }
    if (operation.type === 'setRole') clip.role = operation.role;
    if (operation.type === 'setTrack') { const target = trackFor(proposed, operation.trackId); remove(proposed, clip.id); clip.trackId = target.id; target.clips.push(clip); }
  }
  proposed.duration = Math.max(0, ...clips(proposed).map(clip => clip.timelineStart + clip.duration)); validateTimeline(proposed, media); return proposed;
}
