import { isIP } from 'node:net';

// Vercel mengganti header ini di edge. Jangan percayai header pada server lokal.
export function clientIp(req, vercel = false) {
  const forwarded = req.headers['x-forwarded-for'];
  return vercel && typeof forwarded === 'string' && isIP(forwarded.trim()) ? forwarded.trim() : req.ip;
}

export function securityHeaders(req, res, next) {
  res.set({
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  });
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}
