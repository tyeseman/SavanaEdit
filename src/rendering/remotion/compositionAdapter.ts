import type { CreativeState } from '../../types/creative';
import type { MediaItem } from '../../types/media';
import type { ProjectFormat, TimelineClip, TimelineModel } from '../../types/timeline';
import { secondsToFrames } from '../../utils/time';
import { registryItem } from '../registries';

export interface CompositionClip extends TimelineClip { src: string; fromFrame: number; durationInFrames: number; sourceStartFrame: number; layer: number }
export interface SavanaCompositionProps { width:number;height:number;fps:number;durationInFrames:number;clips:CompositionClip[];creative:CreativeState;quality:'draft'|'preview'|'full' }
const fileUrl=(value:string)=>`file:///${value.replace(/\\/g,'/').split('/').map(encodeURIComponent).join('/')}`.replace('file:////','file:///');
export function timelineToComposition(timeline:TimelineModel,media:MediaItem[],format:ProjectFormat,creative:CreativeState,resolveSource?:(item:MediaItem)=>string):SavanaCompositionProps{
 const byId=new Map(media.map(item=>[item.id,item]));
 const clips=timeline.tracks.flatMap((track,layer)=>track.clips.map(clip=>{const source=byId.get(clip.mediaId);if(!source||source.status==='error')throw new Error(`Missing source for ${clip.name}`);for(const effect of clip.effects||[])if(!registryItem(effect.effectId))throw new Error(`Unknown effect ${effect.effectId}`);if(clip.transitionOut&&!registryItem(clip.transitionOut.transitionId))throw new Error(`Unknown transition ${clip.transitionOut.transitionId}`);return{...clip,src:resolveSource?resolveSource(source):fileUrl(source.path),fromFrame:secondsToFrames(clip.timelineStart,format.projectFPS),durationInFrames:Math.max(1,secondsToFrames(clip.duration,format.projectFPS)),sourceStartFrame:secondsToFrames(clip.sourceIn,format.projectFPS),layer}}));
 for(const item of [...creative.overlays,...creative.captions,...creative.titles])if(!registryItem('overlayId'in item?item.overlayId:'presetId'in item?item.presetId:''))throw new Error(`Unknown creative item on timeline: ${item.id}`);
 return{width:format.projectWidth,height:format.projectHeight,fps:format.projectFPS,durationInFrames:Math.max(1,secondsToFrames(timeline.duration,format.projectFPS)),clips,creative,quality:creative.previewQuality};
}
