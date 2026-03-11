/**
 * AI Client helper — OpenAI GPT-4.1 nano
 * Switched from GPT-4o mini (2026-03-11): 33% cheaper ($0.10/$0.40 vs $0.15/$0.60), 2x faster
 */
import OpenAI from 'openai'

export function createAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  return new OpenAI({ apiKey })
}

/**
 * Call OpenAI GPT-4.1 nano
 */
export async function callAIWithFallback(
  client: OpenAI,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: {
    temperature?: number
    maxTokens?: number
    jsonMode?: boolean
  }
): Promise<string> {
  const { temperature = 0.3, maxTokens = 1000, jsonMode = false } = options ?? {}

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('GPT-4.1 nano returned empty content')
    }

    return content
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[ai-client] GPT-4.1 nano failed: ${msg.substring(0, 200)}`)
    throw err
  }
}
