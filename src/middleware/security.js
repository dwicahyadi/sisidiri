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

export function rateLimit({ limit, windowMs, now = Date.now }) {
  const counters = new Map();
  const timer = setInterval(() => {
    const current = now();
    for (const [key, counter] of counters) if (counter.resetAt <= current) counters.delete(key);
  }, Math.min(windowMs, 60000));
  timer.unref();
  const middleware = (req, res, next) => {
    const current = now();
    const key = req.ip;
    let counter = counters.get(key);
    if (!counter || counter.resetAt <= current) {
      if (counters.size >= 10000 && !counters.has(key)) {
        res.set('Retry-After', '60');
        return res.status(429).json({ success: false, message: 'Layanan sedang sibuk. Coba kembali sebentar lagi.' });
      }
      counter = { count: 0, resetAt: current + windowMs };
      counters.set(key, counter);
    }
    counter.count += 1;
    if (counter.count > limit) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((counter.resetAt - current) / 1000))));
      return res.status(429).json({ success: false, message: 'Terlalu banyak permintaan. Tunggu sebentar sebelum mencoba lagi.' });
    }
    next();
  };
  middleware.close = () => { clearInterval(timer); counters.clear(); };
  return middleware;
}
