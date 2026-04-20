# AGENT.md — Multi-Browser Agent Playbook

## Browser Fleet

This project has **5 isolated Playwright/Chromium instances** available via MCP:

| Instance | MCP Server | Use Case |
|----------|------------|----------|
| `playwright-1` | Primary | Main app navigation, UI testing |
| `playwright-2` | Secondary | API/network monitoring, parallel page |
| `playwright-3` | Tertiary | Competitor research, external sites |
| `playwright-4` | Quaternary | Auth flows, logged-in sessions |
| `playwright-5` | Quinary | Screenshot comparisons, visual QA |

Each instance runs `@playwright/mcp@latest` with `--headless --browser chromium --isolated`.

## How to Use

### Single browser (simple task)
Use any `playwright-*` tool directly — e.g., `mcp__playwright-1__browser_navigate`.

### Multi-browser (parallel tasks)
Call tools from different instances in the **same message** to run them concurrently:

```
mcp__playwright-1__browser_navigate → https://aurafit.style (check our site)
mcp__playwright-2__browser_navigate → https://competitor.com (compare)
mcp__playwright-3__browser_navigate → https://api-endpoint/health (monitor)
```

### Tool naming pattern
All tools follow: `mcp__playwright-{N}__browser_{action}`

Available actions:
- `navigate`, `navigate_back` — go to URLs
- `snapshot` — get accessibility tree (fast, preferred for reading page state)
- `take_screenshot` — visual capture
- `click`, `hover`, `drag` — interact with elements
- `fill_form`, `type`, `press_key` — input text
- `select_option` — dropdowns
- `evaluate`, `run_code` — execute JS in page
- `console_messages` — read console output
- `network_requests` — monitor network activity
- `wait_for` — wait for elements/conditions
- `file_upload` — upload files
- `handle_dialog` — accept/dismiss alerts
- `tabs` — manage tabs
- `resize` — change viewport
- `close` — close browser

## Workflow Patterns

### Visual QA
1. `playwright-1`: navigate to staging URL
2. `playwright-2`: navigate to production URL
3. Take screenshots from both, compare

### Auth + Unauth Testing
1. `playwright-1`: log in, test authenticated flows
2. `playwright-2`: test same pages as anonymous user

### API + UI Monitoring
1. `playwright-1`: interact with the UI
2. `playwright-2`: monitor network requests on the same page

### Competitive Research
1. `playwright-1`: our site
2. `playwright-2` through `playwright-5`: competitor sites

## Project Context

- **App**: AuraFit — AI-powered fashion recommendation wizard
- **Stack**: Next.js 16, React 19, Tailwind CSS 4, Gemini AI, Upstash Vector
- **Dev server**: `pnpm dev` (port 3000)
- **Production**: Deployed on Vercel

## Notes

- All instances are headless — use `snapshot` (accessibility tree) for fast page reads, `take_screenshot` for visual checks
- Each instance is `--isolated` so cookies/state don't leak between them
- Restart Claude Code session if MCP servers need to reconnect
- Prefer `snapshot` over `take_screenshot` for speed when you don't need visuals
