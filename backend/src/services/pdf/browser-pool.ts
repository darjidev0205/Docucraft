import fs from 'fs';
import path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import { performance } from 'perf_hooks';

export interface BrowserPoolStats {
  activeJobs: number;
  queuedJobs: number;
  totalJobsProcessed: number;
  browserCrashesRecovered: number;
  isWarm: boolean;
}

export class BrowserPool {
  private static instance: BrowserPool;

  private browser: Browser | null = null;
  private isLaunching = false;
  private launchPromise: Promise<Browser> | null = null;

  private readonly maxConcurrentJobs = 4;
  private activeJobs = 0;
  private jobQueue: Array<() => void> = [];

  private totalJobsProcessed = 0;
  private browserCrashesRecovered = 0;
  private coldStartTimeMs = 0;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): BrowserPool {
    if (!BrowserPool.instance) {
      BrowserPool.instance = new BrowserPool();
    }
    return BrowserPool.instance;
  }

  private readonly defaultArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-features=TranslateUI',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-popup-blocking',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-sync',
    '--force-color-profile=srgb',
    '--metrics-recording-only',
    '--no-first-run',
    '--font-render-hinting=none',
  ];

  /**
   * Recursively searches for an executable binary (chrome/chromium/chrome-headless-shell) in a folder
   */
  private findExecutableInDir(dir: string): string | null {
    try {
      if (!fs.existsSync(dir)) return null;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const found = this.findExecutableInDir(fullPath);
          if (found) return found;
        } else if (entry.isFile()) {
          const name = entry.name.toLowerCase();
          if (
            name === 'chrome' ||
            name === 'chrome.exe' ||
            name === 'chromium' ||
            name === 'chromium-browser' ||
            name === 'chrome-headless-shell' ||
            name === 'msedge.exe'
          ) {
            return fullPath;
          }
        }
      }
    } catch {
      // Non-readable directory
    }
    return null;
  }

  /**
   * Resolves the most suitable browser configuration across platforms:
   * 1. Explicit environment variables (PUPPETEER_EXECUTABLE_PATH, CHROME_BIN, CHROME_PATH)
   * 2. Standard system locations (Windows Chrome/Edge, Mac Chrome, Linux system Chrome)
   * 3. Local/workspace cache directories (.cache/puppeteer, /opt/render/.cache/puppeteer)
   * 4. @sparticuz/chromium (purpose-built statically linked Linux Chromium for Render/Serverless)
   */
  private async resolveBrowserConfig(): Promise<{
    executablePath: string;
    args: string[];
    defaultViewport?: { width: number; height: number; deviceScaleFactor?: number } | null;
    headless: boolean | 'shell';
    source: string;
  }> {
    // 1. Environment variables
    const envPaths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      process.env.CHROME_BIN,
      process.env.CHROME_PATH,
    ].filter(Boolean) as string[];

    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        console.log(`[BrowserPool] Using browser executable from environment variable: ${p}`);
        return {
          executablePath: p,
          args: this.defaultArgs,
          headless: true,
          source: 'env-var',
        };
      }
    }

    // 2. Standard local system paths
    const standardPaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
      '/usr/local/bin/chrome',
    ];

    for (const p of standardPaths) {
      if (fs.existsSync(p)) {
        console.log(`[BrowserPool] Found local system browser at: ${p}`);
        return {
          executablePath: p,
          args: this.defaultArgs,
          headless: true,
          source: 'system-path',
        };
      }
    }

    // 3. Search common cache directories
    const searchDirs = [
      process.env.PUPPETEER_CACHE_DIR,
      '/opt/render/.cache/puppeteer',
      path.resolve(process.cwd(), '.cache/puppeteer'),
      path.resolve(process.cwd(), 'chrome'),
      path.resolve(process.cwd(), '../.cache/puppeteer'),
      path.resolve(process.cwd(), '../../.cache/puppeteer'),
    ].filter(Boolean) as string[];

    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        const found = this.findExecutableInDir(dir);
        if (found) {
          console.log(`[BrowserPool] Found browser executable in cache directory (${dir}): ${found}`);
          return {
            executablePath: found,
            args: this.defaultArgs,
            headless: true,
            source: 'cache-dir',
          };
        }
      }
    }

    // 4. Statically linked container Chromium (@sparticuz/chromium for Render / Linux cloud runtimes)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sparticuz = require('@sparticuz/chromium');
      if (sparticuz) {
        console.log('[BrowserPool] Attempting resolution via @sparticuz/chromium...');
        const execPath = await sparticuz.executablePath();
        if (execPath && fs.existsSync(execPath)) {
          console.log(`[BrowserPool] ✅ @sparticuz/chromium resolved binary at: ${execPath}`);
          return {
            executablePath: execPath,
            args: [
              ...(sparticuz.args || []),
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
            ],
            defaultViewport: sparticuz.defaultViewport || null,
            headless: sparticuz.headless ?? true,
            source: '@sparticuz/chromium',
          };
        }
      }
    } catch (sparticuzErr: any) {
      console.warn(`[BrowserPool] @sparticuz/chromium resolution attempt: ${sparticuzErr?.message}`);
    }

    // 5. Diagnostics if no browser could be located
    const attemptedSummary = [
      `Env vars (PUPPETEER_EXECUTABLE_PATH, CHROME_BIN): ${envPaths.join(', ') || 'none set'}`,
      `Standard system paths checked (${standardPaths.length} candidates on ${process.platform})`,
      `Cache directories checked: ${searchDirs.join(', ')}`,
      `@sparticuz/chromium: attempted`,
    ];

    throw new Error(
      `[BrowserPool] No compatible Chrome/Chromium executable found for platform '${process.platform}' (${process.arch}).\n` +
      `Attempted sources:\n - ${attemptedSummary.join('\n - ')}`
    );
  }

  /**
   * Acquires the singleton browser instance.
   * If not launched or disconnected, launches a new one.
   */
  public async getBrowser(): Promise<{ browser: Browser; acquireTimeMs: number; isColdStart: boolean }> {
    const t0 = performance.now();
    let isColdStart = false;

    // If browser exists and is connected, return immediately
    if (this.browser && this.browser.isConnected()) {
      return {
        browser: this.browser,
        acquireTimeMs: performance.now() - t0,
        isColdStart: false,
      };
    }

    // Handle concurrent launch requests
    if (this.isLaunching && this.launchPromise) {
      const browser = await this.launchPromise;
      return {
        browser,
        acquireTimeMs: performance.now() - t0,
        isColdStart: false,
      };
    }

    // Launch new browser instance
    this.isLaunching = true;
    isColdStart = true;
    const launchStart = performance.now();

    this.launchPromise = (async () => {
      try {
        const config = await this.resolveBrowserConfig();
        console.log(`[BrowserPool] Launching headless browser (source=${config.source}): ${config.executablePath}`);

        const browser = await puppeteer.launch({
          executablePath: config.executablePath,
          headless: config.headless,
          args: config.args,
          defaultViewport: config.defaultViewport || undefined,
        });

        browser.on('disconnected', () => {
          console.warn('[BrowserPool] Browser disconnected or crashed. Cleaning up reference.');
          this.browser = null;
          this.browserCrashesRecovered++;
        });

        this.browser = browser;
        this.coldStartTimeMs = performance.now() - launchStart;
        console.log(`[BrowserPool] Browser launched in ${this.coldStartTimeMs.toFixed(1)}ms`);
        return browser;
      } finally {
        this.isLaunching = false;
        this.launchPromise = null;
      }
    })();

    const browser = await this.launchPromise;
    return {
      browser,
      acquireTimeMs: performance.now() - t0,
      isColdStart: true,
    };
  }

  /**
   * Concurrency semaphore acquire
   */
  private async acquireSlot(): Promise<void> {
    if (this.activeJobs < this.maxConcurrentJobs) {
      this.activeJobs++;
      return;
    }

    // Queue job until a slot frees up
    await new Promise<void>((resolve) => {
      this.jobQueue.push(resolve);
    });
    this.activeJobs++;
  }

  /**
   * Concurrency semaphore release
   */
  private releaseSlot(): void {
    this.activeJobs--;
    if (this.jobQueue.length > 0) {
      const next = this.jobQueue.shift();
      if (next) next();
    }
  }

  /**
   * Executes a PDF task with an isolated Page tab.
   * NEVER shares tabs between requests.
   * Guaranteed clean closing of page in finally block.
   */
  public async withPage<T>(
    fn: (page: Page, metrics: { browserAcquireTimeMs: number; isColdStart: boolean }) => Promise<T>
  ): Promise<T> {
    await this.acquireSlot();

    let page: Page | null = null;
    try {
      const { browser, acquireTimeMs, isColdStart } = await this.getBrowser();

      page = await browser.newPage();

      // Optimize viewport for print media
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 1,
      });

      const result = await fn(page, {
        browserAcquireTimeMs: acquireTimeMs,
        isColdStart,
      });

      this.totalJobsProcessed++;
      return result;
    } catch (err: any) {
      // If browser crashed during job, invalidate reference so next job respawns
      if (err.message && (err.message.includes('Target closed') || err.message.includes('Session closed'))) {
        console.error('[BrowserPool] Target/Session closed during job. Resetting browser instance.');
        this.browser = null;
        this.browserCrashesRecovered++;
      }
      throw err;
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
      this.releaseSlot();
    }
  }

  public getStats(): BrowserPoolStats {
    return {
      activeJobs: this.activeJobs,
      queuedJobs: this.jobQueue.length,
      totalJobsProcessed: this.totalJobsProcessed,
      browserCrashesRecovered: this.browserCrashesRecovered,
      isWarm: !!(this.browser && this.browser.isConnected()),
    };
  }

  public async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }
}

export const browserPool = BrowserPool.getInstance();
