const { app, BrowserWindow, protocol, net, shell, dialog, ipcMain } = require('electron');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
if (!process.env.SAVANAEDIT_OPENAI_API_KEY && process.env.OPENAI_API_KEY) process.env.SAVANAEDIT_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { pathToFileURL } = require('node:url');
const { registerMediaIpc, resolveMedia, registerAsset, getItem, getItems } = require('./ipc/media.cjs');
const { registerAnalysisIpc } = require('./ipc/analysis.cjs');
const { registerPlannerIpc } = require('./ipc/planner.cjs');
const { registerRenderIpc } = require('./ipc/render.cjs');
const ffmpeg = require('./services/ffmpeg.cjs');
const settings = require('./services/settings.cjs'); const mediaEngine = require('./services/mediaEngine.cjs');
const appLogger = require('./services/appLogger.cjs');

protocol.registerSchemesAsPrivileged([{ scheme: 'savana-media', privileges: { secure: true, standard: true, stream: true, supportFetchAPI: true } }]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1100, minHeight: 700, backgroundColor: '#0b0d10',
    titleBarStyle: 'hidden', titleBarOverlay: { color: '#111318', symbolColor: '#aeb4c0', height: 42 },
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  appLogger.attach(win);
  if (!app.isPackaged) win.loadURL('http://localhost:5174');
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(async () => {
  appLogger.configure(app);
  ffmpeg.configure(app);
  mediaEngine.setCustom(await settings.load(app));
  protocol.handle('savana-media', request => {
    const url = new URL(request.url); const kind = url.hostname; const id = decodeURIComponent(url.pathname.slice(1));
    if (!/^[a-z0-9-]{1,80}$/.test(id) || !['video','thumbnail','scene'].includes(kind)) return new Response('Not found', { status: 404 });
    const approvedPath = resolveMedia(kind, id); if (!approvedPath) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(approvedPath).toString());
  });
  registerMediaIpc();
  registerAnalysisIpc(app,getItem,getItems,registerAsset);
  registerPlannerIpc(app,getItems);
  registerRenderIpc(app,getItems);
  ipcMain.handle('app:open-link',async(_event,url)=>{const allowed=new Set(['https://github.com/tyeseman/SavanaEdit/blob/main/docs/HELP.md','https://github.com/tyeseman/SavanaEdit/blob/main/docs/SHORTCUTS.md','https://github.com/tyeseman/SavanaEdit/issues/new']);if(!allowed.has(url))throw new Error('URL is not approved.');await shell.openExternal(url)});
  ipcMain.handle('app:about',()=>dialog.showMessageBox({type:'info',title:'About SavanaEdit',message:'SavanaEdit',detail:`Version ${app.getVersion()}\nLocal-first AI-assisted desktop video editor.\nhttps://github.com/tyeseman/SavanaEdit`,buttons:['OK']}));
  ipcMain.handle('app:exit',()=>app.quit());
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
