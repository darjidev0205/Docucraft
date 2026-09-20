import { Response, NextFunction } from 'express';
import { DocumentRequest } from '../middleware/ownership.middleware';
import { assetRepository } from '../repositories/asset.repository';
import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env';

export class AssetController {
  async upload(req: DocumentRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      const documentId = req.document!.id;
      const fileUrl = `/uploads/${req.file.filename}`;

      const asset = await assetRepository.create({
        documentId,
        fileName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      });

      res.status(201).json(asset);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: DocumentRequest, res: Response, next: NextFunction) {
    try {
      const assetId = req.params.assetId;
      const asset = await assetRepository.findById(assetId);

      if (!asset || asset.documentId !== req.document!.id) {
        return res.status(404).json({ error: 'Asset not found.' });
      }

      // Delete file from disk
      const filePath = path.join(ENV.UPLOAD_DIR, path.basename(asset.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await assetRepository.delete(assetId);
      res.status(200).json({ message: 'Asset deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const assetController = new AssetController();
