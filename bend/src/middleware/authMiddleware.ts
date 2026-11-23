/**
 * Backward-compatible re-export of the unified authentication layer.
 *
 * All authentication verification now lives in ./auth (the single authoritative
 * layer). This file preserves the existing import path so that route files
 * previously importing from authMiddleware continue to work without changes,
 * while all verification logic is centralized in ./auth.
 *
 * Supported transports:
 *   - Authorization: Bearer <token> header (API / mobile clients)
 *   - httpOnly "token" cookie (web clients)
 *
 * Both transports resolve to the same AuthRequest.user identity model.
 */
import {
  requireAuth,
  requireAdmin,
  verifyToken,
  extractToken,
  type AuthRequest,
  type AuthPayload,
} from "./auth"

export {
  requireAuth,
  requireAdmin,
  verifyToken,
  extractToken,
  type AuthRequest,
  type AuthPayload,
}

export default { requireAuth, requireAdmin, verifyToken, extractToken }