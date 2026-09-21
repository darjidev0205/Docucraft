import { prisma } from '../config/database';
import { AnalyticsEvent } from '@prisma/client';

export class AnalyticsRepository {
  async trackEvent(eventType: string, metadata?: Record<string, any>) {
    return prisma.analyticsEvent.create({
      data: {
        eventType,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  async trackPdfExport(documentId: string, userId: string, fileSize: number) {
    await Promise.all([
      prisma.pdfExport.create({
        data: {
          documentId,
          userId,
          fileSize,
        },
      }),
      this.trackEvent('DOC_EXPORTED', { documentId, userId, fileSize }),
    ]);
  }

  async getAdminStats() {
    const [totalUsers, totalDocuments, totalPdfExports, totalTemplates] = await Promise.all([
      prisma.user.count(),
      prisma.document.count(),
      prisma.pdfExport.count(),
      prisma.template.count(),
    ]);

    const recentEvents = await prisma.analyticsEvent.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalUsers,
      totalDocuments,
      totalPdfExports,
      totalTemplates,
      recentEvents: recentEvents.map((e: AnalyticsEvent) => ({
        id: e.id,
        eventType: e.eventType,
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
