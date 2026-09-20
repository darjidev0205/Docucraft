import { documentRepository } from '../../repositories/document.repository';
import { templateRepository } from '../../repositories/template.repository';
import { analyticsRepository } from '../../repositories/analytics.repository';
import { getTemplateById, autoFormatPlainText, CreateDocumentInput, UpdateDocumentInput, DocumentModel } from '@docucraft/shared';

export class DocumentService {
  async createDocument(userId: string, input: CreateDocumentInput): Promise<DocumentModel> {
    const template = (await templateRepository.findById(input.templateId)) || getTemplateById(input.templateId);

    let initialPages = template.sampleContent.pages.map((p, idx) => ({
      id: `page-${idx + 1}`,
      pageNumber: idx + 1,
      contentHtml: p.contentHtml,
    }));

    if (input.initialContent && input.initialContent.trim()) {
      const formattedHtml = autoFormatPlainText(input.initialContent, input.title);
      initialPages = [
        {
          id: 'page-1',
          pageNumber: 1,
          contentHtml: formattedHtml,
        },
      ];
    }

    const settings = input.settings || template.defaultSettings;

    const document = await documentRepository.create({
      userId,
      title: input.title || template.sampleContent.title || 'Untitled Document',
      templateId: template.id,
      settings,
      pages: initialPages,
    });

    await analyticsRepository.trackEvent('DOC_CREATED', {
      documentId: document.id,
      userId,
      templateId: template.id,
    });

    return document;
  }

  async listDocuments(userId: string, options?: { search?: string; isFavorite?: boolean; isTrash?: boolean }) {
    return documentRepository.listByUser(userId, options);
  }

  async getDocument(documentId: string): Promise<DocumentModel | null> {
    return documentRepository.findById(documentId);
  }

  async updateDocument(documentId: string, input: UpdateDocumentInput, createNewVersion = false): Promise<DocumentModel> {
    return documentRepository.update(documentId, {
      ...input,
      createNewVersion,
    });
  }

  async duplicateDocument(documentId: string, userId: string): Promise<DocumentModel> {
    return documentRepository.duplicate(documentId, userId);
  }

  async moveToTrash(documentId: string): Promise<DocumentModel> {
    return documentRepository.update(documentId, { isTrash: true });
  }

  async restoreFromTrash(documentId: string): Promise<DocumentModel> {
    return documentRepository.update(documentId, { isTrash: false });
  }

  async permanentDelete(documentId: string): Promise<void> {
    return documentRepository.delete(documentId);
  }

  async toggleFavorite(documentId: string, isFavorite: boolean): Promise<DocumentModel> {
    return documentRepository.update(documentId, { isFavorite });
  }
}

export const documentService = new DocumentService();
