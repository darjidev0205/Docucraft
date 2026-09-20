import { Request, Response, NextFunction } from 'express';
import { templateRepository } from '../repositories/template.repository';
import { TEMPLATES, getTemplateById } from '@docucraft/shared';

export class TemplateController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const dbTemplates = await templateRepository.listAll(category);
      if (dbTemplates.length > 0) {
        return res.status(200).json(dbTemplates);
      }
      // Fallback to static registry if DB has not been seeded yet
      const filtered = category && category !== 'All'
        ? TEMPLATES.filter((t) => t.category === category)
        : TEMPLATES;
      res.status(200).json(filtered);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const dbTemplate = await templateRepository.findById(id);
      if (dbTemplate) {
        return res.status(200).json(dbTemplate);
      }
      const template = getTemplateById(id);
      res.status(200).json(template);
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const templateData = req.body;
      const saved = await templateRepository.upsert(templateData);
      res.status(200).json(saved);
    } catch (error) {
      next(error);
    }
  }
}

export const templateController = new TemplateController();
