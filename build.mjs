// Builds dist/bettereddit.user.js (userscript) and extension/ (Firefox add-on) from src/.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const version = pkg.version;
const REPO_RAW = 'https://raw.githubusercontent.com/afgonczol/bettereddit/main/dist/bettereddit.user.js';

const css = readFileSync('src/style.css', 'utf8');
const parts = readdirSync('src').filter((f) => f.endsWith('.js')).sort();
const body = parts.map((f) => `// ---- ${f} ----\n` + readFileSync('src/' + f, 'utf8')).join('\n');

const bundle = `(function () {
'use strict';
const VERSION = ${JSON.stringify(version)};
const CSS = ${JSON.stringify(css)};
${body}
})();
`;

const header = `// ==UserScript==
// @name         Bettereddit
// @namespace    https://github.com/afgonczol/bettereddit
// @version      ${version}
// @description  ${pkg.description}
// @match        *://*.reddit.com/*
// @match        *://reddit.com/*
// @run-at       document-start
// @grant        none
// @noframes
// @downloadURL  ${REPO_RAW}
// @updateURL    ${REPO_RAW}
// ==/UserScript==
`;

mkdirSync('dist', { recursive: true });
writeFileSync('dist/bettereddit.user.js', header + '\n' + bundle);

const manifest = {
  manifest_version: 2,
  name: 'Bettereddit',
  version,
  description: pkg.description,
  icons: { 48: 'icon.svg', 96: 'icon.svg', 128: 'icon.svg' },
  permissions: ['*://*.reddit.com/*', '*://reddit.com/*'],
  content_scripts: [{
    matches: ['*://*.reddit.com/*', '*://reddit.com/*'],
    js: ['bettereddit.js'],
    run_at: 'document_start',
    all_frames: false,
  }],
  browser_specific_settings: {
    gecko: {
      id: 'bettereddit@bettereddit.github.io',
      strict_min_version: '115.0',
      data_collection_permissions: { required: ['none'] },
    },
    gecko_android: { strict_min_version: '120.0' },
  },
};
mkdirSync('extension', { recursive: true });
writeFileSync('extension/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
writeFileSync('extension/bettereddit.js', bundle);

// unsigned package, ready to upload to addons.mozilla.org for signing
const zip = 'dist/bettereddit-extension.zip';
if (existsSync(zip)) rmSync(zip);
try {
  execFileSync('zip', ['-q', '-j', zip, 'extension/manifest.json', 'extension/bettereddit.js', 'extension/icon.svg']);
} catch (e) {
  console.warn('zip not available; skipped', zip);
}
console.log('Built Bettereddit', version, '→ dist/bettereddit.user.js, extension/');
