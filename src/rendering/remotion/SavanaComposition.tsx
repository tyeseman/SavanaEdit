import React from 'react';
import { AbsoluteFill, Audio, Sequence, Video, interpolate, useCurrentFrame } from 'remotion';
import type { CompositionClip, SavanaCompositionProps } from './compositionAdapter';
import type { EffectInstance, OverlayItem } from '../../types/creative';

const n = (effect:EffectInstance, key:string, fallback:number) => Number(effect.parameters[key] ?? fallback);
function effectStyle(effects:EffectInstance[] = [], frame = 0, fps = 30) {
  let brightness=1, contrast=1, saturation=1, blur=0, sepia=0, gray=0, hue=0, invert=0, opacity=1, shadow='';
  for (const effect of effects.filter(item => item.enabled && frame / fps >= item.start && frame / fps <= item.start + item.duration)) {
    if (effect.effectId==='exposure') brightness*=Math.pow(2,n(effect,'amount',0));
    if (effect.effectId==='brightness') brightness*=n(effect,'amount',1);
    if (effect.effectId==='contrast') contrast*=n(effect,'amount',1);
    if (effect.effectId==='saturation') saturation*=n(effect,'amount',1);
    if (effect.effectId==='monochrome') gray=Math.max(gray,n(effect,'amount',1));
    if (effect.effectId==='sepia') sepia=Math.max(sepia,n(effect,'amount',.7));
    if (effect.effectId==='warmth') { const amount=n(effect,'amount',.4); sepia=Math.max(sepia,amount*.45); saturation*=1+amount*.25; hue-=amount*8; }
    if (effect.effectId==='hue-rotate') hue+=n(effect,'degrees',0);
    if (effect.effectId==='invert') invert=Math.max(invert,n(effect,'amount',1));
    if (effect.effectId==='gaussian-blur') blur+=n(effect,'radius',4);
    if (effect.effectId==='soft-focus') { const amount=n(effect,'amount',.3); blur+=amount*5; brightness*=1+amount*.12; }
    if (effect.effectId==='glow') shadow=`drop-shadow(0 0 ${20*n(effect,'amount',.3)}px white)`;
    if (effect.effectId==='fade') opacity*=n(effect,'amount',1);
  }
  return { opacity, filter:`brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px) sepia(${sepia}) grayscale(${gray}) hue-rotate(${hue}deg) invert(${invert}) ${shadow}` };
}

function visualStyle(clip:CompositionClip, frame:number, fps:number) {
  const t=clip.transform||{positionX:0,positionY:0,scale:100,rotation:0,anchorX:50,anchorY:50,opacity:100};
  const out=clip.transitionOut, transitionFrames=out?Math.max(1,Math.round(out.duration*fps)):0, localEnd=clip.durationInFrames-frame;
  let opacity=t.opacity/100, extra='', transitionFilter='', clipPath:React.CSSProperties['clipPath'];
  if (out && localEnd<=transitionFrames) {
    const p=interpolate(localEnd,[0,transitionFrames],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}), q=1-p;
    const id=out.transitionId, strength=Number(out.parameters.strength??.5), distance=Number(out.parameters.distance??1);
    if (id==='dip-black') opacity*=p;
    if (id==='dip-white') transitionFilter=`brightness(${1+q*8*strength})`;
    if (id.startsWith('push-')) { const direction=id.slice(5), x=direction==='left'?-q*100*distance:direction==='right'?q*100*distance:0, y=direction==='up'?-q*100*distance:direction==='down'?q*100*distance:0; extra+=` translate(${x}%,${y}%)`; }
    if (id.startsWith('wipe-')) { const d=id.slice(5); clipPath=d==='left'?`inset(0 ${q*100}% 0 0)`:d==='right'?`inset(0 0 0 ${q*100}%)`:d==='up'?`inset(0 0 ${q*100}% 0)`:`inset(${q*100}% 0 0 0)`; }
    if (id==='zoom-in') extra+=` scale(${1+q*strength})`;
    if (id==='zoom-out') extra+=` scale(${Math.max(.05,1-q*strength)})`;
    if (id==='zoom-blur') { extra+=` scale(${1+q*.25*strength})`; transitionFilter+=` blur(${q*16*strength}px)`; }
    if (id==='spin') { extra+=` scale(${Math.max(.05,p)}) rotate(${q*360*Number(out.parameters.turns??.5)}deg)`; opacity*=p; }
    if (id==='whip-left'||id==='whip-right') { const sign=id.endsWith('left')?-1:1; extra+=` translateX(${sign*q*130*strength}%)`; transitionFilter+=` blur(${q*18*strength}px)`; opacity*=Math.min(1,p*2); }
    if (id==='iris') clipPath=`circle(${p*72}% at 50% 50%)`;
    if (id==='glitch-cut') { extra+=` translate(${Math.sin(frame*8)*q*24*strength}px,${Math.cos(frame*5)*q*8*strength}px)`; transitionFilter+=` hue-rotate(${q*120*strength}deg) contrast(${1+q*strength})`; }
  }
  const effects=effectStyle(clip.effects,frame,fps);
  return {width:'100%',height:'100%',objectFit:'cover' as const,opacity:opacity*effects.opacity,clipPath,transformOrigin:`${t.anchorX}% ${t.anchorY}%`,transform:`translate(${t.positionX}px,${t.positionY}px) scale(${t.scale/100}) rotate(${t.rotation}deg)${extra}`,filter:`${effects.filter} ${transitionFilter}`};
}

function Clip({clip,fps}:{clip:CompositionClip;fps:number}) {
  const frame=useCurrentFrame();
  if (clip.trackId.startsWith('A')) {
    const audio=clip.audio||{volume:1,muted:false,fadeIn:0,fadeOut:0,gainDb:0,pan:0,normalize:false}, base=audio.muted?0:Math.max(0,audio.volume*Math.pow(10,audio.gainDb/20));
    return <Audio src={clip.src} startFrom={clip.sourceStartFrame} volume={local=>{const elapsed=local/fps,remaining=(clip.durationInFrames-local)/fps,inGain=audio.fadeIn?Math.min(1,elapsed/audio.fadeIn):1,outGain=audio.fadeOut?Math.min(1,remaining/audio.fadeOut):1;return base*Math.max(0,Math.min(inGain,outGain));}}/>;
  }
  return <Video src={clip.src} startFrom={clip.sourceStartFrame} muted style={visualStyle(clip,frame,fps)} playbackRate={clip.speed||1}/>;
}

function Overlay({item,fps}:{item:OverlayItem;fps:number}) {
  const frame=useCurrentFrame(),p=frame/Math.max(1,item.duration*fps),intensity=Number(item.parameters.intensity??.5),tint=String(item.parameters.tint||'#ff793f'),speed=Number(item.parameters.speed??1);
  if(item.overlayId==='letterbox')return <AbsoluteFill style={{borderTop:`${item.parameters.size||8}vh solid black`,borderBottom:`${item.parameters.size||8}vh solid black`}}/>;
  if(item.overlayId==='vignette')return <AbsoluteFill style={{background:`radial-gradient(circle,transparent 45%,rgba(0,0,0,${intensity}) 100%)`}}/>;
  if(item.overlayId==='grain-overlay')return <AbsoluteFill style={{opacity:intensity,backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.8\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.5\'/%3E%3C/svg%3E")',transform:`translate(${frame%17}px,${frame%11}px)`}}/>;
  const x=Math.sin(p*Math.PI*2*speed+(item.overlayId.includes('double')?2:0))*35;
  return <AbsoluteFill style={{mixBlendMode:item.blendMode,opacity:intensity,background:`radial-gradient(ellipse at ${50+x}% ${45+Math.cos(p*6)*30}%,${tint},transparent ${20+Number(item.parameters.softness||.7)*50}%)`}}/>;
}

export const SavanaComposition:React.FC<SavanaCompositionProps>=props=><AbsoluteFill style={{backgroundColor:'#000',overflow:'hidden'}}>
  {[...props.clips].sort((a,b)=>a.layer-b.layer).map(clip=><Sequence key={clip.id} from={clip.fromFrame} durationInFrames={clip.durationInFrames}><Clip clip={clip} fps={props.fps}/></Sequence>)}
  {props.creative.overlays.map(item=><Sequence key={item.id} from={Math.round(item.timelineStart*props.fps)} durationInFrames={Math.max(1,Math.round(item.duration*props.fps))}><Overlay item={item} fps={props.fps}/></Sequence>)}
  {props.creative.captions.map(item=><Sequence key={item.id} from={Math.round(item.timelineStart*props.fps)} durationInFrames={Math.max(1,Math.round(item.duration*props.fps))}><AbsoluteFill style={{justifyContent:'flex-end',alignItems:'center',padding:'8%',fontFamily:'Arial'}}><div style={{fontSize:48,fontWeight:700,color:'white',textAlign:'center',textShadow:'0 2px 8px black',background:item.presetId==='caption-boxed'?'#000a':'transparent',padding:'8px 16px'}}>{item.text}</div></AbsoluteFill></Sequence>)}
  {props.creative.titles.map(item=><Sequence key={item.id} from={Math.round(item.timelineStart*props.fps)} durationInFrames={Math.max(1,Math.round(item.duration*props.fps))}><AbsoluteFill style={{justifyContent:'center',alignItems:'center',fontFamily:'Arial',color:String(item.parameters.color||'white')}}><strong style={{fontSize:Number(item.parameters.fontSize||72)}}>{item.text}</strong>{item.subtitle&&<span style={{fontSize:32}}>{item.subtitle}</span>}</AbsoluteFill></Sequence>)}
</AbsoluteFill>;
