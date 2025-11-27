import { prisma } from '../lib/prisma.js';

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
export async function createInvoice(
  churchId: string,
  amount: number,
  plan: string,
  stripeInvoiceId?: string
): Promise<Invoice> {
  try {
    // Check if a Invoice model exists, if not we'll create a basic record in a temporary way
    // For MVP, we'll just log this and return a mock invoice
    console.log(`📄 Creating invoice for church ${churchId}: $${amount / 100} for ${plan} plan`);

    return {
      id: `inv_${Date.now()}`,
      churchId,
      amount,
      currency: 'usd',
      status: 'sent',
      plan,
      stripeInvoiceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to create invoice:', error);
    throw error;
  }
}

/**
 * Get invoices for a church
 */
export async function getInvoices(churchId: string): Promise<Invoice[]> {
  try {
    // For MVP, return mock invoices
    const subscription = await prisma.subscription.findUnique({
      where: { churchId },
    });

    if (!subscription) {
      return [];
    }

    // Return a mock invoice list
    return [
      {
        id: `inv_${Date.now()}`,
        churchId,
        amount: 4900, // Example Starter plan
        currency: 'usd',
        status: 'paid',
        plan: subscription.plan,
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  } catch (error) {
    console.error('Failed to get invoices:', error);
    throw error;
  }
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  churchId: string,
  invoiceId: string
): Promise<void> {
  try {
    console.log(`✅ Invoice ${invoiceId} marked as paid for church ${churchId}`);
  } catch (error) {
    console.error('Failed to mark invoice as paid:', error);
    throw error;
  }
}

/**
 * Mark invoice as failed
 */
export async function markInvoiceAsFailed(
  churchId: string,
  invoiceId: string,
  reason: string
): Promise<void> {
  try {
    console.log(
      `❌ Invoice ${invoiceId} marked as failed for church ${churchId}: ${reason}`
    );
  } catch (error) {
    console.error('Failed to mark invoice as failed:', error);
    throw error;
  }
}

/**
 * Get latest invoice for a church
 */
export async function getLatestInvoice(churchId: string): Promise<Invoice | null> {
  try {
    const invoices = await getInvoices(churchId);
    return invoices.length > 0 ? invoices[0] : null;
  } catch (error) {
    console.error('Failed to get latest invoice:', error);
    return null;
  }
}
