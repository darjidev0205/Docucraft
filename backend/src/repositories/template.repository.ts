import { prisma } from '../config/database';
import { TemplateDefinition } from '@docucraft/shared';

export class TemplateRepository {
  async listAll(category?: string) {
    const where: any = { isActive: true };
    if (category && category !== 'All') {
      where.category = category;
    }
    const templates = await prisma.template.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return templates.map((t) => JSON.parse(t.configJson) as TemplateDefinition);
  }

  async findById(id: string): Promise<TemplateDefinition | null> {
    const template = await prisma.template.findUnique({
      where: { id },
    });
    if (!template) return null;
    return JSON.parse(template.configJson) as TemplateDefinition;
  }

  async upsert(template: TemplateDefinition) {
    return prisma.template.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        category: template.category,
        description: template.description,
        thumbnail: template.thumbnail,
        configJson: JSON.stringify(template),
      },
      create: {
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        thumbnail: template.thumbnail,
        configJson: JSON.stringify(template),
      },
    });
  }

  async countTotal() {
    return prisma.template.count();
  }
}

export const templateRepository = new TemplateRepository();
