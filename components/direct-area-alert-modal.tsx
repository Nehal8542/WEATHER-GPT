'use client'

import React, { useState, useEffect } from 'react'
import {
  AlertOctagon,
  Send,
  X,
  MapPin,
  ShieldAlert,
  Smartphone,
  MessageSquare,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

interface DirectAreaAlertModalProps {
  isOpen: boolean
  onClose: () => void
  initialArea?: string
  initialHazard?: string
  initialSeverity?: string
  initialHeadline?: string
  initialAction?: string
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India (भारत)' },
  { code: '+1', country: 'US / Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
]

export function DirectAreaAlertModal({
  isOpen,
  onClose,
  initialArea = 'Puri, Balasore, Coastal Odisha',
  initialHazard = 'Severe Cyclonic Storm',
  initialSeverity = 'Red',
  initialHeadline = 'Red Alert: Very Severe Cyclonic Storm with wind gusts up to 135 km/h',
  initialAction = 'Complete suspension of marine activities. Coastal residents move to cyclone shelters.',
}: DirectAreaAlertModalProps) {
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [affectedArea, setAffectedArea] = useState(initialArea)
  const [hazard, setHazard] = useState(initialHazard)
  const [severity, setSeverity] = useState(initialSeverity)
  const [headline, setHeadline] = useState(initialHeadline)
  const [action, setAction] = useState(initialAction)
  const [channelChoice, setChannelChoice] = useState<'both' | 'sms' | 'whatsapp'>('both')

  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error'
    text: string
    details?: string
  } | null>(null)

  useEffect(() => {
    if (isOpen) {
      setAffectedArea(initialArea)
      setHazard(initialHazard)
      setSeverity(initialSeverity)
      setHeadline(initialHeadline)
      setAction(initialAction)
      setStatusMessage(null)
    }
  }, [isOpen, initialArea, initialHazard, initialSeverity, initialHeadline, initialAction])

  if (!isOpen) return null

  const getChannelsArray = (): ('sms' | 'whatsapp')[] => {
    if (channelChoice === 'both') return ['sms', 'whatsapp']
    if (channelChoice === 'whatsapp') return ['whatsapp']
    return ['sms']
  }

  const getFullPhoneNumber = () => {
    const clean = phoneNumber.replace(/[\s\-\(\)]/g, '')
    if (clean.startsWith('+')) return clean
    return `${countryCode}${clean}`
  }

  const handleSendDirectAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    const fullPhone = getFullPhoneNumber()
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 8) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid phone number (at least 8-10 digits).',
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/alerts/direct-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          affectedArea,
          hazard,
          severity,
          headline,
          action,
          channels: getChannelsArray(),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `🚨 Direct alert dispatched for ${affectedArea}!`,
          details: data.simulated
            ? `Simulated delivery logged to server console. Add Twilio keys to .env.local for real physical SMS.`
            : `Live SMS/WhatsApp delivered to ${fullPhone}!`,
        })
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to dispatch direct message.',
        })
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error connecting to emergency dispatch service.',
      })
    } finally {
      setLoading(false)
    }
  }

  const isRed = severity.toUpperCase() === 'RED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-950/95 border border-red-500/30 rounded-2xl shadow-2xl p-6 text-white overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 40px rgba(239, 68, 68, 0.2)',
        }}
      >
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Direct Alert for Affected Area
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  Priority SMS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted emergency broadcast to residents in the affected hazard zone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{statusMessage.text}</p>
              {statusMessage.details && (
                <p className="text-slate-400 text-[11px] mt-0.5">{statusMessage.details}</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSendDirectAlert} className="space-y-3.5">
          {/* Affected Area / Region */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Affected Area / Districts</span>
            </label>
            <input
              type="text"
              value={affectedArea}
              onChange={(e) => setAffectedArea(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Recipient Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Mobile Number (in Affected Area)</span>
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-950 text-white">
                    {c.code} {c.country}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Enter mobile number e.g. 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          {/* Delivery Channel */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dispatch Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannelChoice('both')}
                className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  channelChoice === 'both'
                    ? 'bg-gradient-to-r from-red-600/30 to-amber-600/30 border-red-400 text-red-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Both (SMS & WA)</span>
              </button>
              <button
                type="button"
                onClick={() => setChannelChoice('sms')}
                className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  channelChoice === 'sms'
                    ? 'bg-blue-600/25 border-blue-400 text-blue-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>SMS Only</span>
              </button>
              <button
                type="button"
                onClick={() => setChannelChoice('whatsapp')}
                className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  channelChoice === 'whatsapp'
                    ? 'bg-emerald-600/25 border-emerald-400 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Only</span>
              </button>
            </div>
          </div>

          {/* Emergency Message Preview */}
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Emergency Message Preview:
            </span>
            <div className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              {`🚨 [WeatherGPT EMERGENCY BROADCAST]\n📍 Affected Area: ${affectedArea}\n⚠️ Level: ${
                isRed ? '🔴 RED ALERT' : '🟠 WARNING'
              } (${hazard})\n📢 ${headline}\n🛡️ Action: ${action}\n📞 Helplines: 1070 (NDMA) | 112`}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-600/30 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Send Direct Message to Affected Area</span>
            </button>
          </div>
        </form>

        <div className="mt-3 text-center text-[10px] text-slate-500">
          Official NDMA &amp; IMD emergency messaging protocol • Rapid citizen dispatch
        </div>
      </div>
    </div>
  )
}
