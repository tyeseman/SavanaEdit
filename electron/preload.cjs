const {contextBridge,ipcRenderer,webUtils}=require('electron');
contextBridge.exposeInMainWorld('editorAPI',{
 importMedia:()=>ipcRenderer.invoke('media:import-files'),importFolder:()=>ipcRenderer.invoke('media:import-folder'),importPaths:paths=>ipcRenderer.invoke('media:import-paths',paths),
 getPathForFile:file=>webUtils.getPathForFile(file),getMediaUrl:(id,kind='video')=>`savana-media://${kind}/${encodeURIComponent(id)}`,
 getMediaEngineStatus:()=>ipcRenderer.invoke('media:engine-status'),loadProject:()=>ipcRenderer.invoke('project:load'),openProject:()=>ipcRenderer.invoke('project:open'),saveProject:project=>ipcRenderer.invoke('project:save',project),saveProjectAs:project=>ipcRenderer.invoke('project:save-as',project),
 startAnalysis:ids=>ipcRenderer.invoke('analysis:start',ids),analyzeAll:()=>ipcRenderer.invoke('analysis:all'),cancelAnalysis:id=>ipcRenderer.invoke('analysis:cancel',id),getAnalysis:id=>ipcRenderer.invoke('analysis:get',id),
 getSettings:()=>ipcRenderer.invoke('settings:get'),saveSettings:value=>ipcRenderer.invoke('settings:save',value),browseEngine:kind=>ipcRenderer.invoke('settings:browse',kind),
 onAnalysisProgress:callback=>{const listener=(_event,value)=>callback(value);ipcRenderer.on('analysis:progress',listener);return()=>ipcRenderer.removeListener('analysis:progress',listener)},
 generateEdit:input=>ipcRenderer.invoke('planner:generate',input),validateEditPlan:plan=>ipcRenderer.invoke('planner:validate',plan),
 startExport:request=>ipcRenderer.invoke('export:start',request),cancelExport:()=>ipcRenderer.invoke('export:cancel'),onExportProgress:callback=>{const listener=(_event,value)=>callback(value);ipcRenderer.on('export:progress',listener);return()=>ipcRenderer.removeListener('export:progress',listener)},
 openExternal:url=>ipcRenderer.invoke('app:open-link',url),showAbout:()=>ipcRenderer.invoke('app:about'),exitApp:()=>ipcRenderer.invoke('app:exit'),
 onImportProgress:callback=>{const listener=(_event,value)=>callback(value);ipcRenderer.on('media:progress',listener);return()=>ipcRenderer.removeListener('media:progress',listener)}
});
