import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TEMPLATES } from '@docucraft/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Templates
  console.log('Seeding 10 professional templates...');
  for (const template of TEMPLATES) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        category: template.category,
        description: template.description,
        thumbnail: template.thumbnail,
        configJson: JSON.stringify(template),
        isActive: true,
      },
      create: {
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        thumbnail: template.thumbnail,
        configJson: JSON.stringify(template),
        isActive: true,
      },
    });
  }

  // 2. Seed Admin User
  const adminEmail = 'admin@docucraft.io';
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', salt);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'System Administrator',
      role: 'ADMIN',
    },
    create: {
      name: 'System Administrator',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user ready: ${admin.email} (Password: AdminPassword123!)`);

  // 3. Seed Demo User
  const demoEmail = 'demo@docucraft.io';
  const demoPasswordHash = await bcrypt.hash('DemoPassword123!', salt);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: 'Elena Vance',
      role: 'USER',
    },
    create: {
      name: 'Elena Vance',
      email: demoEmail,
      passwordHash: demoPasswordHash,
      role: 'USER',
    },
  });
  console.log(`Demo user ready: ${demoUser.email} (Password: DemoPassword123!)`);

  // 4. Seed sample document for demo user
  const existingDoc = await prisma.document.findFirst({
    where: { userId: demoUser.id },
  });

  if (!existingDoc) {
    const defaultTemplate = TEMPLATES[0]; // professional-business
    await prisma.document.create({
      data: {
        userId: demoUser.id,
        title: 'Q3 Enterprise Strategy & Growth Overview',
        templateId: defaultTemplate.id,
        settingsJson: JSON.stringify(defaultTemplate.defaultSettings),
        contentJson: JSON.stringify([
          {
            id: 'page-1',
            pageNumber: 1,
            contentHtml: defaultTemplate.sampleContent.pages[0].contentHtml,
          },
        ]),
        version: 1,
        isFavorite: true,
      },
    });
    console.log('Created initial demo document.');
  }

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
