/**
 * Build/serve öncesi çalışır. Aktif environment'daki setting'e göre
 * src/favicons/<dosya> dosyasını src/favicon.ico olarak kopyalar.
 * Kullanım: node scripts/copy-favicon.js [prod|dev]
 * - prod: environment.prod.ts kullanır (ng build için)
 * - dev:  environment.ts kullanır (ng serve için)
 */

const fs = require('fs');
const path = require('path');

const envArg = (process.argv[2] || 'dev').toLowerCase();
const isProd = envArg === 'prod';

const srcDir = path.join(__dirname, '..', 'src');
const envPath = path.join(srcDir, 'environments', isProd ? 'environment.prod.ts' : 'environment.ts');
const faviconsDir = path.join(srcDir, 'favicons');
const outFavicon = path.join(srcDir, 'favicon.ico');

function extractSetting(content) {
  const m = content.match(/setting:\s*['"]([^'"]+)['"]/);
  return m ? m[1].trim() : null;
}

function extractFavicons(content) {
  const map = {};
  const blockMatch = content.match(/favicons:\s*\{([\s\S]*?)\}\s*,/);
  if (!blockMatch) return map;
  const block = blockMatch[1];
  const pairs = block.matchAll(/(\w+):\s*['"]([^'"]+)['"]/g);
  for (const p of pairs) {
    map[p[1]] = p[2];
  }
  return map;
}

function main() {
  if (!fs.existsSync(envPath)) {
    console.warn('copy-favicon: env dosyası bulunamadı:', envPath);
    process.exit(0);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const setting = extractSetting(content);
  const favicons = extractFavicons(content);

  if (!setting) {
    console.warn('copy-favicon: setting bulunamadı');
    process.exit(0);
  }

  const faviconFile = favicons[setting] || 'default.ico';
  const sourcePath = path.join(faviconsDir, faviconFile);

  if (!fs.existsSync(faviconsDir)) {
    fs.mkdirSync(faviconsDir, { recursive: true });
    console.warn('copy-favicon: src/favicons klasörü oluşturuldu. Lütfen favicon dosyalarını ekleyin.');
    process.exit(0);
  }

  let source = sourcePath;
  if (!fs.existsSync(source)) {
    const defaultPath = path.join(faviconsDir, 'default.ico');
    if (fs.existsSync(defaultPath)) {
      source = defaultPath;
      console.warn('copy-favicon: Ayara özel favicon yok, default.ico kullanılıyor (setting:', setting + ')');
    } else {
      console.warn('copy-favicon: Favicon bulunamadı:', sourcePath, '- Lütfen src/favicons/ altına ekleyin.');
      process.exit(0);
    }
  }

  fs.copyFileSync(source, outFavicon);
  console.log('copy-favicon: Favicon kopyalandı:', path.basename(source), '-> favicon.ico (setting:', setting + ')');
}

main();
