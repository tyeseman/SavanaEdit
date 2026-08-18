const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const run = promisify(execFile);
const engine = require('../electron/services/mediaEngine.cjs');
const media = require('../electron/services/ffmpeg.cjs');
const fakeApp = { isPackaged: false };

test('bundled FFmpeg and FFprobe resolve and execute', async () => {
  engine.setCustom({});
  const status = await engine.status(fakeApp);
  assert.equal(status.ffmpegAvailable, true);
  assert.equal(status.ffprobeAvailable, true);
  assert.equal(status.ffmpegSource, 'bundled');
  assert.equal(status.ffprobeSource, 'bundled');
  assert.match(status.ffmpegVersion, /^ffmpeg version/i);
  assert.match(status.ffprobeVersion, /^ffprobe version/i);
});

test('bundled engine supports probe, thumbnail, silence, scenes, audio extraction, and waveform', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'savana-media-test-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const ffmpeg = await engine.resolve(fakeApp, 'ffmpeg');
  const source = path.join(dir, 'fixture.mp4');
  await run(ffmpeg, ['-y','-f','lavfi','-i','testsrc2=size=320x180:rate=24:duration=2','-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=2','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',source], { timeout: 30000, windowsHide: true });
  media.configure(fakeApp);
  const info = await media.analyze(source);
  assert.equal(info.width, 320); assert.equal(info.height, 180); assert.equal(info.hasAudio, true);
  assert.equal(await fs.stat(await media.thumbnail(source, info.duration, dir, info.id)).then(x=>x.size>0), true);
  assert.equal(await fs.stat(await media.extractAudio(source, path.join(dir,'audio.wav'))).then(x=>x.size>0), true);
  const audio = await media.analyzeAudio(source); assert.equal(Array.isArray(audio.silenceRanges), true);
  const scenes = await media.detectScenes(source, info.duration); assert.equal(scenes[0], 0);
  const wave = await media.waveform(source, path.join(dir,'wave.json'), info.id, info.duration); assert.equal(wave.sampleCount > 0, true);
});
