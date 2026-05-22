'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const srcDir = path.join(__dirname, '..', 'server', 'src');
const destDir = path.join(__dirname, '..', 'dist', 'server');

async function copyServerAssets() {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'index.js') {
      continue;
    }
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    await fs.cp(srcPath, destPath, { recursive: true, force: true });
  }
}

copyServerAssets().catch((err) => {
  console.error('[copy-server-assets]', err);
  process.exit(1);
});
