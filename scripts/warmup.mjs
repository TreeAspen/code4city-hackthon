// Pre-load the Ollama model into VRAM so the first demo query is fast.
// Cold load costs ~10s; after this it stays resident for 60 minutes.
//
// Usage: node scripts/warmup.mjs   (run once before the demo)

const MODEL = process.env.OLLAMA_MODEL ?? 'llama3.1:8b';
const URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

const t0 = Date.now();
process.stdout.write(`Warming ${MODEL}... `);

const res = await fetch(`${URL}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: MODEL,
    stream: false,
    keep_alive: '60m',
    options: { num_ctx: 4096 },
    messages: [{ role: 'user', content: 'ok' }],
  }),
});

const data = await res.json();
if (data.error) {
  console.error(`\n❌ ${data.error}`);
  console.error('If this is an out-of-memory error, close apps or set OLLAMA_MODEL=llama3.2:3b');
  process.exit(1);
}
console.log(`ready in ${((Date.now() - t0) / 1000).toFixed(1)}s — resident for 60 min.`);
