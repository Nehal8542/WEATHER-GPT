import { type NextRequest, NextResponse } from "next/server"
import type { AviationPayload, GeoLocation } from "@/lib/weather-types"

async function geocode(city: string): Promise<GeoLocation | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`
    )
    if (res.ok) {
      const geo = await res.json()
      if (Array.isArray(geo.results) && geo.results.length > 0) {
        const inResults = geo.results.filter((r: { country_code?: string }) => r.country_code === "IN")
        const best = inResults.length > 0 ? inResults[0] : geo.results[0]
        return {
          name: best.name,
          state: best.admin1,
          country: best.country || "India",
          lat: best.latitude,
          lon: best.longitude,
        }
      }
    }
  } catch { /* fallthrough */ }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&addressdetails=1&limit=1`,
      { headers: { "User-Agent": "WeatherGPT/1.0 (aviation@local.app)" } }
    )
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const d = data[0]; const addr = d.address || {}
        return {
          name: addr.city || addr.town || addr.village || d.name || city,
          state: addr.state,
          country: addr.country || "India",
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
        }
      }
    }
  } catch { /* fallthrough */ }

  return null
}

function flightCategory(visibility: number, ceiling: number): AviationPayload["flightCategory"] {
  // Standard ICAO/FAA flight category rules
  if (ceiling < 200 || visibility < 0.8) return "LIFR"
  if (ceiling < 1000 || visibility < 3)   return "IFR"
  if (ceiling < 3000 || visibility < 8)   return "MVFR"
  return "VFR"
}

function deriveHazards(
  windSpeed: number,
  gusts: number,
  visibility: number,
  ceiling: number,
  temp: number,
  dewPoint: number
): string[] {
  const hazards: string[] = []
  if (windSpeed > 15) hazards.push(`Strong surface winds ${Math.round(windSpeed * 1.944)} kt`)
  if (gusts - windSpeed > 10) hazards.push(`Wind gusts — shear possible (${Math.round(gusts * 1.944)} kt)`)
  if (visibility < 5) hazards.push(`Low visibility ${visibility.toFixed(1)} km`)
  if (ceiling < 600) hazards.push(`Low ceiling ${Math.round(ceiling)} ft`)
  if (temp - dewPoint < 3) hazards.push("High fog/mist risk (temp/dew spread < 3°C)")
  if (temp < 2) hazards.push("Structural icing risk — check SIGMET")
  return hazards.length > 0 ? hazards : ["No significant aviation hazards"]
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city")?.trim()
  if (!city) return NextResponse.json({ error: "Missing location" }, { status: 400 })

  const geo = await geocode(city)
  if (!geo) return NextResponse.json({ error: `Location "${city}" not found` }, { status: 404 })

  try {
    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}` +
      `&current=temperature_2m,dew_point_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,visibility,cloud_cover` +
      `&hourly=cloud_cover_low,visibility` +
      `&timezone=auto`,
      { next: { revalidate: 600 } }
    )

    if (wxRes.ok) {
      const wx = await wxRes.json()
      const cur = wx.current || {}

      const windSpeed = (cur.wind_speed_10m ?? 10) / 3.6          // km/h → m/s
      const gusts     = (cur.wind_gusts_10m ?? cur.wind_speed_10m ?? 12) / 3.6
      const temp      = cur.temperature_2m ?? 25
      const dewPoint  = cur.dew_point_2m ?? (temp - 5)
      const visKm     = Math.min((cur.visibility ?? 10000) / 1000, 10)
      const cloudPct  = cur.cloud_cover ?? 20

      // Estimate ceiling from cloud cover (rough approximation)
      // Cloud base (feet) ≈ (T - Td) × 400  (Td = dew point)
      const spreadCeiling = Math.max((temp - dewPoint) * 400, 300)
      const coverCeiling  = cloudPct > 70 ? spreadCeiling : 5000
      const ceiling       = Math.min(spreadCeiling, coverCeiling)

      const cat = flightCategory(visKm, ceiling)
      const hazards = deriveHazards(windSpeed, gusts, visKm, ceiling, temp, dewPoint)

      const payload: AviationPayload = {
        location: geo,
        ceiling: Math.round(ceiling),
        visibility: Math.round(visKm * 10) / 10,
        windSpeed: Math.round(windSpeed * 10) / 10,
        windDeg: cur.wind_direction_10m ?? 0,
        gusts: Math.round(gusts * 10) / 10,
        temp: Math.round(temp),
        dewPoint: Math.round(dewPoint),
        qnh: Math.round(cur.surface_pressure ?? 1013),
        condition: cloudPct < 25 ? "Clear" : cloudPct < 50 ? "Few" : cloudPct < 75 ? "Scattered" : "Overcast",
        flightCategory: cat,
        hazards,
        source: "live",
      }

      return NextResponse.json(payload)
    }
  } catch (err) {
    console.error("[aviation] fetch error:", err)
  }

  // Demo fallback
  const payload: AviationPayload = {
    location: geo,
    ceiling: 3500,
    visibility: 8,
    windSpeed: 5.5,
    windDeg: 270,
    gusts: 9,
    temp: 27,
    dewPoint: 21,
    qnh: 1012,
    condition: "Few",
    flightCategory: "VFR",
    hazards: ["No significant aviation hazards"],
    source: "demo",
  }
  return NextResponse.json(payload)
}
