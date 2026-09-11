import { type NextRequest, NextResponse } from "next/server"
import { getClimateNormals } from "@/lib/climate-data"
import type {
  AirQuality,
  CurrentWeather,
  DailyForecast,
  ForecastPoint,
  GeoLocation,
  WeatherAlert,
  WeatherPayload,
} from "@/lib/weather-types"

const AQI_LABELS = ["Good", "Fair", "Moderate", "Poor", "Very Poor"]

/* ── Known Indian States for instant precise resolution ── */
const STATE_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  "bihar": { lat: 25.0961, lon: 85.3131, name: "Bihar" },
  "uttar pradesh": { lat: 26.8467, lon: 80.9462, name: "Uttar Pradesh" },
  "madhya pradesh": { lat: 22.9734, lon: 78.6569, name: "Madhya Pradesh" },
  "maharashtra": { lat: 19.7515, lon: 75.7139, name: "Maharashtra" },
  "rajasthan": { lat: 27.0238, lon: 74.2179, name: "Rajasthan" },
  "gujarat": { lat: 22.2587, lon: 71.1924, name: "Gujarat" },
  "karnataka": { lat: 15.3173, lon: 75.7139, name: "Karnataka" },
  "tamil nadu": { lat: 11.1271, lon: 78.6569, name: "Tamil Nadu" },
  "kerala": { lat: 10.8505, lon: 76.2711, name: "Kerala" },
  "punjab": { lat: 31.1471, lon: 75.3412, name: "Punjab" },
  "haryana": { lat: 29.0588, lon: 76.0856, name: "Haryana" },
  "west bengal": { lat: 22.9868, lon: 87.8550, name: "West Bengal" },
  "odisha": { lat: 20.9517, lon: 85.0985, name: "Odisha" },
  "telangana": { lat: 18.1124, lon: 79.0193, name: "Telangana" },
  "andhra pradesh": { lat: 15.9129, lon: 79.7400, name: "Andhra Pradesh" },
  "jharkhand": { lat: 23.6102, lon: 85.2799, name: "Jharkhand" },
  "chhattisgarh": { lat: 21.2787, lon: 81.8661, name: "Chhattisgarh" },
  "uttarakhand": { lat: 30.0668, lon: 79.0193, name: "Uttarakhand" },
  "himachal pradesh": { lat: 31.1048, lon: 77.1734, name: "Himachal Pradesh" },
  "assam": { lat: 26.2006, lon: 92.9376, name: "Assam" },
  "goa": { lat: 15.2993, lon: 74.1240, name: "Goa" },
  "delhi": { lat: 28.6139, lon: 77.2090, name: "Delhi" },
  "jammu and kashmir": { lat: 33.7782, lon: 76.5762, name: "Jammu and Kashmir" },
  "ladakh": { lat: 34.1526, lon: 77.5771, name: "Ladakh" },
}

/* ── WMO Code to weather conditions & icons ── */
function mapWmoCode(code: number): { condition: string; description: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: "Clear", description: "clear sky", icon: "01d" }
    case 1:
      return { condition: "Clear", description: "mainly clear", icon: "02d" }
    case 2:
      return { condition: "Clouds", description: "partly cloudy", icon: "03d" }
    case 3:
      return { condition: "Clouds", description: "overcast", icon: "04d" }
    case 45:
    case 48:
      return { condition: "Fog", description: "foggy", icon: "50d" }
    case 51:
    case 53:
    case 55:
      return { condition: "Drizzle", description: "light drizzle", icon: "09d" }
    case 56:
    case 57:
      return { condition: "Drizzle", description: "freezing drizzle", icon: "09d" }
    case 61:
      return { condition: "Rain", description: "slight rain", icon: "10d" }
    case 63:
      return { condition: "Rain", description: "moderate rain", icon: "10d" }
    case 65:
      return { condition: "Rain", description: "heavy rain", icon: "10d" }
    case 66:
    case 67:
      return { condition: "Rain", description: "freezing rain", icon: "10d" }
    case 71:
    case 73:
    case 75:
    case 77:
      return { condition: "Snow", description: "snowfall", icon: "13d" }
    case 80:
    case 81:
    case 82:
      return { condition: "Rain", description: "rain showers", icon: "09d" }
    case 85:
    case 86:
      return { condition: "Snow", description: "snow showers", icon: "13d" }
    case 95:
      return { condition: "Thunderstorm", description: "thunderstorm", icon: "11d" }
    case 96:
    case 99:
      return { condition: "Thunderstorm", description: "thunderstorm with hail", icon: "11d" }
    default:
      return { condition: "Clouds", description: "scattered clouds", icon: "03d" }
  }
}

function deriveAlerts(current: CurrentWeather, daily: DailyForecast[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = []

  if (current.temp >= 45 || daily.some((d) => d.tempMax >= 45)) {
    alerts.push({
      id: "heat-severe",
      title: "Severe Heat Wave Warning",
      severity: "severe",
      event: "Heat Wave",
      description:
        "Temperatures exceeding 45°C expected. Avoid outdoor exposure between 11 AM and 4 PM, stay hydrated, and check on vulnerable people.",
    })
  } else if (current.temp >= 40 || daily.some((d) => d.tempMax >= 40)) {
    alerts.push({
      id: "heat-warning",
      title: "Heat Wave Warning",
      severity: "warning",
      event: "Heat Wave",
      description: "High temperatures around 40°C. Limit strenuous outdoor activity and stay hydrated.",
    })
  }

  const maxPop = Math.max(...daily.map((d) => d.pop))
  if ((current.rain1h ?? 0) >= 15) {
    alerts.push({
      id: "rain-heavy",
      title: "Heavy Rainfall Warning",
      severity: "warning",
      event: "Heavy Rain",
      description:
        "Intense rainfall reported. Risk of waterlogging and localized flooding in low-lying areas. Avoid unnecessary travel.",
    })
  } else if (maxPop >= 0.7 || (current.rain1h ?? 0) > 0) {
    alerts.push({
      id: "rain-advisory",
      title: "Rainfall Advisory",
      severity: "advisory",
      event: "Rain",
      description: "High probability of rain over the coming days. Carry rain protection and plan travel accordingly.",
    })
  }

  if (current.windSpeed >= 17) {
    alerts.push({
      id: "wind-warning",
      title: "High Wind Warning",
      severity: "warning",
      event: "High Winds",
      description: "Strong winds above 60 km/h expected. Secure loose objects and avoid coastal or open areas.",
    })
  }

  const c = current.condition.toLowerCase()
  if (c.includes("thunder")) {
    alerts.push({
      id: "storm-watch",
      title: "Thunderstorm Watch",
      severity: "watch",
      event: "Thunderstorm",
      description: "Thunderstorm activity in the area. Seek shelter indoors and stay away from tall isolated objects.",
    })
  }

  return alerts
}

/* ── Famous Indian Landmarks & Monument Coordinates ── */
const INDIAN_LANDMARKS: Record<string, { name: string; state: string; lat: number; lon: number }> = {
  "lal qila": { name: "Delhi (Red Fort)", state: "Delhi", lat: 28.6562, lon: 77.2410 },
  "lal kila": { name: "Delhi (Red Fort)", state: "Delhi", lat: 28.6562, lon: 77.2410 },
  "lal quila": { name: "Delhi (Red Fort)", state: "Delhi", lat: 28.6562, lon: 77.2410 },
  "red fort": { name: "Delhi (Red Fort)", state: "Delhi", lat: 28.6562, lon: 77.2410 },
  "redfort": { name: "Delhi (Red Fort)", state: "Delhi", lat: 28.6562, lon: 77.2410 },
  "लाल किला": { name: "Delhi (Red Fort)", state: "Delhi", lat: 28.6562, lon: 77.2410 },
  "लालकिला": { name: "Delhi (Red Fort)", state: "Delhi", lat: 28.6562, lon: 77.2410 },
  "qila": { name: "Delhi (Red Fort)", state: "Delhi", lat: 28.6562, lon: 77.2410 },
  "kila": { name: "Delhi (Red Fort)", state: "Delhi", lat: 28.6562, lon: 77.2410 },
  "india gate": { name: "Delhi (India Gate)", state: "Delhi", lat: 28.6129, lon: 77.2295 },
  "इंडिया गेट": { name: "Delhi (India Gate)", state: "Delhi", lat: 28.6129, lon: 77.2295 },
  "qutub minar": { name: "Delhi (Qutub Minar)", state: "Delhi", lat: 28.5245, lon: 77.1855 },
  "qutab minar": { name: "Delhi (Qutub Minar)", state: "Delhi", lat: 28.5245, lon: 77.1855 },
  "कुतुब मीनार": { name: "Delhi (Qutub Minar)", state: "Delhi", lat: 28.5245, lon: 77.1855 },
  "chandni chowk": { name: "Delhi (Chandni Chowk)", state: "Delhi", lat: 28.6506, lon: 77.2303 },
  "connaught place": { name: "Delhi (Connaught Place)", state: "Delhi", lat: 28.6315, lon: 77.2167 },
  "taj mahal": { name: "Agra (Taj Mahal)", state: "Uttar Pradesh", lat: 27.1751, lon: 78.0421 },
  "tajmahal": { name: "Agra (Taj Mahal)", state: "Uttar Pradesh", lat: 27.1751, lon: 78.0421 },
  "ताज महल": { name: "Agra (Taj Mahal)", state: "Uttar Pradesh", lat: 27.1751, lon: 78.0421 },
  "gateway of india": { name: "Mumbai (Gateway of India)", state: "Maharashtra", lat: 18.9220, lon: 72.8347 },
  "marine drive": { name: "Mumbai (Marine Drive)", state: "Maharashtra", lat: 18.9432, lon: 72.8230 },
  "golden temple": { name: "Amritsar (Golden Temple)", state: "Punjab", lat: 31.6200, lon: 74.8765 },
  "स्वर्ण मंदिर": { name: "Amritsar (Golden Temple)", state: "Punjab", lat: 31.6200, lon: 74.8765 },
  "howrah bridge": { name: "Kolkata (Howrah Bridge)", state: "West Bengal", lat: 22.5851, lon: 88.3468 },
  "charminar": { name: "Hyderabad (Charminar)", state: "Telangana", lat: 17.3616, lon: 78.4747 },
  "चारमीनार": { name: "Hyderabad (Charminar)", state: "Telangana", lat: 17.3616, lon: 78.4747 },
  "hawa mahal": { name: "Jaipur (Hawa Mahal)", state: "Rajasthan", lat: 26.9239, lon: 75.8267 },
  "ram mandir": { name: "Ayodhya (Ram Mandir)", state: "Uttar Pradesh", lat: 26.7922, lon: 82.1998 },
  "राम मंदिर": { name: "Ayodhya (Ram Mandir)", state: "Uttar Pradesh", lat: 26.7922, lon: 82.1998 },
  "kashi vishwanath": { name: "Varanasi (Kashi)", state: "Uttar Pradesh", lat: 25.3109, lon: 83.0107 },
  "kedarnath": { name: "Kedarnath", state: "Uttarakhand", lat: 30.7346, lon: 79.0669 },
  "badrinath": { name: "Badrinath", state: "Uttarakhand", lat: 30.7433, lon: 79.4938 },
  "vaishno devi": { name: "Katra (Vaishno Devi)", state: "Jammu and Kashmir", lat: 33.0308, lon: 74.9490 },
}

/* ── Universal Multi-Source Geocoding (STRICT INDIA ONLY) ── */
async function geocodeLocation(query: string, openWeatherKey?: string): Promise<GeoLocation | null> {
  const cleanQ = query.trim()
  if (!cleanQ) return null
  const lowerQ = cleanQ.toLowerCase()

  // 1. Direct Indian Landmark lookup (exact or substring)
  if (INDIAN_LANDMARKS[lowerQ]) {
    const l = INDIAN_LANDMARKS[lowerQ]
    return {
      name: l.name,
      state: l.state,
      country: "India",
      lat: l.lat,
      lon: l.lon,
    }
  }
  for (const [k, v] of Object.entries(INDIAN_LANDMARKS)) {
    if (k.length >= 3 && lowerQ.includes(k)) {
      return {
        name: v.name,
        state: v.state,
        country: "India",
        lat: v.lat,
        lon: v.lon,
      }
    }
  }

  // 2. Direct Indian State lookup
  if (STATE_COORDS[lowerQ]) {
    const s = STATE_COORDS[lowerQ]
    return {
      name: s.name,
      country: "India",
      lat: s.lat,
      lon: s.lon,
    }
  }

  // 3. OpenWeather Direct Geocoding (if key provided, restrict to IN)
  if (openWeatherKey) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cleanQ)},IN&limit=3&appid=${openWeatherKey}`,
        { next: { revalidate: 3600 } }
      )
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const inPlace = data.find((p: any) => p.country === "IN") || data[0]
          if (inPlace.country === "IN") {
            return {
              name: inPlace.name,
              state: inPlace.state,
              country: "India",
              lat: inPlace.lat,
              lon: inPlace.lon,
            }
          }
        }
      }
    } catch {}
  }

  // 4. OpenStreetMap Nominatim Geocoding API (STRICTLY INDIA)
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQ)}&countrycodes=in&format=json&addressdetails=1&limit=5`
    const nomRes = await fetch(nomUrl, {
      headers: {
        "User-Agent": "WeatherGPT/1.0 (contact@weathergpt.local)",
        "Accept-Language": "en,hi",
      },
      next: { revalidate: 3600 },
    })

    if (nomRes.ok) {
      const results = await nomRes.json()
      if (Array.isArray(results) && results.length > 0) {
        const best = results[0]
        const addr = best.address || {}
        if (addr.country_code === "in" || best.lat >= 6.0 && best.lat <= 37.5) {
          const placeName = addr.village || addr.town || addr.city || addr.suburb || addr.county || addr.state_district || best.name
          const stateDistrict = addr.state_district || addr.county
          const stateName = addr.state

          const stateParts: string[] = []
          if (stateDistrict && stateDistrict !== placeName) stateParts.push(stateDistrict)
          if (stateName && stateName !== placeName && stateName !== stateDistrict) stateParts.push(stateName)

          return {
            name: placeName,
            state: stateParts.length > 0 ? stateParts.join(", ") : undefined,
            country: "India",
            lat: parseFloat(best.lat),
            lon: parseFloat(best.lon),
          }
        }
      }
    }
  } catch {}

  // 5. Open-Meteo Geocoding API (STRICTLY INDIA)
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQ)}&count=10&language=en&format=json&country_code=IN`
    const geoRes = await fetch(geoUrl, { next: { revalidate: 3600 } })
    if (geoRes.ok) {
      const geo = await geoRes.json()
      if (Array.isArray(geo.results) && geo.results.length > 0) {
        const inResults = geo.results.filter((r: any) => r.country_code === "IN")
        if (inResults.length > 0) {
          const best = inResults[0]
          let stateParts: string[] = []
          if (best.admin2 && best.admin2 !== best.name) stateParts.push(best.admin2)
          if (best.admin1 && best.admin1 !== best.name && best.admin1 !== best.admin2) stateParts.push(best.admin1)

          return {
            name: best.name,
            state: stateParts.length > 0 ? stateParts.join(", ") : undefined,
            country: "India",
            lat: best.latitude,
            lon: best.longitude,
          }
        }
      }
    }
  } catch {}

  return null
}

/* ── Live High-Precision Weather Fetcher ── */
async function fetchLiveWeather(geo: GeoLocation): Promise<WeatherPayload> {
  const [wxRes, aqRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=6`,
      { next: { revalidate: 600 } }
    ),
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${geo.lat}&longitude=${geo.lon}&current=pm10,pm2_5,us_aqi`,
      { next: { revalidate: 1800 } }
    ).catch(() => null),
  ])

  if (!wxRes.ok) {
    throw new Error(`Open-Meteo weather fetch failed: ${wxRes.status}`)
  }

  const wx = await wxRes.json()
  const aq = aqRes && aqRes.ok ? await aqRes.json().catch(() => null) : null

  const curData = wx.current || {}
  const curWmo = mapWmoCode(curData.weather_code ?? 0)

  // Current weather
  const current: CurrentWeather = {
    temp: Math.round(curData.temperature_2m ?? 30),
    feelsLike: Math.round(curData.apparent_temperature ?? curData.temperature_2m ?? 30),
    humidity: Math.round(curData.relative_humidity_2m ?? 50),
    pressure: Math.round(curData.surface_pressure ?? 1010),
    windSpeed: Math.round(((curData.wind_speed_10m ?? 10) / 3.6) * 10) / 10,
    windDeg: curData.wind_direction_10m ?? 0,
    clouds: Math.round(curData.cloud_cover ?? 20),
    visibility: 10000,
    condition: curWmo.condition,
    description: curWmo.description,
    icon: curWmo.icon,
    sunrise: wx.daily?.sunrise?.[0] ? Math.floor(new Date(wx.daily.sunrise[0]).getTime() / 1000) : Math.floor(Date.now() / 1000) - 20000,
    sunset: wx.daily?.sunset?.[0] ? Math.floor(new Date(wx.daily.sunset[0]).getTime() / 1000) : Math.floor(Date.now() / 1000) + 16000,
    rain1h: curData.rain ?? curData.precipitation ?? 0,
  }

  // Hourly forecast (next 8 slots: 24h)
  const hourlyTimes: string[] = wx.hourly?.time ?? []
  const hourlyTemps: number[] = wx.hourly?.temperature_2m ?? []
  const hourlyPops: number[] = wx.hourly?.precipitation_probability ?? []
  const hourlyCodes: number[] = wx.hourly?.weather_code ?? []
  const hourlyWinds: number[] = wx.hourly?.wind_speed_10m ?? []

  const nowIso = new Date().toISOString()
  let startIdx = hourlyTimes.findIndex((t) => t >= nowIso.slice(0, 13))
  if (startIdx < 0) startIdx = 0

  const hourly: ForecastPoint[] = hourlyTimes
    .slice(startIdx, startIdx + 8)
    .map((tStr, i) => {
      const idx = startIdx + i
      const code = hourlyCodes[idx] ?? 0
      const wmo = mapWmoCode(code)
      const unixTime = Math.floor(new Date(tStr).getTime() / 1000)
      const temp = Math.round(hourlyTemps[idx] ?? current.temp)
      return {
        time: unixTime,
        temp,
        tempMin: temp - 1,
        tempMax: temp + 1,
        condition: wmo.condition,
        description: wmo.description,
        icon: wmo.icon,
        pop: (hourlyPops[idx] ?? 0) / 100,
        windSpeed: Math.round(((hourlyWinds[idx] ?? 10) / 3.6) * 10) / 10,
      }
    })

  // Daily 5-day forecast
  const dailyDates: string[] = wx.daily?.time ?? []
  const dailyMaxs: number[] = wx.daily?.temperature_2m_max ?? []
  const dailyMins: number[] = wx.daily?.temperature_2m_min ?? []
  const dailyCodes: number[] = wx.daily?.weather_code ?? []
  const dailyPops: number[] = wx.daily?.precipitation_probability_max ?? []

  const daily: DailyForecast[] = dailyDates.slice(0, 5).map((date, i) => {
    const code = dailyCodes[i] ?? 0
    const wmo = mapWmoCode(code)
    return {
      date,
      tempMin: Math.round(dailyMins[i] ?? 24),
      tempMax: Math.round(dailyMaxs[i] ?? 32),
      condition: wmo.condition,
      description: wmo.description,
      icon: wmo.icon,
      pop: (dailyPops[i] ?? 0) / 100,
    }
  })

  // Air Quality
  let airQuality: AirQuality | null = null
  if (aq?.current) {
    const usAqi = aq.current.us_aqi ?? 50
    let aqiIndex = 1
    if (usAqi <= 50) aqiIndex = 1
    else if (usAqi <= 100) aqiIndex = 2
    else if (usAqi <= 150) aqiIndex = 3
    else if (usAqi <= 200) aqiIndex = 4
    else aqiIndex = 5

    airQuality = {
      aqi: aqiIndex,
      label: AQI_LABELS[aqiIndex - 1] ?? "Moderate",
      pm25: Math.round(aq.current.pm2_5 ?? 25),
      pm10: Math.round(aq.current.pm10 ?? 45),
    }
  }

  return {
    location: geo,
    current,
    hourly,
    daily,
    airQuality,
    alerts: deriveAlerts(current, daily),
    climate: getClimateNormals(geo.name),
    source: "live",
  }
}

/* ── Live WeatherAPI.com Real-Time Status Fetcher (STRICT INDIA ONLY) ── */
async function fetchWeatherFromWeatherApi(query: string, apiKey: string): Promise<WeatherPayload | null> {
  const cleanQ = query.trim()
  const lowerQ = cleanQ.toLowerCase()

  let targetQuery = cleanQ
  let customLandmarkName: string | null = null
  let customState: string | null = null

  // 1. Check Indian Landmark lookup (exact or substring)
  for (const [k, v] of Object.entries(INDIAN_LANDMARKS)) {
    if (lowerQ === k || lowerQ.includes(k)) {
      targetQuery = `${v.lat},${v.lon}`
      customLandmarkName = v.name
      customState = v.state
      break
    }
  }

  // 2. Check Indian State lookup
  if (!customLandmarkName && STATE_COORDS[lowerQ]) {
    const s = STATE_COORDS[lowerQ]
    targetQuery = `${s.lat},${s.lon}`
    customLandmarkName = s.name
    customState = s.name
  }

  // 3. If query is a general text query, ensure India scope
  if (!customLandmarkName && !targetQuery.includes(",")) {
    targetQuery = `${targetQuery}, India`
  }

  try {
    let res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(targetQuery)}&days=7&aqi=yes&alerts=yes`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok && targetQuery !== cleanQ) {
      res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cleanQ)}&days=7&aqi=yes&alerts=yes`,
        { next: { revalidate: 300 } }
      )
    }
    if (!res.ok) return null
    const data = await res.json()
    if (!data || !data.location || !data.current) return null

    const loc = data.location
    const cur = data.current
    const forecastDays = Array.isArray(data.forecast?.forecastday) ? data.forecast.forecastday : []

    // STRICT INDIA VALIDATION:
    // Weather must be strictly located within India
    const isIndia =
      (loc.country && loc.country.toLowerCase().trim() === "india") ||
      (loc.lat >= 6.0 && loc.lat <= 37.5 && loc.lon >= 68.0 && loc.lon <= 97.5)

    if (!isIndia) {
      console.warn(`[WeatherAPI] Rejected non-India location: ${loc.name}, ${loc.country} (${loc.lat}, ${loc.lon})`)
      return null
    }

    const geo: GeoLocation = {
      name: customLandmarkName || loc.name,
      state: customState || loc.region || undefined,
      country: "India",
      lat: loc.lat,
      lon: loc.lon,
    }

    // Parse Sunrise and Sunset
    const astro = forecastDays[0]?.astro
    let sunriseUnix = Math.floor(Date.now() / 1000) - 20000
    let sunsetUnix = Math.floor(Date.now() / 1000) + 16000
    if (astro?.sunrise && astro?.sunset) {
      const todayDate = forecastDays[0]?.date || new Date().toISOString().slice(0, 10)
      const parseTime = (tStr: string) => {
        try {
          const d = new Date(`${todayDate} ${tStr}`)
          if (!isNaN(d.getTime())) return Math.floor(d.getTime() / 1000)
        } catch {}
        return null
      }
      sunriseUnix = parseTime(astro.sunrise) ?? sunriseUnix
      sunsetUnix = parseTime(astro.sunset) ?? sunsetUnix
    }

    const current: CurrentWeather = {
      temp: Math.round(cur.temp_c),
      feelsLike: Math.round(cur.feelslike_c ?? cur.temp_c),
      humidity: Math.round(cur.humidity ?? 50),
      pressure: Math.round(cur.pressure_mb ?? 1012),
      windSpeed: Math.round(((cur.wind_kph ?? 10) / 3.6) * 10) / 10,
      windDeg: cur.wind_degree ?? 0,
      clouds: Math.round(cur.cloud ?? 20),
      visibility: Math.round((cur.vis_km ?? 10) * 1000),
      condition: cur.condition?.text?.toLowerCase().includes("rain")
        ? "Rain"
        : cur.condition?.text?.toLowerCase().includes("cloud")
          ? "Clouds"
          : cur.condition?.text?.toLowerCase().includes("clear") || cur.condition?.text?.toLowerCase().includes("sun")
            ? "Clear"
            : (cur.condition?.text ?? "Clear"),
      description: cur.condition?.text?.toLowerCase() ?? "clear sky",
      icon: cur.is_day ? "01d" : "01n",
      sunrise: sunriseUnix,
      sunset: sunsetUnix,
      rain1h: cur.precip_mm ?? 0,
    }

    // Hourly
    const nowEpoch = Math.floor(Date.now() / 1000)
    const allHours: any[] = []
    forecastDays.forEach((fd: any) => {
      if (Array.isArray(fd.hour)) {
        allHours.push(...fd.hour)
      }
    })
    const futureHours = allHours.filter(h => h.time_epoch >= nowEpoch - 3600).slice(0, 8)

    const hourly: ForecastPoint[] = (futureHours.length > 0 ? futureHours : allHours.slice(0, 8)).map(h => {
      const isRain = (h.condition?.text ?? "").toLowerCase().includes("rain")
      return {
        time: h.time_epoch,
        temp: Math.round(h.temp_c),
        tempMin: Math.round(h.temp_c - 1),
        tempMax: Math.round(h.temp_c + 1),
        condition: isRain ? "Rain" : (h.condition?.text ?? "Clear"),
        description: h.condition?.text?.toLowerCase() ?? "clear sky",
        icon: h.is_day ? "01d" : "01n",
        pop: (h.chance_of_rain ?? 0) / 100,
        windSpeed: Math.round(((h.wind_kph ?? 10) / 3.6) * 10) / 10,
      }
    })

    // Daily
    const daily: DailyForecast[] = forecastDays.slice(0, 7).map((fd: any) => {
      const day = fd.day || {}
      const isRain = (day.condition?.text ?? "").toLowerCase().includes("rain")
      return {
        date: fd.date,
        tempMin: Math.round(day.mintemp_c ?? 20),
        tempMax: Math.round(day.maxtemp_c ?? 32),
        condition: isRain ? "Rain" : (day.condition?.text ?? "Clear"),
        description: day.condition?.text?.toLowerCase() ?? "partly cloudy",
        icon: "02d",
        pop: (day.daily_chance_of_rain ?? 0) / 100,
      }
    })

    // Air Quality
    let airQuality: AirQuality | null = null
    if (cur.air_quality) {
      const aq = cur.air_quality
      const epaIndex = aq["us-epa-index"] ?? 2
      const aqiLabels = ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy", "Hazardous"]
      airQuality = {
        aqi: Math.min(epaIndex, 5),
        label: aqiLabels[epaIndex - 1] ?? "Moderate",
        pm25: Math.round(aq.pm2_5 ?? 25),
        pm10: Math.round(aq.pm10 ?? 40),
      }
    }

    // Alerts
    const alerts: WeatherAlert[] = deriveAlerts(current, daily)
    if (Array.isArray(data.alerts?.alert)) {
      data.alerts.alert.forEach((a: any, idx: number) => {
        alerts.push({
          id: `wapi-alert-${idx}`,
          title: a.headline || a.event || "Weather Alert",
          severity: a.severity?.toLowerCase() === "severe" ? "severe" : "warning",
          event: a.event || "Alert",
          description: a.desc || a.instruction || "Take precautions.",
        })
      })
    }

    return {
      location: geo,
      current,
      hourly,
      daily,
      airQuality,
      alerts,
      climate: getClimateNormals(geo.name),
      source: "live",
    }
  } catch (err) {
    console.warn("WeatherAPI fetch error:", err)
    return null
  }
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city")?.trim()
  if (!city) {
    return NextResponse.json({ error: "Missing location parameter" }, { status: 400 })
  }

  const weatherApiKey = process.env.WEATHER_API_KEY || process.env.WEATHERAPI_KEY

  // 1. Primary: Use real-time WeatherAPI status if configured
  if (weatherApiKey) {
    const liveWapi = await fetchWeatherFromWeatherApi(city, weatherApiKey)
    if (liveWapi) {
      return NextResponse.json(liveWapi)
    }
  }

  // 2. Secondary: Fallback to Geocoding + Open-Meteo
  const openWeatherKey = process.env.OPENWEATHER_API_KEY

  try {
    const geo = await geocodeLocation(city, openWeatherKey)
    if (!geo) {
      return NextResponse.json(
        { error: `स्थान "${city}" नहीं मिला। कृपया जिले, राज्य या गांव का नाम सही से लिखें।` },
        { status: 404 }
      )
    }

    const payload = await fetchLiveWeather(geo)
    return NextResponse.json(payload)
  } catch (err) {
    console.error("[weather] error:", (err as Error).message)
    return NextResponse.json(
      { error: "मौसम डेटा प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।" },
      { status: 500 }
    )
  }
}
