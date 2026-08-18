import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { SavanaComposition } from './SavanaComposition';
import type { SavanaCompositionProps } from './compositionAdapter';
const empty:SavanaCompositionProps={width:1920,height:1080,fps:30,durationInFrames:1,clips:[],creative:{overlays:[],captions:[],titles:[],favoriteIds:[],recentIds:[],previewQuality:'preview'},quality:'preview'};
const RenderComponent=SavanaComposition as unknown as React.FC<Record<string,unknown>>;
const Root=()=> <Composition id="SavanaEdit" component={RenderComponent} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={empty as unknown as Record<string,unknown>} calculateMetadata={({props})=>{const value=props as unknown as SavanaCompositionProps;return{durationInFrames:value.durationInFrames,fps:value.fps,width:value.width,height:value.height}}}/>;
registerRoot(Root);
