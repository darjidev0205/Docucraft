interface TestCase {
  name: string;
  method: string;
  path: string;
  origin?: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
  expectedHeaders: Record<string, string | RegExp | null>;
  expectBody?: (body: any) => boolean;
}

const testCases: TestCase[] = [
  {
    name: '1. OPTIONS /api/auth/login from Vercel production frontend',
    method: 'OPTIONS',
    path: '/api/auth/login',
    origin: 'https://docucraft-frontend.vercel.app',
    headers: {
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type,Authorization',
    },
    expectedStatus: 204,
    expectedHeaders: {
      'access-control-allow-origin': 'https://docucraft-frontend.vercel.app',
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': /POST/,
      'access-control-allow-headers': /Content-Type/i,
    },
  },
  {
    name: '2. POST /api/auth/login with valid credentials from Vercel frontend',
    method: 'POST',
    path: '/api/auth/login',
    origin: 'https://docucraft-frontend.vercel.app',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'admin@docucraft.io',
      password: 'AdminPassword123!',
    },
    expectedStatus: 200,
    expectedHeaders: {
      'access-control-allow-origin': 'https://docucraft-frontend.vercel.app',
      'access-control-allow-credentials': 'true',
    },
    expectBody: (b) => Boolean(b.token && b.user && b.user.email === 'admin@docucraft.io'),
  },
  {
    name: '3. POST /api/auth/login with INVALID credentials from Vercel frontend (401 must have CORS)',
    method: 'POST',
    path: '/api/auth/login',
    origin: 'https://docucraft-frontend.vercel.app',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'admin@docucraft.io',
      password: 'WrongPassword999!',
    },
    expectedStatus: 401,
    expectedHeaders: {
      'access-control-allow-origin': 'https://docucraft-frontend.vercel.app',
      'access-control-allow-credentials': 'true',
    },
    expectBody: (b) => b.error === 'Invalid email or password.',
  },
  {
    name: '4. POST /api/auth/login with validation error from Vercel frontend (400 must have CORS)',
    method: 'POST',
    path: '/api/auth/login',
    origin: 'https://docucraft-frontend.vercel.app',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'not-an-email',
      password: '',
    },
    expectedStatus: 400,
    expectedHeaders: {
      'access-control-allow-origin': 'https://docucraft-frontend.vercel.app',
      'access-control-allow-credentials': 'true',
    },
    expectBody: (b) => Boolean(b.error && b.details),
  },
  {
    name: '5. OPTIONS /api/auth/signup from Vercel frontend',
    method: 'OPTIONS',
    path: '/api/auth/signup',
    origin: 'https://docucraft-frontend.vercel.app',
    headers: {
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type',
    },
    expectedStatus: 204,
    expectedHeaders: {
      'access-control-allow-origin': 'https://docucraft-frontend.vercel.app',
      'access-control-allow-credentials': 'true',
    },
  },
  {
    name: '6. POST /api/auth/signup with duplicate email from Vercel frontend (409 must have CORS)',
    method: 'POST',
    path: '/api/auth/signup',
    origin: 'https://docucraft-frontend.vercel.app',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      name: 'Admin Duplicate',
      email: 'admin@docucraft.io',
      password: 'SomePassword123!',
    },
    expectedStatus: 409,
    expectedHeaders: {
      'access-control-allow-origin': 'https://docucraft-frontend.vercel.app',
      'access-control-allow-credentials': 'true',
    },
    expectBody: (b) => b.error === 'An account with this email address already exists.',
  },
  {
    name: '7. OPTIONS from Vercel branch preview deployment (e.g. PR deployment)',
    method: 'OPTIONS',
    path: '/api/auth/login',
    origin: 'https://docucraft-frontend-git-feature-darjidev0205s-projects.vercel.app',
    headers: {
      'Access-Control-Request-Method': 'POST',
    },
    expectedStatus: 204,
    expectedHeaders: {
      'access-control-allow-origin': 'https://docucraft-frontend-git-feature-darjidev0205s-projects.vercel.app',
      'access-control-allow-credentials': 'true',
    },
  },
  {
    name: '8. OPTIONS from local development (http://localhost:3000)',
    method: 'OPTIONS',
    path: '/api/auth/login',
    origin: 'http://localhost:3000',
    headers: {
      'Access-Control-Request-Method': 'POST',
    },
    expectedStatus: 204,
    expectedHeaders: {
      'access-control-allow-origin': 'http://localhost:3000',
      'access-control-allow-credentials': 'true',
    },
  },
  {
    name: '9. Disallowed origin (e.g. malicious site) - must NOT receive allow-origin',
    method: 'OPTIONS',
    path: '/api/auth/login',
    origin: 'https://malicious-attacker-site.com',
    headers: {
      'Access-Control-Request-Method': 'POST',
    },
    expectedStatus: 200,
    expectedHeaders: {
      'access-control-allow-origin': null, // Must NOT be present
    },
  },
  {
    name: '10. POST /auth/login (root alias without /api prefix) from Vercel frontend',
    method: 'POST',
    path: '/auth/login',
    origin: 'https://docucraft-frontend.vercel.app',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'admin@docucraft.io',
      password: 'AdminPassword123!',
    },
    expectedStatus: 200,
    expectedHeaders: {
      'access-control-allow-origin': 'https://docucraft-frontend.vercel.app',
      'access-control-allow-credentials': 'true',
    },
    expectBody: (b) => Boolean(b.token && b.user && b.user.email === 'admin@docucraft.io'),
  },
  {
    name: '11. POST /auth/login (root alias) with invalid credentials returns 401 with CORS',
    method: 'POST',
    path: '/auth/login',
    origin: 'https://docucraft-frontend.vercel.app',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'admin@docucraft.io',
      password: 'BadPassword!',
    },
    expectedStatus: 401,
    expectedHeaders: {
      'access-control-allow-origin': 'https://docucraft-frontend.vercel.app',
      'access-control-allow-credentials': 'true',
    },
    expectBody: (b) => b.error === 'Invalid email or password.',
  },
];

async function runTests() {
  console.log('====================================================');
  console.log('DOCUCRAFT CORS & AUTHENTICATION PRODUCTION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    try {
      const headers: Record<string, string> = {
        ...(tc.headers || {}),
      };
      if (tc.origin) {
        headers['Origin'] = tc.origin;
      }

      const res = await fetch(`http://127.0.0.1:4000${tc.path}`, {
        method: tc.method,
        headers,
        body: tc.body ? JSON.stringify(tc.body) : undefined,
      });

      let testFailed = false;
      const failureReasons: string[] = [];

      if (res.status !== tc.expectedStatus) {
        testFailed = true;
        failureReasons.push(`Expected status ${tc.expectedStatus}, got ${res.status}`);
      }

      for (const [headerName, expectedValue] of Object.entries(tc.expectedHeaders)) {
        const actualValue = res.headers.get(headerName);

        if (expectedValue === null) {
          if (actualValue !== null) {
            testFailed = true;
            failureReasons.push(`Expected header "${headerName}" to be ABSENT, but got: "${actualValue}"`);
          }
        } else if (expectedValue instanceof RegExp) {
          if (!actualValue || !expectedValue.test(actualValue)) {
            testFailed = true;
            failureReasons.push(`Expected header "${headerName}" to match ${expectedValue}, got: "${actualValue}"`);
          }
        } else {
          if (actualValue !== expectedValue) {
            testFailed = true;
            failureReasons.push(`Expected header "${headerName}" to equal "${expectedValue}", got: "${actualValue}"`);
          }
        }
      }

      let jsonBody: any = null;
      if (tc.expectBody) {
        try {
          jsonBody = await res.json();
          if (!tc.expectBody(jsonBody)) {
            testFailed = true;
            failureReasons.push(`Body expectation failed: ${JSON.stringify(jsonBody)}`);
          }
        } catch (e: any) {
          testFailed = true;
          failureReasons.push(`Failed to parse response JSON body: ${e.message}`);
        }
      }

      if (testFailed) {
        failed++;
        console.error(`✗ FAIL: ${tc.name}`);
        for (const reason of failureReasons) {
          console.error(`    -> ${reason}`);
        }
      } else {
        passed++;
        console.log(`✓ PASS: ${tc.name}`);
        const originH = res.headers.get('access-control-allow-origin');
        const credsH = res.headers.get('access-control-allow-credentials');
        console.log(`    Status: ${res.status} | Allow-Origin: ${originH ?? '(none)'} | Credentials: ${credsH ?? '(none)'}`);
      }
    } catch (err: any) {
      failed++;
      console.error(`✗ ERROR executing test "${tc.name}":`, err.message);
    }
  }

  console.log('\n====================================================');
  console.log(`CORS TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
