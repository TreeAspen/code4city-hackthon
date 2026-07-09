/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_LIVE_API?: string;
  readonly VITE_FAKE_OVERLAY?: string;
  readonly VITE_SODA_APP_TOKEN?: string;
  readonly VITE_LLM_PROVIDER?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_MODEL?: string;
  readonly VITE_OLLAMA_MODEL?: string;
  readonly VITE_OLLAMA_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
