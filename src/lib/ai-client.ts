/**
 * AI Client helper — OpenAI gpt-4o-mini
 */
import OpenAI from "openai";

const AI_MODEL = "gpt-4o-mini";

export function createAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  return new OpenAI({ apiKey });
}

export async function callAIWithFallback(
  client: OpenAI,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  },
): Promise<string> {
  const {
    temperature = 0.3,
    maxTokens = 1000,
    jsonMode = false,
  } = options ?? {};

  try {
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode
        ? { response_format: { type: "json_object" as const } }
        : {}),
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error(`${AI_MODEL} returned empty content`);
    }

    return content;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[ai-client] ${AI_MODEL} failed: ${msg.substring(0, 300)}`);
    throw err;
  }
}
