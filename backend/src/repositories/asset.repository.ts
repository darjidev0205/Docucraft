import { prisma } from '../config/database';

export class AssetRepository {
  async create(data: {
    documentId: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }) {
    return prisma.documentAsset.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.documentAsset.findUnique({
      where: { id },
    });
  }

  async delete(id: string) {
    return prisma.documentAsset.delete({
      where: { id },
    });
  }
}

export const assetRepository = new AssetRepository();
