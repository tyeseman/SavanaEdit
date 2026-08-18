import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { AppSettings } from '../../types/media';

export function SettingsModal() {
  const [open,setOpen]=useState(false), [value,setValue]=useState<AppSettings>();
  useEffect(()=>{const show=()=>{setOpen(true);void window.editorAPI.getSettings().then(setValue)};window.addEventListener('savana:preferences',show);return()=>window.removeEventListener('savana:preferences',show)},[]);
  if(!open)return null;
  const browse=async(kind:'ffmpeg'|'ffprobe')=>{const selected=await window.editorAPI.browseEngine(kind);if(selected)setValue(old=>old&&{...old,[`${kind}Path`]:selected})};
  const save=async()=>{if(value)setValue(await window.editorAPI.saveSettings(value))};
  const engineLabel=(kind:'ffmpeg'|'ffprobe')=>{
    const engine=value?.mediaEngine as (Record<string,unknown>|undefined);
    const available=Boolean(engine?.[`${kind}Available`]), source=String(engine?.[`${kind}Source`]||engine?.source||'');
    return available?`${source==='bundled'?'Bundled':'Override'} — Ready`:`Unavailable — ${String(engine?.[`${kind}Error`]||'No working executable found')}`;
  };
  return <div className="modal-backdrop"><section className="settings-modal"><header><strong>Preferences</strong><button onClick={()=>setOpen(false)}><X size={15}/></button></header>{!value?<p>Detecting media engine…</p>:<><h3>Media engine</h3>{(['ffmpeg','ffprobe']as const).map(kind=><label key={kind}><span>{kind==='ffmpeg'?'FFmpeg':'FFprobe'} advanced override</span><div><input value={value[`${kind}Path`]} onChange={e=>setValue({...value,[`${kind}Path`]:e.target.value})} placeholder="Leave empty to use bundled binary"/><button onClick={()=>void browse(kind)}>Browse</button><button onClick={()=>setValue({...value,[`${kind}Path`]:''})}>Use bundled</button></div><small>{engineLabel(kind)} · {value.mediaEngine?.[`${kind}Version`]||'No version available'}</small></label>)}<h3>Transcription</h3><label><span>Provider</span><select value={value.transcriptionProvider} onChange={e=>setValue({...value,transcriptionProvider:e.target.value as 'openai'|'none'})}><option value="openai">OpenAI</option><option value="none">Disabled</option></select><small>{value.openAIConfigured?'API key configured':'Set SAVANAEDIT_OPENAI_API_KEY to enable transcription'}</small></label><footer><button onClick={()=>setOpen(false)}>Cancel</button><button className="primary" onClick={()=>void save()}>Save & detect</button></footer></>}</section></div>;
}
