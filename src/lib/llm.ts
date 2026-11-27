type LlmProvider = "openai" | "openrouter" | "glm";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type ProviderConfig = {
  provider: LlmProvider;
  apiKey?: string;
  baseUrl: string;
  model?: string;
  fallbackModels?: string[];
  headers?: Record<string, string>;
};

export type LlmResult = {
  provider: LlmProvider;
  model: string;
  content: string;
};

const GEMINI_4_MODEL_RE = /^(?:google\/)?gemini-4(?:-|$)/i;
const DEFAULT_OPENROUTER_MODEL = "google/gemini-4-neon";
const DEFAULT_OPENROUTER_FALLBACK_MODEL = "google/gemini-4-hydrogen";
const MIN_GEMINI_4_MAX_TOKENS = 8192;
const DEFAULT_GEMINI_4_MAX_TOKENS = 16384;

function isGemini4Model(model: string): boolean {
  return GEMINI_4_MODEL_RE.test(model.trim());
}

function trimSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function providerConfigs(): ProviderConfig[] {
  const openai: ProviderConfig = {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL || "gpt-5.2"
  };

  const openrouterPrimary = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;
  const openrouterFallback = process.env.OPENROUTER_FALLBACK_MODEL || DEFAULT_OPENROUTER_FALLBACK_MODEL;
  const openrouter: ProviderConfig = {
    provider: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    model: openrouterPrimary,
    fallbackModels: openrouterFallback && openrouterFallback !== openrouterPrimary ? [openrouterFallback] : [],
    headers: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://ventureproof.seymata.com",
      "X-OpenRouter-Title": "VentureProof AI"
    }
  };

  const glm: ProviderConfig = {
    provider: "glm",
    apiKey: process.env.GLM_API_KEY,
    baseUrl: process.env.GLM_BASE_URL || "https://api.z.ai/api/coding/paas/v4",
    model: process.env.GLM_MODEL || "glm-5.2"
  };

  const priority = (process.env.AI_PROVIDER_ORDER || [process.env.AI_PRIMARY_PROVIDER, process.env.AI_FALLBACK_PROVIDER, "openrouter", "openai", "glm"].filter(Boolean).join(","))
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean) as LlmProvider[];

  const configs = { openai, openrouter, glm };
  return [...new Set(priority)].map((provider) => configs[provider]).filter((config) => config?.apiKey && config.model);
}

export async function completeJson(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<LlmResult | null> {
  for (const config of providerConfigs()) {
    const models = [...new Set([config.model, ...(config.fallbackModels || [])].filter((m): m is string => Boolean(m)))];
    for (const model of models) {
      try {
        const gemini4 = isGemini4Model(model);
        const body: Record<string, unknown> = {
          model,
          messages,
          max_tokens: gemini4
            ? Math.max(options?.maxTokens ?? DEFAULT_GEMINI_4_MAX_TOKENS, MIN_GEMINI_4_MAX_TOKENS)
            : (options?.maxTokens ?? 4000),
          response_format: { type: "json_object" }
        };
        if (!gemini4) {
          body.temperature = options?.temperature ?? 0.4;
        }

        const response = await fetch(`${trimSlash(config.baseUrl)}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
            ...config.headers
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          console.warn(`[llm] ${config.provider}/${model} failed`, response.status, await response.text().catch(() => ""));
          continue;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content === "string" && content.trim()) {
          return { provider: config.provider, model, content };
        }
      } catch (error) {
        console.warn(`[llm] ${config.provider}/${model} error`, error);
      }
    }
  }

  return null;
}

export function configuredProviders() {
  return providerConfigs().map((config) => `${config.provider}:${config.model}`);
}
