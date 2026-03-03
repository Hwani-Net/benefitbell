/**
 * AI Client helper — OpenRouter (free tier)
 * 
 * Uses OpenRouter's free endpoint via OpenAI-compatible SDK.
 * Model fallback: tries multiple models if primary fails.
 * Free tier: 20 req/min, 200 req/day — sufficient for MVP.
 */
import OpenAI from 'openai'

// Model priority list — first available wins
const FREE_MODELS = [
  'openrouter/free',                              // Auto-routes to best available free model
  'meta-llama/llama-3.3-70b-instruct:free',       // Great general purpose
  'mistralai/mistral-small-3.1-24b-instruct:free', // Good for structured output
  'google/gemma-3-27b-it:free',                    // Google's open model
] as const

export function createAIClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://zippy-lolly-1f23de.netlify.app',
      'X-Title': 'BenefitBell',
    },
  })
}

/**
 * Call AI with automatic model fallback.
 * Tries each model in priority order; returns first successful response.
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

  let lastError: Error | null = null

  for (const model of FREE_MODELS) {
    try {
      const params: OpenAI.Chat.ChatCompletionCreateParams = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }

      // Note: response_format may not work on all free models
      // We rely on prompt engineering for JSON output instead

      const completion = await client.chat.completions.create(params)
      const content = completion.choices[0]?.message?.content?.trim()

      if (!content) {
        console.warn(`[ai-client] Model ${model} returned empty content, trying next...`)
        continue
      }

      return content
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const msg = lastError.message
      console.warn(`[ai-client] Model ${model} failed: ${msg.substring(0, 100)}`)

      // Don't retry on auth errors
      if (msg.includes('401') || msg.includes('invalid_api_key')) {
        throw lastError
      }
      // Continue to next model for rate limits or other errors
      continue
    }
  }

  throw lastError ?? new Error('All AI models failed')
}
