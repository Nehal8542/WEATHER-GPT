'use client'

import React, { useState } from 'react'
import {
  BellRing,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Smartphone,
  Sparkles,
  X,
  Send,
  Loader2,
  Trash2,
  Info,
  Clock,
  ShieldAlert,
} from 'lucide-react'

interface AutoAlertModalProps {
  isOpen: boolean
  onClose: () => void
  initialCity?: string
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India (भारत)' },
  { code: '+1', country: 'US / Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
  { code: '+61', country: 'Australia' },
  { code: '+65', country: 'Singapore' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+92', country: 'Pakistan' },
  { code: '+977', country: 'Nepal' },
]

export function AutoAlertModal({
  isOpen,
  onClose,
  initialCity = 'New Delhi',
}: AutoAlertModalProps) {
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [city, setCity] = useState(initialCity)
  const [channelChoice, setChannelChoice] = useState<'both' | 'whatsapp' | 'sms'>('both')
  const [alertType, setAlertType] = useState<'all' | 'daily' | 'severe'>('all')

  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
    details?: string
  } | null>(null)

  if (!isOpen) return null

  const getChannelsArray = (): ('sms' | 'whatsapp')[] => {
    if (channelChoice === 'both') return ['sms', 'whatsapp']
    if (channelChoice === 'whatsapp') return ['whatsapp']
    return ['sms']
  }

  const getFullPhoneNumber = () => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '')
    if (cleanNumber.startsWith('+')) return cleanNumber
    return `${countryCode}${cleanNumber}`
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    const fullPhone = getFullPhoneNumber()
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 7) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid mobile number with at least 8-10 digits.',
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          city: city.trim() || 'New Delhi',
          channels: getChannelsArray(),
          alertType,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `🎉 Successfully subscribed ${fullPhone} for ${city}!`,
          details: data.dispatched?.[0]?.simulated
            ? 'Safe Simulation Mode active. Twilio credentials can be added to .env.local for live network delivery.'
            : 'Confirmation alert sent to your phone!',
        })
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to subscribe. Please try again.',
        })
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Network error connecting to subscription server.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestAlert = async () => {
    setStatusMessage(null)
    const fullPhone = getFullPhoneNumber()
    if (!phoneNumber.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a phone number to test.',
      })
      return
    }

    setTestLoading(true)
    try {
      const res = await fetch('/api/alerts/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          city: city.trim() || 'New Delhi',
          channels: getChannelsArray(),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message,
          details: `Sent test bulletin for ${city} to ${fullPhone} via ${channelChoice.toUpperCase()}.`,
        })
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Test alert failed. Please check phone number.',
        })
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to send test alert.',
      })
    } finally {
      setTestLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    const fullPhone = getFullPhoneNumber()
    if (!phoneNumber.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/alerts/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'info',
          text: `Unsubscribed ${fullPhone} from all automated alerts.`,
        })
      }
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl p-6 text-white overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.15)',
        }}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/25">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-100">Automated Weather Alerts</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SMS & WhatsApp
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct phone delivery for daily 8 AM forecasts & severe storm warnings
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

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="font-semibold">{statusMessage.text}</p>
              {statusMessage.details && (
                <p className="text-slate-400 text-[11px]">{statusMessage.details}</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubscribe} className="space-y-4">
          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Mobile Phone Number
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.code} {c.country}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono"
                  required
                />
                <Smartphone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Target City */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target City / District
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. New Delhi, Patna, Mumbai, Kolkata"
              className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              required
            />
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Choose Messaging Channels
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannelChoice('both')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  channelChoice === 'both'
                    ? 'bg-gradient-to-b from-cyan-500/20 to-emerald-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1 text-cyan-400" />
                <span>Both (SMS & WA)</span>
              </button>

              <button
                type="button"
                onClick={() => setChannelChoice('whatsapp')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  channelChoice === 'whatsapp'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 mb-1 text-emerald-400" />
                <span>WhatsApp Only</span>
              </button>

              <button
                type="button"
                onClick={() => setChannelChoice('sms')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  channelChoice === 'sms'
                    ? 'bg-blue-500/20 border-blue-400 text-blue-200 shadow-md shadow-blue-500/10'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4 mb-1 text-blue-400" />
                <span>SMS Only</span>
              </button>
            </div>
          </div>

          {/* Alert Frequency */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Alert Types & Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAlertType('all')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-[11px] font-medium transition-all ${
                  alertType === 'all'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Daily & Severe</span>
              </button>

              <button
                type="button"
                onClick={() => setAlertType('daily')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-[11px] font-medium transition-all ${
                  alertType === 'daily'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>8 AM Daily</span>
              </button>

              <button
                type="button"
                onClick={() => setAlertType('severe')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-[11px] font-medium transition-all ${
                  alertType === 'severe'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Severe Only</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BellRing className="w-4 h-4" />
              )}
              <span>Subscribe & Activate</span>
            </button>

            <button
              type="button"
              onClick={handleTestAlert}
              disabled={testLoading || !phoneNumber.trim()}
              title="Send a sample forecast bulletin to this number right now"
              className="px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-800/90 text-slate-200 text-xs font-medium hover:bg-slate-700/80 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              {testLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>Test Ping</span>
            </button>
          </div>
        </form>

        {/* Footer info & Unsubscribe */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Encrypted E.164 routing • Free service</span>
          <button
            onClick={handleUnsubscribe}
            disabled={loading || !phoneNumber.trim()}
            className="hover:text-rose-400 transition-colors flex items-center gap-1 disabled:opacity-30"
          >
            <Trash2 className="w-3 h-3" />
            <span>Unsubscribe</span>
          </button>
        </div>
      </div>
    </div>
  )
}
