const path = require('node:path');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const executable = name => process.platform === 'win32' ? `${name}.exe` : name;

module.exports = {
  appId: 'com.savanaedit.desktop',
  productName: 'SavanaEdit',
  asar: true,
  directories: { output: 'release' },
  files: ['dist/**/*', 'electron/**/*', 'package.json'],
  extraResources: [
    { from: path.resolve(ffmpegPath), to: `media-engine/${executable('ffmpeg')}` },
    { from: path.resolve(ffprobePath), to: `media-engine/${executable('ffprobe')}` }
  ],
  win: { target: ['nsis'], artifactName: 'SavanaEdit-${version}-Setup.${ext}' },
  mac: { target: ['dmg'], artifactName: 'SavanaEdit-${version}.${ext}' },
  linux: { target: ['AppImage'], artifactName: 'SavanaEdit-${version}.${ext}' },
  nsis: { oneClick: false, allowToChangeInstallationDirectory: true }
};
