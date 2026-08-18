export type Interpolation = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
export interface Keyframe<T = number> { id: string; time: number; value: T; interpolation: Interpolation }
export interface EffectInstance { id: string; effectId: string; enabled: boolean; parameters: Record<string, number | string | boolean>; start: number; duration: number; keyframes: Record<string, Keyframe[]> }
export interface TransformSettings { positionX: number; positionY: number; scale: number; rotation: number; anchorX: number; anchorY: number; opacity: number }
export interface TransitionInstance { id: string; transitionId: string; duration: number; parameters: Record<string, number | string | boolean> }
export type BlendMode = 'normal'|'screen'|'plus-lighter'|'multiply'|'overlay'|'soft-light'|'hard-light'|'lighten'|'darken'|'color-dodge'|'color-burn'|'difference';
export interface OverlayItem { id: string; overlayId: string; timelineStart: number; duration: number; parameters: Record<string, number | string | boolean>; blendMode: BlendMode; assetPath?: string }
export interface CaptionItem { id: string; presetId: string; text: string; timelineStart: number; duration: number; words?: { text: string; start: number; end: number }[] }
export interface TitleItem { id: string; presetId: string; text: string; subtitle?: string; timelineStart: number; duration: number; parameters: Record<string, number | string | boolean> }
export interface AudioSettings { volume: number; muted: boolean; fadeIn: number; fadeOut: number; gainDb: number; pan: number; normalize: boolean; ducking?: { enabled: boolean; amountDb: number; attack: number; release: number } }
export interface CreativeState { overlays: OverlayItem[]; captions: CaptionItem[]; titles: TitleItem[]; favoriteIds: string[]; recentIds: string[]; previewQuality: 'draft'|'preview'|'full' }
export interface RegistryParameter { id: string; label: string; type: 'number'|'color'|'select'|'boolean'; defaultValue: number|string|boolean; min?: number; max?: number; step?: number; options?: string[] }
export interface RegistryItem { id: string; name: string; category: string; description: string; parameters: RegistryParameter[]; compatibility: string[] }
export interface CreativeAssetManifest { name: string; type: 'overlay-pack'|'audio-pack'|'transition-pack'|'mixed'; version: number; assets: { id: string; name: string; type: string; file: string; category?: string }[] }
export interface ExportSettings { format: 'mp4-h264'|'mp4-h265'|'webm'; width: number; height: number; fps: number; quality: number; audioBitrate: number; destination: string; filename: string }
export interface ExportProgress { phase: 'validating'|'bundling'|'rendering'|'encoding'|'validating-output'|'complete'|'cancelled'|'error'; progress: number; message: string; elapsedMs: number; outputPath?: string }
