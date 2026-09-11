'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Anchor,
  ArrowRight,
  BellRing,
  Building2,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Languages,
  Leaf,
  LogIn,
  LogOut,
  MapPin,
  Mic,
  Plane,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { WeatherChat } from '@/components/weather-chat'
import { SkyBackground } from '@/components/sky-background'
import { LiveAlertHeroBox } from '@/components/live-alert-ticker'
import { WIS2Console } from '@/components/wis2-console'
import { TopCitiesWeatherCard } from '@/components/top-cities-weather-card'
import { AutoAlertModal } from '@/components/auto-alert-modal'
import { signOut, useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const userGuides = [
  {
    id: 'farmer',
    tab: '🌾 Farmers & Agriculture',
    tagline: 'Farming & Crop Decisions',
    title: 'Crop Protection & Optimal Irrigation Timing',
    description: 'Ask WeatherGPT in plain language about when to irrigate, apply fertilizer, spray pesticides, and manage rain risk for your fields.',
    badge: 'Soil & Crop Telemetry',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    question: '🗣️ "Should I irrigate my crops in Samastipur tomorrow?"',
    answer: '🌱 "Tomorrow in Samastipur, expect 33°C with sunny skies. Soil moisture at 10cm depth is 38% (Adequate). No heavy rainfall is expected for the next 3 days, making this an optimal window for irrigation and field spraying."',
    highlights: [
      { label: 'Soil Moisture', val: '0–10cm Live Telemetry' },
      { label: 'Spraying Window', val: 'Pre-rain safety alerts' },
      { label: 'Crop Advisory', val: 'Paddy, Maize, Wheat, Mustard' },
    ],
    exampleQuery: 'Samastipur kheti advisory',
  },
  {
    id: 'family',
    tab: '🏠 Daily Life & Commuting',
    tagline: 'Daily Life & Commute',
    title: 'Real-Time Forecasts Before You Step Outside',
    description: 'Check exact hourly rain probabilities, UV index, and air quality (AQI) in seconds before leaving home or planning travel.',
    badge: '24-Hour Forecast & AQI',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    question: '🗣️ "Will it rain this evening? Is it safe to head out?"',
    answer: '⛅ "Skies remain partly cloudy through the afternoon, with a 65% chance of rain developing after 5:30 PM. Wind speeds around 18 km/h. Carrying an umbrella is recommended."',
    highlights: [
      { label: '24-Hour Nowcast', val: 'Hourly rain probability' },
      { label: 'Air Quality (AQI)', val: 'PM2.5 & breathing safety' },
      { label: 'Sunrise & Sunset', val: 'Precise solar timings' },
    ],
    exampleQuery: 'Delhi weather today',
  },
  {
    id: 'alert',
    tab: '🚨 Flood & Cyclone Alerts',
    tagline: 'Disaster Early Warning',
    title: 'Official Warnings for Cyclones, Floods & Heatwaves',
    description: 'Access official IMD color-coded alerts (Red, Orange, Yellow), river basin inundation risks, and 24x7 emergency helplines.',
    badge: 'Official IMD & NDMA Alerts',
    badgeColor: 'bg-red-50 text-red-800 border-red-200',
    question: '🗣️ "Is there any cyclone or flood warning for my district?"',
    answer: '🚨 "IMD has issued an Orange Alert for coastal districts. Cyclonic wind gusts may reach 75–85 km/h with high storm surge. Coastal residents are advised to move to designated safe shelters. National Helpline: 1070."',
    highlights: [
      { label: 'Color-Coded Alerts', val: 'Red, Orange, Yellow IMD Warnings' },
      { label: 'Flood Inundation Risk', val: 'River basin telemetry tracking' },
      { label: '1-Click Dialers', val: '1070 (NDMA), 1077 (District)' },
    ],
    exampleQuery: 'Odisha cyclone warning',
  },
  {
    id: 'voice',
    tab: '🎙️ Voice AI (8 Languages)',
    tagline: 'Multilingual Voice AI',
    title: 'No Typing Needed — Just Speak Your Query',
    description: 'Speak naturally in Hindi, English, Bengali, Telugu, or Tamil. WeatherGPT responds with real-time text and high-clarity voice readout.',
    badge: 'Voice-In & Voice-Out (TTS)',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    question: '🎙️ "What is the 5-day weather forecast for Kolkata?"',
    answer: '🔊 "Scattered rain is expected in Kolkata today. Humidity is 72% with a maximum temperature of 32°C." (Hear instant audio readout via your speaker)',
    highlights: [
      { label: '8 Indian Languages', val: 'Hindi, English, Bengali, Telugu, Tamil, Marathi, Gujarati, Punjabi' },
      { label: 'Speech-to-Text', val: 'Instant mic query recognition' },
      { label: 'Audio Voice Readout', val: 'Spoken weather answers' },
    ],
    exampleQuery: 'Kolkata weather in English',
  },
]

export function WeatherExperience() {
  const [activeGuide, setActiveGuide] = useState(0)
  const [showWIS2, setShowWIS2] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [isChatFullscreen, setIsChatFullscreen] = useState(false)
  const currentGuide = userGuides[activeGuide]
  const { data: session, isPending } = useSession()
  const router = useRouter()

  // Automatically record login event to MongoDB login_history collection
  useEffect(() => {
    if (session?.user?.email) {
      const sessionKey = `login_logged_${session.user.email}_${new Date().toDateString()}`
      if (!sessionStorage.getItem(sessionKey)) {
        fetch('/api/auth/record-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: session.user.name,
            email: session.user.email,
            userId: session.user.id,
          }),
        }).catch(() => {})
        sessionStorage.setItem(sessionKey, 'true')
      }
    }
  }, [session?.user?.email])

  function scrollToChatBot() {
    const chatEl = document.getElementById('weather-chat-widget')
    if (chatEl) {
      chatEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.dispatchEvent(new Event('focus-weather-chat'))
      setTimeout(() => {
        const inputEl = document.getElementById('weather-chat-input') as HTMLTextAreaElement | null
        inputEl?.focus()
      }, 400)
    } else {
      document.getElementById('assistant')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="relative min-h-screen text-[#0f2f5a]">
      <SkyBackground />

      {/* ── Beautiful Floating Glass Navbar (Hidden during Fullscreen Chat) ── */}
      {!isChatFullscreen && (
        <div className="sticky top-3 z-50 mx-auto max-w-7xl px-3 sm:px-6">
          <header className="flex items-center justify-between rounded-2xl sm:rounded-full border border-white/80 bg-white/90 px-4 py-2.5 sm:px-6 sm:py-3 shadow-[0_8px_32px_rgba(15,47,90,0.08)] backdrop-blur-xl transition-all">
            {/* Brand Logo & Title */}
            <Link href="/" className="flex items-center gap-3 transition hover:opacity-95">
              <div className="weather-brand-icon relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                <CloudSun className="size-6 text-white" />
                <span aria-hidden="true" className="brand-sun absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">WeatherGPT</span>
                  <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                    India
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Mausam samjho · Faisla lo
                </p>
              </div>
            </Link>

            {/* Center Info Pills (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setShowAlertModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-800 hover:bg-cyan-500/20 transition shadow-xs cursor-pointer"
                title="Automated SMS & WhatsApp phone alerts"
              >
                <BellRing className="size-3 text-cyan-600 animate-pulse" />
                <span>📱 Auto Alerts</span>
              </button>
              <button
                onClick={() => setShowWIS2(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-500/20 transition shadow-xs cursor-pointer"
              >
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                📡 WMO WIS 2.0 Ingestion
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-600" />
                IMD &amp; GFS/WRF
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-800">
                <span>🌐</span> 8 Indian Languages
              </span>
            </div>

            {/* Right Actions: Login & High-Contrast CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              {session?.user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 py-1 pl-1.5 pr-3 shadow-xs backdrop-blur-md">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="size-6 rounded-full object-cover border border-white shrink-0"
                      />
                    ) : (
                      <div className="size-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {session.user.name?.[0] || 'U'}
                      </div>
                    )}
                    <div className="flex flex-col text-left leading-none">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {session.user.name || 'User'}
                      </span>
                      <span className="text-[10px] text-slate-500 max-w-[150px] truncate font-medium">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await signOut()
                      router.refresh()
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600 transition shadow-xs cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="size-3.5" /> <span className="hidden sm:inline">Sign out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-600/40 bg-blue-50 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700 hover:bg-blue-600 hover:text-white shadow-xs transition"
                >
                  <LogIn className="size-3.5" />
                  <span>Log in</span>
                </Link>
              )}

              <button
                onClick={scrollToChatBot}
                className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                <span>Ask WeatherGPT</span>
                <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
              </button>
            </div>
          </header>

          {/* ── Dynamic Atmospheric Stream & Glowing Breeze Under Header ── */}
          <div className="mx-auto mt-2 flex max-w-6xl items-center justify-between px-3 text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/20 px-3 py-1 shadow-xs backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-bold tracking-wide text-white">Live Doppler Radar Active</span>
              <span className="text-white/60">·</span>
              <span className="hidden sm:inline text-white/95">GFS &amp; WRF 0.05° Real-Time Ingestion</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-white/95 shadow-xs backdrop-blur-md">
              <span className="inline-block animate-spin text-amber-300 text-xs" style={{ animationDuration: '8s' }}>☀️</span>
              <span>28 States &amp; 8 UTs Intelligence Active</span>
            </div>
          </div>

          {/* Luminous flowing breeze accent line */}
          <div className="mx-auto mt-1 max-w-4xl px-4">
            <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-header-glow" />
          </div>
        </div>
      )}

      {/* ── Front Hero: India's friendly weather assistant ── */}
      {!isChatFullscreen && (
        <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pt-8 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-xs backdrop-blur-md">
              <span className="size-2 rounded-full bg-blue-600 animate-pulse" /> India&apos;s friendly weather assistant
            </p>
            <h1 className="max-w-xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0f2f5a] sm:text-5xl lg:text-6xl">
              Weather advice that feels like a <span className="text-blue-600">helpful neighbour.</span>
            </h1>
            <p className="mt-6 max-w-lg text-pretty text-base sm:text-lg leading-relaxed text-slate-700 font-medium">
              Ask in simple Hindi, English, or regional languages. Listen to voice answers. Get clear, actionable advice for your farm,
              flight, family, or city — backed by numerical GFS/WRF weather models.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="group rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition cursor-pointer flex items-center gap-2"
                onClick={scrollToChatBot}
              >
                <span>Ask about your weather</span>
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => setShowAlertModal(true)}
                className="rounded-full border border-cyan-400/80 bg-cyan-50 hover:bg-cyan-100/80 px-5 py-3.5 text-sm font-bold text-cyan-900 shadow-xs transition cursor-pointer flex items-center gap-2"
              >
                <BellRing className="size-4 text-cyan-600 animate-pulse" />
                <span>Auto SMS &amp; WhatsApp</span>
              </button>
              <button
                className="rounded-full border border-slate-300 bg-white/95 hover:bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-xs transition cursor-pointer"
                onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See how it works
              </button>
            </div>
          </div>
          <TopCitiesWeatherCard />
        </section>
      )}

      <section
        id="assistant"
        className={
          isChatFullscreen
            ? "fixed inset-0 z-[999999] m-0 p-0 max-w-none w-screen h-[100dvh] overflow-hidden bg-white"
            : "relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-8 lg:px-10"
        }
      >
        {!isChatFullscreen && (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
            {/* Left Column: About WeatherGPT India */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-950 shadow-sm backdrop-blur-md">
                  <span className="size-2.5 animate-pulse rounded-full bg-emerald-500 ring-2 ring-emerald-300" />
                  About WeatherGPT India
                </div>
                <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-4xl lg:text-5xl sm:leading-tight">
                  Smart, Voice-First AI Weather Intelligence for India
                </h2>
              </div>
              <div className="mt-4 rounded-2xl border border-white/60 bg-white/90 p-4 sm:p-5 shadow-lg shadow-blue-900/10 backdrop-blur-md text-slate-800">
                <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-800">
                  <strong>WeatherGPT</strong> Bharat ka pehla specialized conversational AI weather platform hai jo aam janta, kisano, pilots, aur disaster management teams ke liye real-time mausam aur satarkta natural language mein deta hai.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm font-semibold text-blue-950 sm:grid-cols-4">
                  <span className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 border border-blue-100">
                    <span>🌾</span> Kheti Salah (Agro)
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 border border-red-100">
                    <span>🌪️</span> Flood &amp; Cyclone Alert
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 border border-sky-100">
                    <span>✈️</span> Aviation Briefing
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 border border-emerald-100">
                    <span>🏙️</span> Smart City &amp; AQI
                  </span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-snug">
                  🎙️ Bolkar (voice) ya likhkar Hindi, English, Marathi, Gujarati, Punjabi, Bangla, Telugu ya Tamil mein sawal poochein — turant audio voice aur live weather card ke sath jawab payein.
                </p>
              </div>
            </div>

            {/* Right Column: Emergency Weather Alerts Box (User requested hero spot) */}
            <div className="lg:col-span-5 flex flex-col">
              <LiveAlertHeroBox />
            </div>
          </div>
        )}

        <div
          id="weather-chat-widget"
          className={
          isChatFullscreen
            ? "h-full w-full flex flex-col overflow-hidden bg-white rounded-none border-none"
            : "flex h-[calc(100dvh-300px)] min-h-[460px] max-h-[600px] min-w-0 flex-col overflow-hidden rounded-[2rem] border border-blue-200/60 bg-white/95 shadow-2xl shadow-blue-200/30"
        }>
          <WeatherChat
            isFullscreen={isChatFullscreen}
            onToggleFullscreen={() => {
              setIsChatFullscreen((f) => !f)
              setTimeout(() => window.dispatchEvent(new Event("resize")), 100)
            }}
          />
        </div>
      </section>

      {/* ── User-Oriented "How WeatherGPT Helps You" Section ── */}
      <section id="story" className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-950 shadow-xs backdrop-blur-md">
              <Sparkles className="size-3.5 text-blue-600" />
              Simple &amp; Practical · User-Oriented Guide
            </div>
            <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-4xl">
              How WeatherGPT Helps You
            </h2>
            <div className="mt-2 max-w-2xl rounded-2xl border border-white/60 bg-white/90 p-3 shadow-md backdrop-blur-md text-slate-800">
              <p className="text-xs sm:text-sm font-medium text-slate-700">
                Choose your use case below to see how asking questions in simple language provides instant, actionable meteorological answers.
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              aria-label="Previous guide"
              className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
              disabled={activeGuide === 0}
              onClick={() => setActiveGuide(Math.max(0, activeGuide - 1))}
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="text-xs font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
              0{activeGuide + 1} / 0{userGuides.length}
            </span>
            <button
              aria-label="Next guide"
              className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
              disabled={activeGuide === userGuides.length - 1}
              onClick={() => setActiveGuide(Math.min(userGuides.length - 1, activeGuide + 1))}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* 4 Interactive Category Tabs */}
        <div className="flex flex-wrap gap-2 pb-2">
          {userGuides.map((guide, idx) => (
            <button
              key={guide.id}
              onClick={() => setActiveGuide(idx)}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-xs ${
                activeGuide === idx
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white/90 text-slate-700 border border-slate-200/80 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {guide.tab}
            </button>
          ))}
        </div>

        {/* Selected Guide Detail Card */}
        <div className="mt-4 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-lg shadow-blue-900/5 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left side: Explanation & Highlights */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${currentGuide.badgeColor}`}>
                  {currentGuide.badge}
                </span>
                <span className="text-xs font-medium text-slate-400">· {currentGuide.tagline}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {currentGuide.title}
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                {currentGuide.description}
              </p>

              {/* Highlights 3-box Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {currentGuide.highlights.map((h, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-[11px] font-semibold text-slate-500">{h.label}</p>
                    <p className="mt-1 text-xs font-bold text-slate-900">{h.val}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    document.getElementById('assistant')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-600 transition"
                >
                  <span>Ask Assistant</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Right side: Live Visual Chat Simulation */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 p-5 sm:p-6 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-blue-100/60 text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <CloudSun className="size-4 text-blue-600" />
                    WeatherGPT Live Demonstration
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    Plain Language
                  </span>
                </div>

                {/* User's Question Bubble */}
                <div className="mt-4 flex justify-end">
                  <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-blue-600 px-4 py-3 text-white shadow-sm">
                    <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                      {currentGuide.question}
                    </p>
                  </div>
                </div>

                {/* WeatherGPT's Smart Answer Bubble */}
                <div className="mt-4 flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <CloudSun className="size-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-xs border border-white bg-white/95 p-4 shadow-sm text-slate-800">
                    <p className="text-xs sm:text-sm leading-relaxed font-medium text-slate-800">
                      {currentGuide.answer}
                    </p>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <ShieldCheck className="size-3.5 text-emerald-600" /> Official Sources: IMD / WeatherAPI
                      </span>
                      <span className="font-semibold text-blue-600">
                        Verified Telemetry ✓
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom indicator dots */}
          <div className="mt-6 flex justify-center gap-2">
            {userGuides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to guide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === activeGuide ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                onClick={() => setActiveGuide(i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary">Built for real India</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Features that can win trust.</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Research-backed ideas for the farmer, the family, and the disaster team.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#d8e9f6] bg-white p-5 shadow-sm transition hover:shadow-md">
            <MapPin className="size-6 text-primary" />
            <h3 className="mt-6 font-semibold text-slate-900">Hyperlocal Nowcast</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Live temperature, humidity, rainfall, wind gusts, and 5-day daily forecasts geocoded for all Indian locations.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-[#e9f8ec] px-2.5 py-1 text-xs font-medium text-emerald-700">
              ✅ Live · IMD &amp; WeatherAPI
            </span>
          </div>

          <div className="rounded-3xl border border-[#d8e9f6] bg-white p-5 shadow-sm transition hover:shadow-md">
            <Leaf className="size-6 text-emerald-600" />
            <h3 className="mt-6 font-semibold text-slate-900">Agro &amp; Kheti Advisory</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Real-time soil temperature, moisture at depths, crop growth stages, NDVI satellite proxy, and spraying advisories.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-[#e9f8ec] px-2.5 py-1 text-xs font-medium text-emerald-700">
              ✅ Live · Agro Monitoring
            </span>
          </div>

          <div className="rounded-3xl border border-[#d8e9f6] bg-white p-5 shadow-sm transition hover:shadow-md">
            <AlertTriangle className="size-6 text-red-500" />
            <h3 className="mt-6 font-semibold text-slate-900">Flood &amp; Cyclone Warning</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Official IMD/NDMA color alerts (Red, Orange, Yellow), storm surge height, river basin inundation risk, and emergency helplines.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-[#fee2e2] px-2.5 py-1 text-xs font-medium text-red-700">
              🚨 Live · NDMA Ready
            </span>
          </div>

          <div className="rounded-3xl border border-[#d8e9f6] bg-white p-5 shadow-sm transition hover:shadow-md">
            <Languages className="size-6 text-blue-600" />
            <h3 className="mt-6 font-semibold text-slate-900">8 Indian Languages</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Hindi (हिन्दी), English, Bengali (বাংলা), Telugu (తెలుగు), and Tamil (தமிழ்) with instant AI translation.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-[#e9f8ec] px-2.5 py-1 text-xs font-medium text-emerald-700">
              ✅ Live · Multilingual
            </span>
          </div>

          <div className="rounded-3xl border border-[#d8e9f6] bg-white p-5 shadow-sm transition hover:shadow-md">
            <Mic className="size-6 text-purple-600" />
            <h3 className="mt-6 font-semibold text-slate-900">Voice-In &amp; Audio Readout</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Speak your query in your native language. Hear instant spoken audio answers via Web Speech API speech-to-text &amp; TTS.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-[#e9f8ec] px-2.5 py-1 text-xs font-medium text-emerald-700">
              ✅ Live · Speech AI
            </span>
          </div>

          <div className="rounded-3xl border border-[#d8e9f6] bg-white p-5 shadow-sm transition hover:shadow-md">
            <Plane className="size-6 text-sky-600" />
            <h3 className="mt-6 font-semibold text-slate-900">Aviation METAR/TAF Briefing</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Flight categories (VFR, MVFR, IFR, LIFR), cloud ceiling (AGL), barometric QNH altimeter, and crosswind analysis.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-[#e9f8ec] px-2.5 py-1 text-xs font-medium text-emerald-700">
              ✅ Live · ICAO / METAR
            </span>
          </div>

          <div className="rounded-3xl border border-[#d8e9f6] bg-white p-5 shadow-sm transition hover:shadow-md">
            <Anchor className="size-6 text-cyan-600" />
            <h3 className="mt-6 font-semibold text-slate-900">Marine Coastal &amp; Fisheries</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Wave height, swell period, sea state (Calm to Rough), tidal phase, and safety advisories for Indian fishermen.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-[#e9f8ec] px-2.5 py-1 text-xs font-medium text-emerald-700">
              ✅ Live · Marine Safety
            </span>
          </div>

          <div className="rounded-3xl border border-[#d8e9f6] bg-white p-5 shadow-sm transition hover:shadow-md">
            <Building2 className="size-6 text-amber-600" />
            <h3 className="mt-6 font-semibold text-slate-900">Smart City &amp; Urban Heat</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Urban Heat Island (UHI) index, waterlogging hotspot risks, and UTCI thermal comfort monitoring.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-[#e9f8ec] px-2.5 py-1 text-xs font-medium text-emerald-700">
              ✅ Live · Urban Climate
            </span>
          </div>
        </div>
      </section>

      {/* ── Data Sources Reference Section ── */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-950 shadow-sm backdrop-blur-md">
            <span className="size-2.5 rounded-full bg-blue-600 ring-2 ring-blue-300" />
            Meteorological Data Sources &amp; Verification
          </div>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-5xl sm:leading-tight">
            Where this data comes from.
          </h2>
          <div className="mt-3 rounded-2xl border border-white/60 bg-white/90 p-4 sm:p-5 shadow-md backdrop-blur-md text-slate-800">
            <p className="text-sm sm:text-base font-medium leading-relaxed">
              WeatherGPT combines government-grade meteorological agencies, numerical weather prediction (NWP) models (NOAA GFS &amp; WRF), and high-resolution telemetry to deliver verified weather intelligence across India.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* OpenWeatherMap & WeatherAPI */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/80 bg-white/95 p-6 shadow-md backdrop-blur-sm">
            <div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <svg viewBox="0 0 24 24" className="size-6 fill-current text-primary" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a7 7 0 0 1 6.93 6H19a5 5 0 1 1 0 10H6a5 5 0 0 1-.16-10A7 7 0 0 1 12 2z"/>
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">WeatherAPI &amp; Open-Meteo</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                Real-time surface weather status, 6-day daily forecasts, hourly rain probability, Air Quality Index (AQI), PM2.5, PM10, and high-precision Indian geocoding.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700 font-medium">
                <li>🌡️ Live temperature, feels-like, and pressure</li>
                <li>🌧️ Rainfall probability &amp; wind vectors</li>
                <li>🌫️ Air Quality Index (AQI 1–5 scale)</li>
                <li>🌅 Exact sunrise &amp; sunset astronomical calculations</li>
              </ul>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="https://www.weatherapi.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
              >
                🔗 WeatherAPI Portal
              </a>
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-600"
              >
                🌐 Open-Meteo API
              </a>
            </div>
          </div>

          {/* Agro Monitoring API */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/80 bg-white/95 p-6 shadow-md backdrop-blur-sm">
            <div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <svg viewBox="0 0 24 24" className="size-6 fill-current text-emerald-600" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 8C8 10 5.9 16.17 3.82 19.34L5.71 21l1-1C7.38 19.4 8.38 19 9 19c2 0 2 1 4 1s2-1 4-1 2 1 4 1l1-1-1-1c-2-2-2.17-3.83-4-10z"/>
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Agro Monitoring &amp; Earth Observation</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                Agriculture-focused satellite earth observation and soil telemetry. Monitors crop health, soil moisture at multiple depths, and field-level risk for Indian farmers.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700 font-medium">
                <li>🛰️ Satellite NDVI (Normalized Difference Vegetation Index)</li>
                <li>🌱 0–10cm soil temperature &amp; moisture levels</li>
                <li>🌾 Critical crop stages (Wheat, Paddy, Mustard, Cotton)</li>
                <li>🌧️ Rain wash-off &amp; pesticide spraying window</li>
              </ul>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="https://agromonitoring.com/api"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
              >
                🌾 View Agro API Docs
              </a>
              <a
                href="https://agromonitoring.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600"
              >
                🔑 Agro Dashboard
              </a>
            </div>
          </div>

          {/* IMD - India Meteorological Department & NDMA */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/80 bg-white/95 p-6 shadow-md backdrop-blur-sm">
            <div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                <svg viewBox="0 0 24 24" className="size-6 fill-current text-amber-600" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 7a5 5 0 1 1 0 10A5 5 0 0 1 12 7zm0-5l1.09 3.26A7.5 7.5 0 0 0 19.5 12h-3.26L19.5 13.09A7.5 7.5 0 0 0 12 19.5v-3.26L10.91 19.5A7.5 7.5 0 0 0 4.5 12h3.26L4.5 10.91A7.5 7.5 0 0 0 12 4.5V7.74L13.09 4.5z"/>
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">IMD &amp; NDMA Disaster Warning</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                India&apos;s official government weather authority and national disaster management framework. Powers color-coded alerts (Red/Orange/Yellow), cyclone bulletins, and flood advisories.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700 font-medium">
                <li>🌀 Official cyclone track, wind gust &amp; storm surge</li>
                <li>🌊 River basin flood inundation &amp; CWC water levels</li>
                <li>📍 District-level heatwave &amp; thunderstorm alerts</li>
                <li>📊 30-year IMD climatological normals</li>
              </ul>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="https://mausam.imd.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-500 hover:text-white"
              >
                🇮🇳 Official IMD Portal
              </a>
              <a
                href="https://ndma.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600"
              >
                ⚠️ NDMA Guidelines
              </a>
            </div>
          </div>

        </div>

        {/* Bottom note */}
        <div className="mt-8 rounded-2xl border border-white/70 bg-white/95 p-5 shadow-lg text-xs sm:text-sm leading-relaxed text-slate-800 backdrop-blur-md">
          <div className="flex items-start gap-2.5">
            <span className="text-lg">🛡️</span>
            <div>
              <strong className="font-bold text-slate-950">Official Meteorological Integrity Notice:</strong>
              <p className="mt-1 text-slate-700">
                Live ground metrics are fetched from <code className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-blue-700 border border-blue-200">WeatherAPI</code> and <code className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-blue-700 border border-blue-200">Open-Meteo</code> with strict India geocoding boundaries. Agriculture parameters reference <code className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-emerald-700 border border-emerald-200">Agro Monitoring</code>. Numerical weather models reference <strong>NOAA GFS (0.25°)</strong> and <strong>WRF-ARW (3km)</strong>. Official emergency and disaster directives adhere to guidelines issued by the <strong>India Meteorological Department (IMD)</strong> and <strong>NDMA</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comprehensive Modern Footer ── */}
      <footer className="relative z-20 mt-16 w-full border-t border-blue-900/40 bg-[#07192c] text-slate-300 shadow-2xl">
        <div className="mx-auto max-w-7xl px-5 pt-12 pb-8 lg:px-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Column 1: Brand & Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                  <CloudSun className="size-5" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">WeatherGPT <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-400/30">INDIA</span></span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                India&apos;s conversational AI weather intelligence platform providing real-time forecasts, numerical NWP prediction (GFS/WRF), farmer crop advisories, and IMD/NDMA disaster early warnings.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-blue-950/80 px-2 py-1 text-[10px] font-semibold text-blue-300 border border-blue-800/40">
                  🇮🇳 Made for India
                </span>
                <span className="rounded-md bg-emerald-950/80 px-2 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-800/40">
                  ⚡ 8 Indian Languages
                </span>
                <span className="rounded-md bg-amber-950/80 px-2 py-1 text-[10px] font-semibold text-amber-300 border border-amber-800/40">
                  🛡️ NDMA Ready
                </span>
              </div>
            </div>

            {/* Column 2: Key Specialized Sectors */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Specialized Sectors</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex items-center gap-1.5 hover:text-white transition">
                  <span>🌾</span> Agriculture &amp; Crop Advisories
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition">
                  <span>🌪️</span> Flood &amp; Cyclone Early Warning
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition">
                  <span>✈️</span> Aviation METAR/TAF Briefings
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition">
                  <span>🌊</span> Marine Coastal &amp; Fisheries
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition">
                  <span>🏙️</span> Smart City &amp; Urban Heat Island
                </li>
              </ul>
            </div>

            {/* Column 3: Meteorological Data & Models */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Meteorological Sources</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition flex items-center gap-1">
                    <span>📡</span> IMD — India Meteorological Dept.
                  </a>
                </li>
                <li>
                  <a href="https://www.ncep.noaa.gov" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition flex items-center gap-1">
                    <span>🛰️</span> NOAA GFS (0.25°) &amp; WRF (3km)
                  </a>
                </li>
                <li>
                  <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition flex items-center gap-1">
                    <span>🌐</span> Open-Meteo High-Resolution NWP
                  </a>
                </li>
                <li>
                  <a href="https://www.weatherapi.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition flex items-center gap-1">
                    <span>⚡</span> WeatherAPI Real-Time Status
                  </a>
                </li>
                <li>
                  <a href="https://community.wmo.int/en/activity-areas/wis" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition flex items-center gap-1">
                    <span>📡</span> WMO WIS2.0 Global Broker (MQTT)
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: 24x7 Official Emergency Helplines */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">24x7 Emergency Helplines</h4>
              <p className="text-[11px] text-slate-400">Official government helplines during extreme weather:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a href="tel:1070" className="flex items-center gap-1 rounded bg-red-950/60 p-2 text-red-300 border border-red-800/40 hover:bg-red-900/50 transition">
                  <span className="font-bold">1070</span> <span className="text-[10px] text-slate-400 block">NDMA</span>
                </a>
                <a href="tel:1077" className="flex items-center gap-1 rounded bg-amber-950/60 p-2 text-amber-300 border border-amber-800/40 hover:bg-amber-900/50 transition">
                  <span className="font-bold">1077</span> <span className="text-[10px] text-slate-400 block">State/Dist</span>
                </a>
                <a href="tel:1554" className="flex items-center gap-1 rounded bg-blue-950/60 p-2 text-blue-300 border border-blue-800/40 hover:bg-blue-900/50 transition">
                  <span className="font-bold">1554</span> <span className="text-[10px] text-slate-400 block">Coast Guard</span>
                </a>
                <a href="tel:108" className="flex items-center gap-1 rounded bg-emerald-950/60 p-2 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/50 transition">
                  <span className="font-bold">108</span> <span className="text-[10px] text-slate-400 block">Ambulance</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div className="mt-10 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>© 2026 WeatherGPT India. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
              <span>Supported Languages: <strong>हिन्दी · English · বাংলা · తెలుగు · தமிழ் · मराठी · ગુજરાતી · ਪੰਜਾਬੀ</strong></span>
              <span>·</span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-blue-400 hover:underline transition"
              >
                ↑ Back to Top
              </button>
            </div>
          </div>
        </div>
      </footer>
      <WIS2Console isOpen={showWIS2} onClose={() => setShowWIS2(false)} />
      <AutoAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        initialCity="New Delhi"
      />
    </main>
  )
}
