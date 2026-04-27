/**
 * AI Client — multi-provider fallback chain
 *
 * Order: Gemini 2.5 Flash → OpenAI gpt-4o-mini → Anthropic Haiku 4.5
 * Each provider is tried in turn; the first one that returns a non-empty
 * response wins. Missing API keys cause that provider to be skipped.
 *
 * Direct fetch — no SDK dependencies.
 */

export type ChatRole = "system" | "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CallOptions {
  temperature?: number;
  maxTokens?: number;
  /** Hint that the model should return strict JSON. Each provider applies
   * this differently: OpenAI uses response_format, Gemini uses
   * responseMimeType, Anthropic relies on the system prompt. */
  jsonMode?: boolean;
}

const TIMEOUT_MS = 25000;

// ────────────────────────────────────────────────────────────────────
// Provider implementations
// ────────────────────────────────────────────────────────────────────

async function callGemini(
  messages: ChatMessage[],
  options: CallOptions = {},
): Promise<string> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("provider_unconfigured");

  // Gemini API uses a single content stream; merge system messages into the
  // user message prefix since Gemini's "system_instruction" field is optional
  // and treating system as part of the user prompt is the most portable.
  const systemText = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const userText = messages
    .filter((m) => m.role !== "system")
    .map((m) => m.content)
    .join("\n\n");

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ],
    ...(systemText
      ? { systemInstruction: { parts: [{ text: systemText }] } }
      : {}),
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxTokens ?? 1000,
      ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`gemini_http_${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("gemini_empty_response");
  return text;
}

async function callOpenAI(
  messages: ChatMessage[],
  options: CallOptions = {},
): Promise<string> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("provider_unconfigured");

  const body = {
    model: "gpt-4o-mini",
    messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 1000,
    ...(options.jsonMode
      ? { response_format: { type: "json_object" as const } }
      : {}),
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`openai_http_${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("openai_empty_response");
  return text;
}

async function callAnthropic(
  messages: ChatMessage[],
  options: CallOptions = {},
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) throw new Error("provider_unconfigured");

  const systemText = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const turns = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

  const body = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: options.maxTokens ?? 1000,
    temperature: options.temperature ?? 0.3,
    ...(systemText ? { system: systemText } : {}),
    messages: turns,
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`anthropic_http_${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = (data?.content as Array<{ type: string; text?: string }>)
    ?.filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("anthropic_empty_response");
  return text;
}

// ────────────────────────────────────────────────────────────────────
// Fallback chain
// ────────────────────────────────────────────────────────────────────

type ProviderFn = (
  messages: ChatMessage[],
  options?: CallOptions,
) => Promise<string>;

const PROVIDERS: Array<{ name: string; fn: ProviderFn }> = [
  { name: "gemini", fn: callGemini },
  { name: "openai", fn: callOpenAI },
  { name: "anthropic", fn: callAnthropic },
];

/**
 * Call the first available AI provider. On failure, automatically falls
 * back to the next configured provider. Throws only if every provider
 * fails (or none is configured).
 */
export async function callAI(
  messages: ChatMessage[],
  options?: CallOptions,
): Promise<string> {
  let lastError: unknown;
  for (const provider of PROVIDERS) {
    try {
      const text = await provider.fn(messages, options);
      return text;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      // Unconfigured providers are silently skipped; real errors are logged
      // so we can see fallback activity in Cloud Run logs.
      if (msg !== "provider_unconfigured") {
        console.error(
          `[ai-client] ${provider.name} failed: ${msg.slice(0, 250)} — trying next`,
        );
      }
    }
  }
  const msg =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`all_providers_failed: ${msg}`);
}
