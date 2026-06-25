import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_COLOR = '#dc2626';
const DEFAULT_ACCENT = '#f97316';

export function parseBox(value) {
  const parts = parseNumberList(value, 4, 'box as x,y,width,height');
  const [x, y, width, height] = parts;
  if (width <= 0 || height <= 0) {
    throw new Error('Box width and height must be greater than 0.');
  }
  return { x, y, width, height };
}

export function parseCircle(value) {
  const [cx, cy, r] = parseNumberList(value, 3, 'circle as cx,cy,radius');
  if (r <= 0) {
    throw new Error('Circle radius must be greater than 0.');
  }
  return { cx, cy, r };
}

export function parseArrow(value) {
  const [x1, y1, x2, y2] = parseNumberList(value, 4, 'arrow as x1,y1,x2,y2');
  if (x1 === x2 && y1 === y2) {
    throw new Error('Arrow start and end must be different.');
  }
  return { x1, y1, x2, y2 };
}

function parseNumberList(value, expected, label) {
  const parts = String(value || '').split(',').map((part) => Number(part.trim()));
  if (parts.length !== expected || parts.some((part) => !Number.isFinite(part))) {
    throw new Error(`Expected ${label}.`);
  }
  return parts;
}

export async function annotateImage(options) {
  const input = options.input;
  if (!input) {
    throw new Error('annotate requires an input image path.');
  }

  const image = await readImageInfo(input);
  const output = options.output || defaultOutputPath(input);
  const color = options.color || DEFAULT_COLOR;
  const accent = options.accent || DEFAULT_ACCENT;
  const boxes = normalizeList(options.boxes).map(parseBox);
  const circles = normalizeList(options.circles).map(parseCircle);
  const arrows = normalizeList(options.arrows).map(parseArrow);
  const label = options.label ? String(options.label) : '';

  if (boxes.length + circles.length + arrows.length === 0 && !label) {
    throw new Error('annotate requires at least one box, circle, arrow, or label.');
  }

  const annotations = [];
  for (const box of boxes) {
    annotations.push(`<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="10" ry="10" fill="none" stroke="white" stroke-width="10" opacity="0.96"/>`);
    annotations.push(`<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="10" ry="10" fill="none" stroke="${escapeXml(color)}" stroke-width="5"/>`);
  }
  for (const circle of circles) {
    annotations.push(`<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="white" stroke-width="10" opacity="0.96"/>`);
    annotations.push(`<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="${escapeXml(color)}" stroke-width="5"/>`);
  }
  if (arrows.length) {
    annotations.push(`<defs><marker id="ve-arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth"><path d="M2,2 L10,6 L2,10 z" fill="${escapeXml(accent)}"/></marker></defs>`);
  }
  for (const arrow of arrows) {
    annotations.push(`<line x1="${arrow.x1}" y1="${arrow.y1}" x2="${arrow.x2}" y2="${arrow.y2}" stroke="white" stroke-width="10" stroke-linecap="round" opacity="0.96"/>`);
    annotations.push(`<line x1="${arrow.x1}" y1="${arrow.y1}" x2="${arrow.x2}" y2="${arrow.y2}" stroke="${escapeXml(accent)}" stroke-width="5" stroke-linecap="round" marker-end="url(#ve-arrow)"/>`);
  }
  if (label) {
    const anchor = labelAnchor(boxes, circles, arrows);
    annotations.push(`<g transform="translate(${anchor.x},${anchor.y})"><rect x="0" y="0" width="${Math.max(130, label.length * 7 + 20)}" height="30" rx="6" fill="${escapeXml(color)}"/><text x="10" y="20" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="700">${escapeXml(label)}</text></g>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${image.width}" height="${image.height}" viewBox="0 0 ${image.width} ${image.height}">\n  <image href="data:${image.mime};base64,${image.base64}" x="0" y="0" width="${image.width}" height="${image.height}"/>\n  ${annotations.join('\n  ')}\n</svg>\n`;
  await writeFile(output, svg);
  return { output, width: image.width, height: image.height };
}

function labelAnchor(boxes, circles, arrows) {
  if (boxes.length) {
    return { x: Math.max(0, boxes[0].x), y: Math.max(0, boxes[0].y - 38) };
  }
  if (circles.length) {
    return { x: Math.max(0, circles[0].cx - circles[0].r), y: Math.max(0, circles[0].cy - circles[0].r - 38) };
  }
  if (arrows.length) {
    return { x: Math.max(0, Math.min(arrows[0].x1, arrows[0].x2)), y: Math.max(0, Math.min(arrows[0].y1, arrows[0].y2) - 38) };
  }
  return { x: 12, y: 12 };
}

function normalizeList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function defaultOutputPath(input) {
  const parsed = path.parse(input);
  return path.join(parsed.dir, `${parsed.name}.annotated.svg`);
}

async function readImageInfo(file) {
  const buffer = await readFile(file);
  const ext = path.extname(file).toLowerCase();
  if (ext === '.svg') {
    const text = buffer.toString('utf8');
    const width = readSvgNumber(text, 'width') || readViewBox(text)?.width;
    const height = readSvgNumber(text, 'height') || readViewBox(text)?.height;
    if (!width || !height) {
      throw new Error('SVG input must include width/height or viewBox.');
    }
    return { width, height, mime: 'image/svg+xml', base64: buffer.toString('base64') };
  }
  if (isPng(buffer)) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), mime: 'image/png', base64: buffer.toString('base64') };
  }
  if (isJpeg(buffer)) {
    const dimensions = readJpegDimensions(buffer);
    return { ...dimensions, mime: 'image/jpeg', base64: buffer.toString('base64') };
  }
  throw new Error('Unsupported input image. Use SVG, PNG, or JPEG.');
}

function readSvgNumber(text, attr) {
  const match = text.match(new RegExp(`${attr}=["']([0-9.]+)(?:px)?["']`, 'i'));
  return match ? Number(match[1]) : null;
}

function readViewBox(text) {
  const match = text.match(/viewBox=["']\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)\s*["']/i);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}

function isPng(buffer) {
  return buffer.length > 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
}

function isJpeg(buffer) {
  return buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8;
}

function readJpegDimensions(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error('Could not read JPEG dimensions.');
}

export function generateGitHubComment(options) {
  const image = required(options.image, 'image');
  if (!isReachableUrl(image)) {
    throw new Error('GitHub comments require a reachable image URL, not a local file path.');
  }
  const source = required(options.source, 'source');
  const validation = required(options.validation, 'validation');
  const look = required(options.look, 'look');
  const alt = options.alt || 'Annotated evidence';

  return `Verified on the requested source.\n\nSource: ${source}\nValidation: ${validation}\n\nWhat to look at: ${look}\n\n![${alt}](${image})\n\nNote: the red/orange markers are screenshot annotations for review evidence only; they are not part of the product UI.\n`;
}

function required(value, name) {
  if (!value) throw new Error(`Missing required ${name}.`);
  return String(value);
}

function isReachableUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function captureUrl(options) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error('capture-url requires Playwright. Install it with: npm install -D playwright && npx playwright install chromium');
  }
  const url = required(options.url, 'url');
  const output = options.output || 'visual-evidence-capture.png';
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: Number(options.width || 1440), height: Number(options.height || 1000) } });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: output, fullPage: Boolean(options.fullPage) });
    return { output };
  } finally {
    await browser.close();
  }
}

export async function runCli(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;
  const args = parseArgs(rest);
  if (command === 'annotate') {
    const input = args._[0];
    const result = await annotateImage({
      input,
      output: args.output,
      boxes: args.box,
      circles: args.circle,
      arrows: args.arrow,
      label: args.label,
      color: args.color,
    });
    console.log(result.output);
    return result;
  }
  if (command === 'github-comment') {
    const markdown = generateGitHubComment(args);
    if (args.output) {
      await writeFile(args.output, markdown);
      console.log(args.output);
    } else {
      console.log(markdown);
    }
    return { markdown };
  }
  if (command === 'capture-url') {
    const [url] = args._;
    const result = await captureUrl({ ...args, url });
    console.log(result.output);
    return result;
  }
  printHelp();
  return { help: true };
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const key = token.slice(2);
    const value = argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[++index] : true;
    if (args[key]) {
      args[key] = Array.isArray(args[key]) ? [...args[key], value] : [args[key], value];
    } else {
      args[key] = value;
    }
  }
  return args;
}

function printHelp() {
  console.log(`visual-evidence\n\nCommands:\n  annotate <image> --box x,y,w,h --label text [--output file.svg]\n  capture-url <url> --output screenshot.png\n  github-comment --source URL --image URL --validation text --look text`);
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(`visual-evidence: ${error.message}`);
    process.exitCode = 1;
  });
}