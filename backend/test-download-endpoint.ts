import http from 'http';
import app from './src/server';
import { prisma } from './src/config/database';
import jwt from 'jsonwebtoken';
import { ENV } from './src/config/env';

async function runDownloadEndpointTests() {
  console.log('====================================================');
  console.log('DOCUCRAFT DOWNLOAD ENDPOINT VERIFICATION TEST');
  console.log('====================================================\n');

  // Start temporary HTTP server on an available port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Fetch an existing user & document from MongoDB Atlas
    const user = await prisma.user.findFirst({
      where: { email: 'admin@docucraft.io' },
    });

    if (!user) {
      throw new Error('Admin user not found in database. Run npm run prisma:seed first.');
    }

    // Sign a valid JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Find or create a test document owned by this user
    let doc = await prisma.document.findFirst({
      where: { userId: user.id, isTrash: false },
    });

    if (!doc) {
      doc = await prisma.document.create({
        data: {
          userId: user.id,
          title: 'Production Verification Document',
          templateId: 'professional-business',
          settingsJson: JSON.stringify({
            pageSize: 'A4',
            orientation: 'portrait',
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            colors: { primary: '#0F172A', secondary: '#64748B', background: '#FFFFFF', text: '#334155' },
            typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSizePt: 10, lineSpacing: 1.5 },
            header: { enabled: true, documentTitle: 'Production Test Doc', align: 'split' },
            footer: { enabled: true, pageNumberFormat: 'PAGE_X_OF_Y', align: 'split' },
          }),
          contentJson: JSON.stringify([
            {
              id: 'page-1',
              pageNumber: 1,
              content: '<h1>DocuCraft Production Verification</h1><p>Testing PDF generation and download pipeline end-to-end.</p>',
            },
          ]),
          version: 1,
        },
      });
    }

    console.log(`Using test document ID: ${doc.id} (Title: '${doc.title}')`);
    console.log(`User ID: ${user.id} (${user.email})\n`);

    // Test 1: Unauthenticated request should return 401
    console.log('--- TEST 1: Unauthenticated request ---');
    const resUnauth = await fetch(`${baseUrl}/api/documents/${doc.id}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`Status: ${resUnauth.status} (expected 401)`);
    if (resUnauth.status !== 401) throw new Error(`Expected 401, got ${resUnauth.status}`);
    console.log('✓ PASS: Unauthenticated request rejected with 401\n');

    // Test 2: Invalid document ID format should return 404
    console.log('--- TEST 2: Malformed document ID ---');
    const resMalformed = await fetch(`${baseUrl}/api/documents/invalid-id-123/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Status: ${resMalformed.status} (expected 404)`);
    if (resMalformed.status !== 404) throw new Error(`Expected 404, got ${resMalformed.status}`);
    console.log('✓ PASS: Malformed document ID rejected with 404\n');

    // Test 3: Valid authenticated download request
    console.log('--- TEST 3: Authenticated PDF Download ---');
    const t0 = Date.now();
    const resDownload = await fetch(`${baseUrl}/api/documents/${doc.id}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    console.log(`Status: ${resDownload.status} (expected 200)`);
    console.log(`Content-Type: ${resDownload.headers.get('content-type')} (expected application/pdf)`);
    console.log(`Content-Disposition: ${resDownload.headers.get('content-disposition')}`);
    console.log(`Content-Length: ${resDownload.headers.get('content-length')} bytes`);

    if (resDownload.status !== 200) {
      const errBody = await resDownload.text();
      throw new Error(`Download failed with status ${resDownload.status}: ${errBody}`);
    }

    const contentType = resDownload.headers.get('content-type') || '';
    if (!contentType.includes('application/pdf')) {
      throw new Error(`Unexpected Content-Type: ${contentType}`);
    }

    const contentDisposition = resDownload.headers.get('content-disposition') || '';
    if (!contentDisposition.includes('attachment') || !contentDisposition.includes('.pdf')) {
      throw new Error(`Unexpected Content-Disposition: ${contentDisposition}`);
    }

    const arrayBuffer = await resDownload.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfMagic = buffer.subarray(0, 5).toString('ascii');
    console.log(`PDF Magic Bytes: ${pdfMagic} (expected %PDF-)`);

    if (pdfMagic !== '%PDF-') {
      throw new Error(`Invalid PDF header: ${pdfMagic}`);
    }

    const elapsed = Date.now() - t0;
    console.log(`✓ PASS: Download succeeded in ${elapsed}ms! PDF size: ${buffer.length} bytes\n`);

    // Test 4: Root path alias (/documents/:id/download)
    console.log('--- TEST 4: Root alias /documents/:id/download ---');
    const resAlias = await fetch(`${baseUrl}/documents/${doc.id}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    console.log(`Status: ${resAlias.status} (expected 200)`);
    if (resAlias.status !== 200) {
      throw new Error(`Alias failed with status ${resAlias.status}`);
    }
    console.log('✓ PASS: Route alias /documents/:id/download works identically!\n');

    console.log('====================================================');
    console.log('ALL DOWNLOAD ENDPOINT TESTS PASSED! (4/4)');
    console.log('====================================================');
  } finally {
    server.close();
  }
}

runDownloadEndpointTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
