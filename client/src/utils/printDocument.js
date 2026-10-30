/**
 * Robust A4 Document Printing via Hidden Iframe
 * Prevents pop-up blockers, modal scroll duplication, and unstyled canvas glitches.
 */
export function printDocument(element, title = 'Profuse Document') {
  if (!element) {
    window.print();
    return;
  }

  let iframe = document.getElementById('hrm-print-frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
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
  }

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
        // Handle cross-origin styles
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
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
          ${inlinedStyles}
          
          /* Hardcoded Print Overrides */
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            width: 210mm !important;
          }
          .printable-page {
            width: 210mm !important;
            height: 296mm !important;
            max-height: 296mm !important;
            min-height: 296mm !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 12mm 18mm 10mm 18mm !important;
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
          }
          .printable-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          table {
            border-collapse: collapse !important;
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Iframe print error, falling back:', e);
      window.print();
    }
  }, 450);
}
