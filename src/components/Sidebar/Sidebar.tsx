import { Bot, Clapperboard, FileAudio, Captions, WandSparkles, BetweenHorizontalEnd, SlidersHorizontal } from 'lucide-react';
import { useEditorStore, type EditorPanel } from '../../stores/editorStore';
const entries = [[Clapperboard,'Media'],[Bot,'Assistant'],[Captions,'Transcripts'],[WandSparkles,'Effects'],[BetweenHorizontalEnd,'Transitions'],[FileAudio,'Audio'],[SlidersHorizontal,'Inspector']] as const;
export function Sidebar() { const {activePanel,setActivePanel}=useEditorStore(); return <aside className="sidebar">{entries.map(([Icon,label])=>{const panel=label.toLowerCase() as EditorPanel;return <button className={activePanel===panel?'active':''} key={label} onClick={()=>setActivePanel(panel)}><Icon size={18}/><span>{label}</span></button>})}</aside>; }
