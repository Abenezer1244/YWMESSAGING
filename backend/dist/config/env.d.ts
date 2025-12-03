/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 * Fails fast if critical configuration is missing
 */
interface EnvironmentConfig {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    redisUrl: string;
    jwtSecret: string;
    jwtRefreshSecret: string;
    stripeSecret: string;
    stripePublishable: string;
    telnyxApiKey: string;
    sendgridApiKey: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    awsRegion: string;
    s3BucketName: string;
    datadogApiKey?: string;
    sentryDsn?: string;
    resendApiKey: string;
    frontendUrl: string;
}
/**
 * Validate environment variables at startup
 * Throws error if required variables are missing
 */
export declare function validateEnvironment(): EnvironmentConfig;
export declare const config: EnvironmentConfig;
export {};
//# sourceMappingURL=env.d.ts.map