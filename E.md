❌ Failed to check token revocation: Disconnects client
❌ Failed to check token revocation: Disconnects client
❌ Failed to check token revocation: Disconnects client
❌ Failed to check token revocation: Disconnects client
[Cache] Failed to invalidate admin:cmjknpt7o0002vg72308nod8c:role: Disconnects client
❌ Failed to acquire lock for job recurring-messages: DisconnectsClientError: Disconnects client
    at Commander.disconnect (/opt/render/project/src/node_modules/@redis/client/dist/lib/client/index.js:336:72)
    at disconnectRedis (file:///opt/render/project/src/backend/dist/config/redis.config.js:68:31)
    at gracefulShutdown (file:///opt/render/project/src/backend/dist/index.js:123:15)
    at process.<anonymous> (file:///opt/render/project/src/backend/dist/index.js:142:29)
    at process.emit (node:events:518:28)
❌ Failed to acquire lock for job phone-linking-recovery: DisconnectsClientError: Disconnects client
    at Commander.disconnect (/opt/render/project/src/node_modules/@redis/client/dist/lib/client/index.js:336:72)
    at disconnectRedis (file:///opt/render/project/src/backend/dist/config/redis.config.js:68:31)
    at gracefulShutdown (file:///opt/render/project/src/backend/dist/index.js:123:15)
    at process.<anonymous> (file:///opt/render/project/src/backend/dist/index.js:142:29)
    at process.emit (node:events:518:28)
❌ Failed to acquire lock for job recurring-messages: DisconnectsClientError: Disconnects client
    at Commander.disconnect (/opt/render/project/src/node_modules/@redis/client/dist/lib/client/index.js:336:72)
    at disconnectRedis (file:///opt/render/project/src/backend/dist/config/redis.config.js:68:31)
    at gracefulShutdown (file:///opt/render/project/src/backend/dist/index.js:123:15)
    at process.<anonymous> (file:///opt/render/project/src/backend/dist/index.js:142:29)
    at process.emit (node:events:518:28)
❌ Failed to acquire lock for job phone-linking-recovery: DisconnectsClientError: Disconnects client
    at Commander.disconnect (/opt/render/project/src/node_modules/@redis/client/dist/lib/client/index.js:336:72)
    at disconnectRedis (file:///opt/render/project/src/backend/dist/config/redis.config.js:68:31)
    at gracefulShutdown (file:///opt/render/project/src/backend/dist/index.js:123:15)
    at process.<anonymous> (file:///opt/render/project/src/backend/dist/index.js:142:29)
    at process.emit (node:events:518:28)
❌ Failed to check token revocation: Disconnects client
[Cache] Failed to invalidate admin:cmjizfkjv000498iugnyqfliy:role: Disconnects client
❌ Failed to acquire lock for job recurring-messages: DisconnectsClientError: Disconnects client
    at Commander.disconnect (/opt/render/project/src/node_modules/@redis/client/dist/lib/client/index.js:336:72)
    at disconnectRedis (file:///opt/render/project/src/backend/dist/config/redis.config.js:68:31)
    at gracefulShutdown (file:///opt/render/project/src/backend/dist/index.js:123:15)
    at process.<anonymous> (file:///opt/render/project/src/backend/dist/index.js:142:29)
    at process.emit (node:events:518:28)
❌ Failed to check token revocation: Disconnects client
[Cache] Failed to invalidate admin:cmjknpt7o0002vg72308nod8c:role: Disconnects client
[Cache] Failed to invalidate admin:cmjknpt7o0002vg72308nod8c:role: Disconnects client
❌ Failed to acquire lock for job phone-linking-recovery: DisconnectsClientError: Disconnects client
    at Commander.disconnect (/opt/render/project/src/node_modules/@redis/client/dist/lib/client/index.js:336:72)
    at disconnectRedis (file:///opt/render/project/src/backend/dist/config/redis.config.js:68:31)
    at gracefulShutdown (file:///opt/render/project/src/backend/dist/index.js:123:15)
    at process.<anonymous> (file:///opt/render/project/src/backend/dist/index.js:142:29)
    at process.emit (node:events:518:28)
❌ Failed to check token revocation: Disconnects client
[Cache] Failed to invalidate admin:cmjknpt7o0002vg72308nod8c:role: Disconnects client
❌ Failed to acquire lock for job recurring-messages: DisconnectsClientError: Disconnects client
    at Commander.disconnect (/opt/render/project/src/node_modules/@redis/client/dist/lib/client/index.js:336:72)
    at disconnectRedis (file:///opt/render/project/src/backend/dist/config/redis.config.js:68:31)
    at gracefulShutdown (file:///opt/render/project/src/backend/dist/index.js:123:15)
    at process.<anonymous> (file:///opt/render/project/src/backend/dist/index.js:142:29)
    at process.emit (node:events:518:28)
❌ Failed to acquire lock for job phone-linking-recovery: DisconnectsClientError: Disconnects client
    at Commander.disconnect (/opt/render/project/src/node_modules/@redis/client/dist/lib/client/index.js:336:72)
    at disconnectRedis (file:///opt/render/project/src/backend/dist/config/redis.config.js:68:31)
    at gracefulShutdown (file:///opt/render/project/src/backend/dist/index.js:123:15)
    at process.<anonymous> (file:///opt/render/project/src/backend/dist/index.js:142:29)
    at process.emit (node:events:518:28)
{"timestamp":"2025-12-25T00:03:47.066Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/trial","status":200,"durationMs":2623679},"correlationId":"1766618403387-usl1pxd94"}
✅ Cache HIT (ETag): /trial - Returning 304 Not Modified
{"timestamp":"2025-12-25T00:03:47.067Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/trial","status":200,"durationMs":1364995},"correlationId":"1766619662072-ujixpjqr6"}
{"timestamp":"2025-12-25T00:03:47.068Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/trial","status":200,"durationMs":1259333},"correlationId":"1766619767735-cffahatcn"}
❌ Failed to revoke all tokens: Error: Token revocation failed
    at revokeAccessToken (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Promise.all (index 0)
    at async revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:74:9)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
❌ Failed to revoke all tokens: Error: Token revocation failed
    at revokeAccessToken (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Promise.all (index 0)
    at async revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:74:9)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
❌ Failed to revoke all tokens: Error: Token revocation failed
    at revokeAccessToken (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Promise.all (index 0)
    at async revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:74:9)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
❌ Failed to revoke all tokens: Error: Token revocation failed
    at revokeAccessToken (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Promise.all (index 0)
    at async revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:74:9)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
❌ Failed to revoke all tokens: Error: Token revocation failed
    at revokeAccessToken (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Promise.all (index 0)
    at async revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:74:9)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
❌ Failed to revoke all tokens: Error: Token revocation failed
    at revokeAccessToken (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Promise.all (index 0)
    at async revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:74:9)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
❌ Failed to revoke all tokens: Error: Token revocation failed
    at revokeAccessToken (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Promise.all (index 0)
    at async revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:74:9)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
❌ Failed to revoke all tokens: Error: Token revocation failed
    at revokeAccessToken (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Promise.all (index 0)
    at async revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:74:9)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
❌ Failed to revoke all tokens: Error: Token revocation failed
    at revokeAccessToken (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Promise.all (index 0)
    at async revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:74:9)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
⏭️  Recurring messages already being processed by another server, skipping this run
[PHONE_LINKING_RECOVERY] Job already running on another server, skipping this run
⚠️ Failed to revoke tokens: Error: Logout failed: token revocation error
    at revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:82:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
{"timestamp":"2025-12-25T00:03:47.071Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/logout","status":200,"durationMs":2620962},"correlationId":"1766618406109-twwd8r9q6"}
⏭️  Recurring messages already being processed by another server, skipping this run
[PHONE_LINKING_RECOVERY] Job already running on another server, skipping this run
⏭️  Recurring messages already being processed by another server, skipping this run
[PHONE_LINKING_RECOVERY] Job already running on another server, skipping this run
⏭️  Recurring messages already being processed by another server, skipping this run
[PHONE_LINKING_RECOVERY] Job already running on another server, skipping this run
⏭️  Recurring messages already being processed by another server, skipping this run
[PHONE_LINKING_RECOVERY] Job already running on another server, skipping this run
⚠️ Failed to revoke tokens: Error: Logout failed: token revocation error
    at revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:82:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
{"timestamp":"2025-12-25T00:03:47.071Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/logout","status":200,"durationMs":1275918},"correlationId":"1766619751152-8y7axwhrf"}
⚠️ Failed to revoke tokens: Error: Logout failed: token revocation error
    at revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:82:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
{"timestamp":"2025-12-25T00:03:47.072Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/logout","status":200,"durationMs":1275129},"correlationId":"1766619751943-n5czx28oz"}
[GET]
api.koinoniasms.com/api/billing/trial clientIP="174.227.47.223" requestID="0d064818-4f59-428f" responseTimeMS=1259336 responseBytes=1537 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/logout clientIP="174.227.47.223" requestID="9844ff06-eeed-43f5" responseTimeMS=1274834 responseBytes=1756 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/logout clientIP="174.227.47.223" requestID="e010d908-660c-4341" responseTimeMS=1273994 responseBytes=1756 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/logout clientIP="174.227.47.223" requestID="8731043c-50c8-4504" responseTimeMS=1274468 responseBytes=1756 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/logout clientIP="174.227.47.223" requestID="39ad3b8e-04ae-4961" responseTimeMS=1274308 responseBytes=1756 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/billing/trial clientIP="174.227.47.223" requestID="74a92793-ad00-4753" responseTimeMS=1365001 responseBytes=1537 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/logout clientIP="174.227.47.223" requestID="a6703d4d-c886-415f" responseTimeMS=1274634 responseBytes=1756 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
⚠️ Failed to revoke tokens: Error: Logout failed: token revocation error
    at revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:82:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
{"timestamp":"2025-12-25T00:03:47.072Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/logout","status":200,"durationMs":1274831},"correlationId":"1766619752241-2ilvr3a6d"}
⚠️ Failed to revoke tokens: Error: Logout failed: token revocation error
    at revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:82:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
{"timestamp":"2025-12-25T00:03:47.073Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/logout","status":200,"durationMs":1274631},"correlationId":"1766619752441-qbhhz85gh"}
⚠️ Failed to revoke tokens: Error: Logout failed: token revocation error
    at revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:82:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
{"timestamp":"2025-12-25T00:03:47.073Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/logout","status":200,"durationMs":1274463},"correlationId":"1766619752609-tbfgg3826"}
⚠️ Failed to revoke tokens: Error: Logout failed: token revocation error
    at revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:82:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
{"timestamp":"2025-12-25T00:03:47.074Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/logout","status":200,"durationMs":1274306},"correlationId":"1766619752768-kw4zf6tc7"}
⚠️ Failed to revoke tokens: Error: Logout failed: token revocation error
    at revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:82:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
{"timestamp":"2025-12-25T00:03:47.074Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/logout","status":200,"durationMs":1273992},"correlationId":"1766619753082-hwi8513jq"}
⚠️ Failed to revoke tokens: Error: Logout failed: token revocation error
    at revokeAllTokens (file:///opt/render/project/src/backend/dist/services/token-revocation.service.js:82:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async logout (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:235:17)
{"timestamp":"2025-12-25T00:03:47.074Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/logout","status":200,"durationMs":1273742},"correlationId":"1766619753331-g56s9c0n3"}
⏭️  Recurring messages already being processed by another server, skipping this run
[PHONE_LINKING_RECOVERY] Job already running on another server, skipping this run
⏭️  Recurring messages already being processed by another server, skipping this run
[PHONE_LINKING_RECOVERY] Job already running on another server, skipping this run
⏭️  Recurring messages already being processed by another server, skipping this run
[PHONE_LINKING_RECOVERY] Job already running on another server, skipping this run
⏭️  Recurring messages already being processed by another server, skipping this run
[PHONE_LINKING_RECOVERY] Job already running on another server, skipping this run
✅ Redis connection closed gracefully
✅ Redis disconnected
📴 Closing HTTP server...
{"timestamp":"2025-12-25T00:03:47.516Z","level":"WARN","message":"Slow query detected (447ms)","context":{"operation":"findMany","model":"Branch","duration":447,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.517Z","level":"ERROR","message":"Very slow query detected (447ms)","context":{"operation":"findMany","model":"Branch","duration":447},"error":{"message":"Query exceeded double threshold: 447ms > 200ms","stack":"Error: Query exceeded double threshold: 447ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getBranches (file:///opt/render/project/src/backend/dist/services/branch.service.js:7:22)\n    at async listBranches (file:///opt/render/project/src/backend/dist/controllers/branch.controller.js:15:26)"}}
[GET]
api.koinoniasms.com/api/billing/trial clientIP="174.227.47.223" requestID="5f5a13fd-397d-403c" responseTimeMS=1393014 responseBytes=1381 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
✅ Cache HIT (ETag): /churches/cmjizfkjq000298iusgud3mrf/branches - Returning 304 Not Modified
{"timestamp":"2025-12-25T00:03:47.523Z","level":"WARN","message":"Slow query detected (452ms)","context":{"operation":"findMany","model":"Branch","duration":452,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.523Z","level":"ERROR","message":"Very slow query detected (452ms)","context":{"operation":"findMany","model":"Branch","duration":452},"error":{"message":"Query exceeded double threshold: 452ms > 200ms","stack":"Error: Query exceeded double threshold: 452ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getBranches (file:///opt/render/project/src/backend/dist/services/branch.service.js:7:22)\n    at async listBranches (file:///opt/render/project/src/backend/dist/controllers/branch.controller.js:15:26)"}}
{"timestamp":"2025-12-25T00:03:47.523Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/churches/cmjknpt7j0000vg72tt3639bk/branches","status":200,"durationMs":1259786},"correlationId":"1766619767737-1t5fv2tsk"}
{"timestamp":"2025-12-25T00:03:47.531Z","level":"WARN","message":"Slow query detected (462ms)","context":{"operation":"findMany","model":"Branch","duration":462,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.531Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/churches/cmjknpt7j0000vg72tt3639bk/branches","status":200,"durationMs":1393884},"correlationId":"1766619633646-6w4oc17t1"}
{"timestamp":"2025-12-25T00:03:47.531Z","level":"ERROR","message":"Very slow query detected (462ms)","context":{"operation":"findMany","model":"Branch","duration":462},"error":{"message":"Query exceeded double threshold: 462ms > 200ms","stack":"Error: Query exceeded double threshold: 462ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getBranches (file:///opt/render/project/src/backend/dist/services/branch.service.js:7:22)\n    at async listBranches (file:///opt/render/project/src/backend/dist/controllers/branch.controller.js:15:26)"}}
{"timestamp":"2025-12-25T00:03:47.533Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/current","status":404,"durationMs":2624091},"correlationId":"1766618403442-isbll2m1x"}
{"timestamp":"2025-12-25T00:03:47.584Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/current","status":404,"durationMs":1393373},"correlationId":"1766619634211-wz74q59bg"}
{"timestamp":"2025-12-25T00:03:47.584Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/current","status":404,"durationMs":1365511},"correlationId":"1766619662073-xkhym9dz2"}
{"timestamp":"2025-12-25T00:03:47.585Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/current","status":404,"durationMs":1259845},"correlationId":"1766619767740-9fgwtx4we"}
{"timestamp":"2025-12-25T00:03:47.585Z","level":"WARN","message":"Slow query detected (514ms)","context":{"operation":"findUnique","model":"Admin","duration":514,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.586Z","level":"ERROR","message":"Very slow query detected (514ms)","context":{"operation":"findUnique","model":"Admin","duration":514},"error":{"message":"Query exceeded double threshold: 514ms > 200ms","stack":"Error: Query exceeded double threshold: 514ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getAdmin (file:///opt/render/project/src/backend/dist/services/auth.service.js:157:19)\n    at async getMe (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:204:23)"}}
{"timestamp":"2025-12-25T00:03:47.586Z","level":"WARN","message":"Slow query detected (511ms)","context":{"operation":"findUnique","model":"Admin","duration":511,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.586Z","level":"ERROR","message":"Very slow query detected (511ms)","context":{"operation":"findUnique","model":"Admin","duration":511},"error":{"message":"Query exceeded double threshold: 511ms > 200ms","stack":"Error: Query exceeded double threshold: 511ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getAdmin (file:///opt/render/project/src/backend/dist/services/auth.service.js:157:19)\n    at async getMe (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:204:23)"}}
{"timestamp":"2025-12-25T00:03:47.586Z","level":"WARN","message":"Slow query detected (511ms)","context":{"operation":"findUnique","model":"Admin","duration":511,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.586Z","level":"ERROR","message":"Very slow query detected (511ms)","context":{"operation":"findUnique","model":"Admin","duration":511},"error":{"message":"Query exceeded double threshold: 511ms > 200ms","stack":"Error: Query exceeded double threshold: 511ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getAdmin (file:///opt/render/project/src/backend/dist/services/auth.service.js:157:19)\n    at async getMe (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:204:23)"}}
{"timestamp":"2025-12-25T00:03:47.586Z","level":"WARN","message":"Slow query detected (511ms)","context":{"operation":"findUnique","model":"Admin","duration":511,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.586Z","level":"ERROR","message":"Very slow query detected (511ms)","context":{"operation":"findUnique","model":"Admin","duration":511},"error":{"message":"Query exceeded double threshold: 511ms > 200ms","stack":"Error: Query exceeded double threshold: 511ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getAdmin (file:///opt/render/project/src/backend/dist/services/auth.service.js:157:19)\n    at async getMe (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:204:23)"}}
{"timestamp":"2025-12-25T00:03:47.586Z","level":"WARN","message":"Slow query detected (511ms)","context":{"operation":"findUnique","model":"Admin","duration":511,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.586Z","level":"ERROR","message":"Very slow query detected (511ms)","context":{"operation":"findUnique","model":"Admin","duration":511},"error":{"message":"Query exceeded double threshold: 511ms > 200ms","stack":"Error: Query exceeded double threshold: 511ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getAdmin (file:///opt/render/project/src/backend/dist/services/auth.service.js:157:19)\n    at async getMe (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:204:23)"}}
✅ Cache HIT (ETag): /me - Returning 304 Not Modified
{"timestamp":"2025-12-25T00:03:47.587Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/me","status":200,"durationMs":1256443},"correlationId":"1766619771143-ivbuyaw1o"}
{"timestamp":"2025-12-25T00:03:47.587Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/me","status":200,"durationMs":637291},"correlationId":"1766620390296-bkp8wxejs"}
{"timestamp":"2025-12-25T00:03:47.587Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/me","status":200,"durationMs":589273},"correlationId":"1766620438314-gpnv8s3xe"}
{"timestamp":"2025-12-25T00:03:47.587Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/me","status":200,"durationMs":484183},"correlationId":"1766620543404-11a3532tu"}
{"timestamp":"2025-12-25T00:03:47.588Z","level":"WARN","message":"Slow query detected (517ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":517,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.588Z","level":"ERROR","message":"Very slow query detected (517ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":517},"error":{"message":"Query exceeded double threshold: 517ms > 200ms","stack":"Error: Query exceeded double threshold: 517ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async loginHandler (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:83:27)"}}
{"timestamp":"2025-12-25T00:03:47.588Z","level":"WARN","message":"Slow query detected (517ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":517,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.588Z","level":"ERROR","message":"Very slow query detected (517ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":517},"error":{"message":"Query exceeded double threshold: 517ms > 200ms","stack":"Error: Query exceeded double threshold: 517ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async loginHandler (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:83:27)"}}
{"timestamp":"2025-12-25T00:03:47.588Z","level":"WARN","message":"Slow query detected (517ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":517,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.588Z","level":"ERROR","message":"Very slow query detected (517ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":517},"error":{"message":"Query exceeded double threshold: 517ms > 200ms","stack":"Error: Query exceeded double threshold: 517ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async loginHandler (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:83:27)"}}
{"timestamp":"2025-12-25T00:03:47.588Z","level":"WARN","message":"Slow query detected (513ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":513,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.588Z","level":"ERROR","message":"Very slow query detected (513ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":513},"error":{"message":"Query exceeded double threshold: 513ms > 200ms","stack":"Error: Query exceeded double threshold: 513ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async loginHandler (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:83:27)"}}
{"timestamp":"2025-12-25T00:03:47.588Z","level":"WARN","message":"Slow query detected (513ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":513,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.589Z","level":"ERROR","message":"Very slow query detected (513ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":513},"error":{"message":"Query exceeded double threshold: 513ms > 200ms","stack":"Error: Query exceeded double threshold: 513ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async loginHandler (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:83:27)"}}
{"timestamp":"2025-12-25T00:03:47.589Z","level":"WARN","message":"Slow query detected (514ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":514,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.589Z","level":"ERROR","message":"Very slow query detected (514ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":514},"error":{"message":"Query exceeded double threshold: 514ms > 200ms","stack":"Error: Query exceeded double threshold: 514ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async loginHandler (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:83:27)"}}
{"timestamp":"2025-12-25T00:03:47.589Z","level":"WARN","message":"Slow query detected (514ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":514,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.589Z","level":"ERROR","message":"Very slow query detected (514ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":514},"error":{"message":"Query exceeded double threshold: 514ms > 200ms","stack":"Error: Query exceeded double threshold: 514ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async loginHandler (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:83:27)"}}
{"timestamp":"2025-12-25T00:03:47.589Z","level":"WARN","message":"Slow query detected (514ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":514,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.589Z","level":"ERROR","message":"Very slow query detected (514ms)","context":{"operation":"findUnique","model":"AdminMFA","duration":514},"error":{"message":"Query exceeded double threshold: 514ms > 200ms","stack":"Error: Query exceeded double threshold: 514ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async loginHandler (file:///opt/render/project/src/backend/dist/controllers/auth.controller.js:83:27)"}}
{"timestamp":"2025-12-25T00:03:47.589Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/login","status":200,"durationMs":1466073},"correlationId":"1766619561516-bnrssn3j6"}
{"timestamp":"2025-12-25T00:03:47.589Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/login","status":200,"durationMs":1450514},"correlationId":"1766619577075-cxc5hummp"}
{"timestamp":"2025-12-25T00:03:47.590Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/login","status":200,"durationMs":1433580},"correlationId":"1766619594010-qspny4yft"}
{"timestamp":"2025-12-25T00:03:47.590Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/login","status":200,"durationMs":1251409},"correlationId":"1766619776181-ftnjmddtg"}
{"timestamp":"2025-12-25T00:03:47.590Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/login","status":200,"durationMs":625872},"correlationId":"1766620401718-s6abpgv9m"}
{"timestamp":"2025-12-25T00:03:47.591Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/login","status":200,"durationMs":585689},"correlationId":"1766620441901-lumwibkdo"}
{"timestamp":"2025-12-25T00:03:47.591Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/login","status":200,"durationMs":564138},"correlationId":"1766620463453-udh6xtyhr"}
[POST]
api.koinoniasms.com/api/auth/logout clientIP="174.227.47.223" requestID="af9e0986-b3e6-4af2" responseTimeMS=1275132 responseBytes=1756 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/branches/churches/cmjknpt7j0000vg72tt3639bk/branches clientIP="174.227.47.223" requestID="31dae6f7-3a04-41b4" responseTimeMS=1393888 responseBytes=1505 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/branches/churches/cmjknpt7j0000vg72tt3639bk/branches clientIP="174.227.47.223" requestID="67149898-ecff-41ed" responseTimeMS=1367465 responseBytes=1505 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/numbers/current clientIP="174.227.47.223" requestID="1ba7e555-91b2-4bdd" responseTimeMS=1393376 responseBytes=1516 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/branches/churches/cmjknpt7j0000vg72tt3639bk/branches clientIP="174.227.47.223" requestID="2ada1e34-79fe-4ae2" responseTimeMS=5 responseBytes=1505 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/auth/me clientIP="174.227.47.223" requestID="49e0d8f5-10e8-46f6" responseTimeMS=589276 responseBytes=1684 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/login clientIP="174.227.47.223" requestID="fe6a1e64-ebd2-4794" responseTimeMS=1450516 responseBytes=2709 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/login clientIP="174.227.47.223" requestID="fb62491e-6a58-4322" responseTimeMS=1251412 responseBytes=2715 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/auth/me clientIP="174.227.47.223" requestID="fcf9c31f-1dc2-4e60" responseTimeMS=484185 responseBytes=1684 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/auth/me clientIP="174.227.47.223" requestID="7b9b7a74-f663-4833" responseTimeMS=1256445 responseBytes=1684 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/numbers/current clientIP="174.227.47.223" requestID="962a2f0e-36db-4e10" responseTimeMS=1365514 responseBytes=1516 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/login clientIP="174.227.47.223" requestID="50fbcf5e-27c7-4a12" responseTimeMS=447617 responseBytes=2718 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/login clientIP="174.227.47.223" requestID="2b6b5063-c975-48d1" responseTimeMS=625875 responseBytes=2725 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
[GET]
api.koinoniasms.com/api/branches/churches/cmjknpt7j0000vg72tt3639bk/branches clientIP="174.227.47.223" requestID="ade7f6ac-3ec7-4776" responseTimeMS=1373571 responseBytes=1505 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/auth/me clientIP="174.227.47.223" requestID="ac91aa3c-0c8d-480e" responseTimeMS=637299 responseBytes=1693 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
[POST]
api.koinoniasms.com/api/auth/logout clientIP="174.227.47.223" requestID="9f5d1f2a-7851-4ac0" responseTimeMS=1273746 responseBytes=1756 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/login clientIP="174.227.47.223" requestID="7c54e778-4104-4fa6" responseTimeMS=585691 responseBytes=2719 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/login clientIP="174.227.47.223" requestID="9e216ba9-114a-4ce5" responseTimeMS=1433584 responseBytes=2706 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/branches/churches/cmjknpt7j0000vg72tt3639bk/branches clientIP="174.227.47.223" requestID="785ad497-268b-49b0" responseTimeMS=1359671 responseBytes=1505 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/numbers/current clientIP="174.227.47.223" requestID="550d7949-242c-48bf" responseTimeMS=1259846 responseBytes=1516 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/branches/churches/cmjknpt7j0000vg72tt3639bk/branches clientIP="174.227.47.223" requestID="e459ff0e-3b58-4185" responseTimeMS=1259790 responseBytes=1505 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[GET]
api.koinoniasms.com/api/branches/churches/cmjknpt7j0000vg72tt3639bk/branches clientIP="174.227.47.223" requestID="6fa89be3-3198-47b6" responseTimeMS=1365528 responseBytes=1505 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
[POST]
api.koinoniasms.com/api/auth/logout clientIP="174.227.47.223" requestID="9d07fc7d-fe20-447c" responseTimeMS=1275910 responseBytes=1756 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
{"timestamp":"2025-12-25T00:03:47.592Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/login","status":200,"durationMs":447614},"correlationId":"1766620579978-pskrflkc2"}
{"timestamp":"2025-12-25T00:03:47.592Z","level":"WARN","message":"Slow query detected (523ms)","context":{"operation":"findMany","model":"Branch","duration":523,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.593Z","level":"ERROR","message":"Very slow query detected (523ms)","context":{"operation":"findMany","model":"Branch","duration":523},"error":{"message":"Query exceeded double threshold: 523ms > 200ms","stack":"Error: Query exceeded double threshold: 523ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getBranches (file:///opt/render/project/src/backend/dist/services/branch.service.js:7:22)\n    at async listBranches (file:///opt/render/project/src/backend/dist/controllers/branch.controller.js:15:26)"}}
{"timestamp":"2025-12-25T00:03:47.593Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/churches/cmjizfkjq000298iusgud3mrf/branches","status":200,"durationMs":2604082},"correlationId":"1766618423510-ta8339toz"}
{"timestamp":"2025-12-25T00:03:47.593Z","level":"WARN","message":"Slow query detected (524ms)","context":{"operation":"findMany","model":"Branch","duration":524,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.593Z","level":"ERROR","message":"Very slow query detected (524ms)","context":{"operation":"findMany","model":"Branch","duration":524},"error":{"message":"Query exceeded double threshold: 524ms > 200ms","stack":"Error: Query exceeded double threshold: 524ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getBranches (file:///opt/render/project/src/backend/dist/services/branch.service.js:7:22)\n    at async listBranches (file:///opt/render/project/src/backend/dist/controllers/branch.controller.js:15:26)"}}
{"timestamp":"2025-12-25T00:03:47.593Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/churches/cmjknpt7j0000vg72tt3639bk/branches","status":200,"durationMs":1373569},"correlationId":"1766619654024-467a5kqtc"}
{"timestamp":"2025-12-25T00:03:47.593Z","level":"WARN","message":"Slow query detected (524ms)","context":{"operation":"findMany","model":"Branch","duration":524,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.593Z","level":"ERROR","message":"Very slow query detected (524ms)","context":{"operation":"findMany","model":"Branch","duration":524},"error":{"message":"Query exceeded double threshold: 524ms > 200ms","stack":"Error: Query exceeded double threshold: 524ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getBranches (file:///opt/render/project/src/backend/dist/services/branch.service.js:7:22)\n    at async listBranches (file:///opt/render/project/src/backend/dist/controllers/branch.controller.js:15:26)"}}
{"timestamp":"2025-12-25T00:03:47.594Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/churches/cmjknpt7j0000vg72tt3639bk/branches","status":200,"durationMs":1367461},"correlationId":"1766619660133-ybbhawxxd"}
{"timestamp":"2025-12-25T00:03:47.594Z","level":"WARN","message":"Slow query detected (525ms)","context":{"operation":"findMany","model":"Branch","duration":525,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.594Z","level":"ERROR","message":"Very slow query detected (525ms)","context":{"operation":"findMany","model":"Branch","duration":525},"error":{"message":"Query exceeded double threshold: 525ms > 200ms","stack":"Error: Query exceeded double threshold: 525ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getBranches (file:///opt/render/project/src/backend/dist/services/branch.service.js:7:22)\n    at async listBranches (file:///opt/render/project/src/backend/dist/controllers/branch.controller.js:15:26)"}}
{"timestamp":"2025-12-25T00:03:47.594Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/churches/cmjknpt7j0000vg72tt3639bk/branches","status":200,"durationMs":1365524},"correlationId":"1766619662069-o9pszo1hs"}
{"timestamp":"2025-12-25T00:03:47.594Z","level":"WARN","message":"Slow query detected (525ms)","context":{"operation":"findMany","model":"Branch","duration":525,"threshold":100}}
{"timestamp":"2025-12-25T00:03:47.594Z","level":"ERROR","message":"Very slow query detected (525ms)","context":{"operation":"findMany","model":"Branch","duration":525},"error":{"message":"Query exceeded double threshold: 525ms > 200ms","stack":"Error: Query exceeded double threshold: 525ms > 200ms\n    at file:///opt/render/project/src/backend/dist/utils/query-monitor.js:61:70\n    at async getBranches (file:///opt/render/project/src/backend/dist/services/branch.service.js:7:22)\n    at async listBranches (file:///opt/render/project/src/backend/dist/controllers/branch.controller.js:15:26)"}}
{"timestamp":"2025-12-25T00:03:47.594Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/churches/cmjknpt7j0000vg72tt3639bk/branches","status":200,"durationMs":1359669},"correlationId":"1766619667925-qskjuimpq"}
{"timestamp":"2025-12-25T00:03:47.879Z","level":"INFO","message":"Incoming request","context":{"method":"GET","path":"/api/branches/churches/cmjknpt7j0000vg72tt3639bk/branches","ip":"108.162.246.182","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"},"correlationId":"1766621027879-201ry0bx9"}
⚠️  Redis unavailable - skipping token revocation check (security degraded)
{"timestamp":"2025-12-25T00:03:47.883Z","level":"INFO","message":"Response sent","context":{"method":"GET","path":"/churches/cmjknpt7j0000vg72tt3639bk/branches","status":200,"durationMs":3},"correlationId":"1766621027879-201ry0bx9"}
[OPTIONS]
api.koinoniasms.com/api/numbers/current clientIP="174.227.47.223" requestID="8eb7e910-be71-478c" responseTimeMS=2 responseBytes=1369 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
[OPTIONS]
api.koinoniasms.com/api/branches/churches/cmjizfkjq000298iusgud3mrf/branches clientIP="174.227.47.223" requestID="27dd419c-df69-4af3" responseTimeMS=1 responseBytes=1369 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
[OPTIONS]
api.koinoniasms.com/api/billing/trial clientIP="174.227.47.223" requestID="c99067f2-ce87-48bb" responseTimeMS=2 responseBytes=1369 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
{"timestamp":"2025-12-25T00:03:48.073Z","level":"INFO","message":"Incoming request","context":{"method":"GET","path":"/api/branches/churches/cmjizfkjq000298iusgud3mrf/branches","ip":"172.68.23.37","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"},"correlationId":"1766621028073-kxoxf7e4a"}
⚠️  Redis unavailable - skipping token revocation check (security degraded)
✅ HTTP server closed
✅ Graceful shutdown complete
{"timestamp":"2025-12-25T00:03:48.099Z","level":"INFO","message":"Incoming request","context":{"method":"GET","path":"/api/branches/churches/cmjizfkjq000298iusgud3mrf/branches","ip":"172.68.23.37","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"},"correlationId":"1766621028099-rgaz8ynr7"}
[POST]
api.koinoniasms.com/api/auth/login clientIP="174.227.47.223" requestID="bc541ff5-d442-41fd" responseTimeMS=564143 responseBytes=2718 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
{"timestamp":"2025-12-25T00:03:48.612Z","level":"INFO","message":"Incoming request","context":{"method":"GET","path":"/api/billing/trial","ip":"172.68.23.37","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"},"correlationId":"1766621028612-pinnuoyvs"}
{"timestamp":"2025-12-25T00:03:48.637Z","level":"INFO","message":"Incoming request","context":{"method":"GET","path":"/api/numbers/current","ip":"172.68.23.38","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"},"correlationId":"1766621028637-zg9dgcjee"}
{"timestamp":"2025-12-25T00:03:48.785Z","level":"INFO","message":"Incoming request","context":{"method":"GET","path":"/api/billing/trial","ip":"108.162.246.182","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"},"correlationId":"1766621028785-bb8oamq0o"}
{"timestamp":"2025-12-25T00:03:48.795Z","level":"INFO","message":"Incoming request","context":{"method":"GET","path":"/api/numbers/current","ip":"108.162.246.181","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"},"correlationId":"1766621028795-3roko9a81"}
[OPTIONS]
api.koinoniasms.com/api/admin/profile clientIP="174.227.47.223" requestID="9a2ece72-d737-46c2" responseTimeMS=6 responseBytes=1369 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"
{"timestamp":"2025-12-25T00:03:49.596Z","level":"INFO","message":"Incoming request","context":{"method":"GET","path":"/api/admin/profile","ip":"108.162.246.182","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"},"correlationId":"1766621029596-i29no9jqp"}
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 10, waiting 30000ms
❌ Redis Client Error: 
{"timestamp":"2025-12-25T00:04:08.607Z","level":"INFO","message":"Incoming request","context":{"method":"GET","path":"/api/branches/churches/cmjizfkjq000298iusgud3mrf/branches","ip":"172.68.23.38","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"},"correlationId":"1766621048607-gzoiadbjd"}
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 11, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 12, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 13, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 14, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 15, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 16, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 17, waiting 30000ms
❌ Redis Client Error: 
==> Detected service running on port 3000
==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
🔄 Redis reconnecting...
❌ Redis Client Error: 
🔄 Redis reconnect attempt 18, waiting 30000ms
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 19, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
❌ Redis Client Error: 
🔄 Redis reconnect attempt 20, waiting 30000ms
🔄 Redis reconnecting...
❌ Redis Client Error: 
🔄 Redis reconnect attempt 21, waiting 30000ms
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 22, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 23, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 24, waiting 30000ms
❌ Redis Client Error: 
[POST]
connect-yw-backend.onrender.com/api/scheduler/dlc-approval-check clientIP="18.217.223.226" requestID="f838639f-70e3-40aa" responseTimeMS=216 responseBytes=1574 userAgent="Amazon/EventBridge/ApiDestinations"
{"timestamp":"2025-12-25T00:11:11.181Z","level":"INFO","message":"Incoming request","context":{"method":"POST","path":"/api/scheduler/dlc-approval-check","ip":"172.71.147.40","userAgent":"Amazon/EventBridge/ApiDestinations"},"correlationId":"1766621471181-l88d2d0pv"}
🔔 DLC Approval Check Started [dlc-1766621471182-x5ukxq5kd]
   Time: 2025-12-25T00:11:11.182Z
   Source: AWS CloudWatch EventBridge
🔍 Checking 10DLC approval statuses (webhook safety check)...
Found 0 churches to check
✅ DLC Approval Check Completed [dlc-1766621471182-x5ukxq5kd]
   Duration: 193ms
   Churches Upgraded: 0
   Still Pending: 6
   Next Check: 2025-12-25T00:41:11.375Z
{"timestamp":"2025-12-25T00:11:11.376Z","level":"INFO","message":"Response sent","context":{"method":"POST","path":"/dlc-approval-check","status":200,"durationMs":195},"correlationId":"1766621471181-l88d2d0pv"}
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 25, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 26, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
❌ Redis Client Error: 
🔄 Redis reconnect attempt 27, waiting 30000ms
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 28, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 29, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 30, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 31, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
❌ Redis Client Error: 
🔄 Redis reconnect attempt 32, waiting 30000ms
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 33, waiting 30000ms
❌ Redis Client Error: 
🔄 Redis reconnecting...
🔄 Redis reconnect attempt 34, waiting 30000ms
❌ Redis Client Error: 