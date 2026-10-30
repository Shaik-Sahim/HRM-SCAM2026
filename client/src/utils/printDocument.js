/**
 * Robust A4 Multi-Page Document Printing via Isolated Hidden Iframe
 * Guarantees zero blank/empty overflow pages in the middle or at the end.
 * Enforces strict 210mm x 295.5mm A4 boundaries with zero subpixel bleed.
 */
export function printDocument(element, title = 'Margey Document') {
  if (!element) {
    window.print();
    return;
  }

  // Remove any stale print frame from previous print invocations
  const existingFrame = document.getElementById('hrm-print-frame');
  if (existingFrame) {
    try {
      existingFrame.remove();
    } catch (e) {
      console.warn('Could not remove existing print iframe:', e);
    }
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'hrm-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '210mm';
  iframe.style.height = '297mm';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  // Extract all compiled stylesheet rules synchronously
  let inlinedStyles = '';
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (sheet.cssRules) {
          for (const rule of Array.from(sheet.cssRules)) {
            inlinedStyles += rule.cssText + '\n';
          }
        }
      } catch (e) {
        if (sheet.href) {
          inlinedStyles += `@import url("${sheet.href}");\n`;
        }
      }
    }
  } catch (e) {
    console.warn('Stylesheet extraction warning:', e);
  }

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
          ${inlinedStyles}

          /* Critical Print Reset to Eliminate Empty Overflow Pages */
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }

          *, *:before, *:after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }

          /* Overwrite any Tailwind sibling spacing (space-y-*) that adds margin between printable pages */
          .printable-area,
          .space-y-8,
          .space-y-6,
          .space-y-4,
          body {
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
          }

          .printable-area > *,
          .space-y-8 > :not([hidden]) ~ :not([hidden]),
          .space-y-6 > :not([hidden]) ~ :not([hidden]),
          body > * {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }

          /* Strict single-sheet per .printable-page */
          .printable-page {
            width: 210mm !important;
            max-width: 210mm !important;
            height: 295.5mm !important;
            max-height: 295.5mm !important;
            min-height: 295.5mm !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 8mm 16mm 8mm 16mm !important;
            page-break-before: auto !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            position: relative !important;
          }

          /* Prevent trailing blank page */
          .printable-page:last-child,
          .printable-page:last-of-type {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          table {
            border-collapse: collapse !important;
          }

          img {
            max-width: 100% !important;
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Allow images (like data URI logos and SVG stamps) and web fonts to complete layout paint
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Iframe print error, falling back to window.print():', e);
      window.print();
    }
  }, 450);
}
