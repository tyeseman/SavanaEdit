import type { MediaItem } from '../types/media';
import type { TimelineClip, TimelineModel, TimelineTrack } from '../types/timeline';
export interface ResolvedClip { clip:TimelineClip;track:TimelineTrack;media?:MediaItem;sourceTime:number }
export interface ResolvedTimeline { video:ResolvedClip[];audio:ResolvedClip[];topVideo?:ResolvedClip }
export const timelineToSourceTime=(clip:TimelineClip,timelineTime:number)=>clip.sourceIn+(timelineTime-clip.timelineStart)*(clip.speed||1);
export const sourceToTimelineTime=(clip:TimelineClip,sourceTime:number)=>clip.timelineStart+(sourceTime-clip.sourceIn)/(clip.speed||1);
const active=(clip:TimelineClip,time:number)=>time>=clip.timelineStart&&time<clip.timelineStart+clip.duration;
export function resolveTimeline(timeline:TimelineModel,media:MediaItem[],time:number):ResolvedTimeline{const byId=new Map(media.map(item=>[item.id,item])),video:ResolvedClip[]=[],audio:ResolvedClip[]=[];for(const track of timeline.tracks){if(track.locked&&false)continue;for(const clip of track.clips){if(!active(clip,time))continue;const resolved={clip,track,media:byId.get(clip.mediaId),sourceTime:timelineToSourceTime(clip,time)};(track.type==='audio'?audio:video).push(resolved)}}return{video,audio,topVideo:video.find(item=>item.track.visible!==false)}}
