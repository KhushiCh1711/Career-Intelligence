import { verifyAccessToken } from "../utils/tokens.js";

// Reads "Authorization: Bearer <token>", verifies it, and attaches req.auth = { userId, role, tenantId, refId }.
// role/tenantId/refId are exactly what every downstream query filters by — this is the tenant boundary.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing access token" });

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Not permitted for this role" });
    }
    next();
  };
}
