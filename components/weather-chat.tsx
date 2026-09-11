"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import {
  ArrowUp, Clock, CloudSun, LogIn, Map as MapIcon, Maximize2, Mic, Minimize2, Plus, Square, TriangleAlert, Volume2, VolumeX, X
} from "lucide-react"
import {
  AirQualityCard, AlertCard, AgroCard, AviationCard, ClimateCard, CurrentCard,
  DisasterCard, ForecastCard, HourlyCard, MarineCard, NWPCard, SourceCard, UrbanCard
} from "@/components/weather-cards"
import { GISMap } from "@/components/gis-map"
import { PERSONAS, type PersonaId } from "@/lib/personas"
import { useVoice } from "@/hooks/use-voice"
import { LANGUAGES, type LangCode, t } from "@/lib/i18n"
import { type Intent, parseQuery } from "@/lib/nlp"
import type { AgroPayload, AviationPayload, DisasterPayload, MarinePayload, NWPPayload, UrbanPayload, WeatherPayload } from "@/lib/weather-types"
import { useSession } from "@/lib/auth-client"
import { ChatHistoryDrawer } from "@/components/chat-history-drawer"
import type { ChatConversationSummary } from "@/lib/chat-history"

/* ─────────── types ─────────── */
interface Message {
  id: string
  role: "user" | "bot"
  text: string
  intent?: Intent
  payload?: WeatherPayload
  agro?: AgroPayload
  aviation?: AviationPayload
  nwp?: NWPPayload
  marine?: MarinePayload
  urban?: UrbanPayload
  disaster?: DisasterPayload
  error?: boolean
  modelUsed?: string   // which LLM answered
  isLLM?: boolean      // true = answer came from LLM
  isGreeting?: boolean // true if it's greeting message
  hasFollowUp?: boolean
  showGISMap?: boolean
  gisMapType?: "radar" | "cyclone" | "flood" | "all"
}

/* ─────────── static data ─────────── */
const FOLLOW_UP: Record<LangCode, string> = {
  hi: "\n\n🌍 आप किस शहर का मौसम जानना चाहते हैं?",
  en: "\n\n🌍 Which city's weather would you like to know about?",
  bn: "\n\n🌍 আপনি কোন শহরের আবহাওয়া জানতে চান?",
  te: "\n\n🌍 మీరు ఏ నగరం వాతావరణం తెలుసుకోవాలనుకుంటున్నారు?",
  ta: "\n\n🌍 எந்த நகரத்தின் வானிலையைத் தெரிந்துகொள்ள விரும்புகிறீர்கள்?",
  mr: "\n\n🌍 तुम्हाला कोणत्या शहराचे हवामान जाणून घ्यायचे आहे?",
  gu: "\n\n🌍 તમે કયા શહેરનું હવામાન જાણવા માંગો છો?",
  pa: "\n\n🌍 ਤੁਸੀਂ ਕਿਸ ਸ਼ਹਿਰ ਦਾ ਮੌਸਮ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
}

const SUGGESTIONS: Record<LangCode, string[]> = {
  hi: [
    "मुंबई का मौसम",
    "लखनऊ खेती सलाह",
    "मुंबई विमानन मौसम",
    "गोवा समुद्री मौसम",
    "दिल्ली स्मार्ट सिटी मौसम",
    "दिल्ली NWP मॉडल (GFS/WRF)",
    "ओडिशा चक्रवात व बाढ़ चेतावनी",
    "कोलकाता वायु गुणवत्ता",
  ],
  en: [
    "Weather in Mumbai",
    "Farming advice Lucknow",
    "Aviation weather Mumbai",
    "Marine weather Goa",
    "Smart city weather Delhi",
    "NWP GFS & WRF model Delhi",
    "Cyclone & flood alert Odisha",
    "Air quality Kolkata",
  ],
  bn: [
    "মুম্বাইয়ের আবহাওয়া",
    "লখনউ কৃষি পরামর্শ",
    "দীঘা সামুদ্রিক আবহাওয়া",
    "কলকাতা বায়ু মান",
    "দিল্লি স্মার্ট সিটি আবহাওয়া",
    "ঘূর্ণিঝড় ও বন্যা সতর্কতা ওড়িশা",
  ],
  te: [
    "ముంబై వాతావరణం",
    "లక్నో వ్యవసాయ సలహా",
    "వైజాగ్ సముద్ర వాతావరణం",
    "ఢిల్లీ స్మార్ట్ సిటీ వాతావరణం",
    "కోల్‌కతా గాలి నాణ్యత",
    "తుఫాను వరద హెచ్చరిక ఒడిశా",
  ],
  ta: [
    "மும்பை வானிலை",
    "லக்னோ விவசாய ஆலோசனை",
    "கோவா கடல் வானிலை",
    "டெல்லி ஸ்மார்ட் சிட்டி வானிலை",
    "கொல்கத்தா காற்றுத் தரம்",
    "புயல் மற்றும் வெள்ள எச்சரிக்கை ஒடிசா",
  ],
  mr: [
    "मुंबईचे हवामान",
    "पुणे शेती सल्ला",
    "गोवा सागरी हवामान",
    "नागपूर वायु गुणवत्ता",
  ],
  gu: [
    "અમદાવાદ હવામાન",
    "સૂરત ખેતી સલાહ",
    "કચ્છ દરિયાઇ હવામાન",
  ],
  pa: [
    "ਅੰਮ੍ਰਿਤਸਰ ਮੌਸਮ",
    "ਲੁਧਿਆਣਾ ਖੇਤੀ ਸਲਾਹ",
    "ਜਲੰਧਰ ਹਵਾ ਗੁਣਵੱਤਾ",
  ],
}

let _id = 0
const uid = () => `m${_id++}`

const weatherCache = new Map<string, WeatherPayload>()

function greeting(lang: LangCode): Message {
  return { id: uid(), role: "bot", text: t("greeting", lang), isGreeting: true }
}

/* ── Formatted Message Markdown Renderer ── */
function FormattedMessageText({ text }: { text: string }) {
  if (!text) return null

  const parseBold = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pIdx} style={{ fontWeight: 650 }}>{part.slice(2, -2)}</strong>
      }
      return <span key={pIdx}>{part}</span>
    })
  }

  const lines = text.split("\n")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} style={{ height: 2 }} />

        // Bullet point lines (*, -, •)
        if (/^[\*\-\•]\s+/.test(trimmed)) {
          const itemText = trimmed.replace(/^[\*\-\•]\s+/, "")
          return (
            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 7, paddingLeft: 2 }}>
              <span style={{ color: "#1b6fc8", fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>•</span>
              <div style={{ flex: 1, lineHeight: 1.55 }}>{parseBold(itemText)}</div>
            </div>
          )
        }

        // Numbered list lines (1., 2.)
        if (/^\d+[\.\)]\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+[\.\)])\s+(.*)/)
          if (match) {
            return (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingLeft: 2 }}>
                <span style={{ color: "#1b6fc8", fontWeight: 600, fontSize: 13, lineHeight: 1.55 }}>{match[1]}</span>
                <div style={{ flex: 1, lineHeight: 1.55 }}>{parseBold(match[2])}</div>
              </div>
            )
          }
        }

        return <div key={idx} style={{ lineHeight: 1.55 }}>{parseBold(trimmed)}</div>
      })}
    </div>
  )
}

export interface WeatherChatProps {
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

/* ─────────── component ─────────── */
export function WeatherChat({ isFullscreen = false, onToggleFullscreen }: WeatherChatProps = {}) {
  const { data: session } = useSession()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyList, setHistoryList] = useState<ChatConversationSummary[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const [isMounted, setIsMounted] = useState(false)
  const [lang, setLang]         = useState<LangCode>("hi")
  const [persona, setPersona]   = useState<PersonaId>("general")
  const [showGISModal, setShowGISModal] = useState(false)
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => [greeting("hi")])
  const [input, setInput]       = useState("")
  const [pending, setPending]   = useState(false)
  const [voiceOut, setVoiceOut] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleFocusChat() {
      setShowWelcome(false)
      setTimeout(() => {
        const inputEl = document.getElementById("weather-chat-input") as HTMLTextAreaElement | null
        inputEl?.focus()
      }, 100)
    }
    window.addEventListener("focus-weather-chat", handleFocusChat)
    return () => window.removeEventListener("focus-weather-chat", handleFocusChat)
  }, [])

  const langMeta = LANGUAGES.find(l => l.code === lang)!

  /* ── Load chat history list for authenticated user ── */
  const loadHistoryList = useCallback(async () => {
    if (!session?.user) {
      setHistoryList([])
      return
    }
    setIsLoadingHistory(true)
    try {
      const res = await fetch("/api/chat/history")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.conversations)) {
          setHistoryList(data.conversations)
        }
      }
    } catch (err) {
      console.warn("Failed to load chat history:", err)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [session?.user])

  // Reload history when user session changes
  useEffect(() => {
    if (session?.user) {
      loadHistoryList()
    } else {
      setHistoryList([])
      setConversationId(null)
    }
  }, [session?.user, loadHistoryList])

  /* ── Start a brand new chat ── */
  const handleNewChat = useCallback(() => {
    setConversationId(null)
    setMessages([greeting(lang)])
    setInput("")
    setShowWelcome(false)
  }, [lang])

  /* ── Select & restore an existing chat from history ── */
  const handleSelectConversation = useCallback(async (selectedConvId: string) => {
    try {
      const res = await fetch(`/api/chat/history/${selectedConvId}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.conversation?.messages) {
        setConversationId(selectedConvId)
        setShowWelcome(false)
        const restored: Message[] = data.conversation.messages.map((m: any) => ({
          id: m.id || uid(),
          role: m.role === "assistant" ? "bot" : "user",
          text: m.content,
          modelUsed: m.modelUsed,
          intent: m.intent,
          showGISMap: m.showGISMap,
          gisMapType: m.gisMapType,
        }))
        setMessages(restored)
        if (data.conversation.language && LANGUAGES.some(l => l.code === data.conversation.language)) {
          setLang(data.conversation.language as LangCode)
        }
      }
    } catch (err) {
      console.error("Failed to restore conversation:", err)
    }
  }, [])

  /* ── Delete a conversation ── */
  const handleDeleteConversation = useCallback(async (targetConvId: string) => {
    try {
      const res = await fetch(`/api/chat/history/${targetConvId}`, { method: "DELETE" })
      if (res.ok) {
        setHistoryList(prev => prev.filter(c => c.conversationId !== targetConvId))
        if (conversationId === targetConvId) {
          handleNewChat()
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err)
    }
  }, [conversationId, handleNewChat])

  /* ── Rename a conversation ── */
  const handleRenameConversation = useCallback(async (targetConvId: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/chat/history/${targetConvId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      })
      if (res.ok) {
        setHistoryList(prev =>
          prev.map(c => c.conversationId === targetConvId ? { ...c, title: newTitle } : c)
        )
      }
    } catch (err) {
      console.error("Failed to rename conversation:", err)
    }
  }, [])

  /* ── Clear all chat history ── */
  const handleClearAllHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/history", { method: "DELETE" })
      if (res.ok) {
        setHistoryList([])
        handleNewChat()
      }
    } catch (err) {
      console.error("Failed to clear history:", err)
    }
  }, [handleNewChat])

  const { listening, speaking, canListen, startListening, stopListening, speak, stopSpeaking } =
    useVoice({
      locale: langMeta.speechLocale,
      onResult: (transcript) => {
        setInput(transcript)
        sendMessage(transcript)
      },
    })

  const [translating, setTranslating] = useState(false)

  /* client mount check for portals */
  useEffect(() => {
    setIsMounted(true)
  }, [])

  /* auto-scroll */
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, pending])

  /* Escape key to close GIS modal or exit chat fullscreen */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showGISModal) {
          setShowGISModal(false)
          setIsMapFullscreen(false)
        } else if (isFullscreen && onToggleFullscreen) {
          onToggleFullscreen()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showGISModal, isFullscreen, onToggleFullscreen])

  /* ── build text reply from weather payload ── */
  const buildReply = useCallback((
    intent: Intent,
    payload?: WeatherPayload | null,
    agro?: AgroPayload | null,
    aviation?: AviationPayload | null,
    nwpOrLang?: NWPPayload | null | LangCode,
    marine?: MarinePayload | null,
    urban?: UrbanPayload | null,
    disasterOrLang?: DisasterPayload | null | LangCode,
    targetLang?: LangCode
  ): string => {
    let nwp: NWPPayload | null | undefined
    let disaster: DisasterPayload | null | undefined
    let currentLang: LangCode = "hi"
    if (typeof nwpOrLang === "string") {
      currentLang = nwpOrLang as LangCode
    } else {
      nwp = nwpOrLang
    }
    if (typeof disasterOrLang === "string") {
      currentLang = disasterOrLang as LangCode
    } else {
      disaster = disasterOrLang
      if (targetLang) currentLang = targetLang
    }

    if (intent === "agro" && agro) {
      return t("agro", currentLang, { loc: agro.location.name })
    }
    if (intent === "aviation" && aviation) {
      return t("aviation", currentLang, { loc: aviation.location.name, cat: aviation.flightCategory })
    }
    if (intent === "nwp" && nwp) {
      return t("nwp", currentLang, { loc: nwp.location.name })
    }
    if (intent === "marine" && marine) {
      return t("marine", currentLang, { loc: marine.location.name })
    }
    if (intent === "urban" && urban) {
      return t("urban", currentLang, { loc: urban.location.name })
    }
    if (intent === "disaster" && disaster) {
      return t("disaster", currentLang, { loc: disaster.location.name })
    }
    if (!payload) return t("noLocation", currentLang)
    const loc = payload.location.name
    let text = ""
    switch (intent) {
      case "current":
        text = t("current", currentLang, {
          loc, temp: payload.current.temp, desc: payload.current.description,
          feels: payload.current.feelsLike, hum: payload.current.humidity,
          wind: Math.round(payload.current.windSpeed * 3.6),
        })
        break
      case "forecast": {
        const max = Math.max(...payload.daily.map(d => d.tempMax))
        const min = Math.min(...payload.daily.map(d => d.tempMin))
        text = t("forecast", currentLang, { loc, max, min })
        break
      }
      case "alerts":
        text = payload.alerts.length === 0
          ? t("alertsNone", currentLang, { loc })
          : t("alertsSome", currentLang, { loc, n: payload.alerts.length })
        break
      case "air":
        if (payload.airQuality)
          text = t("air", currentLang, {
            loc, label: payload.airQuality.label,
            aqi: payload.airQuality.aqi, pm25: payload.airQuality.pm25,
          })
        break
      case "climate":
        text = t("climate", currentLang, { loc })
        break
      default:
        text = t("current", currentLang, {
          loc, temp: payload.current.temp, desc: payload.current.description,
          feels: payload.current.feelsLike, hum: payload.current.humidity,
          wind: Math.round(payload.current.windSpeed * 3.6),
        })
    }
    if (payload.source === "demo") text += " " + t("demoNote", currentLang)
    return text
  }, [])

  /* language switch → preserve conversation & translate messages into selected language */
  const switchLang = useCallback(async (newLang: LangCode) => {
    stopSpeaking()
    setLang(newLang)
    setInput("")

    // 1. Synchronously update greetings and structured bot cards immediately
    let toTranslate: { id: string; text: string }[] = []

    setMessages(prev => {
      const updated = prev.map(m => {
        // Greeting messages
        if (m.isGreeting || (!m.intent && !m.payload && !m.agro && !m.aviation && !m.nwp && !m.marine && !m.urban && !m.disaster && m.role === "bot" && !m.isLLM)) {
          const baseGreeting = t("greeting", newLang)
          const follow = m.hasFollowUp ? (FOLLOW_UP[newLang] ?? FOLLOW_UP.en) : ""
          return { ...m, text: baseGreeting + follow, isGreeting: true }
        }

        // Structured intent bot cards (immediate local update)
        if (m.intent && (m.payload || m.agro || m.aviation || m.nwp || m.marine || m.urban || m.disaster) && !m.isLLM) {
          const newText = buildReply(m.intent, m.payload, m.agro, m.aviation, m.nwp, m.marine, m.urban, m.disaster, newLang)
          return { ...m, text: newText }
        }

        return m
      })

      // Collect ALL conversation messages (both user questions AND bot answers/LLM replies)
      toTranslate = updated
        .filter(m => !m.isGreeting && m.text && m.text.trim().length > 0)
        .map(m => ({ id: m.id, text: m.text }))

      return updated
    })

    // 2. Asynchronously translate all user questions and bot answers
    if (toTranslate.length > 0) {
      setTranslating(true)
      try {
        const ids = toTranslate.map(m => m.id)
        const texts = toTranslate.map(m => m.text)

        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts, targetLang: newLang }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data?.translations && Array.isArray(data.translations) && data.translations.length === ids.length) {
            const transMap = new Map<string, string>()
            ids.forEach((id, idx) => {
              if (data.translations[idx]) {
                transMap.set(id, data.translations[idx])
              }
            })
            setMessages(current => current.map(m => {
              const translated = transMap.get(m.id)
              return translated ? { ...m, text: translated } : m
            }))
          }
        }
      } catch (err) {
        console.error("Translation switch error:", err)
      } finally {
        setTranslating(false)
      }
    }
  }, [stopSpeaking, buildReply])

  /* dismiss welcome screen */
  const dismissWelcome = useCallback(() => {
    setShowWelcome(false)
  }, [])

  /* ── send message ── */
  const sendMessage = useCallback(async (raw: string) => {
    const text = raw.trim()
    if (!text || pending) return

    // Dismiss welcome screen on first message
    setShowWelcome(false)

    // Get or initialize active conversationId
    let currentConvId = conversationId
    if (!currentConvId) {
      currentConvId = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      setConversationId(currentConvId)
    }

    const currentLang = lang

    setInput("")
    stopSpeaking()
    const userMsg: Message = { id: uid(), role: "user", text }
    setMessages(prev => [...prev, userMsg])

    // Helper to add bot response, speak if enabled, and persist to chat_history
    const recordBotResponse = (
      botMsg: Message,
      loc?: string | null
    ) => {
      setMessages(prev => [...prev, botMsg])
      if (voiceOut && botMsg.text) speak(botMsg.text)

      // Asynchronously persist to MongoDB chat_history if user is authenticated
      if (session?.user?.id && !botMsg.error) {
        fetch("/api/chat/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: currentConvId,
            userMessage: { id: userMsg.id, content: userMsg.text },
            assistantMessage: {
              id: botMsg.id,
              content: botMsg.text,
              modelUsed: botMsg.modelUsed,
              intent: botMsg.intent,
              showGISMap: botMsg.showGISMap,
              gisMapType: botMsg.gisMapType,
            },
            location: loc || parsed.location || undefined,
            language: currentLang,
          }),
        })
          .then(res => {
            if (res.ok) loadHistoryList()
          })
          .catch(e => console.warn("Failed to persist chat:", e))
      }
    }

    const parsed = parseQuery(text)

    /* greeting — catch in all 11 languages using Set (regex can't span lines) */
    const GREETINGS = new Set(["hi","hii","hiii","hello","hlo","helo","hey","namaste","namaskar","sup","howdy","salaam","salam","vanakkam","vandanalu","नमस्ते","नमस्कार","हेलो","हाय","हैलो","यार","भाई","सलाम","आदाब","शुभप्रभात","শুভেচ্ছা","নমস্কার","হ্যালো","வணக்கம்","నమస్తే","హాయ్","నమస్కార","ഹലോ","ਸਤਿਸ੍ਰੀਅਕਾਲ","ਹੈਲੋ","ਨਮਸਤੇ","ナマステ","ନମਸ୍କାର"])
    const isGreeting = parsed.intent === "greeting" ||
      GREETINGS.has(text.trim().toLowerCase().replace(/[!?.\s]+/g, ""))
    if (isGreeting) {
      const reply = t("greeting", currentLang)
      const follow = FOLLOW_UP[currentLang] ?? FOLLOW_UP.en
      const fullReply = reply + follow
      recordBotResponse({ id: uid(), role: "bot", text: fullReply, isGreeting: true, hasFollowUp: true })
      return
    }

    /* ── Helper: ask LLM with optional weather context, persona & climate RAG ── */
    async function askLLM(question: string, weatherContext?: string, city?: string, temp?: number): Promise<{ reply: string; modelUsed?: string } | null> {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question, weatherContext, persona, city, temp, lang: currentLang }),
        })
        if (!res.ok) return null
        const data = await res.json()
        if (data.reply) return { reply: data.reply, modelUsed: data.modelUsed }
      } catch {}
      return null
    }

    const isMapQuery = /map|radar|cyclone path|flood zone|satellit|naksha|नक्शा|gis|landfall/i.test(text)
    const mapType: "radar" | "cyclone" | "flood" | "all" = /cyclone|storm|landfall/i.test(text) ? "cyclone" : /flood|waterlog/i.test(text) ? "flood" : /radar|rain/i.test(text) ? "radar" : "all"

    /* no location → send to LLM for general answer */
    if (!parsed.location) {
      setPending(true)
      try {
        if (isMapQuery) {
          const mapReply = currentLang === "hi"
            ? "यहाँ भारत का लाइव डॉपलर मौसम रडार, चक्रवात मार्ग और बाढ़ का नक्शा है:"
            : "Here is the Live Doppler Weather Radar, Cyclone Trajectory & Flood Hazard GIS Map for India:"
          recordBotResponse({
            id: uid(),
            role: "bot",
            text: mapReply,
            showGISMap: true,
            gisMapType: mapType,
          }, parsed.location)
          return
        }

        const llm = await askLLM(text)
        if (llm) {
          recordBotResponse({ id: uid(), role: "bot", text: llm.reply, isLLM: true, modelUsed: llm.modelUsed }, parsed.location)
          return
        }
        // LLM unavailable — show helpful prompt
        const reply = t("noLocation", currentLang)
        recordBotResponse({ id: uid(), role: "bot", text: reply }, parsed.location)
      } finally {
        setPending(false)
      }
      return
    }

    setPending(true)
    try {
      /* ── Agro intent ── */
      if (parsed.intent === "agro") {
        const res = await fetch(`/api/agro?city=${encodeURIComponent(parsed.location)}`)
        if (res.ok) {
          const agro: AgroPayload = await res.json()
          const reply = t("agro", currentLang, { loc: agro.location.name })
          recordBotResponse({ id: uid(), role: "bot", text: reply, intent: "agro", agro }, agro.location.name)
          return
        }
      }

      /* ── Aviation intent ── */
      if (parsed.intent === "aviation") {
        const res = await fetch(`/api/aviation?city=${encodeURIComponent(parsed.location)}`)
        if (res.ok) {
          const aviation: AviationPayload = await res.json()
          const reply = t("aviation", currentLang, { loc: aviation.location.name, cat: aviation.flightCategory })
          recordBotResponse({ id: uid(), role: "bot", text: reply, intent: "aviation", aviation }, aviation.location.name)
          return
        }
      }

      /* ── NWP model intent ── */
      if (parsed.intent === "nwp") {
        const loc = parsed.location ?? "Mumbai"
        const reqModel = text.toLowerCase().includes("wrf") ? "wrf" : text.toLowerCase().includes("gfs") ? "gfs" : "all"
        const res = await fetch(`/api/nwp?city=${encodeURIComponent(loc)}&model=${reqModel}`)
        if (res.ok) {
          const nwp: NWPPayload = await res.json()
          const reply = t("nwp", currentLang, { loc: nwp.location.name })
          recordBotResponse({ id: uid(), role: "bot", text: reply, intent: "nwp", nwp }, nwp.location.name)
          return
        }
      }

      /* ── Marine intent ── */
      if (parsed.intent === "marine") {
        const loc = parsed.location ?? "Mumbai"
        const res = await fetch(`/api/marine?city=${encodeURIComponent(loc)}`)
        if (res.ok) {
          const marine: MarinePayload = await res.json()
          const reply = t("marine", currentLang, { loc: marine.location.name })
          recordBotResponse({ id: uid(), role: "bot", text: reply, intent: "marine", marine }, marine.location.name)
          return
        }
      }

      /* ── Smart City & Urban Planning intent ── */
      if (parsed.intent === "urban") {
        const loc = parsed.location ?? "Delhi"
        const res = await fetch(`/api/urban?city=${encodeURIComponent(loc)}`)
        if (res.ok) {
          const urban: UrbanPayload = await res.json()
          const reply = t("urban", currentLang, { loc: urban.location.name })
          recordBotResponse({ id: uid(), role: "bot", text: reply, intent: "urban", urban }, urban.location.name)
          return
        }
      }

      /* ── Flood & Cyclone Disaster Early Warning intent ── */
      if (parsed.intent === "disaster") {
        const loc = parsed.location ?? "Odisha"
        const res = await fetch(`/api/disaster?city=${encodeURIComponent(loc)}`)
        if (res.ok) {
          const disaster: DisasterPayload = await res.json()
          const reply = t("disaster", currentLang, { loc: disaster.location.name })
          recordBotResponse({ id: uid(), role: "bot", text: reply, intent: "disaster", disaster }, disaster.location.name)
          return
        }
      }

      /* ── Instant Parallel Execution: Check Cache or Fetch Weather + LLM ── */
      const cityKey = parsed.location.toLowerCase().trim()
      let payload: WeatherPayload | null = weatherCache.get(cityKey) ?? null

      if (!payload) {
        // Fetch weather first from strict India API
        const fetchedWeather = await fetch(`/api/weather?city=${encodeURIComponent(parsed.location)}`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)

        if (fetchedWeather) {
          payload = fetchedWeather
          weatherCache.set(cityKey, fetchedWeather)
        }

        const intent: Intent = parsed.intent === "unknown" || parsed.intent === "agro" || parsed.intent === "aviation" ? "current" : parsed.intent
        const weatherCtx = payload
          ? `Location: ${payload.location.name} (${payload.location.state || ""}, India). Temp: ${payload.current.temp}°C. Condition: ${payload.current.condition} (${payload.current.description}). Humidity: ${payload.current.humidity}%. Wind: ${payload.current.windSpeed} m/s. Pressure: ${payload.current.pressure} hPa. AQI: ${payload.airQuality?.label || "Moderate"} (PM2.5: ${payload.airQuality?.pm25 || 25}).`
          : `Target Location: ${parsed.location}, India.`

        const [structuredReply, llmFast] = await Promise.all([
          Promise.resolve(payload ? buildReply(intent, payload, null, null, currentLang) : null),
          askLLM(text, weatherCtx, payload?.location?.name, payload?.current?.temp),
        ])

        const finalReply = llmFast?.reply || structuredReply || "माफ करें, अभी डेटा उपलब्ध नहीं है।"

        recordBotResponse({
          id: uid(),
          role: "bot",
          text: finalReply,
          intent: payload ? intent : undefined,
          payload: payload || undefined,
          isLLM: !!llmFast?.reply,
          modelUsed: llmFast?.modelUsed,
          showGISMap: isMapQuery,
          gisMapType: mapType,
        }, payload?.location?.name || parsed.location)
        return
      }

      // If cached: generate weatherCtx and call fast LLM (resolves in ~200-300ms)
      const intent: Intent = parsed.intent === "unknown" || parsed.intent === "agro" || parsed.intent === "aviation" ? "current" : parsed.intent
      const weatherCtx = `City: ${payload.location.name}. Temp: ${payload.current.temp}°C. Condition: ${payload.current.condition}. Humidity: ${payload.current.humidity}%.`

      const [structuredReply, llm] = await Promise.all([
        Promise.resolve(buildReply(intent, payload, null, null, currentLang)),
        askLLM(text, weatherCtx, payload?.location?.name, payload?.current?.temp),
      ])

      const finalReply = llm?.reply || structuredReply
      recordBotResponse({
        id: uid(),
        role: "bot",
        text: finalReply,
        intent,
        payload,
        isLLM: !!llm?.reply,
        modelUsed: llm?.modelUsed,
        showGISMap: isMapQuery,
        gisMapType: mapType,
      }, payload.location.name)

    } catch (e) {
      console.error("WeatherChat fetch error:", e)
      try {
        const llm = await askLLM(text)
        if (llm) {
          recordBotResponse({ id: uid(), role: "bot", text: llm.reply, isLLM: true, modelUsed: llm.modelUsed }, parsed.location)
          return
        }
      } catch {}
      const reply = currentLang === "hi"
        ? "नेटवर्क में दिक्कत आई। कृपया फिर से कोशिश करें।"
        : "Network error. Please try again."
      setMessages(prev => [...prev, { id: uid(), role: "bot", text: reply, error: true }])
    } finally {
      setPending(false)
    }
  }, [pending, lang, voiceOut, speak, stopSpeaking, buildReply, session, conversationId, loadHistoryList])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const toggleMic = () => listening ? stopListening() : startListening()

  const toggleSpeaker = () => {
    if (voiceOut) { stopSpeaking(); setVoiceOut(false) }
    else setVoiceOut(true)
  }

  /* ─────────── render ─────────── */
  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, fontFamily: "var(--font-devanagari, var(--font-geist-sans, sans-serif))", position: "relative" }}
    >

      {/* ══ Animated Welcome Screen ══ */}
      {showWelcome && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50,
          background: "linear-gradient(135deg, #0f2f5a 0%, #1b6fc8 50%, #38bdf8 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-start",
          padding: "20px 16px", textAlign: "center",
          overflowY: "auto", maxHeight: "100%",
          animation: "fadeIn 0.5s ease",
        }}>
          {/* Quick Dismiss Button */}
          <button
            type="button"
            onClick={dismissWelcome}
            title={lang === "hi" ? "बंद करें" : "Skip / Close"}
            aria-label="Close welcome overlay"
            style={{
              position: "absolute", top: 12, right: 12,
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)",
              color: "#ffffff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, transition: "all 0.2s", zIndex: 52,
            }}
          >
            ✕
          </button>

          <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 460 }}>
            {/* Animated emoji / Weather Icon */}
            <div style={{ fontSize: 48, marginBottom: 8, animation: "waveHand 2s ease-in-out infinite" }}>🌤️</div>

            {/* Greeting text */}
            <div style={{
              fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)",
              marginBottom: 4, letterSpacing: 1, textTransform: "uppercase",
              animation: "slideUp 0.7s ease 0.2s both",
            }}>
              {lang === "hi" ? "नमस्ते 🙏" : lang === "mr" ? "नमस्कार 🙏" : lang === "gu" ? "નમસ્તે 🙏" : lang === "pa" ? "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ 🙏" : lang === "bn" ? "নমস্কার 🙏" : lang === "te" ? "నమస్కారం 🙏" : lang === "ta" ? "வணக்கம் 🙏" : "Hello & Welcome 👋"}
            </div>

            <div style={{
              fontSize: 26, fontWeight: 800, color: "#ffffff",
              marginBottom: 6, lineHeight: 1.2,
              animation: "slideUp 0.7s ease 0.3s both",
            }}>
              WeatherGPT
            </div>

            <div style={{
              fontSize: 13, color: "rgba(255,255,255,0.8)",
              maxWidth: 340, lineHeight: 1.5, marginBottom: 14,
              animation: "slideUp 0.7s ease 0.4s both",
            }}>
              {lang === "hi"
                ? "भारत के किसी भी शहर का मौसम, बारिश, चेतावनी, खेती सलाह — सब अपनी भाषा में!"
                : lang === "mr"
                  ? "भारतातील कोणत्याही शहराचे हवामान, पाऊस, इशारे आणि शेती सल्ला — सर्व तुमच्या भाषेत!"
                  : lang === "gu"
                    ? "ભારતના કોઈપણ શહેરનું હવામાન, વરસાદ, ચેતવણી અને ખેતી સલાહ — બધું તમારી ભાષામાં!"
                    : lang === "pa"
                      ? "ਭਾਰਤ ਦੇ ਕਿਸੇ ਵੀ ਸ਼ਹਿਰ ਦਾ ਮੌਸਮ, ਮੀਂਹ, ਚੇਤਾਵਨੀ ਅਤੇ ਖੇਤੀ ਸਲਾਹ — ਸਭ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ!"
                      : lang === "bn"
                        ? "ভারতের যেকোনো শহরের আবহাওয়া, বৃষ্টি, সতর্কতা ও কৃষি পরামর্শ!"
                        : lang === "te"
                          ? "భారతదేశంలోని ఏ నగరానికైనా ప్రత్యక్ష వాతావరణం, వర్షపు హెచ్చరికలు, వ్యవసాయ సలహాలు!"
                          : lang === "ta"
                            ? "இந்தியாவின் எந்தவொரு நகரத்தின் நேரடி வானிலை, மழை எச்சரிக்கைகள் மற்றும் விவசாய ஆலோசனைகள்!"
                            : "Real-time weather, rain alerts, farming & aviation advice for any Indian city!"}
            </div>

            {/* Language selector on Welcome screen */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              marginBottom: 14, animation: "slideUp 0.7s ease 0.45s both",
            }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>🌐 Choose Language / भाषा चुनें</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 360 }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => switchLang(l.code as LangCode)}
                    style={{
                      padding: "5px 12px", borderRadius: 16,
                      border: lang === l.code ? "2px solid #fff" : "1px solid rgba(255,255,255,0.3)",
                      background: lang === l.code ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                      color: "#fff", fontSize: 12, fontWeight: lang === l.code ? 700 : 500,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >{l.native}</button>
                ))}
              </div>
            </div>

            {/* Feature pills */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 5,
              justifyContent: "center", marginBottom: 18, maxWidth: 380,
              animation: "slideUp 0.7s ease 0.5s both",
            }}>
              {["🌧️ Forecast", "⚠️ Alerts", "🌪️ Flood & Cyclone", "🌿 Agro Kheti", "✈️ Aviation", "🌊 Marine", "🏙️ Smart City", "🛰️ NWP Models", "💨 AQI", "🤖 Multi-LLMs"].map(f => (
                <span key={f} style={{
                  padding: "3px 9px", borderRadius: 14,
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: 11, fontWeight: 500,
                  border: "1px solid rgba(255,255,255,0.25)",
                }}>{f}</span>
              ))}
            </div>

            {/* Start button */}
            <button
              type="button"
              onClick={dismissWelcome}
              style={{
                padding: "11px 34px", borderRadius: 50, border: "none",
                background: "#ffffff", color: "#1b6fc8",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                transition: "transform 0.2s, box-shadow 0.2s",
                animation: "slideUp 0.7s ease 0.6s both",
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.transform = "scale(1.05)" }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.transform = "scale(1)" }}
            >
              {lang === "hi" ? "🚀 शुरू करें" : lang === "bn" ? "🚀 शुरू করুন" : lang === "te" ? "🚀 ప్రారంభించండి" : lang === "ta" ? "🚀 தொடங்குங்கள்" : "🚀 Get Started"}
            </button>

            <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.6)", animation: "slideUp 0.7s ease 0.7s both" }}>
              {lang === "hi" ? "या नीचे सवाल पूछें" : lang === "bn" ? "অথবা নিচে प्रश्न লিখুন" : lang === "te" ? "లేదా క్రింద ప్రశ్న రాయండి" : lang === "ta" ? "அல்லது கீழே கேள்வி கேளுங்கள்" : "or type a question below"}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, borderBottom: "1px solid #bfdbfe", background: "rgba(255,255,255,0.85)",
        padding: "10px 16px", backdropFilter: "blur(8px)",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            position: "relative", width: 36, height: 36, borderRadius: 10,
            background: "#dbeafe", color: "#1b6fc8",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CloudSun size={20} />
            <span className="chat-sun" style={{
              position: "absolute", top: -3, right: -3,
              width: 8, height: 8, borderRadius: "50%", background: "#f5a623",
            }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2f5a", lineHeight: 1.2 }}>WeatherGPT</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 11, color: "#4a7aa8", lineHeight: 1.2 }}>IMD + Multi-LLMs</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10,
                background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd"
              }}>
                🤖 GPT · Gemini · Llama
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            title={lang === "hi" ? "नई बातचीत शुरू करें" : "Start New Chat"}
            style={{
              height: 36, padding: "0 11px", borderRadius: 8, border: "1px solid #bfdbfe",
              background: "#eff6ff", color: "#1b6fc8", fontSize: 12, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.2s",
            }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">{lang === "hi" ? "नई चैट" : "New Chat"}</span>
          </button>

          {/* Chat History Button */}
          <button
            type="button"
            onClick={() => {
              if (session?.user) {
                setIsHistoryOpen(true)
                loadHistoryList()
              } else {
                setShowLoginPrompt(true)
              }
            }}
            title={lang === "hi" ? "बातचीत इतिहास देखें" : "View Chat History"}
            style={{
              height: 36, padding: "0 11px", borderRadius: 8,
              border: isHistoryOpen ? "1.5px solid #2563eb" : "1px solid #bfdbfe",
              background: isHistoryOpen ? "#dbeafe" : "#eff6ff",
              color: isHistoryOpen ? "#1e40af" : "#1b6fc8",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.2s",
            }}
          >
            <Clock size={15} />
            <span className="hidden sm:inline">{lang === "hi" ? "इतिहास" : "History"}</span>
            {historyList.length > 0 && (
              <span style={{
                fontSize: 10, background: "#2563eb", color: "#ffffff",
                padding: "1px 6px", borderRadius: 10, fontWeight: 700,
              }}>
                {historyList.length}
              </span>
            )}
          </button>

          {/* Direct Login or User Profile in Chat Header */}
          {!session?.user ? (
            <Link
              href="/login"
              title={lang === "hi" ? "लॉगिन करें" : "Log in"}
              style={{
                height: 36, padding: "0 11px", borderRadius: 8,
                border: "1.5px solid #93c5fd",
                background: "#eff6ff", color: "#1d4ed8",
                fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 5,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">{lang === "hi" ? "लॉगिन" : "Log in"}</span>
            </Link>
          ) : (
            <div
              title={`${session.user.name ?? "User"} (${session.user.email ?? ""})`}
              style={{
                height: 36, padding: "0 9px", borderRadius: 8,
                border: "1px solid #bbf7d0", background: "#f0fdf4",
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 600, color: "#166534",
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "#16a34a", color: "#ffffff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
              }}>
                {(session.user.name?.[0] ?? "U").toUpperCase()}
              </span>
              <span className="hidden md:inline max-w-[80px] truncate">
                {session.user.name?.split(" ")[0] ?? "User"}
              </span>
            </div>
          )}

          {/* GIS Map Launcher Button */}
          <button
            type="button"
            onClick={() => setShowGISModal(true)}
            title="Open Interactive GIS Radar & Hazard Map"
            style={{
              height: 36, padding: "0 10px", borderRadius: 8, border: "1px solid #bfdbfe",
              background: "#eff6ff", color: "#1b6fc8", fontSize: 12, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.2s",
            }}
          >
            <MapIcon size={15} />
            <span className="hidden sm:inline">GIS Radar Map</span>
          </button>

          {/* Fullscreen Chat Toggle Button (Prominent & High-Contrast) */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              title={isFullscreen ? (lang === "hi" ? "चैट छोटा करें (Esc)" : "Exit Fullscreen (Esc)") : (lang === "hi" ? "चैट पूरी स्क्रीन पर करें" : "Fullscreen Chat")}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen Chat"}
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: isFullscreen ? "1.5px solid #dc2626" : "1.5px solid #93c5fd",
                background: isFullscreen ? "#dc2626" : "#eff6ff",
                color: isFullscreen ? "#ffffff" : "#1d4ed8",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: isFullscreen ? "0 2px 8px rgba(220,38,38,0.35)" : "none",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              <span>
                {isFullscreen ? (lang === "hi" ? "छोटा करें" : "Exit") : (lang === "hi" ? "फुलस्क्रीन" : "Fullscreen")}
              </span>
            </button>
          )}

          {/* Speaker toggle */}
          <button
            type="button"
            onClick={toggleSpeaker}
            aria-pressed={voiceOut}
            aria-label={voiceOut ? "Disable voice" : "Enable voice"}
            title={voiceOut ? "Voice ON — click to mute" : "Click to enable voice answers"}
            style={{
              width: 36, height: 36, borderRadius: 8, border: "1px solid #bfdbfe",
              background: voiceOut ? "#dbeafe" : "transparent",
              color: voiceOut ? "#1b6fc8" : "#6b7280",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            {voiceOut ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Translating indicator */}
          {translating && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 9px", borderRadius: 8,
              background: "#eff6ff", border: "1px solid #bfdbfe",
              color: "#1b6fc8", fontSize: 11, fontWeight: 600,
            }}>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🔄</span>
              <span>
                {lang === "hi" ? "अनुवाद हो रहा है..." : lang === "mr" ? "भाषांतर होत आहे..." : lang === "gu" ? "ભાષાંતર થઈ રહ્યું છે..." : lang === "pa" ? "ਅਨੁਵਾਦ ਹੋ ਰਿਹਾ ਹੈ..." : lang === "bn" ? "অনুবাদ হচ্ছে..." : lang === "te" ? "అనువదిస్తోంది..." : lang === "ta" ? "மொழிபெயர்க்கிறது..." : "Translating..."}
              </span>
            </div>
          )}

          {/* Language select — prominent with label */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#eff6ff", borderRadius: 10,
            border: "1.5px solid #93c5fd", padding: "0 10px 0 8px",
            height: 36,
          }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>🌐</span>
            <select
              value={lang}
              onChange={e => switchLang(e.target.value as LangCode)}
              aria-label="Select language"
              style={{
                border: "none", background: "transparent", color: "#0f2f5a",
                fontSize: 13, fontWeight: 600, outline: "none", cursor: "pointer",
                padding: 0,
              }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.native}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ── Persona-Based Contextual Routing Ribbon ── */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
        padding: "6px 14px", background: "rgba(255,255,255,0.95)",
        borderBottom: "1px solid #e2e8f0", overflowX: "auto",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", flexShrink: 0 }}>
          Persona:
        </span>
        {(Object.keys(PERSONAS) as PersonaId[]).map(pId => {
          const p = PERSONAS[pId]
          const isActive = persona === pId
          return (
            <button
              key={pId}
              type="button"
              onClick={() => setPersona(pId)}
              style={{
                padding: "4px 10px", borderRadius: 20,
                fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                border: `1.5px solid ${isActive ? p.color : "#cbd5e1"}`,
                background: isActive ? p.color : "transparent",
                color: isActive ? "#ffffff" : "#334155",
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <span>{p.icon}</span>
              <span>{lang === "hi" ? p.hindiName : p.name}</span>
            </button>
          )
        })}
      </div>

      {/* Active Persona Tagline Banner */}
      {persona !== "general" && (
        <div style={{
          padding: "5px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
          fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            padding: "1px 6px", borderRadius: 6, background: PERSONAS[persona].color + "18",
            color: PERSONAS[persona].color, border: `1px solid ${PERSONAS[persona].color}40`,
          }}>
            {PERSONAS[persona].badge}
          </span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lang === "hi" ? PERSONAS[persona].hindiTagline : PERSONAS[persona].tagline}
          </span>
        </div>
      )}

      {/* GIS Map Modal (Rendered via Portal to document.body for true full-viewport expansion) */}
      {isMounted && showGISModal && createPortal(
        <div
          onClick={() => {
            setShowGISModal(false)
            setIsMapFullscreen(false)
          }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000000,
            background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: isMapFullscreen ? 0 : "env(safe-area-inset-top, 16px) 16px env(safe-area-inset-bottom, 16px) 16px",
          }}
        >
          {/* Modal Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: isMapFullscreen ? "100vw" : "100%",
              maxWidth: isMapFullscreen ? "100vw" : 1200,
              height: isMapFullscreen ? "100dvh" : "calc(100dvh - 36px)",
              maxHeight: isMapFullscreen ? "100dvh" : 860,
              background: "#0f172a",
              borderRadius: isMapFullscreen ? 0 : 16,
              overflow: "hidden",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.95)",
              display: "flex", flexDirection: "column",
              border: isMapFullscreen ? "none" : "1.5px solid rgba(255,255,255,0.2)",
              position: "relative",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 16px", background: "#1e293b",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                <span style={{ fontSize: 18 }}>🗺️</span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {lang === "hi" ? "लाइव डॉपलर रडार, चक्रवात व बाढ़ नक्शा (India GIS)" : "Live Doppler Radar, Cyclone Track & Flood Geofence"}
                </span>
              </div>

              {/* Header Action Buttons (Fullscreen Map + Single Unified Close Button) */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isMapFullscreen
                    setIsMapFullscreen(next)
                    setTimeout(() => window.dispatchEvent(new Event("resize")), 100)
                  }}
                  title={isMapFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
                  style={{
                    background: isMapFullscreen ? "#2563eb" : "rgba(255,255,255,0.12)",
                    border: isMapFullscreen ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.25)",
                    color: "#ffffff",
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s",
                  }}
                >
                  {isMapFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  <span>
                    {isMapFullscreen ? (lang === "hi" ? "छोटा करें" : "Exit Fullscreen") : (lang === "hi" ? "फुलस्क्रीन मैप" : "Fullscreen Map")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowGISModal(false)
                    setIsMapFullscreen(false)
                  }}
                  aria-label="Close Map"
                  style={{
                    background: "#dc2626",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff",
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 10px rgba(220,38,38,0.5)",
                    transition: "all 0.15s",
                  }}
                >
                  <X size={15} />
                  <span>{lang === "hi" ? "बंद करें" : "Close"}</span>
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
              <GISMap height="100%" initialLayer="all" onClose={() => setShowGISModal(false)} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain",
          background: "rgba(239,246,255,0.45)",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

          {messages.map(msg => (
            <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: msg.role === "user" ? "85%" : "100%" }}>

                {/* Bubble */}
                <div style={{
                  padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  fontSize: 14, lineHeight: 1.6,
                  background: msg.role === "user"
                    ? "#1b6fc8"
                    : msg.error
                      ? "#fee2e2"
                      : "rgba(255,255,255,0.92)",
                  color: msg.role === "user" ? "#fff" : msg.error ? "#991b1b" : "#0f2f5a",
                  border: msg.role === "user" ? "none" : "1px solid #bfdbfe",
                  boxShadow: "0 1px 4px rgba(27,111,200,0.08)",
                  display: msg.error ? "flex" : "block",
                  alignItems: msg.error ? "flex-start" : undefined,
                  gap: msg.error ? 8 : undefined,
                }}>
                  {msg.error && <TriangleAlert size={16} style={{ flexShrink: 0, marginTop: 2, color: "#dc2626" }} />}
                  <FormattedMessageText text={msg.text} />
                </div>

                {/* Actions row: Listen button + LLM Model Badge */}
                {msg.role === "bot" && !msg.error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => speaking ? stopSpeaking() : speak(msg.text)}
                      title={speaking ? "Stop speaking" : "Listen to this answer"}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "4px 10px", borderRadius: 8,
                        border: "1px solid #bfdbfe", background: "#eff6ff",
                        color: "#1b6fc8", fontSize: 11, fontWeight: 500, cursor: "pointer",
                      }}
                    >
                      {speaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      {speaking
                        ? (lang === "hi" ? "रोकें" : lang === "mr" ? "थांबवा" : lang === "gu" ? "રોકો" : lang === "pa" ? "ਰੋਕੋ" : lang === "bn" ? "থামান" : lang === "te" ? "ఆపండి" : lang === "ta" ? "நிறுத்து" : "Stop")
                        : (lang === "hi" ? "आवाज़ में सुनें" : lang === "mr" ? "आवाजात ऐका" : lang === "gu" ? "અવાજમાં સાંભળો" : lang === "pa" ? "ਆਵਾਜ਼ ਵਿੱਚ ਸੁਣੋ" : lang === "bn" ? "ভয়েস শুনুন" : lang === "te" ? "వినండి" : lang === "ta" ? "கேளுங்கள்" : "Listen")}
                    </button>

                    {msg.modelUsed && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 8px", borderRadius: 8,
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        color: "#15803d", fontSize: 11, fontWeight: 600,
                      }}>
                        ✨ {msg.modelUsed}
                      </span>
                    )}
                  </div>
                )}

                {/* Source card */}
                {msg.role === "bot" && !msg.error && !msg.payload && (
                  <div style={{ marginTop: 8 }}>
                    <SourceCard source="demo" lang={lang} />
                  </div>
                )}

                {/* Weather cards */}
                {msg.payload && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    <SourceCard source={msg.payload.source} lang={lang} />
                    {(msg.intent === "current" || msg.intent === "forecast") && (
                      <CurrentCard location={msg.payload.location} current={msg.payload.current} />
                    )}
                    {msg.intent === "forecast" && (
                      <>
                        <HourlyCard hourly={msg.payload.hourly} />
                        <ForecastCard daily={msg.payload.daily} />
                      </>
                    )}
                    {msg.intent === "alerts" && (
                      msg.payload.alerts.length > 0
                        ? msg.payload.alerts.map(a => <AlertCard key={a.id} alert={a} />)
                        : <div style={{ padding: "10px 14px", borderRadius: 10, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1b6fc8", fontSize: 13 }}>
                            No active warnings for this location.
                          </div>
                    )}
                    {msg.intent === "current" && msg.payload.alerts.length > 0 &&
                      msg.payload.alerts.map(a => <AlertCard key={a.id} alert={a} />)
                    }
                    {msg.intent === "air" && msg.payload.airQuality && (
                      <AirQualityCard air={msg.payload.airQuality} />
                    )}
                    {msg.intent === "climate" && (
                      <ClimateCard climate={msg.payload.climate} location={msg.payload.location.name} />
                    )}
                  </div>
                )}

                {/* Agro card */}
                {msg.agro && (
                  <div style={{ marginTop: 10 }}>
                    <AgroCard agro={msg.agro} />
                  </div>
                )}

                {/* Aviation card */}
                {msg.aviation && (
                  <div style={{ marginTop: 10 }}>
                    <AviationCard aviation={msg.aviation} />
                  </div>
                )}

                {/* NWP / GFS model card */}
                {msg.nwp && (
                  <div style={{ marginTop: 10 }}>
                    <NWPCard nwp={msg.nwp} />
                  </div>
                )}

                {/* Marine & Coastal Fisheries card */}
                {msg.marine && (
                  <div style={{ marginTop: 10 }}>
                    <MarineCard marine={msg.marine} />
                  </div>
                )}

                {/* Smart City & Urban Planning card */}
                {msg.urban && (
                  <div style={{ marginTop: 10 }}>
                    <UrbanCard urban={msg.urban} />
                  </div>
                )}

                {/* Flood & Cyclone Disaster Early Warning card */}
                {msg.disaster && (
                  <div style={{ marginTop: 10 }}>
                    <DisasterCard disaster={msg.disaster} />
                  </div>
                )}

                {/* Dynamic GIS Doppler Radar & Hazard Map */}
                {msg.showGISMap && (
                  <div style={{ marginTop: 12 }}>
                    <GISMap
                      city={msg.payload?.location?.name}
                      center={msg.payload ? [msg.payload.location.lat, msg.payload.location.lon] : undefined}
                      initialLayer={msg.gisMapType || "all"}
                      height="380px"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {pending && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                background: "rgba(255,255,255,0.92)", border: "1px solid #bfdbfe",
                display: "flex", gap: 6, alignItems: "center",
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 8, height: 8, borderRadius: "50%", background: "#93c5fd",
                    display: "inline-block",
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom: Suggestions + Input ── */}
      <div style={{
        flexShrink: 0, borderTop: "1px solid #bfdbfe",
        background: "#ffffff",
        padding: "10px 16px 12px",
        boxShadow: "0 -4px 16px rgba(27,111,200,0.10)",
      }}>
        {/* Suggestion chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {persona !== "general" && PERSONAS[persona]
            ? PERSONAS[persona].quickPrompts.map(p => {
                const label = lang === "hi" ? p.hi : p.en
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={pending}
                    onClick={() => sendMessage(label)}
                    style={{
                      padding: "5px 12px", borderRadius: 20,
                      border: `1px solid ${PERSONAS[persona].color}40`,
                      background: PERSONAS[persona].color + "15",
                      color: PERSONAS[persona].color, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", transition: "background 0.15s",
                      opacity: pending ? 0.5 : 1,
                    }}
                  >
                    {label}
                  </button>
                )
              })
            : (SUGGESTIONS[lang] || SUGGESTIONS.en).map(s => (
                <button
                  key={s}
                  type="button"
                  disabled={pending}
                  onClick={() => sendMessage(s)}
                  style={{
                    padding: "5px 12px", borderRadius: 20,
                    border: "1px solid #bfdbfe", background: "#eff6ff",
                    color: "#1b6fc8", fontSize: 12, fontWeight: 500,
                    cursor: "pointer", transition: "background 0.15s",
                    opacity: pending ? 0.5 : 1,
                  }}
                >
                  {s}
                </button>
              ))}
        </div>

        {/* Input row */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 8,
          borderRadius: 18, border: `2px solid ${listening ? "#dc2626" : "#93c5fd"}`,
          background: "#fef9f0", padding: "6px 8px",
          transition: "border-color 0.2s",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
        }}>
          {/* Mic */}
          <button
            type="button"
            id="mic-btn"
            onClick={toggleMic}
            disabled={!canListen}
            aria-label={listening ? "Stop listening" : "Start voice input"}
            title={!canListen ? "Voice not supported — use Chrome/Edge" : listening ? "Tap to stop" : "Tap to speak"}
            style={{
              width: 40, height: 40, borderRadius: "50%", border: "none",
              background: listening ? "#dc2626" : canListen ? "#dbeafe" : "#e5e7eb",
              color: listening ? "#fff" : canListen ? "#1b6fc8" : "#9ca3af",
              cursor: canListen ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.2s",
              animation: listening ? "pulse 1.2s ease-in-out infinite" : "none",
            }}
          >
            {listening ? <Square size={15} /> : <Mic size={16} />}
          </button>

          {/* Text input */}
          <textarea
            id="weather-chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              listening
                ? (lang === "hi" ? "🎙 बोलें… (सुन रहा हूँ...)" : lang === "mr" ? "🎙 बोला… (ऐकत आहे...)" : lang === "gu" ? "🎙 બોલો… (સાંભળી રહ્યું છે...)" : lang === "pa" ? "🎙 ਬੋਲੋ… (ਸੁਣ ਰਿਹਾ ਹਾਂ...)" : lang === "bn" ? "🎙 বলুন… (শুনছি...)" : lang === "te" ? "🎙 మాట్లాడండి… (వింటున్నాను...)" : lang === "ta" ? "🎙 பேசுங்கள்… (கேட்கிறேன்...)" : "🎙 Speak now… (Listening…)")
                : lang === "hi"
                  ? "शहर + सवाल लिखें… जैसे: मुंबई का मौसम, लखनऊ खेती सलाह"
                  : lang === "mr"
                    ? "शहर + प्रश्न लिहा… उदा: मुंबईचे हवामान, पुणे शेती सल्ला"
                    : lang === "gu"
                      ? "શહેર + પ્રશ્ન લખો… દા.ત: અમદાવાદ હવામાન, સુરત ખેતી સલાહ"
                      : lang === "pa"
                        ? "ਸ਼ਹਿਰ + ਸਵਾਲ ਲਿਖੋ… ਉਦਾ: ਅੰਮ੍ਰਿਤਸਰ ਮੌਸਮ, ਲੁਧਿਆਣਾ ਖੇਤੀ ਸਲਾਹ"
                        : lang === "bn"
                          ? "শহর + প্রশ্ন লিখুন… যেমন: মুম্বাই আবহাওয়া, লখনউ কৃষি পরামর্শ"
                          : lang === "te"
                            ? "నగరం + ప్రశ్న రాయండి… ఉదా: ముంబై వాతావరణం, వ్యవసాయ సలహా"
                            : lang === "ta"
                              ? "நகரம் + கேள்வி எழுதவும்… எ.கா: சென்னை வானிலை, விவசாய ஆலோசனை"
                              : "Type city + question… e.g. Weather in Mumbai, Lucknow farming"
            }
            style={{
              flex: 1, border: "none", background: "transparent", outline: "none",
              fontSize: 14, color: "#111827", resize: "none",
              padding: "6px 4px", maxHeight: 120, lineHeight: 1.5,
              fontFamily: "inherit",
            }}
          />

          {/* Send */}
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || pending}
            aria-label="Send"
            style={{
              width: 36, height: 36, borderRadius: 10, border: "none",
              background: input.trim() && !pending ? "#1b6fc8" : "#bfdbfe",
              color: "#fff", cursor: input.trim() && !pending ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.2s",
            }}
          >
            <ArrowUp size={16} />
          </button>
        </div>

        {/* Status hint */}
        <div style={{ marginTop: 5, fontSize: 11, color: "#6b93b8", paddingLeft: 4 }}>
          {listening
            ? "🎙 Listening… speak now"
            : speaking
              ? "🔊 Speaking… tap Listen button to stop"
              : canListen
                ? "🎙 Mic ready  ·  ⌨️ Or type below"
                : "⌨️ Type your question — mic not available in this browser"}
        </div>
      </div>

      {/* Chat History Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={historyList}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onClearAllHistory={handleClearAllHistory}
        onRenameConversation={handleRenameConversation}
        isLoading={isLoadingHistory}
        lang={lang}
      />

      {/* Login Prompt Modal for unauthenticated history access */}
      {showLoginPrompt && (
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 65,
            background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            style={{
              background: "#ffffff", borderRadius: 20, padding: "24px 22px",
              maxWidth: 360, width: "100%", boxShadow: "0 20px 40px rgba(15, 47, 90, 0.2)",
              border: "1px solid #bfdbfe", textAlign: "center",
              animation: "slideUp 0.25s ease",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "#eff6ff",
              color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
            }}>
              <Clock size={24} />
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f2f5a", marginBottom: 6 }}>
              {lang === "hi" ? "बातचीत इतिहास सुरक्षित रखें" : "Save Your Chat History"}
            </div>

            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 20 }}>
              {lang === "hi"
                ? "मौसम, फसल और विमानन से जुड़ी बातचीत सुरक्षित रखने और कभी भी दोबारा देखने के लिए लॉगिन करें।"
                : "Sign in to save your WeatherGPT conversations, search previous questions, and access your chats on any device."}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href="/login"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "11px 16px", borderRadius: 12,
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff", fontSize: 13, fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                }}
              >
                <LogIn size={15} />
                <span>{lang === "hi" ? "लॉगिन करें (Sign In)" : "Sign In / Register"}</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                style={{
                  padding: "9px 16px", borderRadius: 12,
                  border: "1px solid #cbd5e1", background: "#f8fafc",
                  color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                {lang === "hi" ? "बाद में (Later)" : "Continue as Guest"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* keyframes */}
      <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(220,38,38,0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes waveHand {
          0%,100% { transform: rotate(0deg) scale(1); }
          20%     { transform: rotate(-15deg) scale(1.1); }
          40%     { transform: rotate(15deg) scale(1.1); }
          60%     { transform: rotate(-10deg) scale(1.05); }
          80%     { transform: rotate(10deg) scale(1.05); }
        }
      `}</style>
    </div>
  )
}
