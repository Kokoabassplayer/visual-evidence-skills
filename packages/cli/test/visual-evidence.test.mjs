import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  annotateImage,
  generateGitHubComment,
  parseBox,
} from '../src/visual-evidence.mjs';

async function createSampleSvg(dir) {
  const file = path.join(dir, 'sample.svg');
  await writeFile(file, '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#f8fafc"/><text x="24" y="88">Current Ratio</text></svg>');
  return file;
}

describe('visual-evidence annotate', () => {
  it('wraps an image in an annotated SVG with box, circle, arrow, and label', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 've-cli-'));
    const source = await createSampleSvg(dir);
    const output = path.join(dir, 'sample.annotated.svg');

    const result = await annotateImage({
      input: source,
      output,
      boxes: ['20,40,180,48'],
      circles: ['260,88,28'],
      arrows: ['210,70,246,84'],
      label: 'Formula area',
    });

    assert.equal(result.output, output);
    assert.equal(result.width, 320);
    assert.equal(result.height, 180);

    const svg = await readFile(output, 'utf8');
    assert.match(svg, /<rect/);
    assert.match(svg, /<circle/);
    assert.match(svg, /<line/);
    assert.match(svg, /Formula area/);
    assert.match(svg, /data:image\/svg\+xml;base64,/);
  });

  it('rejects invalid box coordinates with a clear error', () => {
    assert.throws(() => parseBox('10,20,0,40'), /Box width and height must be greater than 0/);
    assert.throws(() => parseBox('10,20,30'), /Expected box as x,y,width,height/);
  });
});

describe('visual-evidence github-comment', () => {
  it('generates reviewer-ready markdown for reachable image URLs', () => {
    const markdown = generateGitHubComment({
      source: 'https://preview.example.test/finance',
      image: 'https://example.test/evidence.png',
      validation: 'Preview smoke test passed.',
      look: 'The marked formula uses the updated site typography.',
      alt: 'Annotated formula evidence',
    });

    assert.match(markdown, /Source: https:\/\/preview\.example\.test\/finance/);
    assert.match(markdown, /Preview smoke test passed\./);
    assert.match(markdown, /The marked formula uses the updated site typography\./);
    assert.match(markdown, /!\[Annotated formula evidence\]\(https:\/\/example\.test\/evidence\.png\)/);
  });

  it('refuses local image paths in GitHub markdown', () => {
    assert.throws(() => generateGitHubComment({
      source: 'https://preview.example.test/finance',
      image: 'C:\\tmp\\evidence.png',
      validation: 'Preview smoke test passed.',
      look: 'Marked evidence.',
    }), /GitHub comments require a reachable image URL/);
  });
});