import express from 'express';
import { createRuntime } from './src/runtime.js';

// Entrypoint Vercel: tanpa listener port, seed, atau penulisan filesystem runtime.
const runtime = await createRuntime();
const app = express();
app.disable('x-powered-by');
app.use(runtime.app);
export default app;
