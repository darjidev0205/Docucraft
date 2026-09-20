import fs from 'fs';
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

  private getExecutablePath(): string {
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return process.env.CHROME_PATH || 'chrome';
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
        const executablePath = this.getExecutablePath();
        console.log(`[BrowserPool] Launching headless browser using: ${executablePath}`);

        const browser = await puppeteer.launch({
          executablePath,
          headless: true,
          args: [
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
          ],
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
