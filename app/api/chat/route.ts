import { type NextRequest, NextResponse } from "next/server"
import { PERSONAS, type PersonaId } from "@/lib/personas"
import { calculateClimateAnomaly } from "@/lib/climate-data"

export const maxDuration = 10

/* ── In-Memory Fast Cache (5ms response on repeated/similar queries) ── */
const responseCache = new Map<string, { reply: string; modelUsed: string; expires: number }>()


const SYSTEM_PROMPT = `You are "WeatherGPT", an intelligent, high-speed AI meteorological assistant specialized in 5 core sectors across India:

1. **Weather Forecasting & Climate**:
   - Real-time surface metrics (**Temperature**, **Rain chance**, **Humidity**, **Wind**, **AQI**).
   - Numerical Weather Prediction (NWP) model outputs from **NOAA GFS (0.25°)** and **WRF-ARW (3km Mesoscale)**.

2. **Agriculture (Kheti & Crop Advisories)**:
   - Specific advice for Indian farmers (Wheat, Paddy/Rice, Mustard, Cotton, Sugarcane, Pulses, Vegetables).
   - Soil moisture, critical irrigation stages (CRI, Flowering), fertilizer application timing (avoiding wash-off), pest/fungal disease warnings (based on humidity >75%), and harvest protection.

3. **Aviation Weather Briefings**:
   - Flight categories (**VFR**, **MVFR**, **IFR**, **LIFR**), cloud ceiling (AGL), visibility (Statute Miles / meters).
   - METAR & TAF interpretation, runway crosswind component, turbulence, and icing alerts.

4. **Flood & Cyclone Warning Dissemination**:
   - Official IMD & NDMA color-coded alert dissemination (**Red: Take Action**, **Orange: Be Prepared**, **Yellow: Be Updated**, **Green: No Warning**).
   - Inundation and river basin flash flood risks, cyclone track & landfall intensity (Depression, VSCS, Super Cyclone), storm surge height, and evacuation safety checklists.

5. **Marine Weather & Coastal Fisheries**:
   - Sea state (**Calm**, **Moderate**, **Rough**, **Very Rough**), wave height (m), swell period (s), tidal phase.
   - Traditional catamaran and mechanized trawler fishermen safety advisories (offshore distance limits, squall warnings).

6. **Smart City Weather & Urban Planning**:
   - **Urban Heat Island (UHI)** index (+°C excess in dense built core vs rural green belt).
   - Stormwater drainage & waterlogging vulnerability in known city underpasses and low-lying arterial roads.
   - Outdoor thermal comfort (**UTCI** heat stress) for pedestrian and construction labor, outdoor crane clearance, and smog ventilation coefficient.

IMPORTANT GEOGRAPHY & INDIAN LANDMARK RULES:
- You operate EXCLUSIVELY FOR INDIA. All weather, cities, states, landmarks, monuments, and regions are STRICTLY WITHIN INDIA.
- NEVER answer for or mention Pakistan, Bangladesh, Nepal, or foreign places.
- If the user asks about ANY place, monument, or landmark in India (e.g. "Lal Qila", "Red Fort", "Taj Mahal", "India Gate", "Charminar", "Qutub Minar", "Gateway of India", "Hawa Mahal", "Ram Mandir", etc.), or says colloquial phrases like "lal qila jaha waha k batao":
  - Immediately identify which Indian city it is located in (e.g. Lal Qila / Red Fort is in Delhi, India; Taj Mahal is in Agra, India; Charminar is in Hyderabad, India).
  - IMMEDIATELY provide the weather details, temperature, rain chance, AQI, and atmospheric forecast for that Indian location!
  - NEVER refuse, NEVER say "ye mere domain se bahar hai", NEVER say "history ya tourism mere domain mein nahi hai", and NEVER ask "kya aap jaanna chahenge?". Give the weather answer directly and immediately!

Rules:
1. Answer directly, accurately, and naturally.
2. Provide concrete metrics with **bold** labels and clean bullet points (*).
3. Respond in the SAME language as the query or specified language (Hindi, Marathi, Gujarati, Punjabi, Bengali, Tamil, Telugu, English, etc.). If a language preference is specified, always answer in that language and script.
4. Be concise (max 3-5 high-value bullet points).
5. All answers must be strictly focused on India.

Domain Guardrails:
- Strictly answer queries related to Weather, Agriculture, Aviation weather, Flood/Cyclone disasters, Marine/Coastal fisheries, Smart City urban planning, or Climate across India.
- Treat all inquiries about places, monuments, landmarks, temples, tourist spots, or districts as Indian weather inquiries for that place.
- Only decline queries that are completely non-geographic and non-weather questions (e.g. writing software code, Bollywood gossip, mathematics).`

/* ── Ultra-Fast Groq Caller (<300ms) ── */
async function callGroqSuperFast(apiKey: string, prompt: string, weatherContext?: string): Promise<{ reply: string; modelUsed: string } | null> {
  const fullPrompt = weatherContext
    ? `Ground Weather Context:\n${weatherContext}\n\nUser Query: ${prompt}`
    : prompt

  const models = ["qwen/qwen3.8-27b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]
  for (const model of models) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: fullPrompt },
          ],
          temperature: 0.4,
          max_tokens: 750,
          reasoning_format: "hidden",
        }),
      })
      if (res.ok) {
        const data = await res.json()
        let text = data.choices?.[0]?.message?.content
        if (text) {
          text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()
        }
        if (text?.trim()) {
          return {
            reply: text.trim(),
            modelUsed: `Groq (${model.split("/")[1] || model})`,
          }
        }
      }
    } catch (e) {
      console.warn(`[Groq ${model}] error:`, e)
    }
  }
  return null
}

/* ── OpenAI Fast Fallback ── */
async function callOpenAIFast(apiKey: string, prompt: string, weatherContext?: string): Promise<{ reply: string; modelUsed: string } | null> {
  const fullPrompt = weatherContext
    ? `Ground Weather Context:\n${weatherContext}\n\nUser Query: ${prompt}`
    : prompt

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: fullPrompt },
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content
      if (text?.trim()) {
        return {
          reply: text.trim(),
          modelUsed: "OpenAI GPT-4o-mini",
        }
      }
    }
  } catch {}
  return null
}

/* ── Google Gemini Fast Backup ── */
async function callGeminiFast(apiKey: string, prompt: string, weatherContext?: string): Promise<{ reply: string; modelUsed: string } | null> {
  const fullText = weatherContext
    ? `${SYSTEM_PROMPT}\n\nGround Weather Context: ${weatherContext}\n\nUser Query: ${prompt}`
    : `${SYSTEM_PROMPT}\n\nUser Query: ${prompt}`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullText }] }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.5,
        },
      }),
    })
    if (res.ok) {
      const data = await res.json()
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (candidate?.trim()) {
        return {
          reply: candidate.trim(),
          modelUsed: "Google Gemini 3.6 Flash",
        }
      }
    }
  } catch {}
  return null
}

/* ── Built-in Zero-Latency Instant Fallback (<5ms) ── */
function generateInstantResponse(message: string, weatherContext?: string, lang?: string): { reply: string; modelUsed: string } {
  const lower = message.toLowerCase().trim()
  const isGujarati = lang === "gu" || /[\u0A80-\u0AFF]/.test(message)
  const isPunjabi = lang === "pa" || /[\u0A00-\u0A7F]/.test(message)
  const isMarathi = lang === "mr"
  const isHindi = lang === "hi" || (!isMarathi && !isGujarati && !isPunjabi && (/[\u0900-\u097F]|kya|kaise|kaisa|kaha|batao|baarish|tapman|mausam|sardi|garmi|kheti|fasal|namaste/i.test(lower)))

  if (weatherContext) {
    if (isGujarati) {
      return {
        reply: `અહીં તાજું હવામાન વિશ્લેષણ છે:\n\n${weatherContext}\n\n• **સલાહ:** હવામાન અનુસાર જરૂરી સાવચેતી રાખો અને ખેતી કે મુસાફરીનું આયોજન કરતાં પહેલાં આગાહી ધ્યાનમાં લો.`,
        modelUsed: "WeatherGPT Instant Engine",
      }
    }
    if (isPunjabi) {
      return {
        reply: `ਇੱਥੇ ਤਾਜ਼ਾ ਮੌਸਮ ਵਿਸ਼ਲੇਸ਼ਣ ਹੈ:\n\n${weatherContext}\n\n• **ਸਲਾਹ:** ਮੌਸਮ ਅਨੁਸਾਰ ਲੋੜੀਂਦੀ ਸਾਵਧਾਨੀ ਵਰਤੋ ਅਤੇ ਆਪਣੀਆਂ ਖੇਤੀ ਜਾਂ ਯਾਤਰਾ ਗਤੀਵਿਧੀਆਂ ਦੀ ਯੋਜਨਾ ਬਣਾਓ।`,
        modelUsed: "WeatherGPT Instant Engine",
      }
    }
    if (isMarathi) {
      return {
        reply: `येथे ताजे हवामान विश्लेषण दिले आहे:\n\n${weatherContext}\n\n• **सल्ला:** हवामानानुसार आवश्यक काळजी घ्या आणि प्रवास किंवा शेतीचे नियोजन करताना हवामान अंदाजावर लक्ष ठेवा.`,
        modelUsed: "WeatherGPT Instant Engine",
      }
    }
    if (isHindi) {
      return {
        reply: `यहाँ ताज़ा मौसम विश्लेषण है:\n\n${weatherContext}\n\n• **सलाह:** मौसम के अनुसार आवश्यक सावधानी बरतें और यदि आप खेती या यात्रा की योजना बना रहे हैं तो पूर्वानुमान पर नजर रखें।`,
        modelUsed: "WeatherGPT Instant Engine",
      }
    }
    return {
      reply: `Here is the current weather assessment:\n\n${weatherContext}\n\n• **Advice:** Plan your travel or farming activities according to current conditions.`,
      modelUsed: "WeatherGPT Instant Engine",
    }
  }

  // Check if query matches any of our 5 specialized meteorological sectors
  const isWeatherRelated = /weather|rain|temp|climate|forecast|alert|cyclone|flood|wind|aqi|air|farm|crop|soil|irrigation|aviation|flight|pilot|metar|taf|marine|sea|wave|swell|tide|fisherman|fishermen|smart city|urban|heat island|uhi|waterlog|drainage|mausam|baarish|tapman|garmi|sardi|kheti|fasal|pani|vimaan|samundar|toofan|tufan/i.test(lower)

  if (!isWeatherRelated && !lower.includes("hi") && !lower.includes("hello") && !lower.includes("namaste") && !lower.includes("who are you")) {
    if (isGujarati) {
      return {
        reply: "માફ કરશો, હું માત્ર **હવામાન આગાહી (Weather)**, **ખેતી સલાહ (Agriculture)**, **વિમાન હવામાન (Aviation)**, **વાવાઝોડું અને પૂર ચેતવણી (Disasters)**, **દરિયાઈ હવામાન (Marine)**, અને **સ્માર્ટ સિટી પ્લાનિંગ** ના સવાલો માટે સક્ષમ છું। કૃપા કરીને હવામાન સંબંધિત પ્રશ્ન પૂછો! 🌾✈️🌊🏙️🌤️",
        modelUsed: "WeatherGPT Instant Engine",
      }
    }
    if (isPunjabi) {
      return {
        reply: "ਮਾਫ ਕਰਨਾ, ਮੈਂ ਸਿਰਫ **ਮੌਸਮ ਅਨੁਮਾਨ (Weather)**, **ਖੇਤੀਬਾੜੀ ਸਲਾਹ (Agriculture)**, **ਹਵਾਬਾਜ਼ੀ (Aviation)**, **ਹੜ੍ਹ ਤੇ ਤੂਫਾਨ ਚੇਤਾਵਨੀ (Disasters)**, **ਸਮੁੰਦਰੀ ਮੌਸਮ (Marine)**, ਅਤੇ **ਸਮਾਰਟ ਸਿਟੀ ਪਲੈਨਿੰਗ** ਲਈ ਬਣਿਆ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਮੌਸਮ ਨਾਲ ਜੁੜਿਆ ਸਵਾਲ ਪੁੱਛੋ! 🌾✈️🌊🏙️🌤️",
        modelUsed: "WeatherGPT Instant Engine",
      }
    }
    if (isMarathi) {
      return {
        reply: "माफ करा, मी फक्त **हवामान अंदाज (Weather)**, **शेती सल्ला (Agriculture)**, **विमान हवामान (Aviation)**, **पूर व चक्रीवादळ इशारा (Disasters)**, **सागरी हवामान (Marine)**, आणि **स्मार्ट शहर नियोजन** या क्षेत्रांतील प्रश्नांसाठी आहे। कृपया हवामानाशी संबंधित प्रश्न विचारा! 🌾✈️🌊🏙️🌤️",
        modelUsed: "WeatherGPT Instant Engine",
      }
    }
    if (isHindi) {
      return {
        reply: "माफ़ करें, मैं केवल **मौसम पूर्वानुमान (Weather)**, **खेती सलाह (Agriculture)**, **विमानन ब्रीफिंग (Aviation)**, **चक्रवात व बाढ़ चेतावनी (Disasters)**, **समुद्री मौसम (Marine)**, और **स्मार्ट सिटी (Urban Planning)** के सवालों के लिए बना हूँ। कृपया मौसम या इन क्षेत्रों से जुड़ा सवाल पूछें! 🌾✈️🌊🏙️🌤️",
        modelUsed: "WeatherGPT Instant Engine",
      }
    }
    return {
      reply: "Sorry, I am WeatherGPT and I specialize exclusively in **Weather Forecasting**, **Agriculture Advisories**, **Aviation Weather**, **Flood & Cyclone Warnings**, **Marine Coastal Forecasts**, and **Smart City Urban Planning**. Please ask a weather or sectoral query! 🌾✈️🌊🏙️🌤️",
      modelUsed: "WeatherGPT Instant Engine",
    }
  }

  if (isGujarati) {
    return {
      reply: `નમસ્તે! હું WeatherGPT છું।\n\n• **પ્રશ્ન:** "${message}"\n• **વિશેષજ્ઞ ક્ષેત્રો:** હવામાન આગાહી, ખેતી સલાહ, વિમાન બ્રીફિંગ, પૂર અને વાવાઝોડું ચેતવણી, દરિયાઈ હવામાન, અને સ્માર્ટ સિટી પ્લાનિંગ।\n• કોઈપણ ભારતીય શહેરનું નામ લખીને પૂછો!`,
      modelUsed: "WeatherGPT Instant Engine",
    }
  }
  if (isPunjabi) {
    return {
      reply: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ WeatherGPT ਹਾਂ।\n\n• **ਸਵਾਲ:** "${message}"\n• **ਮੁੱਖ ਖੇਤਰ:** ਮੌਸਮ ਅਨੁਮਾਨ, ਖੇਤੀਬਾੜੀ ਸਲਾਹ, ਹਵਾਬਾਜ਼ੀ, ਹੜ੍ਹ ਤੇ ਤੂਫਾਨ ਚੇਤਾਵਨੀ, ਸਮੁੰਦਰੀ ਮੌਸਮ, ਅਤੇ ਸਮਾਰਟ ਸਿਟੀ ਯੋਜਨਾਬੰਦੀ।\n• ਕਿਸੇ ਵੀ ਸ਼ਹਿਰ ਜਾਂ ਜ਼ਿਲ੍ਹੇ ਦਾ ਨਾਮ ਲਿਖ ਕੇ ਪੁੱਛੋ!`,
      modelUsed: "WeatherGPT Instant Engine",
    }
  }
  if (isMarathi) {
    return {
      reply: `नमस्कार! मी WeatherGPT आहे।\n\n• **प्रश्न:** "${message}"\n• **तज्ज्ञ क्षेत्रे:** हवामान अंदाज, शेती सल्ला (Agro), विमान हवामान (Aviation), पूर व चक्रीवादळ पूर्वसूचना, सागरी हवामान (Marine), आणि स्मार्ट शहर नियोजन।\n• कोणत्याही भारतीय शहराचे नाव लिहून विचारा!`,
      modelUsed: "WeatherGPT Instant Engine",
    }
  }
  if (isHindi) {
    return {
      reply: `नमस्ते! मैं WeatherGPT हूँ।\n\n• **प्रश्न:** "${message}"\n• **विशेषज्ञ क्षेत्र:** मौसम पूर्वानुमान, खेती सलाह (Kheti), विमानन (Aviation), बाढ़ व चक्रवात चेतावनी, समुद्री मौसम (Marine), व स्मार्ट सिटी प्लानिंग।\n• किसी भी शहर, जिले या हवाई अड्डे का नाम लिखकर पूछें!`,
      modelUsed: "WeatherGPT Instant Engine",
    }
  }

  return {
    reply: `Hello! WeatherGPT is ready.\n\n• **Query:** "${message}"\n• **Specialized Sectors:** Weather & Climate, Farming Advisories, Aviation (METAR/TAF), Flood/Cyclone Alerts, Marine & Fisheries, and Smart City Planning.\n• Ask for any Indian city, airport, or coastal zone!`,
    modelUsed: "WeatherGPT Instant Engine",
  }
}

export async function POST(req: NextRequest) {
  let userLang: string | undefined = undefined
  try {
    const { message, weatherContext, persona, city, temp, lang } = await req.json()
    userLang = lang

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Dynamic Context Augmentation: Persona + 30-Year Climate RAG Anomaly
    let augmentedContext = weatherContext || ""

    if (city && typeof temp === "number") {
      const anomaly = calculateClimateAnomaly(city, temp)
      augmentedContext += `\n\n[30-Year IMD Climate Baseline RAG]:\n${anomaly.summaryText}`
    }

    if (persona && PERSONAS[persona as PersonaId]) {
      const p = PERSONAS[persona as PersonaId]
      augmentedContext += `\n\n[Active Persona Guidance - ${p.name}]:\n${p.systemPromptGuidance}`
    }

    const langNames: Record<string, string> = {
      hi: "Hindi", mr: "Marathi", gu: "Gujarati", pa: "Punjabi",
      bn: "Bengali", te: "Telugu", ta: "Tamil", en: "English"
    }
    if (lang && langNames[lang] && lang !== "en") {
      augmentedContext += `\n\n[Language Directive]: User preferred language is ${langNames[lang]} (${lang}). Answer strictly in ${langNames[lang]} script.`
    }

    const cacheKey = `${message.trim().toLowerCase()}_${persona || "default"}_${augmentedContext.slice(0, 35)}`
    const cached = responseCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached)
    }

    const groqKey = process.env.GROQ_API_KEY?.trim()
    const geminiKey = (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY)?.trim()
    const openAIKey = process.env.OPENAI_API_KEY?.trim()

    // 1. Primary: Groq (<300ms ultra-fast inference)
    if (groqKey) {
      const groqResult = await callGroqSuperFast(groqKey, message, augmentedContext)
      if (groqResult) {
        responseCache.set(cacheKey, { ...groqResult, expires: Date.now() + 60000 })
        return NextResponse.json(groqResult)
      }
    }

    // 2. Secondary: Google Gemini 3.6 Flash
    if (geminiKey) {
      const geminiResult = await callGeminiFast(geminiKey, message, augmentedContext)
      if (geminiResult) {
        responseCache.set(cacheKey, { ...geminiResult, expires: Date.now() + 60000 })
        return NextResponse.json(geminiResult)
      }
    }

    // 3. Tertiary: OpenAI GPT-4o-mini
    if (openAIKey) {
      const openAIResult = await callOpenAIFast(openAIKey, message, augmentedContext)
      if (openAIResult) {
        responseCache.set(cacheKey, { ...openAIResult, expires: Date.now() + 60000 })
        return NextResponse.json(openAIResult)
      }
    }

    // 4. Instant Fallback (<5ms)
    const fallback = generateInstantResponse(message, augmentedContext, lang)
    return NextResponse.json(fallback)
  } catch (error) {
    console.error("[chat] error:", error)
    const fallback = generateInstantResponse("weather query", undefined, userLang)
    return NextResponse.json(fallback)
  }
}
