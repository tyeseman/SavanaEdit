import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { Expand, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Player, type PlayerRef } from '@remotion/player';
import { useEditorStore } from '../../stores/editorStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useEditStore } from '../../stores/editStore';
import { useCreativeStore } from '../../stores/creativeStore';
import { SavanaComposition } from '../../rendering/remotion/SavanaComposition';
import { timelineToComposition, type SavanaCompositionProps } from '../../rendering/remotion/compositionAdapter';

const ProgramComposition = SavanaComposition as unknown as ComponentType<Record<string, unknown>>;
const formatTime=(value:number,fps=30)=>{const safe=Math.max(0,value||0),hours=Math.floor(safe/3600),minutes=Math.floor(safe%3600/60),seconds=Math.floor(safe%60),frames=Math.floor((safe%1)*fps);return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}:${String(frames).padStart(2,'0')}`};

export function PreviewPanel(){
  const [mode,setMode]=useState<'source'|'program'>('source'), [playing,setPlaying]=useState(false), [time,setTime]=useState(0), [volume,setVolume]=useState(1), [previewError,setPreviewError]=useState('');
  const selected=useEditorStore(s=>s.mediaItems.find(item=>item.id===s.selectedMediaId)), media=useEditorStore(s=>s.mediaItems), timeline=useTimelineStore(s=>s.timeline), setPlayhead=useTimelineStore(s=>s.setPlayhead), format=useEditStore(s=>s.format), creative=useCreativeStore();
  const videoRef=useRef<HTMLVideoElement>(null), playerRef=useRef<PlayerRef>(null), viewerRef=useRef<HTMLDivElement>(null), lastPlayerFrame=useRef(-1);
  const compositionResult=useMemo(()=>{try{return{composition:timelineToComposition(timeline,media,format,creative,item=>window.editorAPI.getMediaUrl(item.id)),error:''}}catch(error){return{composition:undefined,error:error instanceof Error?error.message:'Preview could not be created'}}},[timeline,media,format,creative]), composition=compositionResult.composition;
  const duration=mode==='source'?selected?.duration||0:timeline.duration, fps=mode==='program'?format.projectFPS:selected?.fps||30;

  useEffect(()=>{if(videoRef.current)videoRef.current.volume=volume},[volume,selected?.id,mode]);
  useEffect(()=>{if(mode==='source'){setTime(0);setPlaying(false)}},[selected?.id,mode]);
  useEffect(()=>{
    const modeListener=((event:CustomEvent<'source'|'program'>)=>setMode(event.detail)) as EventListener;
    const seekListener=((event:CustomEvent<number>)=>{const next=Math.max(0,event.detail);if(mode==='source'&&videoRef.current){videoRef.current.currentTime=next;setTime(next)}else{setPlayhead(next);playerRef.current?.seekTo(Math.round(next*format.projectFPS))}}) as EventListener;
    const full=()=>mode==='program'?playerRef.current?.requestFullscreen():void viewerRef.current?.requestFullscreen();
    window.addEventListener('savana:preview-mode',modeListener);window.addEventListener('savana:seek',seekListener);window.addEventListener('savana:fullscreen-preview',full);
    return()=>{window.removeEventListener('savana:preview-mode',modeListener);window.removeEventListener('savana:seek',seekListener);window.removeEventListener('savana:fullscreen-preview',full)};
  },[mode,format.projectFPS,setPlayhead]);
  useEffect(()=>{
    const player=playerRef.current;if(!player||mode!=='program')return;
    const update=(event:{detail:{frame:number}})=>{lastPlayerFrame.current=event.detail.frame;const next=event.detail.frame/format.projectFPS;setTime(next);setPlayhead(next)};
    const play=()=>setPlaying(true),pause=()=>setPlaying(false);
    player.addEventListener('timeupdate',update);player.addEventListener('play',play);player.addEventListener('pause',pause);
    return()=>{player.removeEventListener('timeupdate',update);player.removeEventListener('play',play);player.removeEventListener('pause',pause)};
  },[mode,composition,format.projectFPS,setPlayhead]);
  useEffect(()=>{if(mode!=='program')return;const target=Math.round(timeline.playhead*format.projectFPS);if(Math.abs(target-lastPlayerFrame.current)>1){lastPlayerFrame.current=target;playerRef.current?.seekTo(target);setTime(timeline.playhead)}},[mode,timeline.playhead,format.projectFPS]);

  const toggle=()=>{if(mode==='program')playerRef.current?.toggle();else if(videoRef.current)videoRef.current.paused?void videoRef.current.play().catch(error=>setPreviewError(error.message)):videoRef.current.pause()};
  const scrub=(next:number)=>{const bounded=Math.max(0,Math.min(duration,next));setTime(bounded);if(mode==='program'){setPlayhead(bounded);const frame=Math.round(bounded*format.projectFPS);lastPlayerFrame.current=frame;playerRef.current?.seekTo(frame)}else if(videoRef.current)videoRef.current.currentTime=bounded};
  const seekFrame=(direction:number)=>scrub(time+direction/fps), fullscreen=()=>mode==='program'?playerRef.current?.requestFullscreen():void viewerRef.current?.requestFullscreen();
  const toggleVolume=()=>{const next=volume?0:1;setVolume(next);playerRef.current?.setVolume(next)};
  return <section className="preview-panel"><div className="preview-header"><div className="preview-modes"><button className={mode==='source'?'active':''} onClick={()=>setMode('source')}>Source</button><button className={mode==='program'?'active':''} onClick={()=>setMode('program')}>Program</button></div><strong>{mode==='program'?'Timeline Preview':selected?.name||'No clip selected'}</strong>{mode==='program'&&<select value={creative.previewQuality} onChange={e=>creative.setPreviewQuality(e.target.value as typeof creative.previewQuality)}><option value="draft">Draft</option><option value="preview">Preview</option><option value="full">Full</option></select>}<button onClick={fullscreen} disabled={mode==='source'&&!selected}><Expand size={14}/></button></div><div className="viewer" ref={viewerRef}>{mode==='program'&&composition?<Player ref={playerRef} component={ProgramComposition} inputProps={composition as unknown as Record<string,unknown>} durationInFrames={composition.durationInFrames} fps={composition.fps} compositionWidth={composition.width} compositionHeight={composition.height} style={{width:'100%',height:'100%'}} controls={false}/>:selected?<video ref={videoRef} src={window.editorAPI.getMediaUrl(selected.id)} preload="auto" playsInline onLoadedMetadata={e=>{e.currentTarget.volume=volume;setPreviewError('')}} onTimeUpdate={e=>{setTime(e.currentTarget.currentTime);window.dispatchEvent(new CustomEvent('savana:time',{detail:e.currentTarget.currentTime}))}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setPreviewError('This source cannot be decoded for preview. Reimport it to generate a compatibility proxy.')}/>:<div className="canvas-empty"><Play size={24}/><span>{mode==='program'?'Add clips to preview the timeline':'Select a media clip to preview'}</span></div>}{previewError&&<div className="preview-error">{previewError}</div>}</div><input className="scrubber" type="range" min="0" max={Math.max(.01,duration)} step={1/fps} value={Math.min(time,duration)} onChange={e=>scrub(Number(e.target.value))}/><div className="transport"><span className="timecode">{formatTime(time,fps)}</span><div className="transport-center"><button title="Previous frame" onClick={()=>seekFrame(-1)} disabled={!duration}><SkipBack size={15}/></button><button className="play" title="Play / Pause" onClick={toggle} disabled={!duration}>{playing?<Pause size={17}/>:<Play size={17}/>}</button><button title="Next frame" onClick={()=>seekFrame(1)} disabled={!duration}><SkipForward size={15}/></button></div><div className="transport-right"><span>{formatTime(duration,fps)}</span><button title="Mute" onClick={toggleVolume}>{volume?<Volume2 size={16}/>:<VolumeX size={16}/>}</button><button title="Fullscreen" onClick={fullscreen} disabled={!duration}><Expand size={15}/></button></div></div></section>;
}
