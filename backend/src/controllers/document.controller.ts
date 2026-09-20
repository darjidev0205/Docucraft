import { Response, NextFunction } from 'express';
import { documentService } from '../services/documents/document.service';
import { CreateDocumentSchema, UpdateDocumentSchema } from '@docucraft/shared';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { DocumentRequest } from '../middleware/ownership.middleware';

export class DocumentController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const search = req.query.search as string | undefined;
      const isFavorite = req.query.isFavorite === 'true' ? true : req.query.isFavorite === 'false' ? false : undefined;
      const isTrash = req.query.isTrash === 'true';

      const result = await documentService.listDocuments(userId, { search, isFavorite, isTrash });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const validated = CreateDocumentSchema.parse(req.body);
      const document = await documentService.createDocument(userId, validated);
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }

  async get(req: DocumentRequest, res: Response) {
    res.status(200).json(req.document);
  }

  async update(req: DocumentRequest, res: Response, next: NextFunction) {
    try {
      const documentId = req.document!.id;
      const validated = UpdateDocumentSchema.parse(req.body);
      const createNewVersion = req.query.version === 'true';
      const updated = await documentService.updateDocument(documentId, validated, createNewVersion);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: DocumentRequest, res: Response, next: NextFunction) {
    try {
      const documentId = req.document!.id;
      const userId = req.user!.id;
      const duplicated = await documentService.duplicateDocument(documentId, userId);
      res.status(201).json(duplicated);
    } catch (error) {
      next(error);
    }
  }

  async moveToTrash(req: DocumentRequest, res: Response, next: NextFunction) {
    try {
      const documentId = req.document!.id;
      const updated = await documentService.moveToTrash(documentId);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async restore(req: DocumentRequest, res: Response, next: NextFunction) {
    try {
      const documentId = req.document!.id;
      const updated = await documentService.restoreFromTrash(documentId);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deletePermanent(req: DocumentRequest, res: Response, next: NextFunction) {
    try {
      const documentId = req.document!.id;
      await documentService.permanentDelete(documentId);
      res.status(200).json({ message: 'Document permanently deleted.' });
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorite(req: DocumentRequest, res: Response, next: NextFunction) {
    try {
      const documentId = req.document!.id;
      const { isFavorite } = req.body;
      const updated = await documentService.toggleFavorite(documentId, !!isFavorite);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
