const fs = require('node:fs');
const path = require('node:path');
let logFile;
function write(level, message) {
  if (!logFile) return;
  try { fs.appendFileSync(logFile, `${new Date().toISOString()} [${level}] ${String(message).replace(/[\r\n]+/g,' ')}\n`, 'utf8'); } catch {}
}
function configure(app) {
  const directory = path.join(app.getPath('userData'), 'logs');
  fs.mkdirSync(directory, { recursive: true });
  logFile = path.join(directory, 'savanaedit.log');
  try { if (fs.statSync(logFile).size > 2 * 1024 * 1024) fs.renameSync(logFile, path.join(directory, 'savanaedit.previous.log')); } catch {}
  write('info', `SavanaEdit ${app.getVersion()} starting; packaged=${app.isPackaged}; platform=${process.platform}`);
  process.on('uncaughtException', error => { write('fatal', error?.stack || error); setImmediate(()=>process.exit(1)); });
  process.on('unhandledRejection', error => write('error', error?.stack || error));
}
function attach(window) {
  window.webContents.on('did-fail-load', (_event, code, description, url) => write('error', `Renderer load failed ${code}: ${description} (${url})`));
  window.webContents.on('render-process-gone', (_event, details) => write('fatal', `Renderer exited: ${details.reason} (${details.exitCode})`));
  window.webContents.on('console-message', details => { const level=Number(details.level);if(level>=2)write(level>=3?'error':'warn',`${details.message} (${details.sourceId}:${details.lineNumber})`); });
}
module.exports = { configure, attach, write };
