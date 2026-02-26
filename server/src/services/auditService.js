// ===========================================
// THE VIDEO POOL - Audit Logging Service
// Records admin actions for compliance tracking
// ===========================================

import { query } from "../db/config.js";

/**
 * Log an admin action for audit purposes.
 *
 * @param {Object} params
 * @param {number} params.adminId     - ID of the admin performing the action
 * @param {string} params.action      - Action type (e.g. 'user.update_role', 'video.delete', 'video.bulk_upload')
 * @param {string} params.resourceType - Type of resource (e.g. 'user', 'video')
 * @param {string|number} [params.resourceId] - ID of the affected resource
 * @param {Object} [params.details]   - Additional context (changes made, before/after values, etc.)
 * @param {string} [params.ipAddress] - Request IP address
 * @param {string} [params.userAgent] - Request User-Agent header
 */
export async function logAuditEvent({
  adminId,
  action,
  resourceType,
  resourceId = null,
  details = {},
  ipAddress = null,
  userAgent = null,
}) {
  try {
    await query(
      `INSERT INTO audit_logs (admin_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        adminId,
        action,
        resourceType,
        resourceId ? String(resourceId) : null,
        JSON.stringify(details),
        ipAddress,
        userAgent,
      ],
    );
  } catch (error) {
    // Audit logging should never block the main operation.
    // Log the error but don't rethrow.
    console.error("[AUDIT] Failed to write audit log:", error.message);
  }
}

/**
 * Express middleware factory: automatically logs admin actions.
 * Attach after requireAuth + requireAdmin.
 *
 * @param {string} action - Action name (e.g. 'user.update')
 * @param {Function} [getResourceInfo] - Optional function(req) => { resourceType, resourceId, details }
 */
export function auditMiddleware(action, getResourceInfo) {
  return (req, res, next) => {
    // Hook into response finish to log after success
    const originalEnd = res.end;
    res.end = function (...args) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const info = getResourceInfo
          ? getResourceInfo(req)
          : { resourceType: "unknown", resourceId: null, details: {} };

        logAuditEvent({
          adminId: req.user?.id,
          action,
          resourceType: info.resourceType,
          resourceId: info.resourceId,
          details: info.details,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        });
      }
      originalEnd.apply(res, args);
    };
    next();
  };
}

/**
 * Get audit logs with pagination and filtering.
 * For admin dashboard consumption.
 */
export async function getAuditLogs({
  page = 1,
  limit = 50,
  adminId,
  action,
  resourceType,
} = {}) {
  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (adminId) {
    conditions.push(`al.admin_id = $${paramIdx++}`);
    params.push(adminId);
  }
  if (action) {
    conditions.push(`al.action = $${paramIdx++}`);
    params.push(action);
  }
  if (resourceType) {
    conditions.push(`al.resource_type = $${paramIdx++}`);
    params.push(resourceType);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * limit;

  const [logsResult, countResult] = await Promise.all([
    query(
      `SELECT al.*, u.name as admin_name, u.email as admin_email
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.admin_id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset],
    ),
    query(`SELECT COUNT(*) as count FROM audit_logs al ${whereClause}`, params),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return {
    logs: logsResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export default { logAuditEvent, auditMiddleware, getAuditLogs };
