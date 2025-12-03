2025-12-03T03:09:27.936567667Z 
2025-12-03T03:09:28.356551125Z Prisma schema loaded from prisma/schema.prisma
2025-12-03T03:09:28.883836208Z 
2025-12-03T03:09:28.883867659Z ✔ Generated Prisma Client (v5.13.0) to ./node_modules/@prisma/client in 231ms
2025-12-03T03:09:28.883872028Z 
2025-12-03T03:09:28.883876019Z Start using Prisma Client in Node.js (See: https://pris.ly/d/client)
2025-12-03T03:09:28.883879559Z ```
2025-12-03T03:09:28.883883829Z import { PrismaClient } from '@prisma/client'
2025-12-03T03:09:28.883887349Z const prisma = new PrismaClient()
2025-12-03T03:09:28.883890879Z ```
2025-12-03T03:09:28.883894489Z or start using Prisma Client at the edge (See: https://pris.ly/d/accelerate)
2025-12-03T03:09:28.883897959Z ```
2025-12-03T03:09:28.883903369Z import { PrismaClient } from '@prisma/client/edge'
2025-12-03T03:09:28.883906859Z const prisma = new PrismaClient()
2025-12-03T03:09:28.883910279Z ```
2025-12-03T03:09:28.883913579Z 
2025-12-03T03:09:28.883917069Z See other ways of importing Prisma Client: http://pris.ly/d/importing-client
2025-12-03T03:09:28.883920419Z 
2025-12-03T03:09:28.883925789Z ┌────────────────────────────────────────────────────────────────┐
2025-12-03T03:09:28.88393212Z │  Supercharge your Prisma Client with global database caching,  │
2025-12-03T03:09:28.88393572Z │  scalable connection pooling and real-time database events.    │
2025-12-03T03:09:28.8839544Z │  Explore Prisma Accelerate: https://pris.ly/cli/-accelerate    │
2025-12-03T03:09:28.88395688Z │  Explore Prisma Pulse: https://pris.ly/cli/-pulse              │
2025-12-03T03:09:28.88395938Z └────────────────────────────────────────────────────────────────┘
2025-12-03T03:09:28.88396137Z 
2025-12-03T03:09:35.953704526Z 
2025-12-03T03:09:35.953732306Z > connect-frontend@0.1.0 build
2025-12-03T03:09:35.953736356Z > tsc && npx vite build
2025-12-03T03:09:35.953738746Z 
2025-12-03T03:09:42.65724249Z src/__tests__/e2e/conversation-reply.e2e.test.ts(1,36): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
2025-12-03T03:09:42.657392582Z src/__tests__/e2e/conversation-reply.e2e.test.ts(15,34): error TS7031: Binding element 'testPage' implicitly has an 'any' type.
2025-12-03T03:09:42.657397873Z src/__tests__/e2e/login.e2e.test.ts(1,36): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
2025-12-03T03:09:42.657404813Z src/__tests__/e2e/login.e2e.test.ts(15,34): error TS7031: Binding element 'testPage' implicitly has an 'any' type.
2025-12-03T03:09:42.657435023Z src/__tests__/e2e/login.e2e.test.ts(241,45): error TS7006: Parameter 'route' implicitly has an 'any' type.
2025-12-03T03:09:42.657440613Z src/__tests__/e2e/message-send.e2e.test.ts(1,36): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
2025-12-03T03:09:42.657443043Z src/__tests__/e2e/message-send.e2e.test.ts(15,34): error TS7031: Binding element 'testPage' implicitly has an 'any' type.
2025-12-03T03:09:42.657478234Z src/__tests__/e2e/signup.e2e.test.ts(1,36): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
2025-12-03T03:09:42.657524904Z src/__tests__/e2e/signup.e2e.test.ts(16,34): error TS7031: Binding element 'testPage' implicitly has an 'any' type.
2025-12-03T03:09:42.657608616Z src/components/NPSSurvey.tsx(8,67): error TS2307: Cannot find module '@nextui-org/react' or its corresponding type declarations.
2025-12-03T03:09:42.657636356Z src/components/NPSSurvey.tsx(136,26): error TS7006: Parameter 'e' implicitly has an 'any' type.
2025-12-03T03:09:42.657665997Z src/components/conversations/ConversationsList.tsx(4,10): error TS2305: Module '"react-window"' has no exported member 'FixedSizeList'.
2025-12-03T03:09:42.730120351Z npm error Lifecycle script `build` failed with error:
2025-12-03T03:09:42.730264913Z npm error code 2
2025-12-03T03:09:42.730335994Z npm error path /opt/render/project/src/frontend
2025-12-03T03:09:42.730466626Z npm error workspace connect-frontend@0.1.0
2025-12-03T03:09:42.730574738Z npm error location /opt/render/project/src/frontend
2025-12-03T03:09:42.730664569Z npm error command failed
2025-12-03T03:09:42.730912253Z npm error command sh -c tsc && npx vite build
2025-12-03T03:09:42.782292721Z ==> Build failed 😞
2025-12-03T03:09:42.782316571Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys