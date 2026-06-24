---
name: visual-evidence-annotations
description: "Use when the user asks for screenshot-based visual evidence: capture a screen, webpage, app, document, dashboard, or supplied image and mark the exact area with circles, boxes, arrows, pins, short labels, or callouts. Triggers include capture and circle, visual evidence, mark this, highlight this, pinpoint this, and Thai requests meaning cap-cap-wong-wong."
---

# Visual Evidence Annotations

## Overview

Create clear screenshot evidence by capturing the relevant visual source and marking the exact area the reviewer should notice. The Thai shorthand cap-cap-wong-wong means this practical screenshot-plus-callout result, not a ticketing or PR workflow.

## Core Rules

- Use the exact source the user cares about: live page, preview site, production page, app window, document page, or supplied image.
- Preserve enough surrounding context so a reviewer can tell where the marked area is.
- Use the simplest visible callout that proves the point: circle, rounded box, arrow, pin, or very short label.
- Keep markings high contrast, usually red or orange, and readable at normal zoom.
- Do not add ticketing, review, approval, commit, issue, or PR workflow steps as part of this skill.
- Do not add marker UI into product code; use temporary browser overlays or annotate a copied image file.
- Open or inspect the final image before saying it is ready.

## Steps

1. Confirm the source and target.
   - Identify what must be marked and where it appears.
   - If multiple areas match and guessing would be risky, ask which one.

2. Capture the image.
   - For a webpage or app, use Playwright, browser tooling, or the available screenshot tool.
   - For a supplied screenshot, duplicate it and annotate the copy.
   - For a PDF or slide, render the relevant page to an image before marking it.

3. Add the visual annotation.
   - Use a circle for small or obvious targets.
   - Use a box for text blocks, rows, cards, tables, or wide regions.
   - Use an arrow or pin when the target needs directional emphasis.
   - Use a short label only when the mark alone would be ambiguous.
   - Crop only when it improves readability and still leaves orientation context.

4. Verify the output.
   - Check that the file opens.
   - Check that the target is correct, visible, and readable.
   - Re-capture if the image is blurry, stale, too tightly cropped, or the annotation covers the evidence.

5. Return the result.
   - Provide the final image path or embedded image.
   - Include the source URL/file/page only when useful for traceability.
   - Keep the explanation to one sentence unless the user asks for more.

## Browser Annotation Pattern

Use this only for temporary screenshot overlays in the browser. The annotation must not become application code.

```javascript
async function markTarget(page, locator, options = {}) {
  const color = options.color || '#dc2626';
  const padding = options.padding ?? 8;
  const shape = options.shape || 'box';
  const label = options.label || '';
  const box = await locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      x: r.left + window.scrollX,
      y: r.top + window.scrollY,
      width: r.width,
      height: r.height,
    };
  });

  await page.evaluate(({ box, color, padding, shape, label }) => {
    const marker = document.createElement('div');
    marker.className = 'codex-visual-evidence-marker';
    Object.assign(marker.style, {
      position: 'absolute',
      left: `${Math.max(0, box.x - padding)}px`,
      top: `${Math.max(0, box.y - padding)}px`,
      width: `${box.width + padding * 2}px`,
      height: `${box.height + padding * 2}px`,
      border: `4px solid ${color}`,
      borderRadius: shape === 'circle' ? '999px' : '10px',
      boxShadow: '0 0 0 3px rgba(255,255,255,.95)',
      pointerEvents: 'none',
      zIndex: '2147483646',
    });

    if (label) {
      const tag = document.createElement('div');
      tag.textContent = label;
      Object.assign(tag.style, {
        position: 'absolute',
        left: '0',
        top: '-34px',
        maxWidth: '360px',
        padding: '4px 8px',
        background: color,
        color: '#fff',
        font: '700 13px/1.3 Arial, sans-serif',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,.25)',
        whiteSpace: 'normal',
      });
      marker.appendChild(tag);
    }

    document.body.appendChild(marker);
  }, { box, color, padding, shape, label });
}

async function clearVisualEvidenceMarkers(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.codex-visual-evidence-marker').forEach((el) => el.remove());
  });
}
```

Example:

```javascript
await page.goto(sourceUrl, { waitUntil: 'networkidle' });
await markTarget(page, page.getByText('Current Ratio', { exact: true }), {
  shape: 'box',
  label: 'Formula font should match site text',
});
await page.screenshot({ path: 'current-ratio-formula-marked.png', fullPage: true });
await clearVisualEvidenceMarkers(page);
```

## Quick Checklist

- Correct source
- Correct target
- Clear circle, box, arrow, pin, or short label
- Enough surrounding context
- No hidden or covered evidence
- Final image opens successfully