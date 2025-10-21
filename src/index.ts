#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { chromium, Browser, Page, BrowserContext, Request, Response } from 'playwright';

interface NetworkRequest {
  url: string;
  method: string;
  timestamp: number;
  headers: Record<string, string>;
  postData?: string;
  status?: number;
  statusText?: string;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  timing?: any;
}

interface ConsoleMessage {
  type: string;
  text: string;
  timestamp: number;
  location?: string;
}

class UnifiedBrowserMCP {
  private server: Server;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private networkRequests: NetworkRequest[] = [];
  private consoleMessages: ConsoleMessage[] = [];
  private isMonitoring: boolean = false;
  private requestMap: Map<string, NetworkRequest> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'unified-browser-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'launch_browser',
          description: 'Launch a new browser instance with DevTools monitoring enabled',
          inputSchema: {
            type: 'object',
            properties: {
              headless: {
                type: 'boolean',
                description: 'Run browser in headless mode',
                default: false,
              },
              viewport: {
                type: 'object',
                properties: {
                  width: { type: 'number', default: 1280 },
                  height: { type: 'number', default: 720 },
                },
              },
            },
          },
        },
        {
          name: 'navigate',
          description: 'Navigate to a URL',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to navigate to',
              },
              waitUntil: {
                type: 'string',
                enum: ['load', 'domcontentloaded', 'networkidle'],
                default: 'load',
              },
            },
            required: ['url'],
          },
        },
        {
          name: 'start_monitoring',
          description: 'Start capturing network requests, console messages, and other DevTools data',
          inputSchema: {
            type: 'object',
            properties: {
              clearPrevious: {
                type: 'boolean',
                description: 'Clear previously captured data',
                default: true,
              },
            },
          },
        },
        {
          name: 'fill_form_field',
          description: 'Fill a form field with a value',
          inputSchema: {
            type: 'object',
            properties: {
              selector: {
                type: 'string',
                description: 'CSS selector for the form field',
              },
              value: {
                type: 'string',
                description: 'Value to fill',
              },
            },
            required: ['selector', 'value'],
          },
        },
        {
          name: 'click_element',
          description: 'Click an element',
          inputSchema: {
            type: 'object',
            properties: {
              selector: {
                type: 'string',
                description: 'CSS selector for the element',
              },
              waitForNavigation: {
                type: 'boolean',
                description: 'Wait for navigation after click',
                default: false,
              },
            },
            required: ['selector'],
          },
        },
        {
          name: 'submit_form',
          description: 'Submit a form',
          inputSchema: {
            type: 'object',
            properties: {
              selector: {
                type: 'string',
                description: 'CSS selector for the form or submit button',
              },
            },
            required: ['selector'],
          },
        },
        {
          name: 'get_network_requests',
          description: 'Get all captured network requests with full headers and bodies',
          inputSchema: {
            type: 'object',
            properties: {
              filter: {
                type: 'string',
                description: 'Filter requests by URL pattern (optional)',
              },
            },
          },
        },
        {
          name: 'get_console_messages',
          description: 'Get all captured console messages',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['log', 'warning', 'error', 'info', 'all'],
                default: 'all',
              },
            },
          },
        },
        {
          name: 'screenshot',
          description: 'Take a screenshot of the current page',
          inputSchema: {
            type: 'object',
            properties: {
              fullPage: {
                type: 'boolean',
                description: 'Capture full page',
                default: false,
              },
              selector: {
                type: 'string',
                description: 'CSS selector to screenshot specific element',
              },
            },
          },
        },
        {
          name: 'evaluate_script',
          description: 'Execute JavaScript in the page context',
          inputSchema: {
            type: 'object',
            properties: {
              script: {
                type: 'string',
                description: 'JavaScript code to execute',
              },
            },
            required: ['script'],
          },
        },
        {
          name: 'get_performance_metrics',
          description: 'Get page performance metrics from Navigation Timing API',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'stop_monitoring',
          description: 'Stop monitoring and return summary',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'close_browser',
          description: 'Close the browser and cleanup',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'launch_browser':
            return await this.launchBrowser(args);
          case 'navigate':
            return await this.navigate(args);
          case 'start_monitoring':
            return await this.startMonitoring(args);
          case 'fill_form_field':
            return await this.fillFormField(args);
          case 'click_element':
            return await this.clickElement(args);
          case 'submit_form':
            return await this.submitForm(args);
          case 'get_network_requests':
            return await this.getNetworkRequests(args);
          case 'get_console_messages':
            return await this.getConsoleMessages(args);
          case 'screenshot':
            return await this.screenshot(args);
          case 'evaluate_script':
            return await this.evaluateScript(args);
          case 'get_performance_metrics':
            return await this.getPerformanceMetrics(args);
          case 'stop_monitoring':
            return await this.stopMonitoring(args);
          case 'close_browser':
            return await this.closeBrowser(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  private async launchBrowser(args: any) {
    if (this.browser) {
      await this.browser.close();
    }

    this.browser = await chromium.launch({
      headless: args.headless ?? false,
    });

    this.context = await this.browser.newContext({
      viewport: args.viewport ?? { width: 1280, height: 720 },
    });

    this.page = await this.context.newPage();

    return {
      content: [
        {
          type: 'text',
          text: 'Browser launched successfully',
        },
      ],
    };
  }

  private async navigate(args: any) {
    if (!this.page) throw new Error('Browser not launched');

    await this.page.goto(args.url, {
      waitUntil: args.waitUntil ?? 'load',
    });

    return {
      content: [
        {
          type: 'text',
          text: `Navigated to ${args.url}`,
        },
      ],
    };
  }

  private async startMonitoring(args: any) {
    if (!this.page) throw new Error('Browser not launched');

    if (args.clearPrevious ?? true) {
      this.networkRequests = [];
      this.consoleMessages = [];
      this.requestMap.clear();
    }

    // Monitor network requests
    this.page.on('request', (request: Request) => {
      const requestId = request.url() + '_' + Date.now();
      const networkRequest: NetworkRequest = {
        url: request.url(),
        method: request.method(),
        timestamp: Date.now(),
        headers: request.headers(),
        postData: request.postData() || undefined,
      };
      this.networkRequests.push(networkRequest);
      this.requestMap.set(request.url(), networkRequest);
    });

    this.page.on('response', async (response: Response) => {
      const request = this.requestMap.get(response.url());
      if (request) {
        request.status = response.status();
        request.statusText = response.statusText();
        request.responseHeaders = response.headers();
        
        try {
          // Only capture text responses to avoid binary data
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('text') || contentType.includes('json') || contentType.includes('application/json')) {
            request.responseBody = await response.text();
          }
        } catch (e) {
          // Ignore if body can't be captured
        }
      }
    });

    // Monitor console messages
    this.page.on('console', (msg) => {
      this.consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now(),
        location: msg.location().url,
      });
    });

    this.isMonitoring = true;

    return {
      content: [
        {
          type: 'text',
          text: 'Monitoring started - capturing network requests and console messages',
        },
      ],
    };
  }

  private async fillFormField(args: any) {
    if (!this.page) throw new Error('Browser not launched');

    await this.page.fill(args.selector, args.value);

    return {
      content: [
        {
          type: 'text',
          text: `Filled field ${args.selector} with value`,
        },
      ],
    };
  }

  private async clickElement(args: any) {
    if (!this.page) throw new Error('Browser not launched');

    if (args.waitForNavigation) {
      await Promise.all([
        this.page.waitForNavigation(),
        this.page.click(args.selector),
      ]);
    } else {
      await this.page.click(args.selector);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Clicked element ${args.selector}`,
        },
      ],
    };
  }

  private async submitForm(args: any) {
    if (!this.page) throw new Error('Browser not launched');

    await this.page.click(args.selector);

    return {
      content: [
        {
          type: 'text',
          text: `Submitted form via ${args.selector}`,
        },
      ],
    };
  }

  private async getNetworkRequests(args: any) {
    let requests = this.networkRequests;

    if (args.filter) {
      requests = requests.filter((r) => r.url.includes(args.filter));
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(requests, null, 2),
        },
      ],
    };
  }

  private async getConsoleMessages(args: any) {
    let messages = this.consoleMessages;

    if (args.type && args.type !== 'all') {
      messages = messages.filter((m) => m.type === args.type);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(messages, null, 2),
        },
      ],
    };
  }

  private async screenshot(args: any) {
    if (!this.page) throw new Error('Browser not launched');

    let screenshot: Buffer;
    if (args.selector) {
      const element = await this.page.locator(args.selector);
      screenshot = await element.screenshot();
    } else {
      screenshot = await this.page.screenshot({ fullPage: args.fullPage ?? false });
    }

    return {
      content: [
        {
          type: 'text',
          text: `Screenshot captured (${screenshot.length} bytes)`,
        },
      ],
    };
  }

  private async evaluateScript(args: any) {
    if (!this.page) throw new Error('Browser not launched');

    const result = await this.page.evaluate(args.script);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async getPerformanceMetrics(args: any) {
    if (!this.page) throw new Error('Browser not launched');

    const metrics = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!perfData) {
        return { error: 'No navigation timing data available' };
      }
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive - perfData.fetchStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        request: perfData.responseStart - perfData.requestStart,
        response: perfData.responseEnd - perfData.responseStart,
      };
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(metrics, null, 2),
        },
      ],
    };
  }

  private async stopMonitoring(args: any) {
    this.isMonitoring = false;

    const summary = {
      totalRequests: this.networkRequests.length,
      totalConsoleMessages: this.consoleMessages.length,
      requestsByStatus: this.groupBy(this.networkRequests, 'status'),
      messagesByType: this.groupBy(this.consoleMessages, 'type'),
    };

    return {
      content: [
        {
          type: 'text',
          text: `Monitoring stopped\n\nSummary:\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    };
  }

  private async closeBrowser(args: any) {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }

    return {
      content: [
        {
          type: 'text',
          text: 'Browser closed',
        },
      ],
    };
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((result, item) => {
      const value = item[key] || 'unknown';
      result[value] = (result[value] || 0) + 1;
      return result;
    }, {} as Record<string, number>);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Unified Browser MCP server running on stdio');
  }
}

const server = new UnifiedBrowserMCP();
server.run();


