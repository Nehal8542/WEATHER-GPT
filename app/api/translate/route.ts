import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 10

const LANG_NAMES: Record<string, string> = {
  hi: "Hindi",
  en: "English",
  bn: "Bengali",
  te: "Telugu",
  ta: "Tamil",
  mr: "Marathi",
  gu: "Gujarati",
  pa: "Punjabi",
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { texts, targetLang } = body as { texts?: string[]; targetLang?: string }

    if (!texts || !Array.isArray(texts) || texts.length === 0 || !targetLang) {
      return NextResponse.json({ translations: texts ?? [] })
    }

    const langName = LANG_NAMES[targetLang] ?? targetLang

    // Check Groq API Key
    const groqKey = process.env.GROQ_API_KEY?.trim()
    if (groqKey) {
      const models = ["openai/gpt-oss-20b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b"]
      for (const model of models) {
        try {
          const prompt = `Translate the following array of ${texts.length} messages into ${langName} (${targetLang}).
Keep all markdown formatting (**bold**), bullet points (* or •), emojis, numbers, and units (°C, km/h, mm, AQI) exactly as structured.
Return ONLY valid JSON matching this exact schema:
{
  "translations": ["translated item 1", "translated item 2"]
}

Array to translate:
${JSON.stringify(texts)}`

          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqKey}`,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify({
              model,
              temperature: 0.1,
              max_tokens: 800,
              reasoning_format: "hidden",
              response_format: { type: "json_object" },
              messages: [
                {
                  role: "system",
                  content: `You are an expert meteorological and linguistics translator. You translate accurately into ${langName}. Always respond with a JSON object containing a "translations" string array with ${texts.length} elements in the exact same order.`
                },
                { role: "user", content: prompt }
              ]
            })
          })

          if (res.ok) {
            const data = await res.json()
            const content = data.choices?.[0]?.message?.content?.trim()
            if (content) {
              const parsed = JSON.parse(content)
              if (Array.isArray(parsed.translations) && parsed.translations.length === texts.length) {
                return NextResponse.json({ translations: parsed.translations })
              }
            }
          }
        } catch (err) {
          console.warn(`Groq (${model}) translation failed, trying next:`, err)
        }
      }
    }

    // Fallback: Google Gemini
    const geminiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
    if (geminiKey) {
      try {
        const prompt = `Translate the following JSON array of strings into ${langName}. Return JSON: {"translations": string[]}.
Array: ${JSON.stringify(texts)}`
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(5000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        })
        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            const parsed = JSON.parse(text)
            if (Array.isArray(parsed.translations) && parsed.translations.length === texts.length) {
              return NextResponse.json({ translations: parsed.translations })
            }
          }
        }
      } catch (err) {
        console.warn("Gemini translation fallback failed:", err)
      }
    }

    // Fallback: OpenAI
    const openAiKey = process.env.OPENAI_API_KEY?.trim()
    if (openAiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAiKey}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5000),
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.1,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `Translate the provided array of texts into ${langName}. Return JSON: {"translations": string[]}`
              },
              { role: "user", content: JSON.stringify(texts) }
            ]
          })
        })

        if (res.ok) {
          const data = await res.json()
          const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}")
          if (Array.isArray(parsed.translations) && parsed.translations.length === texts.length) {
            return NextResponse.json({ translations: parsed.translations })
          }
        }
      } catch (err) {
        console.warn("OpenAI translation fallback failed:", err)
      }
    }

    return NextResponse.json({ translations: texts })
  } catch (error) {
    console.error("Translation API error:", error)
    return NextResponse.json({ translations: [] }, { status: 500 })
  }
}
