import type { AudioSettings, EffectInstance, TransformSettings, TransitionInstance } from './creative';
export type EditingMode='Social Reel'|'Interview'|'Podcast'|'Music Video'|'Commercial'|'Product Video'|'Event Recap'|'YouTube'|'Documentary'|'Wedding/Event'|'Custom';
export type AspectRatio='16:9'|'9:16'|'1:1'|'4:5'|'Custom';
export interface PlannedTimelineItem{id:string;type:'video'|'audio'|'title'|'caption'|'gap';sourceMediaId?:string;sourceSceneId?:string;sourceStart?:number;sourceEnd?:number;timelineStart:number;duration:number;trackId:string;role?:'primary'|'broll'|'dialogue'|'music'|'title'|'caption';reason?:string}
export interface EditPlan{id:string;projectId:string;title?:string;mode:EditingMode;targetDuration?:number;aspectRatio?:AspectRatio;timeline:PlannedTimelineItem[];reasoningSummary?:string;warnings?:string[];createdAt:string}
export interface TimelineClip{id:string;mediaId:string;trackId:string;timelineStart:number;sourceIn:number;sourceOut:number;duration:number;name:string;role?:string;linkedClipId?:string;color?:string;speed?:number;transform?:TransformSettings;effects?:EffectInstance[];transitionIn?:TransitionInstance;transitionOut?:TransitionInstance;audio?:AudioSettings}
export type TimelineTrackType='video'|'audio'|'overlay'|'text'|'graphics'|'adjustment';
export interface TimelineTrack{id:string;type:TimelineTrackType;name:string;locked:boolean;muted?:boolean;solo?:boolean;visible?:boolean;volume?:number;height?:number;clips:TimelineClip[]}
export interface TimelineModel{duration:number;fps:number;tracks:TimelineTrack[];playhead:number}
export interface ProjectFormat{projectFPS:number;projectWidth:number;projectHeight:number;aspectRatio:AspectRatio}
export interface AIEditHistoryItem{id:string;prompt:string;timestamp:string;editPlanId:string;revision?:boolean;provider:string}
