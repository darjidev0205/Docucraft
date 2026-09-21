import { performance } from 'perf_hooks';
import { DocumentModel, calculatePageGeometry } from '@docucraft/shared';
import { renderDocumentHtml } from './renderer';
import { browserPool } from './browser-pool';

export interface PdfPerformanceMetrics {
  documentId: string;
  pageCount: number;
  isColdStart: boolean;
  browserAcquireTime: number;
  documentLoadTime: number;
  templateRenderTime: number;
  fontLoadTime: number;
  pdfGenerationTime: number;
  totalTime: number;
}

// In-flight request deduplication lock on the backend
// Rapid identical requests for the same document share the same in-flight PDF generation promise
const inFlightJobs = new Map<string, Promise<{ buffer: Buffer; metrics: PdfPerformanceMetrics }>>();

export async function generatePdfBuffer(document: DocumentModel): Promise<Buffer> {
  const result = await generatePdfWithMetrics(document);
  return result.buffer;
}

export async function generatePdfWithMetrics(
  document: DocumentModel
): Promise<{ buffer: Buffer; metrics: PdfPerformanceMetrics }> {
  const docKey = `${document.id}_v${document.version || 1}_${document.updatedAt || ''}`;

  // If a generation job is already running for this document state, reuse the existing promise
  if (inFlightJobs.has(docKey)) {
    console.log(`[PDF Generator] In-flight deduplication hit for document: ${document.id}`);
    return inFlightJobs.get(docKey)!;
  }

  const jobPromise = executeGenerationJob(document);
  inFlightJobs.set(docKey, jobPromise);

  try {
    return await jobPromise;
  } finally {
    inFlightJobs.delete(docKey);
  }
}

async function executeGenerationJob(
  document: DocumentModel
): Promise<{ buffer: Buffer; metrics: PdfPerformanceMetrics }> {
  const tTotalStart = performance.now();

  // Step 1: Pre-render pagination & HTML compilation
  const tRenderStart = performance.now();
  const { html, pageCount, usedFonts } = renderDocumentHtml(document);
  const templateRenderTime = performance.now() - tRenderStart;

  const geometry = calculatePageGeometry(document.settings);

  let browserAcquireTime = 0;
  let documentLoadTime = 0;
  let fontLoadTime = 0;
  let pdfGenerationTime = 0;
  let isColdStart = false;

  // Step 2: Acquire browser & isolated tab via pool
  const pdfBuffer = await browserPool.withPage(async (page, poolMetrics) => {
    browserAcquireTime = poolMetrics.browserAcquireTimeMs;
    isColdStart = poolMetrics.isColdStart;

    // Step 3: Load document into tab
    const tDocLoadStart = performance.now();
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    documentLoadTime = performance.now() - tDocLoadStart;

    // Step 4: Font readiness verification with timeout safety
    const tFontStart = performance.now();
    await page
      .evaluate(async (fontsToCheck) => {
        try {
          // Wait for fonts subsystem ready with 3s timeout
          await Promise.race([
            (document as any).fonts?.ready,
            new Promise((resolve) => setTimeout(resolve, 3000)),
          ]);

          // Verify each required font family is available
          for (const font of fontsToCheck) {
            try {
              (document as any).fonts?.check(`16px "${font}"`);
            } catch {}
          }
        } catch {}
      }, usedFonts)
      .catch((err) => {
        console.warn('[PDF Generator] Font check warning (non-fatal):', err?.message);
      });
    fontLoadTime = performance.now() - tFontStart;

    // Step 5: Generate physical PDF with exact page geometry
    const tPdfStart = performance.now();
    const generated = await page.pdf({
      width: `${geometry.pageWidthMm}mm`,
      height: `${geometry.pageHeightMm}mm`,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });
    pdfGenerationTime = performance.now() - tPdfStart;

    return Buffer.from(generated);
  });

  const totalTime = performance.now() - tTotalStart;

  const metrics: PdfPerformanceMetrics = {
    documentId: document.id,
    pageCount,
    isColdStart,
    browserAcquireTime: Math.round(browserAcquireTime),
    documentLoadTime: Math.round(documentLoadTime),
    templateRenderTime: Math.round(templateRenderTime),
    fontLoadTime: Math.round(fontLoadTime),
    pdfGenerationTime: Math.round(pdfGenerationTime),
    totalTime: Math.round(totalTime),
  };

  console.log(`[PDF Generator] Metrics for doc ${document.id} (${pageCount} pages, cold=${isColdStart}):`);
  console.log(
    `  Acquire: ${metrics.browserAcquireTime}ms | Render: ${metrics.templateRenderTime}ms | Load: ${metrics.documentLoadTime}ms | Font: ${metrics.fontLoadTime}ms | PDF: ${metrics.pdfGenerationTime}ms | Total: ${metrics.totalTime}ms`
  );

  return { buffer: pdfBuffer, metrics };
}
