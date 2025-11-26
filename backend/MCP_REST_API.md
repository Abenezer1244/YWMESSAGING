# MCP REST API Endpoints

Production-grade REST endpoints for Model Context Provider tools (Semgrep, Ref, Context7, Exa).

## Overview

This implementation provides REST endpoints that bridge backend services with Claude's native MCP system:

- **Semgrep**: Direct HTTP API to `api.semgrep.dev`
- **Ref & Context7**: Agent gateway that invokes Claude with native MCP access
- **Exa**: Direct HTTP API for web search

## Endpoints

### Health Check

**GET /api/security/health**

Returns the operational status of all MCP tools.

```bash
curl http://localhost:3000/api/security/health
```

Response:
```json
{
  "status": "operational",
  "tools": {
    "semgrep": "available",
    "exa": "available",
    "ref": "available",
    "context7": "available"
  }
}
```

### Semgrep Code Scanning

**POST /api/security/semgrep-scan**

Scan code for security vulnerabilities using Semgrep.

```bash
curl -X POST http://localhost:3000/api/security/semgrep-scan \
  -H "Content-Type: application/json" \
  -d '{
    "code": "password = \"hardcoded123\"",
    "language": "python",
    "rules": "security"
  }'
```

**Request Body:**
```typescript
{
  code: string;        // Code to scan
  language: string;    // Language (js, ts, python, java, go, rust, etc)
  rules?: string;      // Rule set (default: "security")
}
```

**Response:**
```json
{
  "status": "success",
  "tool": "semgrep_scan",
  "language": "python",
  "results_count": 1,
  "results": [
    {
      "rule_id": "python.lang.hardcoded-password",
      "message": "Hardcoded credentials detected",
      "severity": "HIGH",
      "path": "script.py",
      "line": 1,
      "column": 12
    }
  ],
  "timestamp": "2025-11-26T..."
}
```

### Ref Search Documentation

**POST /api/security/ref/search**

Search for documentation using Ref MCP.

```bash
curl -X POST http://localhost:3000/api/security/ref/search \
  -H "Content-Type: application/json" \
  -d '{"query": "React hooks"}'
```

**Request Body:**
```typescript
{
  query: string;  // Documentation search query (max 500 chars)
}
```

**Response:**
```json
{
  "status": "success",
  "tool": "ref_search_documentation",
  "response": "Documentation search results..."
}
```

### Ref Read Documentation

**POST /api/security/ref/read**

Read documentation from a specific URL using Ref MCP.

```bash
curl -X POST http://localhost:3000/api/security/ref/read \
  -H "Content-Type: application/json" \
  -d '{"url": "https://react.dev/reference/react/useState"}'
```

**Request Body:**
```typescript
{
  url: string;  // Full URL including hash if needed
}
```

**Response:**
```json
{
  "status": "success",
  "tool": "ref_read_url",
  "response": "URL content as markdown..."
}
```

### Context7 Resolve Library ID

**POST /api/security/context7/resolve**

Resolve a library name to its Context7 ID.

```bash
curl -X POST http://localhost:3000/api/security/context7/resolve \
  -H "Content-Type: application/json" \
  -d '{"libraryName": "React"}'
```

**Request Body:**
```typescript
{
  libraryName: string;  // Library name (max 200 chars)
}
```

**Response:**
```json
{
  "status": "success",
  "tool": "context7_resolve_library_id",
  "response": "Library ID resolution results..."
}
```

### Context7 Get Library Documentation

**POST /api/security/context7/docs**

Get documentation for a library from Context7.

```bash
curl -X POST http://localhost:3000/api/security/context7/docs \
  -H "Content-Type: application/json" \
  -d '{
    "libraryId": "/facebook/react",
    "topic": "hooks",
    "mode": "code"
  }'
```

**Request Body:**
```typescript
{
  libraryId: string;        // Context7 library ID (required)
  topic?: string;           // Topic to focus on
  mode?: "code" | "info";   // Mode: "code" for APIs, "info" for guides (default: "code")
}
```

**Response:**
```json
{
  "status": "success",
  "tool": "context7_get_library_docs",
  "response": "Library documentation..."
}
```

## Architecture

### How It Works

**Direct API Endpoints (Semgrep, Exa):**
```
Client Request
    ↓
REST Endpoint
    ↓
Direct API Call (HTTP)
    ↓
Returns Results
```

**Agent Gateway (Ref, Context7):**
```
Client Request
    ↓
REST Endpoint
    ↓
MCP Agent Gateway Service
    ↓
Claude API with Tool Definition
    ↓
Claude Invokes Native MCP
    ↓
Returns Results
```

### Why This Design

- **Direct APIs** (Semgrep, Exa): These services expose public HTTP endpoints
- **Agent Gateway** (Ref, Context7): These are Claude MCPs that only exist in Claude's environment
  - No public HTTP API
  - Gateway invokes Claude agents which have native access
  - Claude handles the tool execution
  - Backend returns results to client

## Environment Variables

Required:
```env
SEMGREP_API_KEY=<your-semgrep-token>
CLAUDE_API_KEY=<your-claude-api-key>
EXA_API_KEY=<your-exa-api-key>
```

Optional:
```env
REF_API_KEY=<ref-key>              # Not used by REST endpoint
CONTEXT7_API_KEY=<context7-key>    # Not used by REST endpoint
```

## Error Handling

All endpoints return meaningful error messages:

```json
{
  "status": "error",
  "tool": "semgrep_scan",
  "error": "Missing required field: code",
  "details": "..."  // Only in development mode
}
```

## Rate Limiting

All security endpoints are rate-limited with `apiLimiter`:
- 60 requests per 15 minutes per IP
- Returns 429 if exceeded

## Testing

Run the integration tests:

```bash
npm test -- __tests__/api/security.endpoints.test.ts
```

Tests cover:
- Valid requests and responses
- Parameter validation
- Error handling
- Rate limiting
- All language aliases
- URL validation
- Mode validation

## Language Support (Semgrep)

Supported language aliases:
- JavaScript: `js`, `javascript`
- TypeScript: `ts`, `typescript`
- Python: `py`, `python`
- Java: `java`
- Go: `go`
- Rust: `rust`
- C: `c`
- C++: `cpp`
- C#: `csharp`, `c#`
- Ruby: `ruby`
- PHP: `php`
- JSON: `json`
- YAML: `yaml`
- HTML: `html`
- XML: `xml`
- Dockerfile: `dockerfile`

## Production Deployment

These endpoints are production-ready:
- ✅ Real API integrations (not mocks)
- ✅ Enterprise-grade error handling
- ✅ Rate limiting to prevent abuse
- ✅ Input validation
- ✅ Comprehensive logging
- ✅ Full test coverage

Deploy to production with confidence!
