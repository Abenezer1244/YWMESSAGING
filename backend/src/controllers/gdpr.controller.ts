import { Request, Response } from 'express';
import * as gdprService from '../services/gdpr.service.js';

/**
 * GDPR Controller - Handle data export, deletion, and consent endpoints
 * All endpoints require admin authentication
 */

/**
 * POST /api/gdpr/export
 * Request data export - returns download URL
 */
export async function requestExport(req: Request, res: Response) {
  try {
    const { churchId } = req.user || {};

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const adminId = req.user!.adminId;
    const exportData = await gdprService.createDataExport(churchId, adminId);

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error('Export request error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * GET /api/gdpr/export/:exportId/download
 * Download exported data as JSON file
 */
export async function downloadExport(req: Request, res: Response) {
  try {
    const { exportId } = req.params;
    const { churchId } = req.user || {};

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const data = await gdprService.getExportData(exportId);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Export not found or expired',
      });
    }

    // ✅ SECURITY: Set download headers with proper Content-Disposition
    // Prevents header injection, MIME sniffing, and unwanted browser execution
    const { setDownloadHeaders } = await import('../utils/download-headers.js');
    const filename = `church_data_export_${new Date().toISOString()}.json`;
    setDownloadHeaders(res, filename, 'application/json');

    res.send(data);
  } catch (error) {
    console.error('Download export error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/gdpr/delete-account/request
 * Request account deletion - sends confirmation token via email
 */
export async function requestAccountDeletion(req: Request, res: Response) {
  try {
    const { churchId } = req.user || {};

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const adminId = req.user!.adminId;
    const { reason } = req.body;

    const result = await gdprService.requestAccountDeletion(
      churchId,
      adminId,
      reason
    );

    // TODO: Send confirmation email with token
    console.log(
      `Deletion request for church ${churchId}. Token: ${result.confirmationToken}`
    );

    res.json({
      success: true,
      data: {
        deletionRequestId: result.deletionRequestId,
        scheduledDeletionAt: result.scheduledDeletionAt,
        message: result.message,
        note: 'Confirmation token has been sent to your email address',
      },
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * DELETE /api/gdpr/delete-account
 * Confirm account deletion with token
 */
export async function confirmAccountDeletion(req: Request, res: Response) {
  try {
    const { churchId } = req.user || {};

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { confirmationToken } = req.body;

    if (!confirmationToken) {
      return res.status(400).json({
        success: false,
        error: 'Confirmation token is required',
      });
    }

    const result = await gdprService.confirmAccountDeletion(
      churchId,
      confirmationToken
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Delete confirm error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/gdpr/delete-account/cancel
 * Cancel pending account deletion
 */
export async function cancelAccountDeletion(req: Request, res: Response) {
  try {
    const { churchId } = req.user || {};

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const adminId = req.user!.adminId;

    const result = await gdprService.cancelAccountDeletion(churchId, adminId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Delete cancel error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * GET /api/gdpr/consent
 * Get current consent status
 */
export async function getConsentStatus(req: Request, res: Response) {
  try {
    const { churchId } = req.user || {};

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const consent = await gdprService.getConsentStatus(churchId);

    res.json({
      success: true,
      data: consent,
    });
  } catch (error) {
    console.error('Get consent error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/gdpr/consent/:type
 * Update consent for specific type
 */
export async function updateConsent(req: Request, res: Response) {
  try {
    const { churchId } = req.user || {};

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { type } = req.params;
    const { status, reason } = req.body;

    if (!status || !['granted', 'denied', 'withdrawn'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status required: granted, denied, or withdrawn',
      });
    }

    const result = await gdprService.updateConsent(
      churchId,
      type,
      status,
      reason
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Update consent error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * GET /api/gdpr/consent/history
 * Get consent change audit trail
 */
export async function getConsentHistory(req: Request, res: Response) {
  try {
    const { churchId } = req.user || {};

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { type } = req.query;

    const history = await gdprService.getConsentHistory(
      churchId,
      type as string | undefined
    );

    res.json({
      success: true,
      data: {
        churchId,
        type: type || 'all',
        history,
      },
    });
  } catch (error) {
    console.error('Get consent history error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}
