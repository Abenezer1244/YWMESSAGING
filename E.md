┌─────────────────────────────────────────────────────────┐
│  Update available 5.3.1 -> 7.0.1                        │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
src/config/datadog.config.ts(32,7): error TS2353: Object literal may only specify known properties, and 'enabled' does not exist in type 'TracerOptions'.
src/config/datadog.config.ts(64,12): error TS2339: Property 'setTag' does not exist on type 'Tracer'.
src/config/datadog.config.ts(65,12): error TS2339: Property 'setTag' does not exist on type 'Tracer'.
src/config/datadog.config.ts(66,12): error TS2339: Property 'setTag' does not exist on type 'Tracer'.
src/controllers/billing.controller.ts(85,25): error TS2339: Property 'price' does not exist on type 'PlanLimits'.
src/controllers/nps.controller.ts(36,35): error TS2339: Property 'id' does not exist on type 'AccessTokenPayload'.
src/routes/nps.routes.ts(13,30): error TS2307: Cannot find module '../middleware/auth.js' or its corresponding type declarations.
src/routes/nps.routes.ts(14,34): error TS2307: Cannot find module '../middleware/church.js' or its corresponding type declarations.
src/routes/planning-center.routes.ts(14,30): error TS2307: Cannot find module '../middleware/auth.js' or its corresponding type declarations.
src/routes/planning-center.routes.ts(15,34): error TS2307: Cannot find module '../middleware/church.js' or its corresponding type declarations.
src/services/conversation.service.ts(34,5): error TS2739: Type '{}' is missing the following properties from type '{ data: any[]; pagination: { page: number; limit: number; total: number; pages: number; }; }': data, pagination
src/services/gdpr.service.ts(307,16): error TS2339: Property 'numberPool' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/services/gdpr.service.ts(311,16): error TS2339: Property 'webhook' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/services/nps.service.ts(6,24): error TS2307: Cannot find module '../config/database.config.js' or its corresponding type declarations.
src/services/nps.service.ts(79,5): error TS2322: Type 'string' is not assignable to type 'null'.
src/services/planning-center.service.ts(303,7): error TS2353: Object literal may only specify known properties, and 'clientId' does not exist in type 'PlanningCenterIntegration'.
src/services/planning-center.service.ts(343,7): error TS2353: Object literal may only specify known properties, and 'clientId' does not exist in type 'PlanningCenterIntegration'.
src/services/planning-center.service.ts(495,7): error TS2322: Type '() => void' is not assignable to type 'never'.
src/utils/advanced-rate-limiting.ts(363,5): error TS2322: Type '() => (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<...>, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>' is not assignable to type '() => (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
  Call signature return types '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>' and '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>' are incompatible.
    Type 'Promise<Response<any, Record<string, any>> | undefined>' is not assignable to type 'Promise<void>'.
      Type 'Response<any, Record<string, any>> | undefined' is not assignable to type 'void'.
        Type 'Response<any, Record<string, any>>' is not assignable to type 'void'.
src/utils/query-monitor.ts(52,14): error TS2345: Argument of type '"query"' is not assignable to parameter of type 'never'.
src/utils/test-redis-failover.ts(79,9): error TS2322: Type '() => null' is not assignable to type 'number | false | ((retries: number, cause: Error) => number | false | Error) | undefined'.
  Type '() => null' is not assignable to type '(retries: number, cause: Error) => number | false | Error'.
    Type 'null' is not assignable to type 'number | false | Error'.
src/utils/test-redis.ts(79,24): error TS2345: Argument of type '[string, "job-1", "job-2", "job-3"]' is not assignable to parameter of type '[key: RedisCommandArgument, elements: RedisCommandArgument | RedisCommandArgument[]] | [options: CommandOptions<ClientCommandOptions>, key: RedisCommandArgument, elements: RedisCommandArgument | RedisCommandArgument[]]'.
  Type '[string, "job-1", "job-2", "job-3"]' is not assignable to type '[options: CommandOptions<ClientCommandOptions>, key: RedisCommandArgument, elements: RedisCommandArgument | RedisCommandArgument[]]'.
    Source has 4 element(s) but target allows only 3.
npm error Lifecycle script `build` failed with error:
npm error code 2
npm error path /opt/render/project/src/backend
npm error workspace connect-yw-backend@0.1.0
npm error location /opt/render/project/src/backend
npm error command failed
npm error command sh -c prisma generate && tsc
==> Build failed 😞
==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys