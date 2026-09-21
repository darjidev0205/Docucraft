import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { documentRepository } from '../repositories/document.repository';
import { DocumentModel } from '@docucraft/shared';

export interface DocumentRequest extends AuthenticatedRequest {
  document?: DocumentModel;
}

export async function ownershipMiddleware(req: DocumentRequest, res: Response, next: NextFunction) {
  const documentId = req.params.id || req.params.documentId;
  const userId = req.user?.id;

  try {
    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required.' });
    }

    // Guard against malformed MongoDB ObjectId before calling database
    if (!/^[0-9a-fA-F]{24}$/.test(documentId)) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const document = await documentRepository.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Admins can view/audit, but normal users can only access their own documents
    if (document.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. You do not own this document.' });
    }

    req.document = document;
    next();
  } catch (error: any) {
    console.error('[OwnershipMiddleware] ❌ Error verifying document ownership:', {
      documentId,
      userId,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: error?.stack,
    });
    return res.status(500).json({ error: 'Failed to verify document ownership.' });
  }
}
