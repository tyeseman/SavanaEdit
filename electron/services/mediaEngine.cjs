const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const run = promisify(execFile);
let custom = {};

function staticPackagePath(name) {
  try { return name === 'ffmpeg' ? require('ffmpeg-static') : require('ffprobe-static').path; }
  catch { return undefined; }
}

function bundledPath(app, name) {
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  return app.isPackaged ? path.join(process.resourcesPath, 'media-engine', exe) : staticPackagePath(name);
}

function candidates(app, name) {
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  const envName = name === 'ffmpeg' ? 'SAVANAEDIT_FFMPEG_PATH' : 'SAVANAEDIT_FFPROBE_PATH';
  const common = process.platform === 'win32'
    ? [`C:\\ffmpeg\\bin\\${exe}`, `C:\\Program Files\\ffmpeg\\bin\\${exe}`]
    : process.platform === 'darwin'
      ? [`/opt/homebrew/bin/${name}`, `/usr/local/bin/${name}`]
      : [`/usr/local/bin/${name}`, `/usr/bin/${name}`, `/snap/bin/${name}`];
  return [
    { value: custom[name], source: 'custom' },
    { value: process.env[envName], source: 'environment' },
    { value: bundledPath(app, name), source: 'bundled' },
    { value: name, source: 'system-path' },
    ...common.map(value => ({ value, source: 'common-location' }))
  ].filter(entry => entry.value);
}

async function detectOne(app, name) {
  const failures = [];
  for (const entry of candidates(app, name)) {
    if (entry.value !== name) {
      try { await fs.access(entry.value); }
      catch (error) { failures.push(`${entry.source}: file not accessible`); continue; }
    }
    try {
      const { stdout, stderr } = await run(entry.value, ['-version'], { timeout: 8000, windowsHide: true, maxBuffer: 1024 * 1024 });
      const version = `${stdout || stderr}`.split(/\r?\n/)[0].trim();
      if (!version) throw new Error('no version output');
      return { available: true, path: entry.value, version, source: entry.source };
    } catch (error) {
      failures.push(`${entry.source}: ${error.code || error.message || 'execution failed'}`);
    }
  }
  return { available: false, source: 'not-found', error: failures.join('; ') || `${name} was not found` };
}

async function status(app) {
  const [ffmpeg, ffprobe] = await Promise.all([detectOne(app, 'ffmpeg'), detectOne(app, 'ffprobe')]);
  return { ffmpegAvailable: ffmpeg.available, ffprobeAvailable: ffprobe.available, ffmpegPath: ffmpeg.path, ffprobePath: ffprobe.path, ffmpegVersion: ffmpeg.version, ffprobeVersion: ffprobe.version, ffmpegSource: ffmpeg.source, ffprobeSource: ffprobe.source, ffmpegError: ffmpeg.error, ffprobeError: ffprobe.error, source: ffmpeg.source === ffprobe.source ? ffmpeg.source : 'mixed' };
}

async function resolve(app, name) {
  const found = await detectOne(app, name);
  if (!found.available) throw new Error(`${name} is unavailable. ${found.error || 'Configure an advanced override in Preferences.'}`);
  return found.path;
}
function setCustom(next) { custom = { ffmpeg: next?.ffmpegPath || undefined, ffprobe: next?.ffprobePath || undefined }; }
function getCustom() { return { ffmpegPath: custom.ffmpeg, ffprobePath: custom.ffprobe }; }
module.exports = { status, resolve, setCustom, getCustom, candidates };
