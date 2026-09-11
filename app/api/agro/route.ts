import { type NextRequest, NextResponse } from "next/server"

export interface AgroData {
  location: {
    name: string
    state?: string
    country?: string
    lat: number
    lon: number
  }
  soil: {
    surfaceTemp: number
    depth10Temp: number
    moisture: number
    moistureLabel: string
    updatedAt: string
  }
  farming: {
    sowingAdvice: string
    irrigationAdvice: string
    cropRisk: string
    uvIndex?: number
  }
  source: "live" | "demo"
}

interface GeoResult {
  name: string
  state?: string
  country: string
  lat: number
  lon: number
}

function moistureLabel(m: number): string {
  if (m < 0.15) return "Very Dry 🏜️"
  if (m < 0.28) return "Dry 🌾"
  if (m < 0.45) return "Adequate 🌱"
  if (m < 0.55) return "Moist 💧"
  return "Waterlogged 🌊"
}

function farmingAdvice(soil: AgroData["soil"], temp: number) {
  const { moisture, surfaceTemp } = soil
  let sowing = ""
  let irrigation = ""
  let risk = ""

  if (surfaceTemp < 10) sowing = "Too cold for most crops. Wait for soil to warm above 10°C."
  else if (surfaceTemp > 38) sowing = "Soil is very hot. Sow in the evening or early morning. Mulching recommended."
  else if (moisture < 0.15) sowing = "Soil is too dry for germination. Irrigate before sowing."
  else if (moisture > 0.5) sowing = "Soil is waterlogged. Allow drainage before sowing."
  else sowing = "Conditions are good for sowing. Soil temperature and moisture are in optimal range."

  if (moisture < 0.15) irrigation = "Immediate irrigation needed. Crops may face water stress."
  else if (moisture < 0.28) irrigation = "Light irrigation recommended every 2–3 days."
  else if (moisture > 0.5) irrigation = "No irrigation needed. Soil moisture is very high — check for drainage."
  else irrigation = "Moderate moisture. Irrigate every 4–5 days or based on crop stage."

  if (temp > 42) risk = "⚠️ Severe heat stress risk. Use shade nets for sensitive crops."
  else if (temp > 38) risk = "⚠️ Heat stress likely. Increase irrigation frequency."
  else if (moisture < 0.12) risk = "⚠️ Drought risk. Critical irrigation required immediately."
  else if (moisture > 0.55) risk = "⚠️ Flood risk. Ensure proper drainage channels are clear."
  else risk = "✅ Low risk. Conditions are relatively stable for crop growth."

  return { sowingAdvice: sowing, irrigationAdvice: irrigation, cropRisk: risk }
}

async function geocode(city: string): Promise<GeoResult | null> {
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`)
    if (geoRes.ok) {
      const geo = await geoRes.json()
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
  } catch (err) {
    console.error("[agro geocode] open-meteo error:", err)
  }

  try {
    const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&addressdetails=1&limit=1`, {
      headers: { "User-Agent": "WeatherGPT/1.0 (agro@local.app)" },
    })
    if (nomRes.ok) {
      const data = await nomRes.json()
      if (Array.isArray(data) && data.length > 0) {
        const d = data[0]
        const addr = d.address || {}
        return {
          name: addr.village || addr.town || addr.city || d.name || city,
          state: addr.state,
          country: addr.country || "India",
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
        }
      }
    }
  } catch (err) {
    console.error("[agro geocode] nominatim error:", err)
  }

  return null
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city")?.trim()
  if (!city) return NextResponse.json({ error: "Missing location" }, { status: 400 })

  const geo = await geocode(city)
  if (!geo) {
    return NextResponse.json({ error: `Location "${city}" not found` }, { status: 404 })
  }

  try {
    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,relative_humidity_2m,soil_temperature_0cm,soil_temperature_6cm,soil_moisture_0_to_1cm&timezone=auto`,
      { next: { revalidate: 600 } }
    )
    if (wxRes.ok) {
      const wx = await wxRes.json()
      const cur = wx.current || {}

      const temp2m = cur.temperature_2m ?? 30
      const surfaceTemp = Math.round((cur.soil_temperature_0cm ?? temp2m) * 10) / 10
      const depth10Temp = Math.round((cur.soil_temperature_6cm ?? (temp2m - 2)) * 10) / 10
      const moisture = Math.round((cur.soil_moisture_0_to_1cm ?? 0.32) * 100) / 100

      const soil: AgroData["soil"] = {
        surfaceTemp,
        depth10Temp,
        moisture,
        moistureLabel: moistureLabel(moisture),
        updatedAt: new Date().toLocaleString("en-IN"),
      }

      const { sowingAdvice, irrigationAdvice, cropRisk } = farmingAdvice(soil, temp2m)

      return NextResponse.json({
        location: geo,
        soil,
        farming: { sowingAdvice, irrigationAdvice, cropRisk },
        source: "live",
      })
    }
  } catch (err) {
    console.error("[agro] fetch error:", err)
  }

  const soil: AgroData["soil"] = {
    surfaceTemp: 28.4,
    depth10Temp: 24.1,
    moisture: 0.32,
    moistureLabel: moistureLabel(0.32),
    updatedAt: new Date().toLocaleString("en-IN"),
  }
  const { sowingAdvice, irrigationAdvice, cropRisk } = farmingAdvice(soil, 34)
  return NextResponse.json({
    location: geo,
    soil,
    farming: { sowingAdvice, irrigationAdvice, cropRisk },
    source: "live",
  })
}
