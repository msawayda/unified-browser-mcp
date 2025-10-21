# Unified Browser MCP Server

A Model Context Protocol (MCP) server that combines Playwright browser automation with DevTools-style monitoring capabilities in a single browser instance.

## Features

- **Browser Automation**: Navigate, fill forms, click elements, take screenshots
- **Network Monitoring**: Capture all network requests with full headers and response bodies
- **Console Logging**: Monitor all console messages (log, warning, error, info)
- **Performance Metrics**: Extract Navigation Timing API data
- **Single Browser Instance**: All operations work on the same browser/page for consistency

## Installation

1. Install dependencies:
```bash
cd unified-browser-mcp
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Install Playwright browsers (first time only):
```bash
npx playwright install chromium
```

## Configuration

Add to your Claude Desktop config file (`C:\Users\[username]\.cursor\mcp.json`):

```json
{
  "mcpServers": {
    "unified-browser": {
      "command": "node",
      "args": [
        "C:\\Users\\mikes\\CursorScratchpad\\unified-browser-mcp\\build\\index.js"
      ]
    }
  }
}
```

After updating the config, restart Cursor/Claude Desktop.

## Available Tools

### Browser Lifecycle

#### `launch_browser`
Launch a new Chromium browser instance.

**Parameters:**
- `headless` (boolean, optional): Run in headless mode (default: false)
- `viewport` (object, optional): Set viewport size
  - `width` (number): Viewport width (default: 1280)
  - `height` (number): Viewport height (default: 720)

#### `close_browser`
Close the browser and cleanup all resources.

### Navigation & Automation

#### `navigate`
Navigate to a URL.

**Parameters:**
- `url` (string, required): URL to navigate to
- `waitUntil` (string, optional): When to consider navigation complete
  - Options: `load`, `domcontentloaded`, `networkidle`
  - Default: `load`

#### `fill_form_field`
Fill a form field with a value.

**Parameters:**
- `selector` (string, required): CSS selector for the form field
- `value` (string, required): Value to fill

#### `click_element`
Click an element on the page.

**Parameters:**
- `selector` (string, required): CSS selector for the element
- `waitForNavigation` (boolean, optional): Wait for navigation after click (default: false)

#### `submit_form`
Submit a form by clicking a submit button or form element.

**Parameters:**
- `selector` (string, required): CSS selector for the submit button or form

#### `screenshot`
Take a screenshot of the page or a specific element.

**Parameters:**
- `fullPage` (boolean, optional): Capture full scrollable page (default: false)
- `selector` (string, optional): CSS selector to screenshot specific element

#### `evaluate_script`
Execute JavaScript code in the page context.

**Parameters:**
- `script` (string, required): JavaScript code to execute

### Monitoring & DevTools

#### `start_monitoring`
Start capturing network requests and console messages.

**Parameters:**
- `clearPrevious` (boolean, optional): Clear previously captured data (default: true)

#### `get_network_requests`
Get all captured network requests with full details.

**Parameters:**
- `filter` (string, optional): Filter requests by URL pattern

**Returns:** Array of network requests with:
- URL, method, timestamp
- Request headers and POST data
- Response status, headers, and body (text/JSON only)

#### `get_console_messages`
Get all captured console messages.

**Parameters:**
- `type` (string, optional): Filter by message type
  - Options: `log`, `warning`, `error`, `info`, `all`
  - Default: `all`

#### `get_performance_metrics`
Get page performance metrics from the Navigation Timing API.

**Returns:** Performance timing data including:
- DOM content loaded time
- Load complete time
- DOM interactive time
- DNS, TCP, request, and response times

#### `stop_monitoring`
Stop monitoring and return a summary of captured data.

**Returns:** Summary with total counts and breakdowns by status/type

## Example Usage

Here's a typical workflow for automating a form submission while monitoring network activity:

```
1. launch_browser
   - headless: false

2. navigate
   - url: "https://example.com/contact"

3. start_monitoring
   - clearPrevious: true

4. fill_form_field
   - selector: "#name"
   - value: "John Doe"

5. fill_form_field
   - selector: "#email"
   - value: "john@example.com"

6. submit_form
   - selector: "#submit"

7. get_network_requests
   - filter: "api"

8. get_console_messages
   - type: "error"

9. get_performance_metrics

10. close_browser
```

## Use Cases

### Form Automation with Network Monitoring
Automate form submissions while capturing all API calls, XHR requests, and responses.

### Performance Testing
Navigate to pages and collect detailed performance metrics including timing data.

### Debugging Web Applications
Monitor console errors and network failures during automated interactions.

### Integration Testing
Verify that forms trigger the correct API calls with proper payloads and responses.

## Technical Details

- **Browser Engine**: Chromium (via Playwright)
- **Communication**: JSON-RPC over stdio (MCP standard)
- **Network Capture**: Full request/response cycle with headers and bodies
- **Console Capture**: All message types with timestamps and locations
- **Single Instance**: One browser/context/page shared across all operations

## Troubleshooting

### Browser doesn't launch
- Ensure Playwright browsers are installed: `npx playwright install chromium`
- Check that Node.js is in your PATH

### "Browser not launched" error
- Always call `launch_browser` before other operations
- If browser crashes, call `launch_browser` again

### Network requests missing
- Call `start_monitoring` before navigation/interactions
- Network capture begins after `start_monitoring` is called

### Response bodies empty
- Only text and JSON responses are captured (binary data is skipped)
- Some responses may not be available if the request hasn't completed

## Development

To rebuild after making changes:

```bash
npm run build
```

The TypeScript compiler will output to the `build/` directory.

## License

MIT


