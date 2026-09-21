import { Response, NextFunction } from 'express';
import { DocumentRequest } from '../middleware/ownership.middleware';
import { generatePdfBuffer } from '../services/pdf/generator';
import { analyticsRepository } from '../repositories/analytics.repository';
import { DocumentModel } from '@docucraft/shared';

export class PdfController {
  async download(req: DocumentRequest, res: Response, next: NextFunction) {
    const documentId = req.params.id;
    const userId = req.user?.id;
    console.log(`[PDF Controller] Download initiated for document ${documentId} by user ${userId}`);

    try {
      // Document is guaranteed authenticated and ownership-verified by middlewares
      let document: DocumentModel = req.document!;

      // If client sent updated pages or settings directly with the download request, use them
      if (req.body && (req.body.pages || req.body.settings)) {
        document = {
          ...document,
          ...(req.body.title ? { title: req.body.title } : {}),
          ...(req.body.settings ? { settings: req.body.settings } : {}),
          ...(req.body.pages ? { pages: req.body.pages } : {}),
        };
      }

      console.log(`[PDF Controller] Rendering PDF buffer for document '${document.title}' (pages=${document.pages?.length || 0})`);
      const pdfBuffer = await generatePdfBuffer(document);
      console.log(`[PDF Controller] ✅ Generated PDF buffer (${pdfBuffer.length} bytes)`);

      // Track export analytics asynchronously (non-blocking for response)
      analyticsRepository.trackPdfExport(document.id, req.user!.id, pdfBuffer.length).catch((err) => {
        console.warn('[PDF Controller] ⚠️ Non-fatal: failed to record export analytics event:', err?.message || err);
      });

      const sanitizedTitle = (document.title || 'document')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 60);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      res.end(pdfBuffer);
    } catch (error: any) {
      console.error('[PDF Controller] ❌ Error generating PDF for download:', {
        documentId,
        userId,
        errorName: error?.name,
        errorMessage: error?.message,
        stack: error?.stack,
      });
      next(error);
    }
  }

  async previewHtml(req: DocumentRequest, res: Response, next: NextFunction) {
    try {
      const { renderDocumentHtml } = await import('../services/pdf/renderer');
      let document: DocumentModel = req.document!;

      if (req.body && (req.body.pages || req.body.settings)) {
        document = {
          ...document,
          ...(req.body.title ? { title: req.body.title } : {}),
          ...(req.body.settings ? { settings: req.body.settings } : {}),
          ...(req.body.pages ? { pages: req.body.pages } : {}),
        };
      }

      const html = renderDocumentHtml(document);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      next(error);
    }
  }
}

export const pdfController = new PdfController();
