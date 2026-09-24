import jwt from "jsonwebtoken";
import crypto from "crypto";
import "dotenv/config";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);

// Access token: short-lived, sent in the response body, kept in memory client-side (never localStorage).
export function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}
export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

// Refresh token: random opaque string. We store only its SHA-256 hash in the DB (reuse detection),
// and ship the raw value to the client solely as an httpOnly cookie.
export function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}
export function hashRefreshToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  };
}
