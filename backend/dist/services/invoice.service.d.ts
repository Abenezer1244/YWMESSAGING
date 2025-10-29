export interface Invoice {
    id: string;
    churchId: string;
    amount: number;
    currency: string;
    status: 'draft' | 'sent' | 'paid' | 'failed';
    plan: string;
    stripeInvoiceId?: string;
    paidAt?: Date;
    failedAt?: Date;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Create an invoice record
 */
export declare function createInvoice(churchId: string, amount: number, plan: string, stripeInvoiceId?: string): Promise<Invoice>;
/**
 * Get invoices for a church
 */
export declare function getInvoices(churchId: string): Promise<Invoice[]>;
/**
 * Mark invoice as paid
 */
export declare function markInvoiceAsPaid(churchId: string, invoiceId: string): Promise<void>;
/**
 * Mark invoice as failed
 */
export declare function markInvoiceAsFailed(churchId: string, invoiceId: string, reason: string): Promise<void>;
/**
 * Get latest invoice for a church
 */
export declare function getLatestInvoice(churchId: string): Promise<Invoice | null>;
//# sourceMappingURL=invoice.service.d.ts.map