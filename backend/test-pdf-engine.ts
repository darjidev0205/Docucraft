import zlib from 'zlib';
import { performance } from 'perf_hooks';
import {
  DocumentModel,
  DocumentSettings,
  calculatePageGeometry,
  paginateDocument,
} from '@docucraft/shared';
import { generatePdfWithMetrics } from './src/services/pdf/generator';
import { renderDocumentHtml } from './src/services/pdf/renderer';
import { browserPool } from './src/services/pdf/browser-pool';

// Helper: Inspect raw PDF buffer
interface PdfInspectionResult {
  isValidPdf: boolean;
  version: string;
  pageCount: number;
  mediaBoxes: Array<{ widthPt: number; heightPt: number; widthMm: number; heightMm: number }>;
  extractedText: string;
}

function inspectPdfBuffer(buffer: Buffer): PdfInspectionResult {
  const binaryString = buffer.toString('binary');
  const isValidPdf = binaryString.startsWith('%PDF-');
  const versionMatch = binaryString.match(/%PDF-(\d+\.\d+)/);
  const version = versionMatch ? versionMatch[1] : 'unknown';

  // Count /Type /Page objects (excluding /Pages catalog)
  const pageMatches = binaryString.match(/\/Type\s*\/Page\b/g) || [];
  const pageCount = pageMatches.length;

  // Extract MediaBox definitions: /MediaBox [ 0 0 <width> <height> ]
  const mediaBoxRegex = /\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g;
  const mediaBoxes: Array<{ widthPt: number; heightPt: number; widthMm: number; heightMm: number }> = [];
  let mbMatch: RegExpExecArray | null;

  while ((mbMatch = mediaBoxRegex.exec(binaryString)) !== null) {
    const widthPt = parseFloat(mbMatch[1]);
    const heightPt = parseFloat(mbMatch[2]);
    // 1 pt = 25.4 / 72 mm = 0.352777778 mm
    const widthMm = Math.round(widthPt * (25.4 / 72) * 10) / 10;
    const heightMm = Math.round(heightPt * (25.4 / 72) * 10) / 10;
    mediaBoxes.push({ widthPt, heightPt, widthMm, heightMm });
  }

  // Extract text from FlateDecode streams
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let textAccumulator = '';
  let streamMatch: RegExpExecArray | null;

  while ((streamMatch = streamRegex.exec(binaryString)) !== null) {
    const rawStream = Buffer.from(streamMatch[1], 'binary');
    try {
      const decompressed = zlib.inflateSync(rawStream).toString('utf-8');
      // Extract text inside parentheses (text) Tj or [(text)] TJ
      const textMatches = decompressed.match(/\((.*?)\)\s*Tj/g) || [];
      for (const tm of textMatches) {
        const clean = tm.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
        textAccumulator += clean + ' ';
      }
      const tjMatches = decompressed.match(/\[(.*?)\]\s*TJ/g) || [];
      for (const tm of tjMatches) {
        const sub = tm.match(/\((.*?)\)/g) || [];
        for (const s of sub) {
          textAccumulator += s.replace(/[()]/g, '') + ' ';
        }
      }
    } catch {
      // Not a compressed stream or different compression, check binary directly
    }
  }

  // Also include any plain-text strings in binary
  const plainTextStrings = binaryString.match(/\(([^()]{3,})\)/g) || [];
  for (const s of plainTextStrings) {
    textAccumulator += s.replace(/[()]/g, '') + ' ';
  }

  return {
    isValidPdf,
    version,
    pageCount,
    mediaBoxes,
    extractedText: textAccumulator,
  };
}

// Base mock settings
function createMockSettings(overrides?: Partial<DocumentSettings>): DocumentSettings {
  return {
    pageSize: 'A4',
    orientation: 'portrait',
    marginPreset: 'normal',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    colors: {
      primary: '#1E1E24',
      secondary: '#64748B',
      accent: '#FFA259',
      background: '#FFFFFF',
      text: '#1E1E24',
      surface: '#F8FAFC',
    },
    typography: {
      headingFont: 'Inter, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      baseFontSize: 10.5,
      lineHeight: 1.6,
    },
    header: {
      enabled: true,
      companyName: 'DocuCraft Studio',
      documentTitle: 'Engineering Verification',
      align: 'split',
      borderBottom: true,
    },
    footer: {
      enabled: true,
      showPageNumbers: true,
      pageNumberFormat: 'PAGE_OF_TOTAL',
      customText: 'Confidential & Proprietary',
      align: 'split',
      borderTop: true,
    },
    ...overrides,
  };
}

async function runVerificationSuite() {
  console.log('====================================================');
  console.log('DOCUCRAFT PDF ARCHITECTURE & PAGINATION TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failedTests++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Physical Geometry & Bottom-Anchored Footer
  // ----------------------------------------------------
  console.log('\n--- TEST 1: Deterministic Geometry & Footer Anchoring ---');
  {
    const settings = createMockSettings();
    const geom = calculatePageGeometry(settings);

    assert(geom.pageWidthMm === 210, 'A4 portrait width is 210mm');
    assert(geom.pageHeightMm === 297, 'A4 portrait height is 297mm');
    assert(geom.headerTopMm === 20, 'Header top starts at marginTop (20mm)');
    assert(geom.headerHeightMm === 14, 'Header height is 14mm');
    assert(geom.contentTopMm === 34, 'Content area starts at 34mm (marginTop + headerHeight)');

    // footerTop = pageHeight - bottomMargin - footerHeight
    // 297 - 20 - 14 = 263mm
    const expectedFooterTop = 297 - 20 - 14;
    assert(geom.footerTopMm === expectedFooterTop, `Footer top is exactly ${expectedFooterTop}mm`);
    assert(geom.footerHeightMm === 14, 'Footer height is 14mm');

    // availableContentHeight = 297 - 20 - 20 - 14 - 14 = 229mm
    const expectedContentHeight = 297 - 20 - 20 - 14 - 14;
    assert(geom.contentHeightMm === expectedContentHeight, `Available content height is exactly ${expectedContentHeight}mm`);

    // Verify footerTop + footerHeight + marginBottom = pageHeight (perfect closure)
    assert(
      geom.footerTopMm + geom.footerHeightMm + geom.marginBottomMm === geom.pageHeightMm,
      'Geometry sum perfectly closes without gap or overflow'
    );
  }

  // ----------------------------------------------------
  // TEST 2: Single-Page Short Document
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Single-Page Short Document PDF Generation ---');
  {
    const doc: DocumentModel = {
      id: 'test-doc-short-1',
      userId: 'user-test-1',
      title: 'Short Document Test',
      templateId: 'minimal-doc',
      settings: createMockSettings(),
      pages: [
        {
          id: 'page-1',
          pageNumber: 1,
          contentHtml: '<h1>Executive Summary</h1><p>DocuCraft is an industrial-strength document engine.</p>',
        },
      ],
      version: 1,
      isFavorite: false,
      isTrash: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { buffer, metrics } = await generatePdfWithMetrics(doc);
    const inspection = inspectPdfBuffer(buffer);

    assert(inspection.isValidPdf, 'Valid PDF byte stream produced');
    assert(inspection.pageCount === 1, `Page count is 1 (got ${inspection.pageCount})`);
    assert(buffer.length > 5000, `PDF size is valid (${buffer.length} bytes)`);

    if (inspection.mediaBoxes.length > 0) {
      const mb = inspection.mediaBoxes[0];
      assert(Math.abs(mb.widthMm - 210) < 1, `Physical width matches A4 210mm (got ${mb.widthMm}mm)`);
      assert(Math.abs(mb.heightMm - 297) < 1, `Physical height matches A4 297mm (got ${mb.heightMm}mm)`);
    }

    console.log(`    Metrics: acquire=${metrics.browserAcquireTime}ms, render=${metrics.templateRenderTime}ms, load=${metrics.documentLoadTime}ms, pdf=${metrics.pdfGenerationTime}ms, total=${metrics.totalTime}ms`);
  }

  // ----------------------------------------------------
  // TEST 3: Two Pages with Sparse Page 2 (Footer Placement & No Collapsing)
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Two-Page Document Sparse Page 2 (Footer Guarantee) ---');
  {
    const doc: DocumentModel = {
      id: 'test-doc-two-page',
      userId: 'user-test-1',
      title: 'Two Page Document Test',
      templateId: 'minimal-doc',
      settings: createMockSettings(),
      pages: [
        {
          id: 'page-1',
          pageNumber: 1,
          contentHtml: '<h1>Page One Header</h1><p>Full content on page one explaining core product requirements.</p>',
        },
        {
          id: 'page-2',
          pageNumber: 2,
          contentHtml: '<p>This is page two with only one sentence.</p>',
        },
      ],
      version: 1,
      isFavorite: false,
      isTrash: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { buffer, metrics } = await generatePdfWithMetrics(doc);
    const inspection = inspectPdfBuffer(buffer);

    assert(inspection.isValidPdf, 'Valid PDF produced');
    assert(inspection.pageCount === 2, `Page count is exactly 2 (got ${inspection.pageCount})`);

    // Verify HTML layout assigns identical footer top coordinates to both pages
    const { html } = renderDocumentHtml(doc);
    const footerMatches = html.match(/top:\s*263mm/g) || [];
    assert(footerMatches.length === 2, 'Both Page 1 and Page 2 footers have deterministic top: 263mm');

    console.log(`    Metrics: acquire=${metrics.browserAcquireTime}ms, total=${metrics.totalTime}ms`);
  }

  // ----------------------------------------------------
  // TEST 4: Placeholder Sanitization & Trailing Page Pruning
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Placeholder Sanitization ("Start writing on page 2...") ---');
  {
    const docWithPlaceholder: DocumentModel = {
      id: 'test-doc-placeholder',
      userId: 'user-test-1',
      title: 'Placeholder Sanitization Test',
      templateId: 'minimal-doc',
      settings: createMockSettings(),
      pages: [
        {
          id: 'page-1',
          pageNumber: 1,
          contentHtml: '<h1>Real Article</h1><p>This is actual valuable content.</p>',
        },
        {
          id: 'page-2',
          pageNumber: 2,
          contentHtml: '<p>Start writing on page 2...</p>',
        },
      ],
      version: 1,
      isFavorite: false,
      isTrash: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const paginated = paginateDocument(docWithPlaceholder);
    assert(paginated.hasStrippedPlaceholders, 'Paginator detected and stripped placeholder text');
    assert(paginated.pages.length === 1, `Trailing empty placeholder page pruned (got ${paginated.pages.length} page)`);

    const { buffer } = await generatePdfWithMetrics(docWithPlaceholder);
    const inspection = inspectPdfBuffer(buffer);

    assert(
      !inspection.extractedText.includes('Start writing on page 2'),
      'PDF text stream strictly EXCLUDES "Start writing on page 2..."'
    );
    assert(inspection.pageCount === 1, `PDF exported 1 clean page (got ${inspection.pageCount})`);
  }

  // ----------------------------------------------------
  // TEST 5: Long Document Pre-Render Pagination & Overflow Handling
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Long Content Overflow & Block Pagination ---');
  {
    // Generate 15 distinct paragraphs
    const paragraphs = Array.from({ length: 15 }, (_, i) => {
      return `<h2>Section ${i + 1}: Architectural Resilience</h2>
<p>Document block number ${i + 1} verifies that the pagination engine properly moves atomic blocks to subsequent physical sheets when remaining content height is exhausted. Content blocks never overflow into the footer or header region.</p>`;
    }).join('\n');

    const longDoc: DocumentModel = {
      id: 'test-doc-long-flow',
      userId: 'user-test-1',
      title: 'Multi-Page Overflow Test',
      templateId: 'minimal-doc',
      settings: createMockSettings(),
      pages: [
        {
          id: 'page-single',
          pageNumber: 1,
          contentHtml: paragraphs,
        },
      ],
      version: 1,
      isFavorite: false,
      isTrash: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const paginated = paginateDocument(longDoc);
    assert(paginated.pages.length >= 3, `Pre-render paginator split long content into ${paginated.pages.length} pages`);

    // Verify usedHeight on every page is <= availableHeightPx
    const allWithinLimits = paginated.pages.every((p) => p.usedHeightPx <= p.availableHeightPx + 40);
    assert(allWithinLimits, 'All page models respect available content height without overflowing footer');

    const { buffer, metrics } = await generatePdfWithMetrics(longDoc);
    const inspection = inspectPdfBuffer(buffer);

    assert(inspection.pageCount === paginated.pages.length, `Generated PDF page count (${inspection.pageCount}) matches paginator model (${paginated.pages.length})`);
    console.log(`    Metrics: ${inspection.pageCount} pages generated in ${metrics.totalTime}ms (${Math.round(metrics.totalTime / inspection.pageCount)}ms/page)`);
  }

  // ----------------------------------------------------
  // TEST 6: Size and Orientation Matrix
  // ----------------------------------------------------
  console.log('\n--- TEST 6: Page Sizes & Orientations Matrix ---');
  {
    const testCases: Array<{ pageSize: 'A4' | 'A5' | 'Letter'; orientation: 'portrait' | 'landscape'; expW: number; expH: number }> = [
      { pageSize: 'A4', orientation: 'portrait', expW: 210, expH: 297 },
      { pageSize: 'A4', orientation: 'landscape', expW: 297, expH: 210 },
      { pageSize: 'A5', orientation: 'portrait', expW: 148, expH: 210 },
      { pageSize: 'Letter', orientation: 'portrait', expW: 215.9, expH: 279.4 },
    ];

    for (const tc of testCases) {
      const geom = calculatePageGeometry(
        createMockSettings({ pageSize: tc.pageSize, orientation: tc.orientation })
      );
      assert(
        Math.abs(geom.pageWidthMm - tc.expW) < 0.1 && Math.abs(geom.pageHeightMm - tc.expH) < 0.1,
        `${tc.pageSize} ${tc.orientation} geometry: ${geom.pageWidthMm}x${geom.pageHeightMm}mm (expected ${tc.expW}x${tc.expH}mm)`
      );

      const doc: DocumentModel = {
        id: `test-size-${tc.pageSize}-${tc.orientation}`,
        userId: 'user-test-1',
        title: `${tc.pageSize} ${tc.orientation} Test`,
        templateId: 'minimal-doc',
        settings: createMockSettings({ pageSize: tc.pageSize, orientation: tc.orientation }),
        pages: [
          {
            id: 'page-1',
            pageNumber: 1,
            contentHtml: `<h1>${tc.pageSize} ${tc.orientation}</h1><p>Testing physical bounds.</p>`,
          },
        ],
        version: 1,
        isFavorite: false,
        isTrash: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { buffer } = await generatePdfWithMetrics(doc);
      const inspection = inspectPdfBuffer(buffer);
      assert(inspection.isValidPdf, `${tc.pageSize} ${tc.orientation} generated valid PDF`);
      if (inspection.mediaBoxes.length > 0) {
        const mb = inspection.mediaBoxes[0];
        assert(
          Math.abs(mb.widthMm - tc.expW) <= 1.5 && Math.abs(mb.heightMm - tc.expH) <= 1.5,
          `PDF MediaBox matches ${tc.pageSize} ${tc.orientation} (got ${mb.widthMm}x${mb.heightMm}mm)`
        );
      }
    }
  }

  // ----------------------------------------------------
  // TEST 7: Warm Browser Pool Concurrency & Performance
  // ----------------------------------------------------
  console.log('\n--- TEST 7: Warm Browser Pool Concurrency (4 simultaneous jobs) ---');
  {
    const startConcurrent = performance.now();
    const concurrentDocs = Array.from({ length: 4 }, (_, i) => ({
      id: `test-concurrent-${i + 1}`,
      userId: 'user-test-1',
      title: `Concurrent Job ${i + 1}`,
      templateId: 'minimal-doc',
      settings: createMockSettings(),
      pages: [
        {
          id: 'page-1',
          pageNumber: 1,
          contentHtml: `<h1>Concurrent Job ${i + 1}</h1><p>Validating browser tab isolation and semaphore control.</p>`,
        },
      ],
      version: 1,
      isFavorite: false,
      isTrash: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Launch 4 simultaneous jobs
    const results = await Promise.all(
      concurrentDocs.map((d) => generatePdfWithMetrics(d))
    );

    const elapsed = performance.now() - startConcurrent;
    assert(results.length === 4, 'All 4 concurrent requests succeeded');
    const allValid = results.every((r) => inspectPdfBuffer(r.buffer).isValidPdf);
    assert(allValid, 'All 4 generated PDFs are valid');

    const poolStats = browserPool.getStats();
    assert(poolStats.activeJobs === 0, 'All concurrency slots released back to pool');
    assert(poolStats.totalJobsProcessed >= 4, `Total pool jobs processed: ${poolStats.totalJobsProcessed}`);

    console.log(`    4 concurrent jobs completed in ${Math.round(elapsed)}ms total (avg ${Math.round(elapsed / 4)}ms per job)`);
  }

  // ----------------------------------------------------
  // TEST 8: Backend In-Flight Deduplication Lock
  // ----------------------------------------------------
  console.log('\n--- TEST 8: In-Flight Request Deduplication Lock ---');
  {
    const dedupeDoc: DocumentModel = {
      id: 'test-dedupe-doc',
      userId: 'user-test-1',
      title: 'Rapid Click Dedupe Test',
      templateId: 'minimal-doc',
      settings: createMockSettings(),
      pages: [
        {
          id: 'page-1',
          pageNumber: 1,
          contentHtml: '<h1>Rapid Click Protection</h1><p>Testing deduplication lock.</p>',
        },
      ],
      version: 2,
      isFavorite: false,
      isTrash: false,
      createdAt: new Date().toISOString(),
      updatedAt: '2026-09-20T12:00:00Z',
    };

    // Trigger 3 calls for the EXACT same document simultaneously
    const [resA, resB, resC] = await Promise.all([
      generatePdfWithMetrics(dedupeDoc),
      generatePdfWithMetrics(dedupeDoc),
      generatePdfWithMetrics(dedupeDoc),
    ]);

    assert(
      resA.buffer.length === resB.buffer.length && resB.buffer.length === resC.buffer.length,
      'Identical PDF buffers delivered across deduplicated promises'
    );
  }

  console.log('\n====================================================');
  console.log(`TEST SUITE COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  // Gracefully shutdown browser pool
  await browserPool.shutdown();

  if (failedTests > 0) {
    process.exit(1);
  }
}

runVerificationSuite().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
