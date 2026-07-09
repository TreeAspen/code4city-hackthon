// Free-model LLM client for the browser Extractor.
//
// Providers (choose via VITE_LLM_PROVIDER, or auto):
//  - 'gemini': Google Gemini free tier. Needs VITE_GEMINI_API_KEY. Fast (~1-2s),
//    recommended for live demos.
//  - 'ollama': local Ollama server (http://localhost:11434). No key at all, but
//    latency depends on your hardware (an 8B model on CPU can take 10-30s/query).
//    Requires `ollama pull <model>` first. Ollama's default CORS config already
//    allows localhost dev servers; if you see CORS errors set OLLAMA_ORIGINS=*.
//
// Both providers enforce the JSON schema server-side (Gemini responseSchema /
// Ollama grammar-constrained `format`), so responses parse deterministically.

export type LLMProvider = 'gemini' | 'ollama';

const explicit = import.meta.env.VITE_LLM_PROVIDER as LLMProvider | undefined;
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const activeProvider: LLMProvider | null =
  explicit === 'ollama' ? 'ollama'
  : explicit === 'gemini' ? (geminiKey ? 'gemini' : null)
  : geminiKey ? 'gemini'
  : null;

export const isLLMConfigured = activeProvider !== null;

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1:8b';
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';

interface JsonCall {
  system: string;
  user: string;
  schema: object; // plain JSON schema: type/properties/items/required/enum only
}

// Returns the raw JSON text emitted by the model (schema-constrained).
export async function callLLMJson({ system, user, schema }: JsonCall): Promise<string> {
  if (activeProvider === 'gemini') return callGemini(system, user, schema);
  if (activeProvider === 'ollama') return callOllama(system, user, schema);
  throw new Error('No LLM provider configured (set VITE_GEMINI_API_KEY or VITE_LLM_PROVIDER=ollama)');
}

async function callGemini(system: string, user: string, schema: object): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(25_000),
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no text');
  return text;
}

async function callOllama(system: string, user: string, schema: object): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // local models can be slow — generous timeout
    signal: AbortSignal.timeout(90_000),
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: schema, // grammar-constrained JSON output
      keep_alive: '60m', // stay resident in VRAM during the demo (no 9s cold reload)
      options: { temperature: 0, num_ctx: 4096, num_predict: 3000 },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data?.message?.content;
  if (!text) throw new Error('Ollama returned no content');
  return text;
}
