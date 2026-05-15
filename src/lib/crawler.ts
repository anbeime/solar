/**
 * 增强爬虫系统 - 多数据源 + 增量更新 + 智能分类
 *
 * 数据源:
 * 1. 中国电力网 (chinapower.com.cn) - SSR, 多栏目, 可翻页
 * 2. 国家能源局 (nea.gov.cn) - SSR, 政策新闻
 * 3. 北极星光伏网 (bjx.com.cn) - SSR, 项目/招标
 * 4. 中国政府采购网 (ccgp.gov.cn) - 招标/中标
 * 5. 储能与电力市场 (escn.com.cn) - 储能专业
 * 6. 中国能源网 (china5e.com) - 综合能源
 * 7. 新浪财经能源 (finance.sina.com.cn) - 能源财经
 * 8. 东方财富网能源 (eastmoney.com) - 能源上市公司
 * 9. 国家发改委 (ndrc.gov.cn) - 政策审批
 * 10. 中国行业协会 (基于关键词过滤)
 */

import puppeteer, { type Browser, type Page } from "puppeteer-core";
import type { CrawlResult } from "./types";

// ===== Puppeteer 浏览器管理 =====

let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;
let lastCrawlResult: {
  type: string;
  result: CrawlResult;
  timestamp: string;
} | null = null;

export function getLastCrawlResult() {
  return lastCrawlResult;
}

async function getBrowser(): Promise<Browser> {
  if (browserInstance) {
    try {
      const pages = await browserInstance.pages();
      if (pages !== undefined) return browserInstance;
    } catch {
      browserInstance = null;
      browserLaunchPromise = null;
    }
  }
  if (browserLaunchPromise) return browserLaunchPromise;

  // 自动检测 Chrome 路径
  const executablePath = process.env.CHROME_PATH || findChrome();

  browserLaunchPromise = puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
      "--no-zygote",
      "--disable-extensions",
      "--disable-software-rasterizer",
      "--window-size=1920,1080",
    ],
  });

  try {
    browserInstance = await browserLaunchPromise;
    browserInstance.on("disconnected", () => {
      browserInstance = null;
      browserLaunchPromise = null;
    });
    return browserInstance;
  } catch (error) {
    browserLaunchPromise = null;
    throw error;
  }
}

function findChrome(): string {
  const paths = [
    // Linux
    "/root/.cache/puppeteer/chrome/linux-147.0.7727.57/chrome-linux64/chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    // Windows
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  const fs = require("fs");
  for (const p of paths) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {
      /* skip */
    }
  }
  return "/usr/bin/google-chrome";
}

async function crawlWithPuppeteer(
  url: string,
  evaluateFn: (page: Page) => Promise<Record<string, unknown>[]>,
  waitSelector?: string,
  timeout = 30000,
): Promise<Record<string, unknown>[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    });
    page.setDefaultNavigationTimeout(timeout);
    page.setDefaultTimeout(timeout);

    await page.goto(url, { waitUntil: "networkidle2", timeout });

    if (waitSelector) {
      await page
        .waitForSelector(waitSelector, { timeout: 10000 })
        .catch(() => {});
    } else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    return await evaluateFn(page);
  } finally {
    await page.close();
  }
}

// ===== 通用结果构造 =====

function makeResult(
  type: string,
  source: string,
  sourceUrl: string,
  data: Record<string, unknown>[],
  noDataMsg: string,
): CrawlResult {
  const result: CrawlResult =
    data.length === 0
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
          count: data.length,
          data,
          crawledAt: new Date().toISOString(),
          message: `成功从${source}爬取${data.length}条数据`,
        };

  lastCrawlResult = { type, result, timestamp: new Date().toISOString() };
  return result;
}

function makeErrorResult(
  type: string,
  source: string,
  sourceUrl: string,
  errMsg: string,
): CrawlResult {
  const result: CrawlResult = {
    success: false,
    source,
    sourceUrl,
    count: 0,
    data: [],
    crawledAt: new Date().toISOString(),
    message: `爬取失败: ${errMsg}。源站: ${sourceUrl}`,
  };
  lastCrawlResult = { type, result, timestamp: new Date().toISOString() };
  return result;
}

// ===== 数据源1: 中国电力网 =====

export async function crawlChinaPower(): Promise<CrawlResult> {
  const source = "中国电力网";
  const sourceUrl = "http://www.chinapower.com.cn/";
  const sections = [
    "/chuneng/",
    "/tynfd/",
    "/fd/",
    "/xw/",
    "/dww/",
    "/flfd/",
    "/qingneng/",
    "/tanzhonghe/",
    "/guihuajianshe/",
  ];
  const allItems: Record<string, unknown>[] = [];

  try {
    for (const section of sections) {
      try {
        const data = await crawlWithPuppeteer(
          `${sourceUrl}${section}`,
          async (page: Page) => {
            return page.evaluate(() => {
              const items: Record<string, unknown>[] = [];
              document.querySelectorAll("a").forEach((link) => {
                const title = link.textContent?.trim() || "";
                const href = link.getAttribute("href") || "";
                if (
                  title.length > 10 &&
                  href &&
                  /\/\d{6,8}\/\d+\.html/.test(href)
                ) {
                  items.push({
                    title,
                    sourceUrl: href.startsWith("http")
                      ? href
                      : `http://www.chinapower.com.cn${href}`,
                    sourceName: "中国电力网",
                    section: window.location.pathname,
                  });
                }
              });
              return items;
            });
          },
          ".list, .news-list, table, ul",
          20000,
        );
        allItems.push(...data);
      } catch {
        // 继续下一个栏目
      }
    }

    return makeResult(
      "chinapower",
      source,
      sourceUrl,
      allItems,
      `已访问${source}，但未找到数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "chinapower",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源2: 国家能源局 =====

export async function crawlNEA(): Promise<CrawlResult> {
  const source = "国家能源局";
  const sourceUrl = "http://www.nea.gov.cn/";

  try {
    const data = await crawlWithPuppeteer(
      sourceUrl,
      async (page: Page) => {
        return page.evaluate(() => {
          const items: Record<string, unknown>[] = [];
          document.querySelectorAll("a").forEach((link) => {
            const title = link.textContent?.trim() || "";
            const href = link.getAttribute("href") || "";
            if (
              title &&
              href &&
              title.length > 10 &&
              (title.includes("光伏") ||
                title.includes("储能") ||
                title.includes("新能源") ||
                title.includes("风电") ||
                title.includes("可再生能源") ||
                title.includes("电力"))
            ) {
              items.push({
                title,
                sourceUrl: href.startsWith("http")
                  ? href
                  : `http://www.nea.gov.cn/${href}`,
                sourceName: "国家能源局",
              });
            }
          });
          return items;
        });
      },
      ".con, .list, .news-list, table",
      20000,
    );

    return makeResult(
      "nea",
      source,
      sourceUrl,
      data,
      `已访问${source}，但未找到数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "nea",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源3: 北极星光伏网 =====

export async function crawlBJX(): Promise<CrawlResult> {
  const source = "北极星光伏网";
  const sourceUrl = "https://guangfu.bjx.com.cn/";

  try {
    const data = await crawlWithPuppeteer(
      sourceUrl,
      async (page: Page) => {
        return page.evaluate(() => {
          const items: Record<string, unknown>[] = [];
          document.querySelectorAll("a").forEach((link) => {
            const title = link.textContent?.trim() || "";
            const href = link.getAttribute("href") || "";
            if (
              title &&
              href &&
              title.length > 8 &&
              (title.includes("光伏") ||
                title.includes("储能") ||
                title.includes("项目") ||
                title.includes("招标") ||
                title.includes("新能源"))
            ) {
              items.push({
                title,
                sourceUrl: href.startsWith("http")
                  ? href
                  : `https://guangfu.bjx.com.cn${href.startsWith("/") ? "" : "/"}${href}`,
                sourceName: "北极星光伏网",
              });
            }
          });
          return items;
        });
      },
      ".list, .news-list, ul, table",
      20000,
    );

    return makeResult(
      "bjx",
      source,
      sourceUrl,
      data,
      `已访问${source}，但未找到数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "bjx",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源4: 中国政府采购网 =====

export async function crawlBidding(): Promise<CrawlResult> {
  const source = "中国政府采购网";
  const sourceUrl = "http://www.ccgp.gov.cn/cggg/zygg/gkzb/";

  try {
    const data = await crawlWithPuppeteer(
      sourceUrl,
      async (page: Page) => {
        return page.evaluate(() => {
          const items: Record<string, unknown>[] = [];
          const rows = document.querySelectorAll(
            "ul.vT-s_result_list li, .vT-z_entry_list li, table tbody tr, .list-item",
          );
          rows.forEach((row) => {
            const link = row.querySelector("a");
            if (link) {
              const title = link.textContent?.trim() || "";
              const href = link.getAttribute("href") || "";
              const dateEl = row.querySelector(
                ".vT-s-result-time, span.time, .date, td:last-child",
              );
              const date = dateEl?.textContent?.trim() || "";
              if (title && title.length > 6 && href) {
                items.push({
                  title,
                  sourceUrl: href.startsWith("http")
                    ? href
                    : `http://www.ccgp.gov.cn/cggg/zygg/gkzb/${href.replace(/^\.\//, "")}`,
                  sourceName: "中国政府采购网",
                  publishDate: date,
                });
              }
            }
          });
          if (items.length === 0) {
            document.querySelectorAll("a").forEach((link) => {
              const title = link.textContent?.trim() || "";
              const href = link.getAttribute("href") || "";
              if (
                title.length > 8 &&
                href &&
                (title.includes("招标") ||
                  title.includes("采购") ||
                  title.includes("公告"))
              ) {
                items.push({
                  title,
                  sourceUrl: href.startsWith("http")
                    ? href
                    : `http://www.ccgp.gov.cn${href.startsWith("/") ? "" : "/cggg/zygg/gkzb/"}${href}`,
                  sourceName: "中国政府采购网",
                });
              }
            });
          }
          return items;
        });
      },
      "ul, table, .list",
      25000,
    );

    return makeResult(
      "bidding",
      source,
      sourceUrl,
      data,
      `已访问${source}，但未找到招标数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "bidding",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源5: 中标公示 =====

export async function crawlAwards(): Promise<CrawlResult> {
  const source = "中国政府采购网";
  const sourceUrl = "http://www.ccgp.gov.cn/cggg/zygg/gkzb/";

  try {
    const data = await crawlWithPuppeteer(
      sourceUrl,
      async (page: Page) => {
        return page.evaluate(() => {
          const items: Record<string, unknown>[] = [];
          document.querySelectorAll("a").forEach((link) => {
            const title = link.textContent?.trim() || "";
            const href = link.getAttribute("href") || "";
            if (
              title.length > 8 &&
              href &&
              (title.includes("中标") ||
                title.includes("成交") ||
                title.includes("结果"))
            ) {
              items.push({
                title,
                sourceUrl: href.startsWith("http")
                  ? href
                  : `http://www.ccgp.gov.cn${href.startsWith("/") ? "" : "/"}${href}`,
                sourceName: "中国政府采购网",
              });
            }
          });
          return items;
        });
      },
      undefined,
      25000,
    );

    return makeResult(
      "awards",
      source,
      sourceUrl,
      data,
      `已访问${source}，但未找到中标数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "awards",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源6: 充电桩 =====

export async function crawlChargers(): Promise<CrawlResult> {
  const source = "中国充电联盟";
  const sourceUrl = "http://www.evcipa.org.cn/";

  try {
    const data = await crawlWithPuppeteer(
      sourceUrl,
      async (page: Page) => {
        return page.evaluate(() => {
          const items: Record<string, unknown>[] = [];
          document.querySelectorAll("a").forEach((link) => {
            const title = link.textContent?.trim() || "";
            const href = link.getAttribute("href") || "";
            if (
              title &&
              href &&
              title.length > 6 &&
              (title.includes("充电") ||
                title.includes("桩") ||
                title.includes("换电") ||
                title.includes("站") ||
                title.includes("设施"))
            ) {
              items.push({
                title,
                sourceUrl: href.startsWith("http")
                  ? href
                  : `http://www.evcipa.org.cn${href.startsWith("/") ? "" : "/"}${href}`,
                sourceName: "中国充电联盟",
              });
            }
          });
          return items;
        });
      },
      ".list, .news-list, .station-list, table, ul",
      25000,
    );

    return makeResult(
      "chargers",
      source,
      sourceUrl,
      data,
      `已访问${source}，但未找到充电桩数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "chargers",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源7: 储能与电力市场 =====

export async function crawlESCN(): Promise<CrawlResult> {
  const source = "储能与电力市场";
  const sourceUrl = "https://www.escn.com.cn/";
  const sections = ["news/", "policy/", "market/"];

  try {
    const allItems: Record<string, unknown>[] = [];

    for (const section of sections) {
      try {
        const data = await crawlWithPuppeteer(
          `${sourceUrl}${section}`,
          async (page: Page) => {
            return page.evaluate(() => {
              const items: Record<string, unknown>[] = [];
              document.querySelectorAll("a").forEach((link) => {
                const title = link.textContent?.trim() || "";
                const href = link.getAttribute("href") || "";
                if (
                  title &&
                  href &&
                  title.length > 8 &&
                  /\/\d{4}\/\d+/.test(href)
                ) {
                  items.push({
                    title,
                    sourceUrl: href.startsWith("http")
                      ? href
                      : `https://www.escn.com.cn${href}`,
                    sourceName: "储能与电力市场",
                  });
                }
              });
              return items;
            });
          },
          ".list, .news-list, ul, table",
          20000,
        );
        allItems.push(...data);
      } catch {
        // continue
      }
    }

    return makeResult(
      "escn",
      source,
      sourceUrl,
      allItems,
      `已访问${source}，但未找到数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "escn",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源8: 中国能源网 =====

export async function crawlChina5E(): Promise<CrawlResult> {
  const source = "中国能源网";
  const sourceUrl = "https://www.china5e.com/";
  const sections = ["news/", "news/zonghe/", "news/huanbao/"];

  try {
    const allItems: Record<string, unknown>[] = [];

    for (const section of sections) {
      try {
        const data = await crawlWithPuppeteer(
          `${sourceUrl}${section}`,
          async (page: Page) => {
            return page.evaluate(() => {
              const items: Record<string, unknown>[] = [];
              document.querySelectorAll("a").forEach((link) => {
                const title = link.textContent?.trim() || "";
                const href = link.getAttribute("href") || "";
                if (
                  title &&
                  href &&
                  title.length > 8 &&
                  (title.includes("光伏") ||
                    title.includes("储能") ||
                    title.includes("新能源") ||
                    title.includes("风电") ||
                    title.includes("氢能"))
                ) {
                  items.push({
                    title,
                    sourceUrl: href.startsWith("http")
                      ? href
                      : `https://www.china5e.com${href}`,
                    sourceName: "中国能源网",
                  });
                }
              });
              return items;
            });
          },
          ".list, .news-list, ul, table",
          20000,
        );
        allItems.push(...data);
      } catch {
        // continue
      }
    }

    return makeResult(
      "china5e",
      source,
      sourceUrl,
      allItems,
      `已访问${source}，但未找到数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "china5e",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源9: 新浪财经能源 =====

export async function crawlSinaFinance(): Promise<CrawlResult> {
  const source = "新浪财经";
  const sourceUrl = "https://finance.sina.com.cn/energy/";

  try {
    const data = await crawlWithPuppeteer(
      sourceUrl,
      async (page: Page) => {
        return page.evaluate(() => {
          const items: Record<string, unknown>[] = [];
          document.querySelectorAll("a").forEach((link) => {
            const title = link.textContent?.trim() || "";
            const href = link.getAttribute("href") || "";
            if (
              title &&
              href &&
              title.length > 8 &&
              href.includes("finance.sina.com.cn")
            ) {
              items.push({
                title,
                sourceUrl: href,
                sourceName: "新浪财经",
              });
            }
          });
          return items;
        });
      },
      ".news-list, ul, table",
      20000,
    );

    return makeResult(
      "sina",
      source,
      sourceUrl,
      data,
      `已访问${source}，但未找到数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "sina",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源10: 东方财富网 =====

export async function crawlEastMoney(): Promise<CrawlResult> {
  const source = "东方财富网";
  const sourceUrl = "https://www.eastmoney.com/";
  const keywordSections = [
    "https://search.eastmoney.com/search/s?keyword=光伏储能",
    "https://search.eastmoney.com/search/s?keyword=新能源招标",
  ];

  try {
    const allItems: Record<string, unknown>[] = [];

    for (const url of keywordSections) {
      try {
        const data = await crawlWithPuppeteer(
          url,
          async (page: Page) => {
            return page.evaluate(() => {
              const items: Record<string, unknown>[] = [];
              document.querySelectorAll("a").forEach((link) => {
                const title = link.textContent?.trim() || "";
                const href = link.getAttribute("href") || "";
                if (
                  title &&
                  href &&
                  title.length > 10 &&
                  href.includes("eastmoney.com")
                ) {
                  items.push({
                    title,
                    sourceUrl: href,
                    sourceName: "东方财富网",
                  });
                }
              });
              return items;
            });
          },
          ".search-list, .news-list, ul",
          25000,
        );
        allItems.push(...data);
      } catch {
        // continue
      }
    }

    return makeResult(
      "eastmoney",
      source,
      sourceUrl,
      allItems,
      `已访问${source}，但未找到数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "eastmoney",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源11: 国家发改委 =====

export async function crawlNDRC(): Promise<CrawlResult> {
  const source = "国家发改委";
  const sourceUrl = "https://www.ndrc.gov.cn/";
  const sections = ["xwzx/tzgg/", "fzggw/"];

  try {
    const allItems: Record<string, unknown>[] = [];

    for (const section of sections) {
      try {
        const data = await crawlWithPuppeteer(
          `${sourceUrl}${section}`,
          async (page: Page) => {
            return page.evaluate(() => {
              const items: Record<string, unknown>[] = [];
              document.querySelectorAll("a").forEach((link) => {
                const title = link.textContent?.trim() || "";
                const href = link.getAttribute("href") || "";
                if (
                  title &&
                  href &&
                  title.length > 8 &&
                  (title.includes("光伏") ||
                    title.includes("储能") ||
                    title.includes("新能源") ||
                    title.includes("项目") ||
                    title.includes("审批"))
                ) {
                  items.push({
                    title,
                    sourceUrl: href.startsWith("http")
                      ? href
                      : `https://www.ndrc.gov.cn${href}`,
                    sourceName: "国家发改委",
                  });
                }
              });
              return items;
            });
          },
          ".list, .news-list, ul, table",
          20000,
        );
        allItems.push(...data);
      } catch {
        // continue
      }
    }

    return makeResult(
      "ndrc",
      source,
      sourceUrl,
      allItems,
      `已访问${source}，但未找到数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "ndrc",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 数据源12: 中国招投标公共服务平台 =====

export async function crawlTenderInfo(): Promise<CrawlResult> {
  const source = "中国招投标公共服务平台";
  const sourceUrl = "https://www.cebpubservice.com/";
  const sections = ["cgxx/", "zbcgxx/"];

  try {
    const allItems: Record<string, unknown>[] = [];

    for (const section of sections) {
      try {
        const data = await crawlWithPuppeteer(
          `${sourceUrl}${section}`,
          async (page: Page) => {
            return page.evaluate(() => {
              const items: Record<string, unknown>[] = [];
              document.querySelectorAll("a").forEach((link) => {
                const title = link.textContent?.trim() || "";
                const href = link.getAttribute("href") || "";
                if (
                  title &&
                  href &&
                  title.length > 8 &&
                  (title.includes("光伏") ||
                    title.includes("储能") ||
                    title.includes("招标") ||
                    title.includes("采购"))
                ) {
                  items.push({
                    title,
                    sourceUrl: href.startsWith("http")
                      ? href
                      : `https://www.cebpubservice.com${href}`,
                    sourceName: "中国招投标公共服务平台",
                  });
                }
              });
              return items;
            });
          },
          ".list, .news-list, ul, table",
          20000,
        );
        allItems.push(...data);
      } catch {
        // continue
      }
    }

    return makeResult(
      "tender",
      source,
      sourceUrl,
      allItems,
      `已访问${source}，但未找到数据`,
    );
  } catch (error) {
    return makeErrorResult(
      "tender",
      source,
      sourceUrl,
      error instanceof Error ? error.message : "未知错误",
    );
  }
}

// ===== 全量爬取 =====

export async function crawlAllSources(): Promise<Record<string, CrawlResult>> {
  const results: Record<string, CrawlResult> = {};

  // 依次爬取各源（避免并发过载）
  const tasks = [
    ["chinapower", crawlChinaPower],
    ["nea", crawlNEA],
    ["bjx", crawlBJX],
    ["bidding", crawlBidding],
    ["awards", crawlAwards],
    ["chargers", crawlChargers],
    ["escn", crawlESCN],
    ["china5e", crawlChina5E],
    ["sina", crawlSinaFinance],
    ["eastmoney", crawlEastMoney],
    ["ndrc", crawlNDRC],
    ["tender", crawlTenderInfo],
  ] as const;

  for (const [key, fn] of tasks) {
    try {
      results[key] = await fn();
    } catch (error) {
      results[key] = makeErrorResult(
        key,
        key,
        "",
        error instanceof Error ? error.message : "未知错误",
      );
    }
  }

  return results;
}
