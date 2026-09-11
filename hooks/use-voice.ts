"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseVoiceOptions {
  locale: string
  onResult: (transcript: string) => void
}

export function useVoice({ locale, onResult }: UseVoiceOptions) {
  const [listening, setListening]   = useState(false)
  const [speaking, setSpeaking]     = useState(false)
  const [canListen, setCanListen]   = useState(false)
  const recognitionRef = useRef<any>(null)
  const onResultRef    = useRef(onResult)
  onResultRef.current  = onResult

  /* ── Init SpeechRecognition ── */
  useEffect(() => {
    if (typeof window === "undefined") return
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!SR) return

    const rec = new SR()
    rec.continuous      = false
    rec.interimResults  = false
    rec.maxAlternatives = 1
    rec.lang            = locale
    recognitionRef.current = rec
    setCanListen(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Update locale on language change ── */
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = locale
    }
  }, [locale])

  /* ── Start mic ── */
  const startListening = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return

    rec.lang = locale

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      onResultRef.current(transcript)
    }

    rec.onend   = () => setListening(false)
    rec.onerror = (e: any) => {
      console.warn("SpeechRecognition error:", e.error)
      setListening(false)
      // If mic was denied, disable the button
      if (e.error === "not-allowed") {
        setCanListen(false)
      }
    }

    try {
      rec.start()
      setListening(true)
    } catch (err) {
      console.warn("rec.start() failed:", err)
      setListening(false)
    }
  }, [locale])

  /* ── Stop mic ── */
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  /* ── Speak — wait for voices to load (Safari / Chrome bug) ── */
  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return

      const synth = window.speechSynthesis
      synth.cancel()

      const doSpeak = () => {
        const utter    = new SpeechSynthesisUtterance(text)
        utter.lang     = locale
        utter.rate     = 0.96
        utter.pitch    = 1
        utter.volume   = 1

        // Pick best matching voice for locale
        const voices = synth.getVoices()
        const match  = voices.find(v => v.lang.startsWith(locale.split("-")[0]))
        if (match) utter.voice = match

        utter.onstart = () => setSpeaking(true)
        utter.onend   = () => setSpeaking(false)
        utter.onerror = () => setSpeaking(false)
        synth.speak(utter)
      }

      // Voices may not be loaded yet — wait for them
      if (synth.getVoices().length > 0) {
        doSpeak()
      } else {
        synth.addEventListener("voiceschanged", doSpeak, { once: true })
        // Fallback after 800 ms if voiceschanged never fires
        setTimeout(() => {
          if (!speaking) doSpeak()
        }, 800)
      }
    },
    [locale, speaking],
  )

  /* ── Stop speaking ── */
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [])

  return { listening, speaking, canListen, startListening, stopListening, speak, stopSpeaking }
}
