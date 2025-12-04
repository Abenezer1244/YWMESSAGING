2025-12-03T18:10:57.874326348Z ==> Downloading cache...
2025-12-03T18:10:57.91550503Z ==> Cloning from https://github.com/Abenezer1244/YWMESSAGING
2025-12-03T18:11:06.047603834Z ==> Checking out commit 371c2514b9ab4ca2f5eb5b7893693969316ca40d in branch main
2025-12-03T18:11:20.144288481Z ==> Downloaded 689MB in 8s. Extraction took 13s.
2025-12-03T18:11:36.734574697Z ==> Requesting Node.js version >=18.0.0
2025-12-03T18:11:36.87482952Z ==> Using Node.js version 25.2.1 via /opt/render/project/src/package.json
2025-12-03T18:11:36.901468631Z ==> Docs on specifying a Node.js version: https://render.com/docs/node-version
2025-12-03T18:11:37.026017238Z ==> Running build command 'npm ci --production=false && npm run build'...
2025-12-03T18:12:10.225796736Z 
2025-12-03T18:12:10.225823246Z added 2004 packages, and audited 2007 packages in 33s
2025-12-03T18:12:10.22602012Z 
2025-12-03T18:12:10.226163334Z 284 packages are looking for funding
2025-12-03T18:12:10.226284326Z   run `npm fund` for details
2025-12-03T18:12:10.265991636Z 
2025-12-03T18:12:10.266019287Z 17 vulnerabilities (5 low, 2 moderate, 10 high)
2025-12-03T18:12:10.266023567Z 
2025-12-03T18:12:10.266029997Z To address issues that do not require attention, run:
2025-12-03T18:12:10.266034227Z   npm audit fix
2025-12-03T18:12:10.266038117Z 
2025-12-03T18:12:10.266042027Z To address all issues (including breaking changes), run:
2025-12-03T18:12:10.266046448Z   npm audit fix --force
2025-12-03T18:12:10.266049937Z 
2025-12-03T18:12:10.266055468Z Run `npm audit` for details.
2025-12-03T18:12:10.711190299Z 
2025-12-03T18:12:10.711217689Z > connect-yw-platform@0.1.0 build
2025-12-03T18:12:10.711222879Z > npm run build --workspaces
2025-12-03T18:12:10.711226319Z 
2025-12-03T18:12:10.857301887Z 
2025-12-03T18:12:10.857331128Z > connect-yw-backend@0.1.0 build
2025-12-03T18:12:10.857336468Z > prisma generate && tsc
2025-12-03T18:12:10.857339958Z 
2025-12-03T18:12:11.335124558Z Prisma schema loaded from prisma/schema.prisma
2025-12-03T18:12:11.944516466Z 
2025-12-03T18:12:11.944543796Z ✔ Generated Prisma Client (v5.13.0) to ./node_modules/@prisma/client in 251ms
2025-12-03T18:12:11.944548147Z 
2025-12-03T18:12:11.944552236Z Start using Prisma Client in Node.js (See: https://pris.ly/d/client)
2025-12-03T18:12:11.944555827Z ```
2025-12-03T18:12:11.944560247Z import { PrismaClient } from '@prisma/client'
2025-12-03T18:12:11.944563847Z const prisma = new PrismaClient()
2025-12-03T18:12:11.944567367Z ```
2025-12-03T18:12:11.944570887Z or start using Prisma Client at the edge (See: https://pris.ly/d/accelerate)
2025-12-03T18:12:11.944574467Z ```
2025-12-03T18:12:11.944578767Z import { PrismaClient } from '@prisma/client/edge'
2025-12-03T18:12:11.944582757Z const prisma = new PrismaClient()
2025-12-03T18:12:11.944586227Z ```
2025-12-03T18:12:11.944589567Z 
2025-12-03T18:12:11.944593037Z See other ways of importing Prisma Client: http://pris.ly/d/importing-client
2025-12-03T18:12:11.944596397Z 
2025-12-03T18:12:11.944600818Z ┌────────────────────────────────────────────────────────────────┐
2025-12-03T18:12:11.944605528Z │  Supercharge your Prisma Client with global database caching,  │
2025-12-03T18:12:11.944609168Z │  scalable connection pooling and real-time database events.    │
2025-12-03T18:12:11.944624698Z │  Explore Prisma Accelerate: https://pris.ly/cli/-accelerate    │
2025-12-03T18:12:11.944626988Z │  Explore Prisma Pulse: https://pris.ly/cli/-pulse              │
2025-12-03T18:12:11.944629218Z └────────────────────────────────────────────────────────────────┘
2025-12-03T18:12:11.944631228Z 
2025-12-03T18:12:18.547005824Z 
2025-12-03T18:12:18.547042545Z > connect-frontend@0.1.0 build
2025-12-03T18:12:18.547049635Z > tsc && npx vite build
2025-12-03T18:12:18.547054396Z 
2025-12-03T18:12:25.742244124Z src/App.tsx(4,21): error TS2307: Cannot find module 'react-ga4' or its corresponding type declarations.
2025-12-03T18:12:25.742364186Z src/hooks/useWebVitals.ts(3,21): error TS2307: Cannot find module 'react-ga4' or its corresponding type declarations.
2025-12-03T18:12:25.824043835Z npm error Lifecycle script `build` failed with error:
2025-12-03T18:12:25.824176518Z npm error code 2
2025-12-03T18:12:25.824290511Z npm error path /opt/render/project/src/frontend
2025-12-03T18:12:25.824525866Z npm error workspace connect-frontend@0.1.0
2025-12-03T18:12:25.82472202Z npm error location /opt/render/project/src/frontend
2025-12-03T18:12:25.824839782Z npm error command failed
2025-12-03T18:12:25.825012086Z npm error command sh -c tsc && npx vite build
2025-12-03T18:12:25.879724318Z ==> Build failed 😞
2025-12-03T18:12:25.879744658Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys