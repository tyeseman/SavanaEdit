import { useEffect } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useEditStore } from '../../stores/editStore';
import { useCreativeStore } from '../../stores/creativeStore';
import type { PersistedProject } from '../../types/media';

export function ProjectShortcuts() {
  useEffect(() => {
    const snapshot = (): PersistedProject => {
      const editor = useEditorStore.getState(), timeline = useTimelineStore.getState(), edit = useEditStore.getState(), creative = useCreativeStore.getState();
      return { projectName: editor.projectName, mediaItems: editor.mediaItems, selectedMediaId: editor.selectedMediaId, timeline: timeline.timeline, projectFormat: edit.format, aiEditHistory: edit.history, creative: { overlays: creative.overlays, captions: creative.captions, titles: creative.titles, favoriteIds: creative.favoriteIds, recentIds: creative.recentIds, previewQuality: creative.previewQuality } };
    };
    const hydrate = (project: PersistedProject) => {
      useEditorStore.getState().hydrate(project);
      useTimelineStore.getState().hydrate(project.timeline);
      useEditStore.getState().hydrate(project.projectFormat, project.aiEditHistory);
      useCreativeStore.getState().hydrate(project.creative);
    };
    const key = (event: KeyboardEvent) => {
      if (!event.ctrlKey) return;
      const value = event.key.toLowerCase();
      if (value === 's') { event.preventDefault(); event.shiftKey ? void window.editorAPI.saveProjectAs(snapshot()) : void window.editorAPI.saveProject(snapshot()); }
      else if (value === 'o') { event.preventDefault(); void window.editorAPI.openProject().then(project => project && hydrate(project)); }
      else if (value === 'n') { event.preventDefault(); if (confirm('Start a new project?')) { useEditorStore.getState().clearMedia(); useTimelineStore.getState().hydrate(); useCreativeStore.getState().hydrate(); } }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  return null;
}
