import { prisma } from '../config/database';
import { DocumentModel, DocumentSettings, DocumentPage } from '@docucraft/shared';

export class DocumentRepository {
  async create(data: {
    userId: string;
    title: string;
    templateId: string;
    settings: DocumentSettings;
    pages: DocumentPage[];
  }) {
    const document = await prisma.document.create({
      data: {
        userId: data.userId,
        title: data.title,
        templateId: data.templateId,
        settingsJson: JSON.stringify(data.settings),
        contentJson: JSON.stringify(data.pages),
        version: 1,
        versions: {
          create: {
            versionNumber: 1,
            title: data.title,
            settingsJson: JSON.stringify(data.settings),
            contentJson: JSON.stringify(data.pages),
          },
        },
      },
      include: {
        assets: true,
      },
    });

    return this.mapToModel(document);
  }

  async findById(id: string): Promise<DocumentModel | null> {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        assets: true,
      },
    });

    if (!document) return null;
    return this.mapToModel(document);
  }

  async listByUser(userId: string, options?: {
    search?: string;
    isFavorite?: boolean;
    isTrash?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ documents: DocumentModel[]; total: number }> {
    const where: any = {
      userId,
      isTrash: options?.isTrash ?? false,
    };

    if (options?.isFavorite !== undefined) {
      where.isFavorite = options.isFavorite;
    }

    if (options?.search) {
      where.title = {
        contains: options.search,
      };
    }

    const [docs, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
        include: { assets: true },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      documents: docs.map((d) => this.mapToModel(d)),
      total,
    };
  }

  async update(id: string, data: {
    title?: string;
    templateId?: string;
    settings?: DocumentSettings;
    pages?: DocumentPage[];
    isFavorite?: boolean;
    isTrash?: boolean;
    createNewVersion?: boolean;
  }): Promise<DocumentModel> {
    const currentDoc = await prisma.document.findUniqueOrThrow({ where: { id } });

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.templateId !== undefined) updateData.templateId = data.templateId;
    if (data.settings !== undefined) updateData.settingsJson = JSON.stringify(data.settings);
    if (data.pages !== undefined) updateData.contentJson = JSON.stringify(data.pages);
    if (data.isFavorite !== undefined) updateData.isFavorite = data.isFavorite;
    if (data.isTrash !== undefined) updateData.isTrash = data.isTrash;

    if (data.createNewVersion) {
      const nextVersion = currentDoc.version + 1;
      updateData.version = nextVersion;
      updateData.versions = {
        create: {
          versionNumber: nextVersion,
          title: data.title || currentDoc.title,
          settingsJson: data.settings ? JSON.stringify(data.settings) : currentDoc.settingsJson,
          contentJson: data.pages ? JSON.stringify(data.pages) : currentDoc.contentJson,
        },
      };
    }

    const updated = await prisma.document.update({
      where: { id },
      data: updateData,
      include: { assets: true },
    });

    return this.mapToModel(updated);
  }

  async duplicate(id: string, userId: string): Promise<DocumentModel> {
    const original = await prisma.document.findUniqueOrThrow({ where: { id } });

    const duplicate = await prisma.document.create({
      data: {
        userId,
        title: `${original.title} (Copy)`,
        templateId: original.templateId,
        settingsJson: original.settingsJson,
        contentJson: original.contentJson,
        version: 1,
        versions: {
          create: {
            versionNumber: 1,
            title: `${original.title} (Copy)`,
            settingsJson: original.settingsJson,
            contentJson: original.contentJson,
          },
        },
      },
      include: { assets: true },
    });

    return this.mapToModel(duplicate);
  }

  async delete(id: string): Promise<void> {
    await prisma.document.delete({
      where: { id },
    });
  }

  async countTotal(): Promise<number> {
    return prisma.document.count();
  }

  private mapToModel(raw: any): DocumentModel {
    return {
      id: raw.id,
      userId: raw.userId,
      title: raw.title,
      templateId: raw.templateId,
      settings: JSON.parse(raw.settingsJson),
      pages: JSON.parse(raw.contentJson),
      assets: raw.assets?.map((a: any) => ({
        id: a.id,
        documentId: a.documentId,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
        createdAt: a.createdAt.toISOString(),
      })),
      version: raw.version,
      isFavorite: raw.isFavorite,
      isTrash: raw.isTrash,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    };
  }
}

export const documentRepository = new DocumentRepository();
