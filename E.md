2025-12-01T21:45:05.132344882Z ==> Cloning from https://github.com/Abenezer1244/YWMESSAGING
2025-12-01T21:45:07.009611798Z ==> Checking out commit 32c52b100ceb1e1a78f585dc4e3143ac7b1e302d in branch main
2025-12-01T21:45:08.4020129Z ==> Using Node.js version 22.16.0 (default)
2025-12-01T21:45:08.427734071Z ==> Docs on specifying a Node.js version: https://render.com/docs/node-version
2025-12-01T21:45:10.438851906Z ==> Running build command 'npm install && npm run build'...
2025-12-01T21:45:22.433432794Z 
2025-12-01T21:45:22.433474786Z added 503 packages, and audited 505 packages in 12s
2025-12-01T21:45:22.433492296Z 
2025-12-01T21:45:22.433542978Z 39 packages are looking for funding
2025-12-01T21:45:22.433565659Z   run `npm fund` for details
2025-12-01T21:45:22.43656536Z 
2025-12-01T21:45:22.43658149Z 3 low severity vulnerabilities
2025-12-01T21:45:22.43658631Z 
2025-12-01T21:45:22.436591061Z To address issues that do not require attention, run:
2025-12-01T21:45:22.436595541Z   npm audit fix
2025-12-01T21:45:22.436599271Z 
2025-12-01T21:45:22.436603121Z To address all issues (including breaking changes), run:
2025-12-01T21:45:22.436607751Z   npm audit fix --force
2025-12-01T21:45:22.436611502Z 
2025-12-01T21:45:22.436615192Z Run `npm audit` for details.
2025-12-01T21:45:22.661004691Z 
2025-12-01T21:45:22.661039012Z > connect-yw-backend@0.1.0 build
2025-12-01T21:45:22.661046652Z > prisma generate && tsc
2025-12-01T21:45:22.661050623Z 
2025-12-01T21:45:23.117977208Z Prisma schema loaded from prisma/schema.prisma
2025-12-01T21:45:23.836171571Z 
2025-12-01T21:45:23.836199992Z ✔ Generated Prisma Client (v5.3.1) to ./../node_modules/@prisma/client in 341ms
2025-12-01T21:45:23.836204662Z 
2025-12-01T21:45:23.836209912Z Start using Prisma Client in Node.js (See: https://pris.ly/d/client)
2025-12-01T21:45:23.836214292Z ```
2025-12-01T21:45:23.836219203Z import { PrismaClient } from '@prisma/client'
2025-12-01T21:45:23.836223073Z const prisma = new PrismaClient()
2025-12-01T21:45:23.836226873Z ```
2025-12-01T21:45:23.836230673Z or start using Prisma Client at the edge (See: https://pris.ly/d/accelerate)
2025-12-01T21:45:23.836235013Z ```
2025-12-01T21:45:23.836239754Z import { PrismaClient } from '@prisma/client/edge'
2025-12-01T21:45:23.836243523Z const prisma = new PrismaClient()
2025-12-01T21:45:23.836247114Z ```
2025-12-01T21:45:23.836250464Z 
2025-12-01T21:45:23.836254084Z See other ways of importing Prisma Client: http://pris.ly/d/importing-client
2025-12-01T21:45:23.836257754Z 
2025-12-01T21:45:30.216077087Z src/__tests__/services/auth.service.test.ts(1,38): error TS2307: Cannot find module '@jest/globals' or its corresponding type declarations.
2025-12-01T21:45:30.216210493Z src/__tests__/services/billing.service.test.ts(1,38): error TS2307: Cannot find module '@jest/globals' or its corresponding type declarations.
2025-12-01T21:45:30.216226723Z src/__tests__/services/message.service.test.ts(1,38): error TS2307: Cannot find module '@jest/globals' or its corresponding type declarations.
2025-12-01T21:45:30.26775219Z npm error Lifecycle script `build` failed with error:
2025-12-01T21:45:30.267811082Z npm error code 2
2025-12-01T21:45:30.267856954Z npm error path /opt/render/project/src/backend
2025-12-01T21:45:30.268023491Z npm error workspace connect-yw-backend@0.1.0
2025-12-01T21:45:30.268037071Z npm error location /opt/render/project/src/backend
2025-12-01T21:45:30.268079543Z npm error command failed
2025-12-01T21:45:30.268120294Z npm error command sh -c prisma generate && tsc
2025-12-01T21:45:30.320099169Z ==> Build failed 😞
2025-12-01T21:45:30.32011843Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys