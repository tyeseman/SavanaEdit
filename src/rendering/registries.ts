import type { RegistryItem } from '../types/creative';
const number=(id:string,label:string,value:number,min:number,max:number,step=.01)=>({id,label,type:'number' as const,defaultValue:value,min,max,step});
const color=(id:string,label:string,value:string)=>({id,label,type:'color' as const,defaultValue:value});
export const TransitionRegistry:RegistryItem[]=[
 {id:'cut',name:'Cut',category:'Essential',description:'Immediate edit with no overlap.',parameters:[],compatibility:['video']},
 {id:'dip-black',name:'Dip to Black',category:'Essential',description:'Fade through black.',parameters:[number('depth','Depth',1,0,1)],compatibility:['video']},
 {id:'dip-white',name:'Dip to White',category:'Essential',description:'Flash the outgoing frame to white.',parameters:[number('strength','Strength',1,0,1)],compatibility:['video']},
 ...['left','right','up','down'].map(direction=>({id:`wipe-${direction}`,name:`Wipe ${direction[0].toUpperCase()+direction.slice(1)}`,category:'Wipe',description:`Directional ${direction} edge wipe.`,parameters:[number('softness','Softness',0,0,1)],compatibility:['video']})),
 ...['left','right','up','down'].map(direction=>({id:`push-${direction}`,name:`Push ${direction[0].toUpperCase()+direction.slice(1)}`,category:'Slide',description:`Move the outgoing frame ${direction}.`,parameters:[number('distance','Distance',1,.1,1)],compatibility:['video']})),
 {id:'zoom-in',name:'Zoom In',category:'Zoom',description:'Scale into the outgoing frame.',parameters:[number('strength','Strength',.25,0,1)],compatibility:['video']},
 {id:'zoom-out',name:'Zoom Out',category:'Zoom',description:'Scale away from the outgoing frame.',parameters:[number('strength','Strength',.25,0,1)],compatibility:['video']},
 {id:'zoom-blur',name:'Zoom Blur',category:'Zoom',description:'Short scale and blur bridge.',parameters:[number('strength','Strength',.5,0,1)],compatibility:['video']},
 {id:'spin',name:'Spin',category:'Motion',description:'Rotate and shrink the outgoing frame.',parameters:[number('turns','Turns',.5,0,2,.1)],compatibility:['video']},
 {id:'whip-left',name:'Whip Left',category:'Motion',description:'Fast leftward motion with blur.',parameters:[number('strength','Strength',.7,0,1)],compatibility:['video']},
 {id:'whip-right',name:'Whip Right',category:'Motion',description:'Fast rightward motion with blur.',parameters:[number('strength','Strength',.7,0,1)],compatibility:['video']},
 {id:'iris',name:'Iris Close',category:'Wipe',description:'Circular close to black.',parameters:[number('softness','Softness',0,0,1)],compatibility:['video']},
 {id:'glitch-cut',name:'Glitch Cut',category:'Stylized',description:'Brief jitter and color distortion.',parameters:[number('strength','Strength',.6,0,1)],compatibility:['video']},
];
export const EffectRegistry:RegistryItem[]=[
 {id:'exposure',name:'Exposure',category:'Color',description:'Adjust overall exposure.',parameters:[number('amount','Stops',0,-3,3,.1)],compatibility:['video','image']},
 {id:'contrast',name:'Contrast',category:'Color',description:'Expand or compress tonal contrast.',parameters:[number('amount','Amount',1,0,2)],compatibility:['video','image']},
 {id:'saturation',name:'Saturation',category:'Color',description:'Adjust color intensity.',parameters:[number('amount','Amount',1,0,2)],compatibility:['video','image']},
 {id:'brightness',name:'Brightness',category:'Color',description:'Adjust image brightness.',parameters:[number('amount','Amount',1,0,2)],compatibility:['video','image']},
 {id:'hue-rotate',name:'Hue Rotate',category:'Color',description:'Rotate colors around the hue wheel.',parameters:[number('degrees','Degrees',0,-180,180,1)],compatibility:['video','image']},
 {id:'invert',name:'Invert',category:'Color',description:'Invert image colors.',parameters:[number('amount','Amount',1,0,1)],compatibility:['video','image']},
 {id:'warmth',name:'Warmth',category:'Color',description:'Add a warm amber treatment.',parameters:[number('amount','Amount',.4,0,1)],compatibility:['video','image']},
 {id:'monochrome',name:'Monochrome',category:'Color',description:'Remove color.',parameters:[number('amount','Amount',1,0,1)],compatibility:['video','image']},
 {id:'sepia',name:'Sepia',category:'Color',description:'Warm archival tone.',parameters:[number('amount','Amount',.7,0,1)],compatibility:['video','image']},
 {id:'gaussian-blur',name:'Gaussian Blur',category:'Blur',description:'Even image blur.',parameters:[number('radius','Radius',4,0,40,.5)],compatibility:['video','image']},
 {id:'glow',name:'Glow',category:'Stylization',description:'Bright soft halo.',parameters:[number('amount','Amount',.3,0,1)],compatibility:['video','image']},
 {id:'soft-focus',name:'Soft Focus',category:'Blur',description:'Gentle blur and lifted exposure.',parameters:[number('amount','Amount',.3,0,1)],compatibility:['video','image']},
 {id:'fade',name:'Fade',category:'Utility',description:'Adjust clip transparency.',parameters:[number('amount','Opacity',1,0,1)],compatibility:['video','image']},
];
export const OverlayRegistry:RegistryItem[]=[
 ...[['light-leak-warm','Warm Orange Leak','#ff6a24'],['light-leak-red','Red Film Leak','#e52a22'],['light-leak-gold','Gold Leak','#ffc34e'],['light-leak-blue','Blue Leak','#298cff'],['light-leak-purple','Purple Leak','#a145ff'],['light-leak-edge','Edge Leak','#ff8b3d'],['light-leak-double','Double Leak','#ff416c'],['light-leak-cinematic','Slow Cinematic Leak','#f5a35c']].map(([id,name,tint])=>({id,name,category:'Light Leaks',description:'Procedural animated light field with distinct motion and falloff.',parameters:[number('intensity','Intensity',.55,0,1),number('speed','Speed',1,.1,5,.1),number('softness','Softness',.7,0,1),color('tint','Tint',tint)],compatibility:['composition']})),
 {id:'vignette',name:'Vignette',category:'Utility',description:'Soft edge darkening.',parameters:[number('intensity','Intensity',.35,0,1)],compatibility:['composition']},
 {id:'letterbox',name:'Letterbox',category:'Utility',description:'Cinematic matte bars.',parameters:[number('size','Bar Size',8,0,25,.5)],compatibility:['composition']},
 {id:'grain-overlay',name:'Grain',category:'Film',description:'Animated procedural monochrome grain.',parameters:[number('intensity','Intensity',.15,0,.7)],compatibility:['composition']},
];
export const CaptionPresetRegistry:RegistryItem[]=['Clean','Boxed'].map(name=>({id:`caption-${name.toLowerCase()}`,name,category:'Captions',description:`${name} readable caption treatment.`,parameters:[number('fontSize','Font Size',48,16,120,1),color('color','Color','#ffffff')],compatibility:['caption']}));
export const TitlePresetRegistry:RegistryItem[]=[{id:'title-basic-title',name:'Basic Title',category:'Titles',description:'Centered editable title.',parameters:[number('fontSize','Font Size',72,20,180,1),color('color','Color','#ffffff')],compatibility:['title']}];
export const registries={transitions:TransitionRegistry,effects:EffectRegistry,overlays:OverlayRegistry,captions:CaptionPresetRegistry,titles:TitlePresetRegistry};
export const registryItem=(id:string)=>Object.values(registries).flat().find(item=>item.id===id);
