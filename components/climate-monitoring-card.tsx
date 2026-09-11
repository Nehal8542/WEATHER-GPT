'use client'

import React, { useState, useEffect } from 'react'
import {
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Zap,
  Send,
  Clock,
  Radio,
  Layers,
} from 'lucide-react'

interface ClimateDataState {
  parameter: string
  currentValue: number
  threshold: number
  status: 'NORMAL' | 'WARNING' | 'CRITICAL'
  isLimitCrossed: boolean
  reason: string
  smsStatus: string
  city: string
  lastCheckedAt: string
  lastAlertAt?: string
  isDemo?: boolean
}

export function ClimateMonitoringCard({ defaultCity = 'Delhi' }: { defaultCity?: string }) {
  const [city, setCity] = useState(defaultCity)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [data, setData] = useState<ClimateDataState | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch real climate data and check threshold
  const fetchClimateStatus = async (targetCity = city) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/climate/check?city=${encodeURIComponent(targetCity)}`)
      const json = await res.json()
      if (res.ok && json.success) {
        setData(json.monitoring)
      } else {
        setError(json.error || 'Failed to check climate status')
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to climate service')
    } finally {
      setLoading(false)
    }
  }

  // SIH DEMO: Trigger threshold crossing simulation
  const handleDemoTrigger = async () => {
    setDemoLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/climate/demo-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          simulatedValue: 42.0, // Exceeds default 40.0°C threshold
          parameter: 'Temperature',
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setData(json.monitoring)
      } else {
        setError(json.error || 'Failed to trigger demo alert')
      }
    } catch (err: any) {
      setError(err.message || 'Error executing demo trigger')
    } finally {
      setDemoLoading(false)
    }
  }

  useEffect(() => {
    fetchClimateStatus(defaultCity)
  }, [defaultCity])

  const isCritical = data?.status === 'CRITICAL'
  const isWarning = data?.status === 'WARNING'
  const isNormal = data?.status === 'NORMAL'

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-xl ${
        isCritical
          ? 'bg-rose-950/80 border-rose-500/50 shadow-rose-900/20 text-rose-50 ring-1 ring-rose-500/40'
          : isWarning
          ? 'bg-amber-950/80 border-amber-500/50 shadow-amber-900/20 text-amber-50'
          : 'bg-white/90 border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-slate-800'
      }`}
    >
      {/* Background Glow */}
      <div
        className={`absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
          isCritical
            ? 'bg-rose-500/20'
            : isWarning
            ? 'bg-amber-500/20'
            : 'bg-blue-500/10'
        }`}
      />

      <div className="p-5 sm:p-6">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-xl text-white shadow-sm ${
                isCritical
                  ? 'bg-gradient-to-tr from-rose-600 to-red-500 animate-pulse shadow-rose-500/30'
                  : isWarning
                  ? 'bg-gradient-to-tr from-amber-600 to-yellow-500'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20'
              }`}
            >
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    isCritical ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Climate Monitoring
                </h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                    isCritical
                      ? 'bg-rose-500/30 text-rose-200 border-rose-400/40'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  SIH Demo
                </span>
              </div>
              <p
                className={`text-xs ${
                  isCritical ? 'text-rose-200/80' : 'text-slate-500'
                }`}
              >
                Historical Baseline vs. Configured Threshold Alert
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-wide border shadow-xs ${
              isCritical
                ? 'bg-rose-600 text-white border-rose-400 animate-bounce'
                : isWarning
                ? 'bg-amber-500 text-white border-amber-300'
                : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
            }`}
          >
            {isCritical ? (
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
            ) : isWarning ? (
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{data?.status || 'CHECKING'}</span>
          </div>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Critical / Warning Reason Banner */}
        {data?.isLimitCrossed && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-600/25 border border-rose-400/60 flex items-start gap-2.5 text-white animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black tracking-wide uppercase text-rose-200">
                ⚠ {data.reason}
              </p>
              <p className="text-xs text-rose-100 mt-0.5">
                Current {data.parameter} ({data.currentValue}°C) exceeds the configured
                safety threshold ({data.threshold}°C). Automatic emergency SMS notification
                triggered.
              </p>
            </div>
          </div>
        )}

        {/* Main 3 Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {/* Metric 1: Parameter & Current Value */}
          <div
            className={`p-3.5 rounded-xl border ${
              isCritical
                ? 'bg-rose-900/40 border-rose-700/50 text-white'
                : 'bg-slate-50/80 border-slate-200/80 text-slate-800'
            }`}
          >
            <span
              className={`text-[11px] font-semibold block uppercase tracking-wider ${
                isCritical ? 'text-rose-200' : 'text-slate-500'
              }`}
            >
              Parameter: {data?.parameter || 'Temperature'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black">
                {data ? `${data.currentValue}°C` : '--'}
              </span>
              {data?.isDemo && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-1.5 py-0.2 rounded">
                  TEST
                </span>
              )}
            </div>
            <span
              className={`text-[11px] block mt-0.5 ${
                isCritical ? 'text-rose-200/70' : 'text-slate-500'
              }`}
            >
              Location: {city}
            </span>
          </div>

          {/* Metric 2: Configured Threshold */}
          <div
            className={`p-3.5 rounded-xl border ${
              isCritical
                ? 'bg-rose-900/40 border-rose-700/50 text-white'
                : 'bg-slate-50/80 border-slate-200/80 text-slate-800'
            }`}
          >
            <span
              className={`text-[11px] font-semibold block uppercase tracking-wider ${
                isCritical ? 'text-rose-200' : 'text-slate-500'
              }`}
            >
              Configured Threshold
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black">
                {data ? `${data.threshold}°C` : '40°C'}
              </span>
            </div>
            <span
              className={`text-[11px] block mt-0.5 ${
                isCritical ? 'text-rose-200/70' : 'text-slate-500'
              }`}
            >
              Env: CLIMATE_THRESHOLD_1
            </span>
          </div>

          {/* Metric 3: Status Details */}
          <div
            className={`col-span-2 sm:col-span-1 p-3.5 rounded-xl border ${
              isCritical
                ? 'bg-rose-900/40 border-rose-700/50 text-white'
                : 'bg-slate-50/80 border-slate-200/80 text-slate-800'
            }`}
          >
            <span
              className={`text-[11px] font-semibold block uppercase tracking-wider ${
                isCritical ? 'text-rose-200' : 'text-slate-500'
              }`}
            >
              Monitoring Status
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isCritical
                    ? 'bg-rose-400 animate-ping'
                    : isWarning
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="text-lg font-black tracking-wide">
                {data?.status || 'NORMAL'}
              </span>
            </div>
            <span
              className={`text-[11px] block mt-0.5 truncate ${
                isCritical ? 'text-rose-200/70' : 'text-slate-500'
              }`}
            >
              {isNormal ? 'Safe baseline' : 'Risk threshold crossed'}
            </span>
          </div>
        </div>

        {/* Telemetry Information Row: Last Checked, Last Alert, SMS Status */}
        <div
          className={`rounded-xl p-3 border text-xs mb-4 space-y-1.5 ${
            isCritical
              ? 'bg-rose-900/20 border-rose-800/40 text-rose-100'
              : 'bg-slate-100/70 border-slate-200/70 text-slate-600'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last Checked:</span>
              <strong className={isCritical ? 'text-white' : 'text-slate-900'}>
                {data?.lastCheckedAt
                  ? new Date(data.lastCheckedAt).toLocaleTimeString('en-IN')
                  : 'Just now'}
              </strong>
            </span>

            {data?.lastAlertAt && (
              <span className="flex items-center gap-1 font-medium text-rose-300">
                <Radio className="w-3.5 h-3.5" />
                <span>Last Alert:</span>
                <strong>
                  {new Date(data.lastAlertAt).toLocaleTimeString('en-IN')}
                </strong>
              </span>
            )}
          </div>

          {/* SMS Status Indicator */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            <Send className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-400">SMS Status:</span>
            <span
              className={`font-mono font-bold text-[11px] truncate ${
                data?.smsStatus?.includes('Sent')
                  ? 'text-emerald-400'
                  : data?.smsStatus?.includes('Cooldown')
                  ? 'text-amber-300'
                  : data?.smsStatus?.includes('Simulated')
                  ? 'text-cyan-300'
                  : 'text-slate-400'
              }`}
            >
              {data?.smsStatus || 'Standby (Trigger on threshold cross)'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* SIH DEMO TRIGGER BUTTON */}
          <button
            type="button"
            onClick={handleDemoTrigger}
            disabled={demoLoading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-md shadow-rose-600/30 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {demoLoading ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            )}
            <span>Demo Alert Trigger</span>
          </button>

          {/* REAL REFRESH CHECK BUTTON */}
          <button
            type="button"
            onClick={() => fetchClimateStatus(city)}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs border transition-all cursor-pointer disabled:opacity-50 ${
              isCritical
                ? 'bg-rose-900/60 border-rose-700 text-white hover:bg-rose-800/80'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Check Real Climate</span>
          </button>

          {/* Quick City Switcher */}
          <div className="hidden sm:flex items-center gap-1 ml-auto">
            <span className="text-[11px] text-slate-400 font-medium">City:</span>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value)
                fetchClimateStatus(e.target.value)
              }}
              className={`text-xs rounded-lg px-2 py-1 border font-medium cursor-pointer focus:outline-none ${
                isCritical
                  ? 'bg-rose-900 border-rose-700 text-white'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="Delhi">Delhi</option>
              <option value="Patna">Patna</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Lucknow">Lucknow</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
