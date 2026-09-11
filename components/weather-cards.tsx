"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AlertTriangle, Droplets, Eye, Gauge, Leaf, MapPin, PhoneCall, Plane, ShieldAlert, Sunrise, Sunset, Thermometer, Wind } from "lucide-react"
import { WeatherIcon } from "@/components/weather-icon"
import type {
  AgroPayload,
  AirQuality,
  AlertSeverity,
  AviationPayload,
  ClimateNormal,
  CurrentWeather,
  DailyForecast,
  DisasterPayload,
  ForecastPoint,
  GeoLocation,
  MarinePayload,
  NWPPayload,
  UrbanPayload,
  WeatherAlert,
} from "@/lib/weather-types"

function fmtTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

function dayLabel(date: string) {
  return new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
}

export function CurrentCard({ location, current }: { location: GeoLocation; current: CurrentWeather }) {
  const stats = [
    { icon: Droplets, label: "Humidity", value: `${current.humidity}%` },
    { icon: Wind, label: "Wind", value: `${Math.round(current.windSpeed * 3.6)} km/h` },
    { icon: Gauge, label: "Pressure", value: `${current.pressure} hPa` },
    { icon: Eye, label: "Visibility", value: `${(current.visibility / 1000).toFixed(1)} km` },
  ]
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            <span>
              {location.name}
              {location.state ? `, ${location.state}` : ""}, {location.country}
            </span>
          </div>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-mono text-5xl font-semibold leading-none text-foreground">{current.temp}°</span>
            <span className="mb-1 text-sm capitalize text-muted-foreground">{current.description}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Feels like {current.feelsLike}°C</p>
        </div>
        <WeatherIcon condition={current.condition} className="size-14 shrink-0 text-primary" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md bg-secondary/60 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              <s.icon className="size-3" />
              {s.label}
            </div>
            <div className="mt-0.5 font-mono text-sm text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Sunrise className="size-3.5 text-accent" /> {fmtTime(current.sunrise)}
        </span>
        <span className="flex items-center gap-1.5">
          <Sunset className="size-3.5 text-accent" /> {fmtTime(current.sunset)}
        </span>
      </div>
    </div>
  )
}

export function SourceCard({ source, lang = "en" }: { source: "live" | "demo"; lang?: "en" | "hi" | string }) {
  const hi = lang === "hi"
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{hi ? "मौसम की जानकारी का स्रोत" : "Weather information source"}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {source === "live" ? (hi ? "लाइव उपग्रह, रडार और मौसम मॉडल से प्राप्त रीयल-टाइम सटीक डेटा।" : "Real-time live data from meteorological satellite and radar models.") : (hi ? "डेमो डेटा" : "Demo data")}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
          {hi ? "● लाइव डेटा" : "● Live Data"}
        </span>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">{hi ? "पूर्वानुमान: अगले 24 घंटे + 5 दिन · स्थान: आपके सवाल से पहचाना गया" : "Forecast window: next 24 hours + 5 days · Location: geocoded from your question"}</p>
    </div>
  )
}

export function HourlyCard({ hourly }: { hourly: ForecastPoint[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Next 24 Hours</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {hourly.map((point) => (
          <div key={point.time} className="flex min-w-16 flex-col items-center gap-1.5 rounded-md bg-secondary/60 px-2 py-2 text-center">
            <span className="text-[10px] text-muted-foreground">
              {new Date(point.time * 1000).toLocaleTimeString("en-IN", { hour: "numeric" })}
            </span>
            <WeatherIcon condition={point.condition} className="size-5 text-primary" />
            <span className="font-mono text-sm text-foreground">{point.temp}°</span>
            <span className="flex items-center gap-0.5 text-[10px] text-primary">
              <Droplets className="size-2.5" />{Math.round(point.pop * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ForecastCard({ daily }: { daily: DailyForecast[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">5-Day Forecast</h3>
      <div className="flex flex-col gap-1">
        {daily.map((d) => (
          <div key={d.date} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary/50">
            <span className="w-28 shrink-0 text-sm text-foreground">{dayLabel(d.date)}</span>
            <WeatherIcon condition={d.condition} className="size-5 shrink-0 text-primary" />
            <span className="flex-1 truncate text-xs capitalize text-muted-foreground">{d.description}</span>
            <span className="flex items-center gap-1 text-xs text-primary">
              <Droplets className="size-3" />
              {Math.round(d.pop * 100)}%
            </span>
            <span className="w-16 shrink-0 text-right font-mono text-sm">
              <span className="text-foreground">{d.tempMax}°</span>
              <span className="text-muted-foreground"> / {d.tempMin}°</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const SEVERITY_STYLES: Record<AlertSeverity, { bar: string; badge: string; label: string }> = {
  advisory: { bar: "bg-primary", badge: "bg-primary/15 text-primary", label: "Advisory" },
  watch: { bar: "bg-accent", badge: "bg-accent/15 text-accent", label: "Watch" },
  warning: { bar: "bg-accent", badge: "bg-accent/20 text-accent", label: "Warning" },
  severe: { bar: "bg-destructive", badge: "bg-destructive/20 text-destructive", label: "Severe" },
}

export function AlertCard({ alert }: { alert: WeatherAlert }) {
  const s = SEVERITY_STYLES[alert.severity]
  return (
    <div className="flex overflow-hidden rounded-lg border border-border bg-card">
      <div className={`w-1 shrink-0 ${s.bar}`} aria-hidden="true" />
      <div className="p-3.5">
        <div className="flex items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${s.badge}`}>
            {s.label}
          </span>
          <h4 className="text-sm font-medium text-foreground">{alert.title}</h4>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{alert.description}</p>
      </div>
    </div>
  )
}

export function AirQualityCard({ air }: { air: AirQuality }) {
  const pct = (air.aqi / 5) * 100
  const color = air.aqi <= 2 ? "text-primary" : air.aqi === 3 ? "text-accent" : "text-destructive"
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Air Quality Index</h3>
      <div className="flex items-center justify-between">
        <div>
          <span className={`font-mono text-3xl font-semibold ${color}`}>{air.label}</span>
          <p className="mt-1 text-xs text-muted-foreground">
            PM2.5 {air.pm25} · PM10 {air.pm10} µg/m³
          </p>
        </div>
        <span className="font-mono text-sm text-muted-foreground">AQI {air.aqi}/5</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${air.aqi <= 2 ? "bg-primary" : air.aqi === 3 ? "bg-accent" : "bg-destructive"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function ClimateCard({ climate, location }: { climate: ClimateNormal[]; location: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Climate Normals — {location}
      </h3>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={climate} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} unit="°" />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
            />
            <Line type="monotone" dataKey="avgHigh" name="Avg High" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="avgLow" name="Avg Low" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={climate} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "var(--secondary)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
            />
            <Bar dataKey="rainfall" name="Rainfall (mm)" fill="var(--chart-3)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full" style={{ background: "var(--chart-2)" }} /> Avg High
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full" style={{ background: "var(--chart-1)" }} /> Avg Low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full" style={{ background: "var(--chart-3)" }} /> Rainfall
        </span>
      </div>
    </div>
  )
}

/* ─── Agro Card ─── */
export function AgroCard({ agro }: { agro: AgroPayload }) {
  const { soil, farming, location } = agro

  const moistureColor =
    soil.moisture < 0.15 ? "#dc2626" :
    soil.moisture < 0.28 ? "#f59e0b" :
    soil.moisture < 0.5  ? "#16a34a" : "#2563eb"

  const riskColor =
    farming.cropRisk.startsWith("⚠️") ? "#dc2626" : "#16a34a"

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="size-4 text-emerald-600" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Agro Advisory — {location.name}{location.state ? `, ${location.state}` : ""}
        </h3>
      </div>

      {/* Soil stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-md bg-white/80 p-2.5 border border-emerald-100">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            <Thermometer className="size-3" /> Soil Temp
          </div>
          <div className="mt-0.5 font-mono text-sm">{soil.surfaceTemp}°C</div>
        </div>
        <div className="rounded-md bg-white/80 p-2.5 border border-emerald-100">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            <Droplets className="size-3" /> Moisture
          </div>
          <div className="mt-0.5 font-mono text-sm" style={{ color: moistureColor }}>
            {soil.moistureLabel}
          </div>
        </div>
      </div>

      {/* Advice */}
      <div className="space-y-2">
        <div className="rounded-md bg-white/80 p-2.5 border border-emerald-100">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">🌱 Sowing</p>
          <p className="text-xs leading-5 text-foreground">{farming.sowingAdvice}</p>
        </div>
        <div className="rounded-md bg-white/80 p-2.5 border border-emerald-100">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">💧 Irrigation</p>
          <p className="text-xs leading-5 text-foreground">{farming.irrigationAdvice}</p>
        </div>
        <div className="rounded-md p-2.5 border" style={{ background: `${riskColor}10`, borderColor: `${riskColor}30` }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">🌾 Crop Risk</p>
          <p className="text-xs leading-5" style={{ color: riskColor }}>{farming.cropRisk}</p>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground">Updated: {soil.updatedAt} · Source: Open-Meteo Soil API</p>
    </div>
  )
}

/* ─── Aviation Card ─── */
const CAT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  VFR:  { bg: "#16a34a", text: "#fff", label: "VFR — Visual Flight Rules" },
  MVFR: { bg: "#2563eb", text: "#fff", label: "MVFR — Marginal VFR" },
  IFR:  { bg: "#dc2626", text: "#fff", label: "IFR — Instrument Flight Rules" },
  LIFR: { bg: "#7c3aed", text: "#fff", label: "LIFR — Low IFR" },
}

function windDir(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]
  return dirs[Math.round(deg / 22.5) % 16]
}

export function AviationCard({ aviation }: { aviation: AviationPayload }) {
  const cat = CAT_COLORS[aviation.flightCategory] ?? CAT_COLORS.VFR
  const windKt = Math.round(aviation.windSpeed * 1.944)
  const gustKt = aviation.gusts ? Math.round(aviation.gusts * 1.944) : null

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Plane className="size-4 text-blue-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Aviation Wx — {aviation.location.name}
          </h3>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold tracking-wide"
          style={{ background: cat.bg, color: cat.text }}
        >
          {aviation.flightCategory}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{cat.label}</p>

      <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
        {[
          { icon: Eye,      label: "Visibility",  value: `${aviation.visibility} km` },
          { icon: Gauge,    label: "QNH",          value: `${aviation.qnh} hPa` },
          { icon: Wind,     label: "Wind",         value: `${windDir(aviation.windDeg)} ${windKt}${gustKt ? `G${gustKt}` : ""} kt` },
          { icon: Droplets, label: "Ceiling",      value: `${aviation.ceiling} ft` },
        ].map(s => (
          <div key={s.label} className="rounded-md bg-white/80 p-2.5 border border-blue-100">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              <s.icon className="size-3" />{s.label}
            </div>
            <div className="mt-0.5 font-mono text-sm text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-md bg-white/80 p-2.5 border border-blue-100">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Hazards</p>
        <ul className="space-y-1">
          {aviation.hazards.map((h, i) => (
            <li key={i} className={`text-xs flex items-center gap-1.5 ${
              h.startsWith("No significant") ? "text-emerald-700" : "text-orange-700"
            }`}>
              <span>{h.startsWith("No significant") ? "✅" : "⚠️"}</span> {h}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
        <span>Temp: {aviation.temp}°C · Dew: {aviation.dewPoint}°C</span>
        <span className="text-right">Spread: {aviation.temp - aviation.dewPoint}°C</span>
      </div>
    </div>
  )
}

/* ─── NWP / GFS Model Card ─── */

function fmtModelRun(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-IN", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC"
}

function liColor(li: number): string {
  if (li < -6) return "#dc2626"
  if (li < -3) return "#f59e0b"
  if (li < 0)  return "#ca8a04"
  return "#16a34a"
}
function liLabel(li: number): string {
  if (li < -6) return "Extremely Unstable"
  if (li < -3) return "Moderately Unstable"
  if (li < 0)  return "Slightly Unstable"
  if (li < 2)  return "Neutral"
  return "Stable"
}
function capeLabel(c: number): string {
  if (c === 0) return "No instability"
  if (c < 500)  return "Weak"
  if (c < 2000) return "Moderate"
  if (c < 3500) return "Large"
  return "Extreme"
}

export function NWPCard({ nwp }: { nwp: NWPPayload }) {
  const [selectedModel, setSelectedModel] = useState<"gfs" | "wrf" | "compare">(nwp.activeModel === "wrf" ? "wrf" : "gfs")

  const gfs = nwp.models?.gfs
  const wrf = nwp.models?.wrf

  // Display values according to active selection
  const activeData = selectedModel === "wrf" && wrf ? wrf : gfs ? gfs : nwp

  const surface = [
    { label: "2m Temp",    value: `${activeData.temp2m}°C` },
    { label: "Dew Point",  value: `${activeData.dewPoint}°C` },
    { label: "Humidity",   value: `${activeData.relativeHumidity}%` },
    { label: "Pressure",   value: `${activeData.pressure} hPa` },
    { label: "Wind 10m",   value: `${Math.round(activeData.windSpeed10m * 1.944)} kt` },
    { label: "Gusts",      value: `${Math.round(activeData.windGusts * 1.944)} kt` },
    { label: "24h Precip", value: `${activeData.totalPrecip} mm` },
    { label: "Snow Depth", value: `${(nwp.snowDepth * 100).toFixed(0)} cm` },
  ]

  const upper = [
    { label: "500 hPa GH",   value: `${nwp.geopotentialHeight500} m` },
    { label: "500 hPa Temp", value: `${nwp.temp500}°C` },
    { label: "500 hPa Wind", value: `${Math.round(nwp.windSpeed500 * 1.944)} kt` },
    { label: "Precip Water", value: `${activeData.precipitableWater} kg/m²` },
  ]

  // 72-h chart data with both GFS and WRF overlaid for ensemble comparison
  const chartData = (gfs?.hourly || nwp.hourly).filter((_, i) => i % 3 === 0).map((h, i) => {
    const wrfPoint = wrf?.hourly?.[i * 3]
    return {
      time: new Date(h.time).toLocaleTimeString("en-IN", { hour: "numeric", timeZone: "UTC" }),
      tempGfs: h.temp,
      tempWrf: wrfPoint?.temp ?? h.temp,
      precipGfs: h.precip,
      precipWrf: wrfPoint?.precip ?? h.precip,
      capeGfs: h.cape,
      capeWrf: wrfPoint?.cape ?? h.cape,
    }
  })

  const wis2Up = nwp.wis2.connected

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-purple-800">🛰 Numerical Weather Prediction (NWP)</span>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
              {selectedModel === "wrf" ? "WRF 3km Mesoscale" : selectedModel === "gfs" ? "GFS 0.25° Synoptic" : "GFS vs WRF Multi-Model"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {nwp.location.name}{nwp.location.state ? `, ${nwp.location.state}` : ""} · Model Run: {fmtModelRun(nwp.modelRun)}
          </p>
        </div>

        {/* WIS2.0 MQTT Badge */}
        <div className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold flex flex-col items-end gap-0.5 ${
          wis2Up ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-red-300 bg-red-50 text-red-700"
        }`}>
          <span className="flex items-center gap-1">
            <span className={`inline-block size-1.5 rounded-full animate-pulse ${wis2Up ? "bg-emerald-500" : "bg-red-500"}`} />
            WIS2.0 MQTT {wis2Up ? "LIVE" : "OFFLINE"}
          </span>
          <span className="text-[9px] font-normal opacity-70">{nwp.wis2.latencyMs} ms · {nwp.wis2.signalCount} signals</span>
          <span className="text-[9px] font-normal opacity-60 max-w-[180px] truncate">{nwp.wis2.topic}</span>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-purple-100/70 rounded-lg text-xs font-medium">
        <button
          type="button"
          onClick={() => setSelectedModel("gfs")}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all text-center ${
            selectedModel === "gfs"
              ? "bg-white text-purple-900 font-bold shadow-sm"
              : "text-purple-700 hover:text-purple-900 hover:bg-white/40"
          }`}
        >
          🌐 NOAA GFS (0.25°)
        </button>
        <button
          type="button"
          onClick={() => setSelectedModel("wrf")}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all text-center ${
            selectedModel === "wrf"
              ? "bg-white text-purple-900 font-bold shadow-sm"
              : "text-purple-700 hover:text-purple-900 hover:bg-white/40"
          }`}
        >
          🌪️ WRF-ARW (3km Mesoscale)
        </button>
        <button
          type="button"
          onClick={() => setSelectedModel("compare")}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all text-center ${
            selectedModel === "compare"
              ? "bg-white text-purple-900 font-bold shadow-sm"
              : "text-purple-700 hover:text-purple-900 hover:bg-white/40"
          }`}
        >
          ⚖️ GFS vs WRF Compare
        </button>
      </div>

      {/* Model Physics & Resolution Specs Banner */}
      {selectedModel !== "compare" && (
        <div className="rounded-md bg-white p-2.5 border border-purple-100 text-[11px] flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-purple-900">
              {selectedModel === "wrf" ? "WRF-ARW 3km Regional (IMD/NCAR Core)" : "NOAA GFS 0.25° Seamless (Global)"}:
            </span>{" "}
            <span className="text-muted-foreground">
              {selectedModel === "wrf" ? "3 km Non-Hydrostatic Convective-Permitting" : "28 km Hydrostatic Spectral Synoptic"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-purple-700 font-mono">
            <span>Core: {selectedModel === "wrf" ? "WSM6 Explicit" : "SAS Cumulus"}</span>
            <span>PBL: {selectedModel === "wrf" ? "YSU Non-Local" : "K-Profile"}</span>
          </div>
        </div>
      )}

      {/* Comparison Table View */}
      {selectedModel === "compare" && gfs && wrf && (
        <div className="rounded-md bg-white p-3 border border-purple-100 overflow-x-auto">
          <p className="text-xs font-bold text-purple-900 mb-2 flex items-center justify-between">
            <span>Model Ensemble Comparison Matrix</span>
            <span className="text-[10px] font-normal text-muted-foreground">Global vs High-Res Mesoscale</span>
          </p>
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-purple-100 text-[10px] text-muted-foreground">
                <th className="pb-1.5">Parameter</th>
                <th className="pb-1.5 font-semibold text-purple-700">NOAA GFS (0.25°)</th>
                <th className="pb-1.5 font-semibold text-blue-700">WRF-ARW (3km)</th>
                <th className="pb-1.5">Spread / Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 font-mono text-[11px]">
              <tr>
                <td className="py-1 text-muted-foreground font-sans">Resolution</td>
                <td className="py-1 text-purple-900">~28 km</td>
                <td className="py-1 text-blue-900">3 km (Nested)</td>
                <td className="py-1 text-muted-foreground">High localized detail</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground font-sans">2m Temperature</td>
                <td className="py-1 text-purple-900">{gfs.temp2m}°C</td>
                <td className="py-1 text-blue-900">{wrf.temp2m}°C</td>
                <td className="py-1 text-muted-foreground">{Math.abs(Math.round((wrf.temp2m - gfs.temp2m) * 10) / 10)}°C</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground font-sans">24h Precip</td>
                <td className="py-1 text-purple-900">{gfs.totalPrecip} mm</td>
                <td className="py-1 text-blue-900">{wrf.totalPrecip} mm</td>
                <td className="py-1 text-muted-foreground">{(wrf.totalPrecip - gfs.totalPrecip).toFixed(1)} mm</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground font-sans">CAPE (Instability)</td>
                <td className="py-1 text-purple-900">{gfs.cape} J/kg</td>
                <td className="py-1 text-blue-900">{wrf.cape} J/kg</td>
                <td className="py-1 text-muted-foreground">{wrf.cape - gfs.cape} J/kg</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground font-sans">CIN (Inhibition)</td>
                <td className="py-1 text-purple-900">{gfs.cin} J/kg</td>
                <td className="py-1 text-blue-900">{wrf.cin} J/kg</td>
                <td className="py-1 text-muted-foreground">Cap strength</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground font-sans">10m Wind Speed</td>
                <td className="py-1 text-purple-900">{gfs.windSpeed10m} m/s</td>
                <td className="py-1 text-blue-900">{wrf.windSpeed10m} m/s</td>
                <td className="py-1 text-muted-foreground">{(wrf.windSpeed10m - gfs.windSpeed10m).toFixed(1)} m/s</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Instability Diagnostics: CAPE + Lifted Index + CIN */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md bg-white p-2.5 border border-purple-100">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">
            CAPE (J/kg)
          </p>
          <p className="font-mono text-lg font-bold text-foreground">{activeData.cape}</p>
          <p className="text-[10px] mt-0.5" style={{ color: liColor(activeData.liftedIndex) }}>
            {capeLabel(activeData.cape)}
          </p>
        </div>

        <div className="rounded-md bg-white p-2.5 border border-purple-100">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">
            Lifted Index
          </p>
          <p className="font-mono text-lg font-bold" style={{ color: liColor(activeData.liftedIndex) }}>
            {activeData.liftedIndex > 0 ? "+" : ""}{activeData.liftedIndex}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: liColor(activeData.liftedIndex) }}>
            {liLabel(activeData.liftedIndex)}
          </p>
        </div>

        <div className="rounded-md bg-white p-2.5 border border-purple-100">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">
            CIN (Inhibition)
          </p>
          <p className="font-mono text-lg font-bold text-foreground">{activeData.cin ?? 35} <span className="text-xs font-normal text-muted-foreground">J/kg</span></p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {(activeData.cin ?? 35) > 50 ? "Strong Cap" : (activeData.cin ?? 35) > 20 ? "Moderate Cap" : "Weak Cap"}
          </p>
        </div>
      </div>

      {/* Surface variables */}
      <div>
        <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">
          Surface Layer ({selectedModel === "wrf" ? "WRF 3km" : "GFS 0.25°"})
        </p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {surface.map(s => (
            <div key={s.label} className="rounded-md bg-white px-2.5 py-2 border border-purple-100">
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="font-mono text-sm text-foreground mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upper air 500 hPa */}
      <div>
        <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">Upper Air (500 hPa)</p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {upper.map(s => (
            <div key={s.label} className="rounded-md bg-white px-2.5 py-2 border border-purple-100">
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="font-mono text-sm text-foreground mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 72-hour forecast chart with GFS vs WRF multi-model curves */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
            72-Hour Temperature Prediction Grid
          </p>
          <div className="flex items-center gap-3 text-[10px] font-semibold">
            <span className="flex items-center gap-1 text-purple-700">
              <span className="inline-block w-2.5 h-0.5 bg-[#7c3aed] rounded-full" /> GFS
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <span className="inline-block w-2.5 h-0.5 bg-[#0284c7] rounded-full" /> WRF
            </span>
          </div>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} unit="°" />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
              />
              <Line type="monotone" dataKey="tempGfs" name="GFS Temp (°C)" stroke="#7c3aed" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tempWrf" name="WRF Temp (°C)" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 72-hour precipitation multi-model */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
            72-Hour Precipitation (mm)
          </p>
          <div className="flex items-center gap-3 text-[10px] font-semibold">
            <span className="flex items-center gap-1 text-purple-700">
              <span className="inline-block w-2 h-2 bg-[#7c3aed] rounded-sm" /> GFS
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <span className="inline-block w-2 h-2 bg-[#0284c7] rounded-sm" /> WRF
            </span>
          </div>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "var(--secondary)" }}
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="precipGfs" name="GFS Precip (mm)" fill="#7c3aed" radius={[2, 2, 0, 0]} />
              <Bar dataKey="precipWrf" name="WRF Precip (mm)" fill="#0284c7" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        NWP Models: NOAA GFS 0.25° & IMD/NCAR WRF-ARW 3km Mesoscale · Global WIS2.0 MQTT topic: {nwp.wis2.topic}
      </p>
    </div>
  )
}

/* ─── Marine & Coastal Fisheries Weather Card ─── */
export function MarineCard({ marine }: { marine: MarinePayload }) {
  const isDanger = marine.fishermanWarning.level === "danger"
  const isCaution = marine.fishermanWarning.level === "caution"

  const seaMetrics = [
    { label: "Significant Wave", value: `${marine.waveHeight} m` },
    { label: "Wave Period",      value: `${marine.wavePeriod} s` },
    { label: "Swell Height",     value: `${marine.swellHeight} m` },
    { label: "Swell Period",     value: `${marine.swellPeriod} s` },
    { label: "Sea Surface Temp", value: `${marine.seaSurfaceTemp}°C` },
    { label: "Beaufort Force",   value: `F-${marine.beaufortScale} (${marine.beaufortDescription})` },
    { label: "Tidal Phase",      value: marine.tidalStatus },
    { label: "Wave Direction",   value: `${marine.waveDirection}°` },
  ]

  const chartData = (marine.hourly || []).slice(0, 16).map(h => ({
    time: new Date(h.time).toLocaleTimeString("en-IN", { hour: "numeric", timeZone: "UTC" }),
    wave: h.waveHeight,
    period: h.wavePeriod,
  }))

  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50/40 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-cyan-900">🌊 Marine & Coastal Weather</span>
            <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-800 border border-cyan-200">
              {marine.seaState}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {marine.location.name}{marine.location.state ? `, ${marine.location.state}` : ""} · Coastal & Fisheries Sector
          </p>
        </div>

        <div className="rounded-md border border-cyan-200 bg-white px-3 py-1 text-right">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Sea Temp</p>
          <p className="font-mono text-sm font-bold text-cyan-900">{marine.seaSurfaceTemp}°C</p>
        </div>
      </div>

      {/* Fisherman Safety Advisory Banner */}
      <div className={`rounded-md p-3 border ${
        isDanger
          ? "border-red-300 bg-red-50 text-red-900"
          : isCaution
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-emerald-300 bg-emerald-50 text-emerald-900"
      }`}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <span>{isDanger ? "🚨 DANGER: GALE / ROUGH SEA ADVISORY" : isCaution ? "⚠️ CAUTION: MODERATE SEA ADVISORY" : "✅ SAFE: FISHING OPERATIONS PERMITTED"}</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-current">
            Max Distance: {marine.fishermanWarning.maxOffshoreDistanceKm} km
          </span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">{marine.fishermanWarning.message}</p>
      </div>

      {/* Primary Oceanographic Parameters */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {seaMetrics.map(m => (
          <div key={m.label} className="rounded-md bg-white px-2.5 py-2 border border-cyan-100">
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
            <p className="font-mono text-sm text-foreground mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      {/* 24-Hour Wave Height Forecast Chart */}
      <div>
        <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">
          Wave Height Forecast (Meters)
        </p>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} unit="m" />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
              />
              <Line type="monotone" dataKey="wave" name="Wave Height (m)" stroke="#0891b2" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Source: WMO Marine Weather Code 3700 & Open-Meteo Marine Global Model
      </p>
    </div>
  )
}

/* ─── Smart City Weather Monitoring & Urban Planning Card ─── */
export function UrbanCard({ urban }: { urban: UrbanPayload }) {
  const isFloodCritical = urban.drainageVulnerability === "Critical Flash Flood Risk" || urban.drainageVulnerability === "High"

  return (
    <div className="rounded-lg border border-slate-300 bg-slate-50/70 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">🏙️ Smart City Weather & Urban Planning</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
              Urban Resilience
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {urban.location.name}{urban.location.state ? `, ${urban.location.state}` : ""} · Municipal Catchment & Infrastructure
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-1 text-right">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">UHI Index</p>
          <p className="font-mono text-sm font-bold text-amber-600">+{urban.urbanHeatIslandDelta}°C Excess</p>
        </div>
      </div>

      {/* Urban Heat Island & Drainage Alert */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {/* Drainage / Waterlogging Vulnerability */}
        <div className={`rounded-md p-3 border ${
          isFloodCritical
            ? "border-red-300 bg-red-50 text-red-950"
            : "border-amber-200 bg-amber-50 text-amber-950"
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">Drainage & Inundation</span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/80 border border-current">
              {urban.drainageVulnerability}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">High-Risk Waterlogging Hotspots:</p>
          <ul className="mt-1 space-y-0.5 text-[11px]">
            {urban.waterloggingHotspots.slice(0, 3).map((h, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="text-red-500 font-bold">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Thermal Comfort UTCI & Outdoor Labor */}
        <div className="rounded-md p-3 border border-slate-200 bg-white text-slate-900">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">Outdoor Thermal Comfort (UTCI)</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
              {urban.thermalComfortCategory}
            </span>
          </div>
          <p className="font-mono text-lg font-bold mt-1">{urban.thermalComfortUTCI}°C <span className="text-[11px] font-normal text-muted-foreground">feel</span></p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Pedestrian and outdoor construction work stress index.
          </p>
        </div>
      </div>

      {/* Construction Clearance & Smog Ventilation */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-md p-2.5 border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-muted-foreground">Construction / Crane Clearance</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              urban.constructionClearance.status.startsWith("Approved")
                ? "bg-emerald-100 text-emerald-800"
                : urban.constructionClearance.status.startsWith("Caution")
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
            }`}>
              {urban.constructionClearance.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">{urban.constructionClearance.reason}</p>
        </div>

        <div className="rounded-md p-2.5 border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-muted-foreground">Smog Ventilation Coefficient</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {urban.dispersionCategory}
            </span>
          </div>
          <p className="font-mono text-sm font-bold text-slate-800">{urban.ventilationCoefficient} <span className="text-[10px] font-normal text-muted-foreground">m²/s</span></p>
          <p className="text-[10px] text-muted-foreground">Rate of vehicular and industrial emissions clearance.</p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Data: Municipal Urban Heat Island Model & Runoff Impervious Surface Coefficient
      </p>
    </div>
  )
}

/* ── Flood & Cyclone Disaster Early Warning Dissemination Card ── */
export function DisasterCard({ disaster }: { disaster: DisasterPayload }) {
  const alertStyles = {
    Red: {
      bg: "bg-red-50",
      border: "border-red-300",
      badge: "bg-red-600 text-white",
      heading: "text-red-950",
      bar: "bg-red-600",
      pulse: "bg-red-500",
    },
    Orange: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      badge: "bg-amber-500 text-white",
      heading: "text-amber-950",
      bar: "bg-amber-500",
      pulse: "bg-amber-400",
    },
    Yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      badge: "bg-yellow-500 text-slate-900",
      heading: "text-yellow-950",
      bar: "bg-yellow-400",
      pulse: "bg-yellow-400",
    },
    Green: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      badge: "bg-emerald-600 text-white",
      heading: "text-emerald-950",
      bar: "bg-emerald-500",
      pulse: "bg-emerald-400",
    },
  }[disaster.colorAlert]

  return (
    <div className={`rounded-xl border ${alertStyles.border} ${alertStyles.bg} p-4 text-card-foreground shadow-sm space-y-3.5`}>
      {/* Header: Location & Official IMD Alert Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 text-slate-800">
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                IMD & NDMA Disaster Early Warning
              </span>
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${alertStyles.pulse} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${alertStyles.bar}`}></span>
              </span>
            </div>
            <h3 className={`text-base font-bold ${alertStyles.heading}`}>
              {disaster.location.name} {disaster.location.state ? `(${disaster.location.state})` : ""}
            </h3>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${alertStyles.badge}`}>
          {disaster.colorAlert} Alert
        </span>
      </div>

      {/* Action Directive Banner */}
      <div className="rounded-lg bg-white/90 p-3 border border-black/5 shadow-xs">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-900">{disaster.colorAlertTitle}</p>
            <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{disaster.actionDirective}</p>
          </div>
        </div>
      </div>

      {/* 2-Column: Cyclone Tracking + River Basin Flood Inundation */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Cyclone Status */}
        <div className="rounded-lg bg-white/90 p-3 border border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              🌀 Tropical Cyclone Status
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {disaster.cycloneStatus.category}
            </span>
          </div>
          {disaster.cycloneStatus.systemName && (
            <p className="text-xs font-semibold text-slate-800">{disaster.cycloneStatus.systemName}</p>
          )}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
            <div className="rounded bg-slate-50 p-1.5 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Sustained</span>
              <span className="text-xs font-bold text-slate-800">{disaster.cycloneStatus.maxSustainedWindKmph} km/h</span>
            </div>
            <div className="rounded bg-slate-50 p-1.5 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Gusts</span>
              <span className="text-xs font-bold text-red-700">{disaster.cycloneStatus.gustsKmph} km/h</span>
            </div>
            <div className="rounded bg-slate-50 p-1.5 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Storm Surge</span>
              <span className="text-xs font-bold text-blue-700">{disaster.cycloneStatus.stormSurgeMeters} m</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            <strong>Landfall:</strong> {disaster.cycloneStatus.estimatedLandfall}
          </p>
        </div>

        {/* River Basin Flood Risk */}
        <div className="rounded-lg bg-white/90 p-3 border border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              🌊 River Basin & Flood Risk
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              disaster.floodRisk.waterLevelStatus === "Above Danger Mark"
                ? "bg-red-100 text-red-800 font-bold"
                : "bg-emerald-100 text-emerald-800"
            }`}>
              {disaster.floodRisk.waterLevelStatus}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800">{disaster.floodRisk.basinName}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Inundation Probability:</span>
              <span className="font-bold text-slate-900">{disaster.floodRisk.inundationProbabilityPct}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${disaster.floodRisk.inundationProbabilityPct > 70 ? "bg-red-600" : disaster.floodRisk.inundationProbabilityPct > 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${disaster.floodRisk.inundationProbabilityPct}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-600">
            <strong>Critical Zones:</strong> {disaster.floodRisk.criticalBlocks.join(", ")}
          </p>
        </div>
      </div>

      {/* Safety & Evacuation Checklist */}
      <div className="rounded-lg bg-white/90 p-3 border border-black/5 shadow-xs">
        <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
          <span>📋</span> NDMA Citizen Safety & Evacuation Protocol:
        </h4>
        <ul className="space-y-1 text-xs text-slate-700">
          {disaster.safetyChecklist.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 24x7 Emergency Helpline Fast Dials */}
      <div className="rounded-lg bg-white/95 p-2.5 border border-black/5 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
          📞 24x7 Official Emergency Helplines (Tap to Call)
        </span>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <a
            href={`tel:${disaster.emergencyHelplines.ndma}`}
            className="flex items-center justify-center gap-1 rounded bg-red-600 py-1.5 px-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition"
          >
            <PhoneCall className="h-3 w-3" /> NDMA {disaster.emergencyHelplines.ndma}
          </a>
          <a
            href={`tel:${disaster.emergencyHelplines.stateEmergency}`}
            className="flex items-center justify-center gap-1 rounded bg-amber-600 py-1.5 px-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
          >
            <PhoneCall className="h-3 w-3" /> State {disaster.emergencyHelplines.stateEmergency}
          </a>
          <a
            href={`tel:${disaster.emergencyHelplines.coastGuard}`}
            className="flex items-center justify-center gap-1 rounded bg-blue-600 py-1.5 px-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <PhoneCall className="h-3 w-3" /> Coast Guard {disaster.emergencyHelplines.coastGuard}
          </a>
          <a
            href={`tel:${disaster.emergencyHelplines.ambulance}`}
            className="flex items-center justify-center gap-1 rounded bg-emerald-600 py-1.5 px-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
          >
            <PhoneCall className="h-3 w-3" /> Ambulance {disaster.emergencyHelplines.ambulance}
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>Source: IMD Radar Bulletin & Central Water Commission (CWC)</span>
        <span>Standard Operating Procedure (NDMA Guidelines)</span>
      </div>
    </div>
  )
}


