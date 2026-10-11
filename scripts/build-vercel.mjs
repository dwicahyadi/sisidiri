import { fileURLToPath } from 'node:url';
import { seedDatabase } from '../database/seed.js';
import { loadConfig } from '../src/config/env.js';

// Gagalkan build jika environment deployment belum lengkap.
if (process.env.VERCEL === '1') loadConfig();

// File ini dibundel bersama function; tidak ada seed/penulisan saat request.
seedDatabase(fileURLToPath(new URL('../database/personality.sqlite', import.meta.url)));
await import('./build.mjs');
