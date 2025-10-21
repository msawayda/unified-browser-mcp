# Unified Browser MCP Server

A Model Context Protocol (MCP) server that combines Playwright browser automation with DevTools-style monitoring capabilities in a single browser instance.

## Features

- **Browser Automation**: Navigate, fill forms, click elements, take screenshots
- **Network Monitoring**: Capture all network requests with full headers and response bodies
- **Console Logging**: Monitor all console messages (log, warning, error, info)
- **Performance Metrics**: Extract Navigation Timing API data
- **Single Browser Instance**: All operations work on the same browser/page for consistency

## What is an MCP Server?

The Model Context Protocol (MCP) allows AI assistants like Claude to interact with external tools and services. This MCP server acts as a bridge between Claude and browser automation capabilities, running automatically in the background whenever you use Claude Desktop or Cursor.

**Key Points:**
- 🔄 **Automatic Startup**: The server launches automatically when you open Cursor/Claude Desktop
- 🔌 **No Manual Running**: You never need to manually start the server
- 🛠️ **Tool Provider**: Makes browser automation tools available to Claude
- 💬 **Communication**: Uses JSON-RPC over stdio to talk to Claude

## Installation

### Prerequisites

Before installing, ensure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Cursor** or **Claude Desktop** - [Download Cursor](https://cursor.sh/)

### Method 1: Using npx (Recommended - Easiest)

**This is the simplest method** - no cloning, no building, just one config update!

Simply add this to your MCP configuration file and restart Cursor:

```json
{
  "mcpServers": {
    "unified-browser": {
      "command": "npx",
      "args": ["-y", "unified-browser-mcp"]
    }
  }
}
```

**That's it!** The server will be automatically downloaded and run when Cursor starts.

**Note:** You'll still need to install Playwright browsers once:
```bash
npx playwright install chromium
```

---

### Method 2: Manual Installation from Source

If you prefer to build from source or want to modify the code:

**Step 1: Get the Code**

Choose one of these methods:

**Option A: Clone from GitHub**
```bash
git clone https://github.com/msawayda/unified-browser-mcp.git
cd unified-browser-mcp
```

**Option B: Download ZIP**
1. Go to https://github.com/msawayda/unified-browser-mcp
2. Click "Code" → "Download ZIP"
3. Extract to your preferred location
4. Open terminal/command prompt in that folder

**Step 2: Install Dependencies**

```bash
npm install
```

This will install:
- `@modelcontextprotocol/sdk` - MCP communication layer
- `playwright` - Browser automation library
- TypeScript and build tools

**Expected output:**
```
added 19 packages, and audited 20 packages in 25s
found 0 vulnerabilities
```

**Step 3: Build the Server**

```bash
npm run build
```

This compiles the TypeScript code to JavaScript in the `build/` directory.

**Expected output:**
```
> unified-browser-mcp@1.0.0 build
> tsc
```

You should now see a `build/` folder with `index.js` inside.

**Step 4: Install Playwright Browsers**

```bash
npx playwright install chromium
```

This downloads the Chromium browser (~150 MB) that Playwright will use.

**Expected output:**
```
Downloading Chromium 141.0.7390.37...
Chromium downloaded to C:\Users\[username]\AppData\Local\ms-playwright\chromium-1194
```

**Note:** This only needs to be done once per machine.

## Configuration

### Locate Your MCP Configuration File

The MCP configuration file location depends on your operating system:

| OS | Configuration File Path |
|---|---|
| **Windows** | `C:\Users\[username]\.cursor\mcp.json` |
| **macOS** | `~/Library/Application Support/Cursor/mcp.json` |
| **Linux** | `~/.config/cursor/mcp.json` |

**For Claude Desktop** (instead of Cursor):
- **Windows**: `C:\Users\[username]\AppData\Roaming\Claude\mcp.json`
- **macOS**: `~/Library/Application Support/Claude/mcp.json`
- **Linux**: `~/.config/Claude/mcp.json`

### Add the Server Configuration

1. **Open the config file** in a text editor (create it if it doesn't exist)

2. **Add your server** to the `mcpServers` object:

#### For npx Installation (Method 1):

**All Operating Systems:**
```json
{
  "mcpServers": {
    "unified-browser": {
      "command": "npx",
      "args": ["-y", "unified-browser-mcp"]
    }
  }
}
```

Simple! Same config works on Windows, macOS, and Linux.

#### For Manual Installation (Method 2):

**Windows Example:**
```json
{
  "mcpServers": {
    "unified-browser": {
      "command": "node",
      "args": [
        "C:\\Users\\YourUsername\\unified-browser-mcp\\build\\index.js"
      ]
    }
  }
}
```

**macOS/Linux Example:**
```json
{
  "mcpServers": {
    "unified-browser": {
      "command": "node",
      "args": [
        "/Users/yourusername/unified-browser-mcp/build/index.js"
      ]
    }
  }
}
```

**Important Notes:**
- ✅ Use **absolute paths** (full path from root)
- ✅ On Windows, use **double backslashes** (`\\`) or forward slashes (`/`)
- ✅ Replace `YourUsername` with your actual username
- ✅ Match the path to where you installed the server

3. **If you already have other MCP servers**, add a comma after the previous entry:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "unified-browser": {
      "command": "npx",
      "args": ["-y", "unified-browser-mcp"]
    }
  }
}
```

### Step 5: Restart Cursor/Claude Desktop

**Important:** You must completely restart the application for MCP servers to load.

1. **Close Cursor/Claude Desktop completely** (not just the window)
2. **Reopen the application**
3. The MCP server will now start automatically in the background

## How It Works

### Automatic Server Management

When you start Cursor/Claude Desktop:

1. **Cursor reads** your `mcp.json` configuration
2. **Launches the server** by running: `node path/to/build/index.js`
3. **Establishes communication** via stdio (standard input/output)
4. **Keeps it running** in the background throughout your session
5. **Shuts it down** automatically when you close Cursor

You'll see this in the server logs (stderr):
```
Unified Browser MCP server running on stdio
```

### Using the Server

Once configured and Cursor is restarted:

1. **Start a conversation** with Claude in Cursor
2. **The tools are automatically available** - Claude can now use browser automation commands
3. **Request browser actions** like:
   - "Launch a browser and navigate to example.com"
   - "Fill out this form and monitor the network requests"
   - "Take a screenshot of the current page"
4. **Claude will execute** using the MCP tools behind the scenes

**You never need to manually start or stop the server!**

## Verification

### Check If the Server Loaded Successfully

After restarting Cursor, you can verify the server is working:

1. **Start a new chat with Claude**
2. **Ask:** "What MCP tools do you have available?"
3. **Look for:** Tools like `launch_browser`, `navigate`, `start_monitoring`, etc.

If you see these tools, the server is running correctly! ✅

### Common Installation Issues

#### ❌ "Cannot find module '@modelcontextprotocol/sdk'"
**Problem:** Dependencies not installed

**Solution:**
```bash
cd unified-browser-mcp
npm install
```

#### ❌ "build/index.js not found"
**Problem:** TypeScript not compiled

**Solution:**
```bash
npm run build
```

#### ❌ "Playwright browsers not found"
**Problem:** Chromium not downloaded

**Solution:**
```bash
npx playwright install chromium
```

#### ❌ Tools not appearing in Claude
**Possible causes:**
1. **Wrong path in mcp.json** - Double-check the absolute path
2. **Didn't restart Cursor** - Must fully restart, not just reload window
3. **JSON syntax error** - Validate your JSON at https://jsonlint.com/
4. **Wrong file location** - Config must be in the correct OS-specific location

**Debug steps:**
1. Check Cursor's developer console (Help → Toggle Developer Tools)
2. Look for MCP-related errors
3. Verify the path exists: `node C:\path\to\build\index.js` should output the server message

## Updating

To update the server after pulling new changes:

```bash
cd unified-browser-mcp
git pull origin main  # If using git
npm install           # Install any new dependencies
npm run build         # Rebuild
```

Then restart Cursor/Claude Desktop.

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


