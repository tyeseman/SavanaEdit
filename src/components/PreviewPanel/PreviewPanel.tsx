import { useEffect, useMemo, useRef, useState } from 'react';
import { Expand, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useTimelineStore } from '../../stores/timelineStore';

const formatTime = (value: number) => `00:${Math.floor((value || 0) / 60).toString().padStart(2, '0')}:${Math.floor((value || 0) % 60).toString().padStart(2, '0')}:00`;

export function PreviewPanel() {
  const [mode, setMode] = useState<'source' | 'program'>('source');
  const selected = useEditorStore(state => state.mediaItems.find(item => item.id === state.selectedMediaId));
  const media = useEditorStore(state => state.mediaItems);
  const analysis = useEditorStore(state => state.selectedMediaId ? state.analysisById[state.selectedMediaId] : undefined);
  const timeline = useTimelineStore(state => state.timeline);
  const setPlayhead = useTimelineStore(state => state.setPlayhead);
  const programClip = useMemo(() => {
    for (const trackId of ['V2', 'V1']) {
      const clip = timeline.tracks.find(track => track.id === trackId)?.clips.find(candidate => timeline.playhead >= candidate.timelineStart && timeline.playhead < candidate.timelineStart + candidate.duration);
      if (clip) return clip;
    }
  }, [timeline]);
  const item = mode === 'source' ? selected : media.find(candidate => candidate.id === programClip?.mediaId);
  const videoRef = useRef<HTMLVideoElement>(null), viewerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false), [time, setTime] = useState(0), [volume, setVolume] = useState(1);
  const duration = mode === 'source' ? item?.duration || 0 : timeline.duration;
  const sourceOffset = mode === 'program' && programClip ? programClip.sourceIn + (timeline.playhead - programClip.timelineStart) : 0;

  useEffect(() => { setPlaying(false); setTime(mode === 'program' ? timeline.playhead : 0); }, [item?.id, mode]);
  useEffect(() => { if (videoRef.current) videoRef.current.volume = volume; }, [volume, item?.id]);
  useEffect(() => {
    const listener = ((event: CustomEvent<number>) => { if (mode === 'source' && videoRef.current) videoRef.current.currentTime = event.detail; }) as EventListener;
    window.addEventListener('savana:seek', listener); return () => window.removeEventListener('savana:seek', listener);
  }, [mode]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if (event.code === 'Space' && !(event.target as HTMLElement).matches('input,textarea,select')) { event.preventDefault(); videoRef.current?.paused ? void videoRef.current.play() : videoRef.current?.pause(); } };
    window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener);
  }, []);
  useEffect(() => {
    const modeListener = ((event: CustomEvent<'source' | 'program'>) => setMode(event.detail)) as EventListener;
    const fullListener = () => void viewerRef.current?.requestFullscreen();
    window.addEventListener('savana:preview-mode', modeListener); window.addEventListener('savana:fullscreen-preview', fullListener);
    return () => { window.removeEventListener('savana:preview-mode', modeListener); window.removeEventListener('savana:fullscreen-preview', fullListener); };
  }, []);

  const scene = analysis?.scenes.find(candidate => time >= candidate.start && time < candidate.end);
  const silence = analysis?.audio?.silenceRanges.some(candidate => time >= candidate.start && time < candidate.end);
  const seekFrame = (direction: number) => { const frame = 1 / (mode === 'program' ? timeline.fps : item?.fps || 30), next = Math.max(0, Math.min(duration, time + direction * frame)); if (mode === 'program') setPlayhead(next); else if (videoRef.current) videoRef.current.currentTime = next; };
  const toggle = () => { if (!videoRef.current || !item) return; videoRef.current.paused ? void videoRef.current.play() : videoRef.current.pause(); };
  const scrub = (next: number) => { setTime(next); if (mode === 'program') setPlayhead(next); else if (videoRef.current) videoRef.current.currentTime = next; };
  const updateTime = (element: HTMLVideoElement) => {
    if (mode === 'program' && programClip) {
      const next = programClip.timelineStart + Math.max(0, element.currentTime - programClip.sourceIn), boundary = programClip.timelineStart + programClip.duration;
      setTime(next); setPlayhead(next >= boundary ? boundary + 0.001 : next);
      if (next >= boundary && playing) setTimeout(() => void videoRef.current?.play(), 30);
    } else { setTime(element.currentTime); window.dispatchEvent(new CustomEvent('savana:time', { detail: element.currentTime })); }
  };

  return <section className="preview-panel"><div className="preview-header"><div className="preview-modes"><button className={mode === 'source' ? 'active' : ''} onClick={() => setMode('source')}>Source</button><button className={mode === 'program' ? 'active' : ''} onClick={() => setMode('program')}>Program</button></div><strong>{mode === 'program' ? programClip?.name || 'Timeline gap' : item?.name || 'No clip selected'}</strong>{mode === 'source' && scene && <em>Scene {scene.index + 1}{silence ? ' · Silence' : ''}</em>}<button onClick={() => void viewerRef.current?.requestFullscreen()} disabled={!item}><Expand size={14}/></button></div><div className="viewer" ref={viewerRef}>{item ? <video key={`${mode}-${item.id}-${programClip?.id || ''}`} ref={videoRef} src={window.editorAPI.getMediaUrl(item.id)} onLoadedMetadata={() => { if (videoRef.current && mode === 'program') videoRef.current.currentTime = sourceOffset; }} onTimeUpdate={event => updateTime(event.currentTarget)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}/> : <div className="canvas-empty"><Play size={24}/><span>{mode === 'program' ? 'Move the playhead onto a timeline clip' : 'Select a media clip to preview'}</span></div>}</div><input className="scrubber" type="range" min="0" max={duration} step=".01" value={Math.min(time, duration)} onChange={event => scrub(Number(event.target.value))}/><div className="transport"><span className="timecode">{formatTime(time)}</span><div className="transport-center"><button onClick={() => seekFrame(-1)} disabled={!item}><SkipBack size={15}/></button><button className="play" onClick={toggle} disabled={!item}>{playing ? <Pause size={17}/> : <Play size={17}/>}</button><button onClick={() => seekFrame(1)} disabled={!item}><SkipForward size={15}/></button></div><div className="transport-right"><span>{formatTime(duration)}</span><button onClick={() => setVolume(volume ? 0 : 1)}>{volume ? <Volume2 size={16}/> : <VolumeX size={16}/>}</button><button onClick={() => void viewerRef.current?.requestFullscreen()} disabled={!item}><Expand size={15}/></button></div></div></section>;
}
