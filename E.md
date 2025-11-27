[GET]404connect-yw-backend.onrender.com/clientIP="34.82.41.62" requestID="32bf1c2b-e2d0-48dd" responseTimeMS=21 responseBytes=1296 userAgent="Go-http-client/2.0"
     ==> 
     ==> ///////////////////////////////////////////////////////////
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 24770 bytes
   Signature header: sha256=691540cf653b6e4e6b33a2bec05b1238f7210973fe30c4d0a21f369a0ffd2590
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 691540cf65...
   Calculated: 691540cf65...
   Payload size: 24770 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: pull_request
   Delivery ID: 8b12d010-cb55-11f0-97c6-92c4ee168311
   PR Number: #31
   PR Title: feat: Week 1 Security & Reliability - Input validation, error trackin…
   Action: opened
🤖 Processing GitHub webhook: pull_request
🔍 PR Review Triggered
   PR #31: feat: Week 1 Security & Reliability - Input validation, error trackin…
   Author: Abenezer1244
   Branch: feature/mcp-rest-api-test
📡 Invoking 5 agents in parallel...
🤖 Invoking 5 agents (parallel)
🤖 Invoking backend-engineer agent with MCPs...
📊 MCP Configuration for backend-engineer:
   Total Tools: 4
   ✓ context7_resolve_library_id
   ✓ context7_get_library_docs
   ✓ exa_web_search_exa
   ✓ semgrep_scan
🔧 Agent "backend-engineer" has 4 MCPs available
   - context7_resolve_library_id
   - context7_get_library_docs
   - exa_web_search_exa
   - semgrep_scan
   🔄 Iteration 1/10
🤖 Invoking senior-frontend agent with MCPs...
📊 MCP Configuration for senior-frontend:
   Total Tools: 6
   ✓ context7_resolve_library_id
   ✓ context7_get_library_docs
   ✓ exa_web_search_exa
   ✓ semgrep_scan
   ✓ playwright_browser_navigate
   ✓ playwright_browser_take_screenshot
🔧 Agent "senior-frontend" has 6 MCPs available
   - context7_resolve_library_id
   - context7_get_library_docs
   - exa_web_search_exa
   - semgrep_scan
   - playwright_browser_navigate
   - playwright_browser_take_screenshot
   🔄 Iteration 1/10
🤖 Invoking security-analyst agent with MCPs...
📊 MCP Configuration for security-analyst:
   Total Tools: 4
   ✓ semgrep_scan
   ✓ exa_web_search_exa
   ✓ context7_resolve_library_id
   ✓ context7_get_library_docs
🔧 Agent "security-analyst" has 4 MCPs available
   - semgrep_scan
   - exa_web_search_exa
   - context7_resolve_library_id
   - context7_get_library_docs
   🔄 Iteration 1/10
🤖 Invoking design-review agent with MCPs...
📊 MCP Configuration for design-review:
   Total Tools: 3
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.9" requestID="6c474968-6031-43c1" responseTimeMS=25 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
   ✓ playwright_browser_navigate
   ✓ playwright_browser_take_screenshot
   ✓ exa_web_search_exa
🔧 Agent "design-review" has 3 MCPs available
   - playwright_browser_navigate
   - playwright_browser_take_screenshot
   - exa_web_search_exa
   🔄 Iteration 1/10
🤖 Invoking qa-testing agent with MCPs...
📊 MCP Configuration for qa-testing:
   Total Tools: 4
   ✓ playwright_browser_navigate
   ✓ playwright_browser_take_screenshot
   ✓ semgrep_scan
   ✓ exa_web_search_exa
🔧 Agent "qa-testing" has 4 MCPs available
   - playwright_browser_navigate
   - playwright_browser_take_screenshot
   - semgrep_scan
   - exa_web_search_exa
   🔄 Iteration 1/10
✅ GitHub webhook accepted for processing
   Stop reason: tool_use
   🔧 Agent used 1 tool(s)
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"GitHub PR Abenezer1244 Week 1 Security Reliability Input validation","num_results":5,"type":"auto"}
🔍 Exa Search: "GitHub PR Abenezer1244 Week 1 Security Reliability Input validation" (auto, 5 results)
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
   🔄 Iteration 2/10
   Stop reason: tool_use
   🔧 Agent used 3 tool(s)
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"Zod validation security best practices OWASP injection attacks 2024","num_results":5,"type":"deep"}
🔍 Exa Search: "Zod validation security best practices OWASP injection attacks 2024" (deep, 5 results)
   Stop reason: tool_use
   🔧 Agent used 4 tool(s)
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"Zod validation testing strategies best practices 2024","num_results":5}
🔍 Exa Search: "Zod validation testing strategies best practices 2024" (auto, 5 results)
   Stop reason: tool_use
   🔧 Agent used 3 tool(s)
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"Zod validation best practices Node.js Express API 2024","num_results":5,"type":"auto"}
🔍 Exa Search: "Zod validation best practices Node.js Express API 2024" (auto, 5 results)
   Stop reason: tool_use
   🔧 Agent used 3 tool(s)
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"React frontend input validation Zod integration best practices 2024","num_results":5}
🔍 Exa Search: "React frontend input validation Zod integration best practices 2024" (auto, 5 results)
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"Sentry error tracking React frontend integration performance impact","num_results":5}
🔍 Exa Search: "Sentry error tracking React frontend integration performance impact" (auto, 5 results)
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"Redis token revocation blacklist performance scalability patterns","num_results":5,"type":"auto"}
🔍 Exa Search: "Redis token revocation blacklist performance scalability patterns" (auto, 5 results)
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"Sentry error tracking testing integration tests","num_results":5}
🔍 Exa Search: "Sentry error tracking testing integration tests" (auto, 5 results)
❌ Exa search failed: Request failed with status code 429
   ✓ Tool execution complete
      ✓ Tool result added to context
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"Redis token revocation testing edge cases security","num_results":5}
🔍 Exa Search: "Redis token revocation testing edge cases security" (auto, 5 results)
❌ Exa search failed: Request failed with status code 429
   ✓ Tool execution complete
      ✓ Tool result added to context
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"database backup testing verification strategies","num_results":5}
🔍 Exa Search: "database backup testing verification strategies" (auto, 5 results)
❌ Exa search failed: Request failed with status code 429
   ✓ Tool execution complete
      ✓ Tool result added to context
   🔄 Iteration 2/10
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"Sentry error tracking Express middleware best practices 2024","num_results":5,"type":"auto"}
🔍 Exa Search: "Sentry error tracking Express middleware best practices 2024" (auto, 5 results)
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"frontend security token revocation patterns React accessibility WCAG","num_results":5}
🔍 Exa Search: "frontend security token revocation patterns React accessibility WCAG" (auto, 5 results)
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
   🔄 Iteration 2/10
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
   🔄 Iteration 2/10
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 25816 bytes
   Signature header: sha256=afe7ea0278377d133407cd50fd6990ed506bb976b1b2bdd876c5c2684ed32670
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: afe7ea0278...
   Calculated: afe7ea0278...
   Payload size: 25816 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: pull_request
   Delivery ID: 8ff37080-cb55-11f0-903d-dcad2a330c1f
   PR Number: #31
   PR Title: feat: Week 1 Security & Reliability - Input validation, error trackin…
   Action: closed
🤖 Processing GitHub webhook: pull_request
⚠️ Skipping PR action: closed
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 26846 bytes
   Signature header: sha256=37c187093444e7546ca7a6656b98d2f26a6426b2c198f666642b1f5d364f72f9
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 37c1870934...
   Calculated: 37c1870934...
   Payload size: 26846 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: push
   Delivery ID: 903eb90a-cb55-11f0-9d9c-9d1f58c4e309
   Commit SHA: edc9da5
   Branch: refs/heads/main
   Pusher: Abenezer1244
🤖 Processing GitHub webhook: push
📤 Push to main branch detected
   Commit: edc9da5
   Pusher: Abenezer1244
   Commits: 2
📡 Invoking 3 agents in parallel...
🤖 Invoking 3 agents (parallel)
🤖 Invoking system-architecture agent with MCPs...
📊 MCP Configuration for system-architecture:
   Total Tools: 3
   ✓ context7_resolve_library_id
   ✓ context7_get_library_docs
   ✓ exa_web_search_exa
🔧 Agent "system-architecture" has 3 MCPs available
   - context7_resolve_library_id
   - context7_get_library_docs
   - exa_web_search_exa
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.32" requestID="66626307-bfe1-4d8a" responseTimeMS=48 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.251" requestID="1aecdcdf-30f4-4a87" responseTimeMS=18 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
   🔄 Iteration 1/10
🤖 Invoking devops agent with MCPs...
📊 MCP Configuration for devops:
   Total Tools: 3
   ✓ context7_resolve_library_id
   ✓ context7_get_library_docs
   ✓ exa_web_search_exa
🔧 Agent "devops" has 3 MCPs available
   - context7_resolve_library_id
   - context7_get_library_docs
   - exa_web_search_exa
   🔄 Iteration 1/10
🤖 Invoking product-manager agent with MCPs...
📊 MCP Configuration for product-manager:
   Total Tools: 3
   ✓ exa_web_search_exa
   ✓ context7_resolve_library_id
   ✓ context7_get_library_docs
🔧 Agent "product-manager" has 3 MCPs available
   - exa_web_search_exa
   - context7_resolve_library_id
   - context7_get_library_docs
   🔄 Iteration 1/10
✅ GitHub webhook accepted for processing
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"Redis token blacklist revocation security vulnerabilities authentication 2024","num_results":5,"type":"deep"}
🔍 Exa Search: "Redis token blacklist revocation security vulnerabilities authentication 2024" (deep, 5 results)
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 19542 bytes
   Signature header: sha256=eb9aa3277c8404cbef55b068b55f31c2632349d68c2dd00be06c196d2eacfdae
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: eb9aa3277c...
   Calculated: eb9aa3277c...
   Payload size: 19542 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.58" requestID="6feda023-481c-4e8b" responseTimeMS=16 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.9" requestID="b114b522-1d80-4d72" responseTimeMS=7 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
📨 GitHub Webhook Received
   Event Type: workflow_run
   Delivery ID: 9116e1e0-cb55-11f0-8b22-06b5cca147f8
   Workflow: .github/workflows/agents-pr-review.yml
   Status: failure
   Branch: main
🤖 Processing GitHub webhook: workflow_run
⚠️ Skipping workflow action: requested
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 9492 bytes
   Signature header: sha256=c29905c1991ddd884c30141e684671511b4a2b7d9a0eaa94554bb22800cdceed
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: c29905c199...
   Calculated: c29905c199...
   Payload size: 9492 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_suite
   Delivery ID: 911cae40-cb55-11f0-8a73-1e06f5ab2714
🤖 Processing GitHub webhook: check_suite
⚠️ Unhandled GitHub event type: check_suite
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 9492 bytes
   Signature header: sha256=09b0ff70143f5a5d2502c447f8854cc96d205dce588e9d0ed9741b2f5941c0aa
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 09b0ff7014...
   Calculated: 09b0ff7014...
   Payload size: 9492 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_suite
   Delivery ID: 915411f0-cb55-11f0-8610-cf1cc27a1c4e
🤖 Processing GitHub webhook: check_suite
⚠️ Unhandled GitHub event type: check_suite
✅ GitHub webhook accepted for processing
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.62" requestID="4fbaaf30-1e54-4342" responseTimeMS=4 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.148" requestID="67dcccb5-17d9-4b5e" responseTimeMS=12 responseBytes=1434 userAgent="GitHub-Hookshot/41bdff2"
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 19548 bytes
   Signature header: sha256=e24f1303ff8a3bf698981d2fe2b44ca117e196b03126674ac395d389d53d8f03
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: e24f1303ff...
   Calculated: e24f1303ff...
   Payload size: 19548 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_run
   Delivery ID: 914e4590-cb55-11f0-9d9e-36b2d11e0033
   Workflow: .github/workflows/agents-main-merge.yml
   Status: failure
   Branch: main
🤖 Processing GitHub webhook: workflow_run
⚠️ Skipping workflow action: requested
✅ GitHub webhook accepted for processing
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.38" requestID="0d8714c5-80eb-4b4f" responseTimeMS=9 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.12" requestID="f0162aa4-7dd7-4aa0" responseTimeMS=3 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.37" requestID="ab695794-1011-4f96" responseTimeMS=11 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.9" requestID="d22b26ba-a8a8-454f" responseTimeMS=4 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.12" requestID="d562a21a-d795-4c9a" responseTimeMS=21 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.42" requestID="467b5624-d240-4324" responseTimeMS=2 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.9" requestID="bf362aa3-6d67-4c67" responseTimeMS=8 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11826 bytes
   Signature header: sha256=e113c6bca8e79307ccfe5b10c40035fd329d456461ad5a18dff93514337ffc1a
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: e113c6bca8...
   Calculated: e113c6bca8...
   Payload size: 11826 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: 91f76d00-cb55-11f0-963b-7fc733f619cd
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"Sentry error tracking security information disclosure OWASP 2024","num_results":5,"type":"deep"}
🔍 Exa Search: "Sentry error tracking security information disclosure OWASP 2024" (deep, 5 results)
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.90" requestID="2597c140-08cb-4d7e" responseTimeMS=9 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.148" requestID="095bcec3-8bea-40a6" responseTimeMS=5 responseBytes=1434 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.109" requestID="30cc61cf-665c-4cb0" responseTimeMS=4 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.12" requestID="a8ca6574-ec60-4026" responseTimeMS=21 responseBytes=1434 userAgent="GitHub-Hookshot/41bdff2"
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11825 bytes
   Signature header: sha256=df2107e2ad9cae918f6d98a076823cd265ea10b48ba2328fc5d4a61463f4d1b1
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: df2107e2ad...
   Calculated: df2107e2ad...
   Payload size: 11825 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: 91f716e8-cb55-11f0-8609-b332c7282328
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 19443 bytes
   Signature header: sha256=42eb0e68903bde693228a2dbe568c73be54ab9a919f84956ae7f30fbb3817461
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 42eb0e6890...
   Calculated: 42eb0e6890...
   Payload size: 19443 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_run
   Delivery ID: 91bb5f40-cb55-11f0-9e74-7cba1d0132c7
   Workflow: Deploy to Render
   Status: null
   Branch: main
🤖 Processing GitHub webhook: workflow_run
⚠️ Skipping workflow action: requested
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7077 bytes
   Signature header: sha256=1bdfbc39bbf04b3fd7a44f429fc885af591811a188b046e70c657df850c7f5d7
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 1bdfbc39bb...
   Calculated: 1bdfbc39bb...
   Payload size: 7077 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: 91ffe250-cb55-11f0-80a4-9596bd413a5d
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7081 bytes
   Signature header: sha256=18d629decbd192d0ec1babd70aa8b5530228803969d59cc056cd01030021c0d4
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 18d629decb...
   Calculated: 18d629decb...
   Payload size: 7081 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: 91f9c7d0-cb55-11f0-83a6-8120b38c61a5
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7080 bytes
   Signature header: sha256=a53cb74cb548b7d94093bf241634d78178e529f558c2c32c139d3a6e1f7d1e25
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: a53cb74cb5...
   Calculated: a53cb74cb5...
   Payload size: 7080 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: 91f9c7d0-cb55-11f0-9489-d058947691f1
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11822 bytes
   Signature header: sha256=0e84c4fd69fbd4f5ae6909ac635bf04ce4898ea69514d06ab44a6c14fc5ad269
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 0e84c4fd69...
   Calculated: 0e84c4fd69...
   Payload size: 11822 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: 91fc60f8-cb55-11f0-80fa-843b539da61e
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7129 bytes
   Signature header: sha256=c13355d7337c9c5693055f5d211a5ea7318a0f0fcdfd27eecb19de9fe2158330
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: c13355d733...
   Calculated: c13355d733...
   Payload size: 7129 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: 9399bc30-cb55-11f0-81fc-fd190eb7cb7c
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 19450 bytes
   Signature header: sha256=b1e148741552c654f78b133c54215ca6aef7ccafcfbbcd31e87661ef1d62ca38
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: b1e1487415...
   Calculated: b1e1487415...
   Payload size: 19450 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_run
   Delivery ID: 93d7af90-cb55-11f0-9e35-4bc22e057581
   Workflow: Deploy to Render
   Status: null
   Branch: main
🤖 Processing GitHub webhook: workflow_run
⚠️ Skipping workflow action: in_progress
✅ GitHub webhook accepted for processing
   Stop reason: tool_use
   🔧 Agent used 1 tool(s)
      Executing: exa_web_search_exa
🔧 EXECUTING REAL MCP TOOL: exa_web_search_exa
   Input: {"query":"systems architecture code review checklist scalability database design integration patterns 2024","num_results":5,"type":"deep"}
🔍 Exa Search: "systems architecture code review checklist scalability database design integration patterns 2024" (deep, 5 results)
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7125 bytes
   Signature header: sha256=4a203e074f0f0e4882bae44d0dd5d1d17c3a557c7414e7239db10604d5a0da5a
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 4a203e074f...
   Calculated: 4a203e074f...
   Payload size: 7125 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: 9361e350-cb55-11f0-9d30-2cd8a9d1c16c
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7128 bytes
   Signature header: sha256=db420cee6a00b5fc2e3f24e534d26903467eac91c55e907370c502726732b5a2
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: db420cee6a...
   Calculated: db420cee6a...
   Payload size: 7128 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: 93e2ac10-cb55-11f0-889e-290e25678d38
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
   Stop reason: end_turn
   ✅ Agent completed (end_turn)
✅ product-manager agent completed (1 iterations)
   Severity: info
   Findings: 0
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
   🔄 Iteration 2/10
✓ Exa returned 5 results
   ✓ Tool execution complete
      ✓ Tool result added to context
   🔄 Iteration 2/10
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11858 bytes
   Signature header: sha256=974a99f0bc5008e0a2e3c2a556706fa0ce7b440c49f4f4772b8017e52ebd2faa
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 974a99f0bc...
   Calculated: 974a99f0bc...
   Payload size: 11858 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: 99644a72-cb55-11f0-8905-c9116be3d2fe
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 8085 bytes
   Signature header: sha256=1b6d5237845f1b6c1e7af6a603dbce5485619b258827cb1a9b6377f424cb8d55
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 1b6d523784...
   Calculated: 1b6d523784...
   Payload size: 8085 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: 9967f0f0-cb55-11f0-8edb-81336e0b159a
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.12" requestID="1843b55f-8925-4c6c" responseTimeMS=4 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.105" requestID="38853da5-1c49-4250" responseTimeMS=3 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
[PHONE_LINKING_RECOVERY] Starting phone linking recovery job
[PHONE_LINKING_RECOVERY] Found 0 churches needing recovery
[PHONE_LINKING_RECOVERY] 0 churches ready for retry (respecting backoff)
[PHONE_LINKING_RECOVERY] Recovery job completed. Processed: 0 churches. Duration: 83ms
[PHONE_LINKING_RECOVERY] Summary: 0 succeeded, 0 failed, 0 need manual intervention
[PHONE_LINKING_RECOVERY] Starting phone linking recovery job
[PHONE_LINKING_RECOVERY] Found 0 churches needing recovery
[PHONE_LINKING_RECOVERY] 0 churches ready for retry (respecting backoff)
[PHONE_LINKING_RECOVERY] Recovery job completed. Processed: 0 churches. Duration: 68ms
[PHONE_LINKING_RECOVERY] Summary: 0 succeeded, 0 failed, 0 need manual intervention
   Stop reason: end_turn
   ✅ Agent completed (end_turn)
✅ system-architecture agent completed (2 iterations)
   Severity: info
   Findings: 0
   Stop reason: end_turn
   ✅ Agent completed (end_turn)
✅ devops agent completed (1 iterations)
   Severity: info
   Findings: 0
💾 Cached analysis results for hash 1d43b2d9...
   Cache size: 1/1000
✅ All agents completed. Post-merge analysis done.
   Successful responses: 3/3
📝 Audit logged for system-architecture
📝 Audit logged for devops
📝 Audit logged for product-manager
✅ Slack notification sent
   Stop reason: end_turn
   ✅ Agent completed (end_turn)
✅ design-review agent completed (2 iterations)
   Severity: info
   Findings: 8
   Stop reason: max_tokens
   ⚠️ Unknown stop reason: max_tokens
✅ senior-frontend agent completed (2 iterations)
   Severity: info
   Findings: 0
   Stop reason: max_tokens
   ⚠️ Unknown stop reason: max_tokens
✅ qa-testing agent completed (2 iterations)
   Severity: info
   Findings: 0
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.41" requestID="8f3f4bda-4eed-4538" responseTimeMS=4 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.9" requestID="26e3c2f5-d921-44da" responseTimeMS=5 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 8244 bytes
   Signature header: sha256=ec44dba7a3a9040592a48f5d56167711a0d2ac55123ba699e39e677a6c5be180
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: ec44dba7a3...
   Calculated: ec44dba7a3...
   Payload size: 8244 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: b658ffb0-cb55-11f0-807a-1c3b6db013a7
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11855 bytes
   Signature header: sha256=2b441316b783180beb6713c68f436cf50c740d6a2a845eca6f74019a34d5a465
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 2b441316b7...
   Calculated: 2b441316b7...
   Payload size: 11855 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: b65361e0-cb55-11f0-9047-cb4be0da0110
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11862 bytes
   Signature header: sha256=a97f62ead25041d5c507f8bdf5ae890b67a88010cca753bff124a2ea66c27a55
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: a97f62ead2...
   Calculated: a97f62ead2...
   Payload size: 11862 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: b8f26bf8-cb55-11f0-8719-43d3ee4abf9c
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 19451 bytes
   Signature header: sha256=a6a2b249a835f499880c880328bb698b6e41e78c1af1b81e9422764e2b052730
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: a6a2b249a8...
   Calculated: a6a2b249a8...
   Payload size: 19451 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_run
   Delivery ID: b8e92070-cb55-11f0-95ac-2d58c31163db
   Workflow: Deploy to Render
   Status: failure
   Branch: main
🤖 Processing GitHub webhook: workflow_run
⚙️ Workflow Run Event
   Workflow: Deploy to Render
   Status: failure
📡 Invoking 1 agent(s)...
🤖 Invoking 1 agents (parallel)
🤖 Invoking security-analyst agent with MCPs...
📊 MCP Configuration for security-analyst:
   Total Tools: 4
   ✓ semgrep_scan
   ✓ exa_web_search_exa
   ✓ context7_resolve_library_id
   ✓ context7_get_library_docs
🔧 Agent "security-analyst" has 4 MCPs available
   - semgrep_scan
   - exa_web_search_exa
   - context7_resolve_library_id
   - context7_get_library_docs
   🔄 Iteration 1/10
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 9491 bytes
   Signature header: sha256=dfd56973d97af3654e4ca802072f888c8dced7c5a32f162b293a18ee699b748c
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: dfd56973d9...
   Calculated: dfd56973d9...
   Payload size: 9491 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_suite
   Delivery ID: b8e43e70-cb55-11f0-877a-4ceadd7588c2
🤖 Processing GitHub webhook: check_suite
⚠️ Unhandled GitHub event type: check_suite
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 9692 bytes
   Signature header: sha256=27f16d4d8c705ef2d767cf6cf8cb253823adc10f39521a68fc06c1951980f419
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 27f16d4d8c...
   Calculated: 27f16d4d8c...
   Payload size: 9692 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: b8f5f1b0-cb55-11f0-8974-0643cf1034d8
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.11" requestID="cf54ade4-ca50-42cb" responseTimeMS=4 responseBytes=1434 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.9" requestID="abea8ac9-cb2a-4427" responseTimeMS=3 responseBytes=1434 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.173" requestID="93488d2c-1602-4b8d" responseTimeMS=4 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.74" requestID="456a12d4-5666-4dec" responseTimeMS=7 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     ==> Deploying...
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 19503 bytes
   Signature header: sha256=2978689e00e1206fee20b1bb7615cc321c4dfff2d43d1a3087557578a372ee05
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 2978689e00...
   Calculated: 2978689e00...
   Payload size: 19503 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_run
   Delivery ID: ba30bba0-cb55-11f0-9a89-b3a7e316fdfd
   Workflow: Automated Agent Deployment Review
   Status: null
   Branch: main
🤖 Processing GitHub webhook: workflow_run
⚠️ Skipping workflow action: requested
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11828 bytes
   Signature header: sha256=2be24eb30d1e2e8e5489c9ac84651ea6c82bd6ad6b88283c8d5b7fbe4bbf7798
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 2be24eb30d...
   Calculated: 2be24eb30d...
   Payload size: 11828 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: ba844554-cb55-11f0-9204-3b99248f6432
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7100 bytes
   Signature header: sha256=d1e67bd4dbe35e08dbc21da3853dd7c41a0cc516fd3e8a729eee35edf9a182ae
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: d1e67bd4db...
   Calculated: d1e67bd4db...
   Payload size: 7100 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: ba867cc0-cb55-11f0-969c-44b2072e5c83
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11864 bytes
   Signature header: sha256=7ecb408690a4339351d36f411453556410925690bcc40ca9c1944de3c343f589
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 7ecb408690...
   Calculated: 7ecb408690...
   Payload size: 11864 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: ba8eb700-cb55-11f0-9e73-fe26299b822d
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11866 bytes
   Signature header: sha256=5a019bc4b1fe120adfd9825f6dc8c1a508980105dee90e0b9a588a184478d2aa
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 5a019bc4b1...
   Calculated: 5a019bc4b1...
   Payload size: 11866 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: ba922f8e-cb55-11f0-9429-648cb5ad866e
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11864 bytes
   Signature header: sha256=d30ccfb80273044ba1c424f8f5a0a713b55544db39751d480d0394e6a718961b
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: d30ccfb802...
   Calculated: d30ccfb802...
   Payload size: 11864 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: ba960c9e-cb55-11f0-83bc-8b09d83c36c0
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7135 bytes
   Signature header: sha256=8189558d6f1b96902e911e7d31088fdf7dcd06d98c362dae546f70ee7c0ebc1b
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 8189558d6f...
   Calculated: 8189558d6f...
   Payload size: 7135 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: ba9e2370-cb55-11f0-8b24-56f854d0891e
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11862 bytes
   Signature header: sha256=0122dbf6c3e80ef4eae8cea31c5d66f92ca3a9f6ee9cc81319d943aea3b77232
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 0122dbf6c3...
   Calculated: 0122dbf6c3...
   Payload size: 11862 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: ba982218-cb55-11f0-9328-6fcb76e05f5f
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7139 bytes
   Signature header: sha256=8950e9bce3dd847c62783a88e5b72408f3cdd85def48ba8e7b57be71718b4149
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 8950e9bce3...
   Calculated: 8950e9bce3...
   Payload size: 7139 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: ba97e1e0-cb55-11f0-9335-9b8778db39ec
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11860 bytes
   Signature header: sha256=22796a6679b7d84e0f451e3c9cfa3cc0dc4fd4be613c3e821ac004d8258c47f9
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 22796a6679...
   Calculated: 22796a6679...
   Payload size: 11860 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: ba9bf122-cb55-11f0-9d3e-687b63024e29
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7137 bytes
   Signature header: sha256=ab24a49b9ed8b2832fb0951a1ec7df76296311cf7798bcd3489e21b8124585a0
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: ab24a49b9e...
   Calculated: ab24a49b9e...
   Payload size: 7137 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: ba95bf00-cb55-11f0-8df7-4f8a5488790b
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11862 bytes
   Signature header: sha256=66cee521199c7408373e709fd2b638648460a8da3c722f4d68e2ba072155bc3e
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 66cee52119...
   Calculated: 66cee52119...
   Payload size: 11862 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: ba9355e4-cb55-11f0-8dbe-518441ab28bd
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.9" requestID="5547fa83-8c31-4589" responseTimeMS=28 responseBytes=1434 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.119" requestID="62a6d2ca-77c2-4474" responseTimeMS=4 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.42" requestID="8adde2fb-046e-4696" responseTimeMS=4 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.96" requestID="0cee0908-09ab-400a" responseTimeMS=5 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.9" requestID="942b55a6-f68e-4329" responseTimeMS=4 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.40" requestID="97bc63bc-2b99-48fd" responseTimeMS=5 responseBytes=1434 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.24" requestID="e0a21e3b-7389-4682" responseTimeMS=3 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.24" requestID="b16e07ab-5bd5-407a" responseTimeMS=2 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.47" requestID="1c7c902f-bb06-4444" responseTimeMS=2 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.10" requestID="449c1090-e4a2-43a2" responseTimeMS=2 responseBytes=1434 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.19" requestID="9cf08754-cc0d-46f6" responseTimeMS=9 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.65" requestID="544161e5-e2d6-4eb2" responseTimeMS=6 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7148 bytes
   Signature header: sha256=f054b05a034264266e964cb607f6f18a8bce6246c628d5345ddb27538e316ddd
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: f054b05a03...
   Calculated: f054b05a03...
   Payload size: 7148 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: bc2b0500-cb55-11f0-9003-36a2953ab5e1
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 19510 bytes
   Signature header: sha256=e3268f1e6b35dff49fd75d2261714218f64ea7da17a9bb174f16be383ca36b24
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: e3268f1e6b...
   Calculated: e3268f1e6b...
   Payload size: 19510 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_run
   Delivery ID: bc20f2e0-cb55-11f0-839c-d25d6f20a796
   Workflow: Automated Agent Deployment Review
   Status: null
   Branch: main
🤖 Processing GitHub webhook: workflow_run
⚠️ Skipping workflow action: in_progress
✅ GitHub webhook accepted for processing
   Stop reason: end_turn
   ✅ Agent completed (end_turn)
✅ security-analyst agent completed (1 iterations)
   Severity: info
   Findings: 0
💾 Cached analysis results for hash 46e20790...
   Cache size: 2/1000
✅ Workflow analysis completed.
   Successful responses: 1/1
📝 Audit logged for security-analyst
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.172" requestID="f428c223-03b9-420c" responseTimeMS=2 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.78" requestID="4ca2199e-b23d-4196" responseTimeMS=4 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
✅ Slack notification sent
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 11864 bytes
   Signature header: sha256=2b77349794b0f2376f686b0e178c73f65420d85bee9adc452ce7380b1e3585d5
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 2b77349794...
   Calculated: 2b77349794...
   Payload size: 11864 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_run
   Delivery ID: bd97deae-cb55-11f0-967d-53278693bfda
🤖 Processing GitHub webhook: check_run
⚠️ Unhandled GitHub event type: check_run
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 7632 bytes
   Signature header: sha256=d806f87fb3f5dfbc347694096ee58b0e24a39ec351f04b5b67372c91b01e422c
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: d806f87fb3...
   Calculated: d806f87fb3...
   Payload size: 7632 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_job
   Delivery ID: bd9c2130-cb55-11f0-8e27-edb634345b64
🤖 Processing GitHub webhook: workflow_job
⚠️ Unhandled GitHub event type: workflow_job
✅ GitHub webhook accepted for processing
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.42" requestID="f110ee25-f984-4aa7" responseTimeMS=1 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 9491 bytes
   Signature header: sha256=2afff183dbf95702a3145cb162637a71f4ef2b55da3724ea155fc019b8365beb
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 2afff183db...
   Calculated: 2afff183db...
   Payload size: 9491 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: check_suite
   Delivery ID: bd9a4c70-cb55-11f0-8894-e444541dbbd7
🤖 Processing GitHub webhook: check_suite
⚠️ Unhandled GitHub event type: check_suite
✅ GitHub webhook accepted for processing
🔍 Webhook payload details:
   Body type: Buffer
   Body length: 19511 bytes
   Signature header: sha256=4fe9a90912997bbea13c3cc7f86539091a52cb7cb1d3253fdbe90f0def940019
   Expected pattern: sha256=<hash>
🔐 Signature verification:
   Received: 4fe9a90912...
   Calculated: 4fe9a90912...
   Payload size: 19511 bytes
   Secret length: 44 chars
✅ GitHub webhook signature verified successfully
📨 GitHub Webhook Received
   Event Type: workflow_run
   Delivery ID: bda018d0-cb55-11f0-9a6c-675012ae4f31
   Workflow: Automated Agent Deployment Review
   Status: success
   Branch: main
🤖 Processing GitHub webhook: workflow_run
⚙️ Workflow Run Event
   Workflow: Automated Agent Deployment Review
   Status: success
📡 Invoking 1 agent(s)...
🤖 Invoking 1 agents (parallel)
✅ Cache hit for hash 46e20790...
   Saved analysis time (would have cost Claude API call)
🎯 Using cached results (skipped 1 agent invocations)
✅ GitHub webhook accepted for processing
✅ Workflow analysis completed.
   Successful responses: 1/1
📝 Audit logged for security-analyst
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.74" requestID="a08d8d99-78ad-4daa" responseTimeMS=4 responseBytes=1434 userAgent="GitHub-Hookshot/41bdff2"
✅ Slack notification sent
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.24" requestID="07a0f85e-f5cd-4b14" responseTimeMS=2 responseBytes=1435 userAgent="GitHub-Hookshot/41bdff2"
     [POST]202connect-yw-backend.onrender.com/api/webhooks/github/agentsclientIP="140.82.115.85" requestID="b05cad31-8816-4433" responseTimeMS=2 responseBytes=1436 userAgent="GitHub-Hookshot/41bdff2"
==> Running 'node dist/index.js'
⚠️ SENTRY_DSN not configured. Error tracking disabled.
🔄 Database already in sync (migrations pre-deployed)
✅ All database migrations applied successfully
✅ Database schema is in sync with code
📊 Checking database backup configuration...
⚠️ Database backup configuration needs attention
   → Upgrade to Standard plan ($15/month)
   → Enable 7-day Point-In-Time Recovery
   → Schedule backup plan upgrade during maintenance window
   → Test recovery procedure on staging environment
   → Document recovery RTO/RPO requirements
✅ Server running on http://localhost:3000
Recurring message scheduler started (runs every 5 minutes)
✅ Message scheduling initialized
✅ Phone number linking recovery job scheduled (every 5 minutes)
✅ Application fully initialized and ready
Processing 0 due recurring messages
     ==> Your service is live 🎉
     ==> 
     ==> ///////////////////////////////////////////////////////////
     ==> ///////////////////////////////////////////////////////////
     ==> 
     ==> Available at your primary URL https://api.koinoniasms.com + 1 more domain
     ==> 
     ==> ///////////////////////////////////////////////////////////
     [GET]404connect-yw-backend.onrender.com/clientIP="35.230.74.10" requestID="1a6283ae-0760-4718" responseTimeMS=3 responseBytes=1296 userAgent="Go-http-client/2.0"