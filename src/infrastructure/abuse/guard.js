import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { HttpError } from '../../middleware/errors.js';

const unavailable = () => new HttpError(503, 'Pengamanan layanan belum tersedia. Coba lagi sebentar, ya.');
const invalid = () => new HttpError(401, 'Akses chat sudah dipakai atau berakhir. Ulangi kuis untuk mulai lagi.');
const dayWindow = (now) => {
  const date = new Date(now * 1000);
  return { day: date.toISOString().slice(0, 10), ttl: 86400 - (now % 86400) + 60 };
};
class Guard {
  constructor({ secret = randomBytes(32), dailyLimit = 200, now = () => Math.floor(Date.now() / 1000) } = {}) {
    this.secret = secret; this.dailyLimit = dailyLimit; this.now = now;
    this.prefix = `sisidiri:v2:${this.hash('namespace').slice(0, 16)}`;
  }
  hash(value) { return createHmac('sha256', this.secret).update(value).digest('hex'); }
  sessionKey(sid) { return `${this.prefix}:session:${sid}`; }
  rateKey(bucket, ip) { return `${this.prefix}:rate:${bucket}:${this.hash(ip || 'unknown')}`; }
  claimError(code, retryAfter = 60) {
    if (code === -2) throw new HttpError(409, 'Pesan sebelumnya masih diproses. Tunggu sebentar, ya.');
    if (code === -3) throw new HttpError(401, 'Sudah 25 balasan, Kak. Ulangi kuis untuk mulai chat baru.');
    if (code === -4) { const error = new HttpError(429, 'Kuota chat hari ini sudah habis. Coba lagi besok, ya.'); error.retryAfter = retryAfter; throw error; }
    throw invalid();
  }
  close() {}
}

// Pengembangan lokal saja. Produksi wajib memakai Redis bersama.
export class MemoryGuard extends Guard {
  constructor(options = {}) {
    super(options); this.entries = new Map();
    this.timer = setInterval(() => this.sweep(), 60000); this.timer.unref();
  }
  sweep() { for (const [key, value] of this.entries) if (value.exp <= this.now()) this.entries.delete(key); }
  get(key) {
    const value = this.entries.get(key);
    if (value && value.exp <= this.now()) { this.entries.delete(key); return undefined; }
    return value;
  }
  put(key, value, exp) {
    if (!this.entries.has(key) && this.entries.size >= 10000) { this.sweep(); if (this.entries.size >= 10000) throw unavailable(); }
    this.entries.set(key, { value, exp });
  }
  async register(payload) {
    const key = this.sessionKey(payload.sid);
    if (this.get(key) || payload.exp <= this.now()) throw unavailable();
    this.put(key, '0', payload.exp);
  }
  async rate(bucket, ip, limit, seconds) {
    const key = this.rateKey(bucket, ip); const current = this.get(key);
    const count = (current?.value || 0) + 1; const exp = current?.exp || this.now() + seconds;
    this.put(key, count, exp);
    return { allowed: count <= limit, retryAfter: Math.max(1, exp - this.now()) };
  }
  async claim(payload) {
    const key = this.sessionKey(payload.sid); const current = this.get(key);
    if (!current) throw invalid();
    if (String(current.value).startsWith('p:')) this.claimError(-2);
    if (current.value !== String(payload.turn)) throw invalid();
    if (payload.turn >= 25) this.claimError(-3);
    const { day, ttl } = dayWindow(this.now()); const dailyKey = `${this.prefix}:daily:${day}`;
    const daily = this.get(dailyKey); const count = daily?.value || 0;
    if (count >= this.dailyLimit) this.claimError(-4, ttl);
    const owner = randomUUID();
    this.put(dailyKey, count + 1, daily?.exp || this.now() + ttl);
    this.put(key, `p:${payload.turn}:${owner}`, current.exp);
    return owner;
  }
  async finish(payload, owner, success) {
    const key = this.sessionKey(payload.sid); const current = this.get(key);
    if (current?.value !== `p:${payload.turn}:${owner}`) throw unavailable();
    this.put(key, String(payload.turn + Number(success)), current.exp);
  }
  close() { clearInterval(this.timer); this.entries.clear(); }
}

export const scripts = {
  register: `return redis.call('SET', KEYS[1], '0', 'EX', ARGV[1], 'NX') and 1 or 0`,
  rate: `local count = redis.call('INCR', KEYS[1])
local ttl = redis.call('TTL', KEYS[1])
if ttl < 0 then redis.call('EXPIRE', KEYS[1], ARGV[1]); ttl = tonumber(ARGV[1]) end
return {count, ttl}`,
  claim: `local current = redis.call('GET', KEYS[1])
if not current then return {0} end
if string.sub(current, 1, 2) == 'p:' then return {-2} end
if current ~= ARGV[1] then return {-1} end
if tonumber(ARGV[1]) >= 25 then return {-3} end
local count = tonumber(redis.call('GET', KEYS[2]) or '0')
if count >= tonumber(ARGV[3]) then return {-4, redis.call('TTL', KEYS[2])} end
redis.call('INCR', KEYS[2])
if count == 0 then redis.call('EXPIRE', KEYS[2], ARGV[4]) end
redis.call('SET', KEYS[1], ARGV[2], 'KEEPTTL')
return {1}`,
  finish: `if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2], 'KEEPTTL')
return 1`,
};
export class RedisGuard extends Guard {
  constructor({ url, token, fetcher = fetch, ...options }) { super(options); this.url = url; this.token = token; this.fetcher = fetcher; }
  async eval(script, keys, args) {
    try {
      const response = await this.fetcher(this.url, { method: 'POST', headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(['EVAL', script, keys.length, ...keys, ...args.map(String)]), signal: AbortSignal.timeout(5000), redirect: 'error' });
      if (!response.ok) throw unavailable();
      const data = await response.json();
      if (data.error || !Object.hasOwn(data, 'result')) throw unavailable();
      return data.result;
    } catch { throw unavailable(); }
  }
  async register(payload) {
    const ttl = Math.min(3600, payload.exp - this.now());
    if (ttl <= 0 || await this.eval(scripts.register, [this.sessionKey(payload.sid)], [ttl]) !== 1) throw unavailable();
  }
  async rate(bucket, ip, limit, seconds) {
    const result = await this.eval(scripts.rate, [this.rateKey(bucket, ip)], [seconds]);
    if (!Array.isArray(result) || result.length !== 2 || !result.every(Number.isInteger) || result[0] < 1 || result[1] < 0) throw unavailable();
    return { allowed: result[0] <= limit, retryAfter: Math.max(1, result[1]) };
  }
  async claim(payload) {
    const owner = randomUUID(); const { day, ttl } = dayWindow(this.now());
    const result = await this.eval(scripts.claim, [this.sessionKey(payload.sid), `${this.prefix}:daily:${day}`], [payload.turn, `p:${payload.turn}:${owner}`, this.dailyLimit, ttl]);
    if (!Array.isArray(result) || ![1, 0, -1, -2, -3, -4].includes(result[0])) throw unavailable();
    if (result[0] !== 1) this.claimError(result[0], Math.max(1, Number(result[1]) || ttl));
    return owner;
  }
  async finish(payload, owner, success) {
    if (await this.eval(scripts.finish, [this.sessionKey(payload.sid)], [`p:${payload.turn}:${owner}`, payload.turn + Number(success)]) !== 1) throw unavailable();
  }
}
export function createGuard(config = {}) {
  const options = { secret: config.tokenSecret, dailyLimit: config.chatDailyLimit || 200 };
  if (config.redisUrl && config.redisToken) return new RedisGuard({ ...options, url: config.redisUrl, token: config.redisToken });
  if (config.production || config.vercel) throw new Error('Redis bersama wajib untuk pengamanan produksi.');
  return new MemoryGuard(options);
}
