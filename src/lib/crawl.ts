/**
 * 爬取工具函数 - 集成 Puppeteer 无头浏览器
 * 负责从各数据源抓取并解析JS动态渲染页面
 */

import puppeteer, { type Browser, type Page } from 'puppeteer-core';

export interface CrawlResult {
  success: boolean;
  source: string;
  sourceUrl: string;
  count: number;
  data: Record<string, unknown>[];
  crawledAt: string;
  message: string;
}

// ===== Puppeteer 浏览器管理 =====

let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;
let lastCrawlResult: { type: string; result: CrawlResult; timestamp: string } | null = null;

export function getLastCrawlResult() {
  return lastCrawlResult;
}

async function getBrowser(): Promise<Browser> {
  if (browserInstance) {
    try {
      const pages = await browserInstance.pages();
      if (pages !== undefined) {
        return browserInstance;
      }
    } catch {
      browserInstance = null;
      browserLaunchPromise = null;
    }
  }
  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  browserLaunchPromise = puppeteer.launch({
    executablePath:
      '/root/.cache/puppeteer/chrome/linux-147.0.7727.57/chrome-linux64/chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote',
      '--disable-extensions',
      '--disable-software-rasterizer',
      '--window-size=1920,1080',
    ],
  });

  try {
    browserInstance = await browserLaunchPromise;
    browserInstance.on('disconnected', () => {
      browserInstance = null;
      browserLaunchPromise = null;
    });
    return browserInstance;
  } catch (error) {
    browserLaunchPromise = null;
    throw error;
  }
}

async function crawlWithPuppeteer(
  url: string,
  evaluateFn: (page: Page) => Promise<Record<string, unknown>[]>,
  waitSelector?: string,
  timeout = 30000
): Promise<Record<string, unknown>[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    });

    page.setDefaultNavigationTimeout(timeout);
    page.setDefaultTimeout(timeout);

    await page.goto(url, { waitUntil: 'networkidle2', timeout });

    if (waitSelector) {
      await page.waitForSelector(waitSelector, { timeout: 10000 }).catch(() => {});
    } else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    const extractedData = await evaluateFn(page);
    return extractedData;
  } finally {
    await page.close();
  }
}

function makeResult(
  type: string,
  source: string,
  sourceUrl: string,
  extractedData: Record<string, unknown>[],
  noDataMsg: string
): CrawlResult {
  const result: CrawlResult = extractedData.length === 0
    ? {
        success: false,
        source,
        sourceUrl,
        count: 0,
        data: [],
        crawledAt: new Date().toISOString(),
        message: noDataMsg,
      }
    : {
        success: true,
        source,
        sourceUrl,
        count: extractedData.length,
        data: extractedData,
        crawledAt: new Date().toISOString(),
        message: `成功从${source}爬取${extractedData.length}条数据`,
      };

  lastCrawlResult = { type, result, timestamp: new Date().toISOString() };
  return result;
}

function makeErrorResult(type: string, source: string, sourceUrl: string, errMsg: string): CrawlResult {
  const result: CrawlResult = {
    success: false,
    source,
    sourceUrl,
    count: 0,
    data: [],
    crawledAt: new Date().toISOString(),
    message: `无头浏览器爬取失败: ${errMsg}。源站地址: ${sourceUrl}`,
  };
  lastCrawlResult = { type, result, timestamp: new Date().toISOString() };
  return result;
}

// ===== 各数据源爬取函数 =====

/**
 * 从中国政府采购网爬取光伏储能招标公告
 */
export async function crawlBidding(): Promise<CrawlResult> {
  const source = '中国政府采购网';
  const sourceUrl = 'http://www.ccgp.gov.cn/cggg/zygg/gkzb/';

  try {
    const extractedData = await crawlWithPuppeteer(
      sourceUrl,
      async (page: Page) => {
        return page.evaluate(() => {
          const items: Record<string, unknown>[] = [];
          const rows = document.querySelectorAll('ul.vT-s_result_list li, .vT-z_entry_list li, table tbody tr, .list-item');

          rows.forEach((row) => {
            const link = row.querySelector('a');
            if (link) {
              const title = link.textContent?.trim() || '';
              const href = link.getAttribute('href') || '';
              const dateEl = row.querySelector('.vT-s-result-time, span.time, .date, td:last-child');
              const date = dateEl?.textContent?.trim() || '';

              if (title && title.length > 6 && href) {
                items.push({
                  title,
                  sourceUrl: href.startsWith('http')
                    ? href
                    : `http://www.ccgp.gov.cn/cggg/zygg/gkzb/${href.replace(/^\.\//, '')}`,
                  sourceName: '中国政府采购网',
                  publishDate: date,
                  crawledAt: new Date().toISOString(),
                });
              }
            }
          });

          // 如果结构化选择器没匹配到，退而搜索所有包含"招标"或"采购"的链接
          if (items.length === 0) {
            document.querySelectorAll('a').forEach((link) => {
              const title = link.textContent?.trim() || '';
              const href = link.getAttribute('href') || '';
              if (
                title.length > 8 &&
                href &&
                (title.includes('招标') || title.includes('采购') || title.includes('公告'))
              ) {
                items.push({
                  title,
                  sourceUrl: href.startsWith('http')
                    ? href
                    : `http://www.ccgp.gov.cn${href.startsWith('/') ? '' : '/cggg/zygg/gkzb/'}${href}`,
                  sourceName: '中国政府采购网',
                  crawledAt: new Date().toISOString(),
                });
              }
            });
          }

          return items;
        });
      },
      'ul, table, .list',
      25000
    );

    return makeResult('bidding', source, sourceUrl, extractedData, `已通过无头浏览器访问${source}，但未找到招标公告数据。页面结构可能已变更。源站地址: ${sourceUrl}`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    return makeErrorResult('bidding', source, sourceUrl, errMsg);
  }
}

/**
 * 从中国政府采购网爬取中标公示
 */
export async function crawlAwards(): Promise<CrawlResult> {
  const source = '中国政府采购网';
  const sourceUrl = 'http://www.ccgp.gov.cn/cggg/zygg/gkzb/';

  try {
    const extractedData = await crawlWithPuppeteer(
      sourceUrl,
      async (page: Page) => {
        return page.evaluate(() => {
          const items: Record<string, unknown>[] = [];
          // 中标公告搜索结果
          document.querySelectorAll('a').forEach((link) => {
            const title = link.textContent?.trim() || '';
            const href = link.getAttribute('href') || '';
            if (
              title.length > 8 &&
              href &&
              (title.includes('中标') || title.includes('成交') || title.includes('结果'))
            ) {
              items.push({
                title,
                sourceUrl: href.startsWith('http')
                  ? href
                  : `http://www.ccgp.gov.cn${href.startsWith('/') ? '' : '/'}${href}`,
                sourceName: '中国政府采购网',
                crawledAt: new Date().toISOString(),
              });
            }
          });
          return items;
        });
      },
      undefined,
      25000
    );

    return makeResult('awards', source, sourceUrl, extractedData, `已通过无头浏览器访问${source}，但未找到中标公示数据。源站地址: ${sourceUrl}`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    return makeErrorResult('awards', source, sourceUrl, errMsg);
  }
}

/**
 * 从国家能源局爬取项目数据
 */
export async function crawlProjects(): Promise<CrawlResult> {
  const source = '国家能源局';
  const sourceUrl = 'http://www.nea.gov.cn/';

  try {
    const extractedData = await crawlWithPuppeteer(
      sourceUrl,
      async (page: Page) => {
        return page.evaluate(() => {
          const items: Record<string, unknown>[] = [];
          const links = document.querySelectorAll('a');

          links.forEach((link) => {
            const title = link.textContent?.trim() || '';
            const href = link.getAttribute('href') || '';

            if (
              title &&
              href &&
              title.length > 10 &&
              (title.includes('光伏') || title.includes('储能') || title.includes('新能源') || title.includes('风电') || title.includes('太阳能') || title.includes('电力') || title.includes('可再生能源'))
            ) {
              items.push({
                title,
                sourceUrl: href.startsWith('http')
                  ? href
                  : `http://www.nea.gov.cn/${href}`,
                sourceName: '国家能源局',
                crawledAt: new Date().toISOString(),
              });
            }
          });
          return items;
        });
      },
      '.con, .list, .news-list, table',
      25000
    );

    return makeResult('projects', source, sourceUrl, extractedData, `已通过无头浏览器访问${source}，但未找到新能源相关数据。源站地址: ${sourceUrl}`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    return makeErrorResult('projects', source, sourceUrl, errMsg);
  }
}

/**
 * 从中国充电联盟爬取充电桩数据
 */
export async function crawlChargers(): Promise<CrawlResult> {
  const source = '中国充电联盟';
  const sourceUrl = 'http://www.evcipa.org.cn/';

  try {
    const extractedData = await crawlWithPuppeteer(
      sourceUrl,
      async (page: Page) => {
        return page.evaluate(() => {
          const items: Record<string, unknown>[] = [];
          const links = document.querySelectorAll('a');

          links.forEach((link) => {
            const title = link.textContent?.trim() || '';
            const href = link.getAttribute('href') || '';

            if (
              title &&
              href &&
              title.length > 6 &&
              (title.includes('充电') || title.includes('桩') || title.includes('换电') || title.includes('站') || title.includes('设施') || title.includes('补短'))
            ) {
              items.push({
                title,
                sourceUrl: href.startsWith('http')
                  ? href
                  : `http://www.evcipa.org.cn${href.startsWith('/') ? '' : '/'}${href}`,
                sourceName: '中国充电联盟',
                crawledAt: new Date().toISOString(),
              });
            }
          });
          return items;
        });
      },
      '.list, .news-list, .station-list, table, ul',
      25000
    );

    return makeResult('chargers', source, sourceUrl, extractedData, `已通过无头浏览器访问${source}，但未找到充电桩数据。源站地址: ${sourceUrl}`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    return makeErrorResult('chargers', source, sourceUrl, errMsg);
  }
}
