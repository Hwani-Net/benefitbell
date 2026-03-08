/**
 * AI Client helper — Gemini (primary) + OpenRouter (fallback)
 * 
 * Priority:
 * 1. Gemini API (free tier, 15 req/min)
 * 2. OpenRouter free models (fallback)
 */
import OpenAI from 'openai'

// OpenRouter free model fallback list — try auto-router first, then individual models
const FREE_MODELS = [
  'openrouter/free',                                    // Auto-router: picks available free model
  'deepseek/deepseek-r1:free',                          // DeepSeek R1 reasoning
  'meta-llama/llama-3.3-70b-instruct:free',             // Llama 3.3 70B
  'mistralai/mistral-small-3.1-24b-instruct:free',      // Mistral Small 3.1
  'google/gemma-3-27b-it:free',                         // Gemma 3 27B
] as const

export function createAIClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app',
      'X-Title': 'BenefitBell',
    },
  })
}

/**
 * Call AI with Gemini-first, OpenRouter fallback.
 * Tries Gemini API first (faster, more reliable), then falls back to OpenRouter free models.
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
  const { temperature = 0.3, maxTokens = 1000 } = options ?? {}

  // ── 1. Try Gemini API first ──────────────────────
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    try {
      const result = await callGemini(geminiKey, messages, { temperature, maxTokens })
      if (result) return result
    } catch (err) {
      console.warn('[ai-client] Gemini failed, falling back to OpenRouter:', 
        err instanceof Error ? err.message.substring(0, 100) : String(err))
    }
  }

  // ── 2. Fallback to OpenRouter free models ────────
  let lastError: Error | null = null

  for (const model of FREE_MODELS) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      })
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

      if (msg.includes('401') || msg.includes('invalid_api_key')) throw lastError
      if (msg.includes('429') || msg.includes('rate_limit') || msg.includes('quota')) {
        await new Promise(r => setTimeout(r, 1000))
      }
      continue
    }
  }

  throw lastError ?? new Error('All AI models failed')
}

/**
 * Call Gemini API directly (not through OpenRouter)
 */
async function callGemini(
  apiKey: string,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options: { temperature: number; maxTokens: number }
): Promise<string | null> {
  // Convert OpenAI messages to Gemini format
  const systemMsg = messages.find(m => m.role === 'system')
  const userMsgs = messages.filter(m => m.role !== 'system')

  const contents = userMsgs.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content) }],
  }))

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      responseMimeType: 'application/json',
    },
  }

  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: String(systemMsg.content) }] }
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API ${res.status}: ${errText.substring(0, 200)}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  return text || null
}
