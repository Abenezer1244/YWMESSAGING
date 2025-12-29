
Search
Search

Dec 29, 12:24 PM - 12:28 PM
PST



==> Downloading cache...
==> Cloning from https://github.com/Abenezer1244/YWMESSAGING
==> Checking out commit 06a45ac506c9d5bbaa4ae9e10bffe6680e290127 in branch main
==> Downloaded 686MB in 3s. Extraction took 14s.
==> Requesting Node.js version >=18.0.0
==> Using Node.js version 25.2.1 via /opt/render/project/src/package.json
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
==> Running build command 'npm ci --production=false && npm run build'...
added 2214 packages, and audited 2217 packages in 46s
296 packages are looking for funding
  run `npm fund` for details
18 vulnerabilities (6 low, 1 moderate, 11 high)
To address issues that do not require attention, run:
  npm audit fix
To address all issues (including breaking changes), run:
  npm audit fix --force
Run `npm audit` for details.
> koinonia-sms@0.1.0 build
> npm run build --workspaces
> koinonia-sms-backend@0.1.0 build
> prisma generate && tsc
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v5.13.0) to ./node_modules/@prisma/client in 230ms
Start using Prisma Client in Node.js (See: https://pris.ly/d/client)
```
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```
or start using Prisma Client at the edge (See: https://pris.ly/d/accelerate)
```
import { PrismaClient } from '@prisma/client/edge'
const prisma = new PrismaClient()
```
See other ways of importing Prisma Client: http://pris.ly/d/importing-client
┌────────────────────────────────────────────────────────────────┐
│  Supercharge your Prisma Client with global database caching,  │
│  scalable connection pooling and real-time database events.    │
│  Explore Prisma Accelerate: https://pris.ly/cli/-accelerate    │
│  Explore Prisma Pulse: https://pris.ly/cli/-pulse              │
└────────────────────────────────────────────────────────────────┘
src/lib/tenant-prisma.ts(257,39): error TS2339: Property 'tenant' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(54,48): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(70,41): error TS2339: Property 'tenant' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(114,48): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(130,26): error TS2339: Property 'tenant' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(165,48): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(206,41): error TS2339: Property 'tenant' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(230,48): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(256,47): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(295,48): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(317,33): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
npm error Lifecycle script `build` failed with error:
npm error code 2
npm error path /opt/render/project/src/backend
npm error workspace koinonia-sms-backend@0.1.0
npm error location /opt/render/project/src/backend
npm error command failed
npm error command sh -c prisma generate && tsc
> koinonia-sms-frontend@0.1.0 build
> tsc && npx vite build
vite v7.1.12 building for production...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
transforming...
✓ 2880 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                        1.30 kB │ gzip:   0.61 kB
dist/assets/css/index-BlEd3H25.css                    87.56 kB │ gzip:  14.74 kB
dist/assets/js/analytics-BjEJjmEs.js                   0.36 kB │ gzip:   0.23 kB
dist/assets/js/billing-B8VHwF5e.js                     0.49 kB │ gzip:   0.23 kB
dist/assets/js/themeColors-Cduerava.js                 0.52 kB │ gzip:   0.27 kB
dist/assets/js/designTokens-BhFJIg83.js                0.53 kB │ gzip:   0.36 kB
dist/assets/js/useBreakpoint-D_gF-sG6.js               0.59 kB │ gzip:   0.37 kB
dist/assets/js/LineChartImpl-CiewmSrD.js               0.63 kB │ gzip:   0.40 kB
dist/assets/js/BackButton-CD9BMhs9.js                  0.66 kB │ gzip:   0.45 kB
dist/assets/js/messages-SG8SMC7_.js                    0.68 kB │ gzip:   0.38 kB
dist/assets/js/BarChartImpl-ribzZB_-.js                0.72 kB │ gzip:   0.44 kB
dist/assets/js/SoftButton-BT31kdh0.js                  0.89 kB │ gzip:   0.52 kB
dist/assets/js/MobileTable-D0LwGODm.js                 2.99 kB │ gzip:   1.02 kB
dist/assets/js/AnimatedBlobs-CcUmiRey.js               3.24 kB │ gzip:   1.09 kB
dist/assets/js/TemplateFormModal-CHKBpnB4.js           3.64 kB │ gzip:   1.21 kB
dist/assets/js/TemplatesPage-Cq_t8zxI.js               3.96 kB │ gzip:   1.59 kB
dist/assets/js/LoginPage-CdgpJPfn.js                   4.38 kB │ gzip:   1.96 kB
dist/assets/js/MessageHistoryPage-XJHn2aDS.js          5.03 kB │ gzip:   1.91 kB
dist/assets/js/SendMessagePage-CxgAxDvj.js             5.10 kB │ gzip:   1.86 kB
dist/assets/js/PrivacyPage-CQX7qSs6.js                 5.88 kB │ gzip:   1.55 kB
dist/assets/js/SoftLayout-D9pgB24F.js                  6.08 kB │ gzip:   2.00 kB
dist/assets/js/BlogPage-pOM1ye0Q.js                    6.10 kB │ gzip:   2.13 kB
dist/assets/js/TermsPage-DZC6uQGt.js                   6.38 kB │ gzip:   1.87 kB
dist/assets/js/BillingPage-BPuP1eDX.js                 6.62 kB │ gzip:   1.99 kB
dist/assets/js/ContactPage-u3fCYE6i.js                 6.68 kB │ gzip:   1.91 kB
dist/assets/js/CookiePolicyPage-CZZdBhTt.js            6.71 kB │ gzip:   1.75 kB
dist/assets/js/AboutPage-7YTrDT82.js                   6.77 kB │ gzip:   2.11 kB
dist/assets/js/CheckoutPage-B8rVcYck.js                7.09 kB │ gzip:   2.45 kB
dist/assets/js/SubscribePage-DgDTm2PC.js               7.41 kB │ gzip:   2.48 kB
dist/assets/js/BranchesPage-CxHR5yD3.js                7.47 kB │ gzip:   2.42 kB
dist/assets/js/RegisterPage-Dr30YZHx.js                7.57 kB │ gzip:   2.51 kB
dist/assets/js/ChatWidget-7xH0P2Ws.js                  8.08 kB │ gzip:   2.25 kB
dist/assets/js/CareersPage-vyjEtXUr.js                 8.53 kB │ gzip:   2.40 kB
dist/assets/js/SecurityPage-BKNEFX6a.js                9.10 kB │ gzip:   2.02 kB
dist/assets/js/RecurringMessagesPage-30f-Vgb1.js       9.25 kB │ gzip:   2.81 kB
dist/assets/js/react-stripe.esm-Bb9JIkK3.js           11.23 kB │ gzip:   4.20 kB
dist/assets/js/PhoneNumberPurchaseModal-DO0JoCz0.js   12.10 kB │ gzip:   4.08 kB
dist/assets/js/MembersPage-DKBXdEkp.js                13.10 kB │ gzip:   4.08 kB
dist/assets/js/ConversationsPage-BD0JpbCr.js          18.28 kB │ gzip:   5.90 kB
dist/assets/js/index.esm-BdG2FjqQ.js                  22.38 kB │ gzip:   8.28 kB
dist/assets/js/focus-trap-react-Ch0l227q.js           25.80 kB │ gzip:   8.03 kB
dist/assets/js/DashboardPage-CJChz489.js              26.09 kB │ gzip:   7.84 kB
dist/assets/js/AnalyticsPage-YHC2x7MI.js              32.62 kB │ gzip:   9.85 kB
dist/assets/js/AdminSettingsPage-BJYW780y.js          33.57 kB │ gzip:   8.26 kB
dist/assets/js/vendor-utils-DZXJUmYg.js               47.35 kB │ gzip:  18.43 kB
dist/assets/js/LandingPage-DqbUzzao.js                51.54 kB │ gzip:  10.25 kB
dist/assets/js/vendor-ui-DmDBw7yB.js                 117.57 kB │ gzip:  37.95 kB
dist/assets/js/vendor-react-GajVb7Yi.js              159.43 kB │ gzip:  51.99 kB
dist/assets/js/index-BS7Ba6WZ.js                     208.63 kB │ gzip:  68.05 kB
dist/assets/js/vendor-charts-D9m5HzY1.js             394.60 kB │ gzip: 102.47 kB
✓ built in 17.96s
==> Build failed 😞
==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys

==> Downloading cache...
==> Cloning from https://github.com/Abenezer1244/YWMESSAGING
==> Checking out commit 06a45ac506c9d5bbaa4ae9e10bffe6680e290127 in branch main
==> Downloaded 519MB in 3s. Extraction took 11s.
==> Using Node.js version 22.16.0 (default)
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
==> Running build command 'npm install && npm run build'...
up to date, audited 821 packages in 4s
63 packages are looking for funding
  run `npm fund` for details
5 vulnerabilities (3 low, 2 high)
To address issues that do not require attention, run:
  npm audit fix
To address all issues (including breaking changes), run:
  npm audit fix --force
Run `npm audit` for details.
> koinonia-sms-backend@0.1.0 build
> prisma generate && tsc
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v5.13.0) to ./node_modules/@prisma/client in 326ms
Start using Prisma Client in Node.js (See: https://pris.ly/d/client)
```
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```
or start using Prisma Client at the edge (See: https://pris.ly/d/accelerate)
```
import { PrismaClient } from '@prisma/client/edge'
const prisma = new PrismaClient()
```
See other ways of importing Prisma Client: http://pris.ly/d/importing-client
┌────────────────────────────────────────────────────────────────┐
│  Supercharge your Prisma Client with global database caching,  │
│  scalable connection pooling and real-time database events.    │
│  Explore Prisma Accelerate: https://pris.ly/cli/-accelerate    │
│  Explore Prisma Pulse: https://pris.ly/cli/-pulse              │
└────────────────────────────────────────────────────────────────┘
src/lib/tenant-prisma.ts(257,39): error TS2339: Property 'tenant' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(54,48): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(70,41): error TS2339: Property 'tenant' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(114,48): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(130,26): error TS2339: Property 'tenant' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(165,48): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(206,41): error TS2339: Property 'tenant' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(230,48): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(256,47): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(295,48): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/services/phone-registry.service.ts(317,33): error TS2339: Property 'phoneNumberRegistry' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
npm error Lifecycle script `build` failed with error:
npm error code 2
npm error path /opt/render/project/src/backend
npm error workspace koinonia-sms-backend@0.1.0
npm error location /opt/render/project/src/backend
npm error command failed
npm error command sh -c prisma generate && tsc
==> Build failed 😞
==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys