#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.resolve(process.cwd(), 'allure-report');
const INDEX_HTML = path.join(REPORT_DIR, 'index.html');
const OUT_FILE = path.join(process.cwd(), 'allure-report-single.html');

function mimeFor(ext) {
  switch (ext.toLowerCase()) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.css': return 'text/css';
    case '.js': return 'application/javascript';
    case '.woff2': return 'font/woff2';
    case '.woff': return 'font/woff';
    case '.ttf': return 'font/ttf';
    default: return 'application/octet-stream';
  }
}

if (!fs.existsSync(INDEX_HTML)) {
  console.error('Could not find generated Allure report at', INDEX_HTML);
  process.exit(1);
}

let html = fs.readFileSync(INDEX_HTML, 'utf8');

// inline CSS <link rel="stylesheet" href="..."></link>
html = html.replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi, (m, href) => {
  const file = path.join(REPORT_DIR, href);
  if (!fs.existsSync(file)) return m;
  try {
    const css = fs.readFileSync(file, 'utf8');
    // inline url(...) assets
    const inlinedCss = css.replace(/url\(([^)]+)\)/g, (m2, url) => {
      const clean = url.replace(/["'\s]/g, '');
      const asset = path.join(path.dirname(file), clean);
      if (!fs.existsSync(asset)) return m2;
      const ext = path.extname(asset);
      const mime = mimeFor(ext);
      const data = fs.readFileSync(asset);
      return `url("data:${mime};base64,${data.toString('base64')}")`;
    });
    return `<style>${inlinedCss}</style>`;
  } catch (err) {
    return m;
  }
});

// inline JS <script src="..."></script>
html = html.replace(/<script[^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi, (m, src) => {
  const file = path.join(REPORT_DIR, src);
  if (!fs.existsSync(file)) return m;
  try {
    const js = fs.readFileSync(file, 'utf8');
    return `<script>${js}</script>`;
  } catch (err) {
    return m;
  }
});

// inline images <img src="..."> and <image xlink:href="..."> inside svg
html = html.replace(/(<img[^>]*src=["'])([^"']+)(["'][^>]*>)/gi, (m, a, src, b) => {
  const file = path.join(REPORT_DIR, src);
  if (!fs.existsSync(file)) return m;
  try {
    const data = fs.readFileSync(file);
    const ext = path.extname(file);
    const mime = mimeFor(ext);
    return `${a}data:${mime};base64,${data.toString('base64')}${b}`;
  } catch (err) {
    return m;
  }
});

// write output
fs.writeFileSync(OUT_FILE, html, 'utf8');
console.log('Generated single-file Allure report at', OUT_FILE);
