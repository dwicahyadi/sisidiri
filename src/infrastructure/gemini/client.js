import { HttpError } from '../../middleware/errors.js';

export async function createGeminiClient(config, providedSDK) {
  if (!config.apiKey) return { available: false };
  let GoogleGenAI = providedSDK;
  try { if (!GoogleGenAI) ({ GoogleGenAI } = await import('@google/genai')); } catch {
    if (config.production) throw new Error('SDK @google/genai belum terpasang.');
    return { available: false };
  }
  const ai = new GoogleGenAI({ apiKey: config.apiKey, httpOptions: { timeout: config.timeoutMs, retryOptions: { attempts: 1 } } });
  return {
    available: true,
    async create({ instruction, message, previousId }) {
      let interaction;
      try {
        interaction = await ai.interactions.create({
          model: config.model,
          system_instruction: instruction,
          input: message,
          store: true,
          ...(previousId ? { previous_interaction_id: previousId } : {}),
          generation_config: { max_output_tokens: config.maxOutputTokens },
        }, { timeout_ms: config.timeoutMs, retries: { strategy: 'none' } });
      } catch (error) {
        const timeout = /timeout|timed out|abort/i.test(error.name || '') || /timeout|timed out/i.test(error.message || '');
        throw new HttpError(timeout ? 504 : 502, 'AI belum bisa membalas. Coba lagi sebentar, ya.');
      }
      if (interaction.status && interaction.status !== 'completed') throw new HttpError(502, 'Balasan AI belum selesai. Coba lagi sebentar, ya.');
      const text = typeof interaction.output_text === 'string' ? interaction.output_text.trim() : '';
      if (!text || typeof interaction.id !== 'string' || !interaction.id.trim() || interaction.id.length > 1024) {
        throw new HttpError(502, 'Balasan AI belum tersedia. Coba lagi sebentar, ya.');
      }
      return { message: text, id: interaction.id };
    },
  };
}
