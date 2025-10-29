import Bull from 'bull';
export declare const mailQueue: Bull.Queue<any>;
export declare const smsQueue: Bull.Queue<any>;
export declare const analyticsQueue: Bull.Queue<any>;
export declare function closeQueues(): Promise<void>;
//# sourceMappingURL=queue.d.ts.map