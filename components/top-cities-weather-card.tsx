'use client'

import { useState, useEffect } from 'react'
import {
  CloudSun,
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  Wind,
  Droplets,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  MapPin,
} from 'lucide-react'

export interface CityForecastDay {
  dayName: string
  dateStr: string
  condition: string
  tempMax: number
  tempMin: number
  pop: number
  icon: string
}

export interface CityWeatherConfig {
  id: string
  name: string
  hindiName: string
  state: string
  currentTemp: number
  feelsLike: number
  condition: string
  humidity: number
  windSpeed: number
  advice: string
  englishAdvice: string
  initialForecast: CityForecastDay[]
}

const TOP_CITIES: CityWeatherConfig[] = [
  {
    id: 'delhi',
    name: 'Delhi',
    hindiName: 'दिल्ली',
    state: 'National Capital Region',
    currentTemp: 34,
    feelsLike: 36,
    condition: 'Sunny & Clear',
    humidity: 48,
    windSpeed: 12,
    advice: 'Delhi NCR mein tej dhoop aur saaf aasmaan. Bahar yatra aur rozmarra kam ke liye anukool din.',
    englishAdvice: 'Sunny & clear skies across Delhi NCR. Favorable day for travel and outdoor activities.',
    initialForecast: [
      { dayName: 'Aaj', dateStr: '10 Sep', condition: 'Sunny', tempMax: 36, tempMin: 27, pop: 5, icon: 'sun' },
      { dayName: 'Kal', dateStr: '11 Sep', condition: 'Partly Cloudy', tempMax: 35, tempMin: 26, pop: 15, icon: 'cloud-sun' },
      { dayName: 'Sat', dateStr: '12 Sep', condition: 'Clear', tempMax: 36, tempMin: 27, pop: 10, icon: 'sun' },
      { dayName: 'Sun', dateStr: '13 Sep', condition: 'Sunny', tempMax: 37, tempMin: 28, pop: 10, icon: 'sun' },
      { dayName: 'Mon', dateStr: '14 Sep', condition: 'Light Rain', tempMax: 33, tempMin: 25, pop: 45, icon: 'rain' },
      { dayName: 'Tue', dateStr: '15 Sep', condition: 'Overcast', tempMax: 32, tempMin: 24, pop: 35, icon: 'cloud' },
      { dayName: 'Wed', dateStr: '16 Sep', condition: 'Sunny', tempMax: 35, tempMin: 26, pop: 15, icon: 'sun' },
    ],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    hindiName: 'मुंबई',
    state: 'Maharashtra',
    currentTemp: 29,
    feelsLike: 33,
    condition: 'Coastal Breeze & Rain',
    humidity: 78,
    windSpeed: 18,
    advice: 'Mumbai tatiya ilaqon mein halki boonda-baandi aur nami. Bahar nikalte waqt chatri sath rakhein.',
    englishAdvice: 'Humid coastal breeze with light passing showers. Keep an umbrella handy for daily commute.',
    initialForecast: [
      { dayName: 'Aaj', dateStr: '10 Sep', condition: 'Light Rain', tempMax: 30, tempMin: 26, pop: 65, icon: 'rain' },
      { dayName: 'Kal', dateStr: '11 Sep', condition: 'Passing Showers', tempMax: 29, tempMin: 25, pop: 70, icon: 'rain' },
      { dayName: 'Sat', dateStr: '12 Sep', condition: 'Partly Cloudy', tempMax: 31, tempMin: 26, pop: 40, icon: 'cloud-sun' },
      { dayName: 'Sun', dateStr: '13 Sep', condition: 'Light Rain', tempMax: 30, tempMin: 26, pop: 55, icon: 'rain' },
      { dayName: 'Mon', dateStr: '14 Sep', condition: 'Moderate Rain', tempMax: 29, tempMin: 25, pop: 80, icon: 'rain' },
      { dayName: 'Tue', dateStr: '15 Sep', condition: 'Rain Showers', tempMax: 29, tempMin: 25, pop: 75, icon: 'rain' },
      { dayName: 'Wed', dateStr: '16 Sep', condition: 'Partly Cloudy', tempMax: 31, tempMin: 26, pop: 45, icon: 'cloud-sun' },
    ],
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    hindiName: 'बेंगलुरु',
    state: 'Karnataka',
    currentTemp: 27,
    feelsLike: 28,
    condition: 'Pleasant & Mild',
    humidity: 62,
    windSpeed: 14,
    advice: 'Bengaluru mein thandi hawayein aur suhavna mausam. Shaam ko halki phulki phuhar sambhav.',
    englishAdvice: 'Pleasant temperature and breezy weather across Bengaluru. Ideal for commute and field work.',
    initialForecast: [
      { dayName: 'Aaj', dateStr: '10 Sep', condition: 'Partly Cloudy', tempMax: 28, tempMin: 20, pop: 25, icon: 'cloud-sun' },
      { dayName: 'Kal', dateStr: '11 Sep', condition: 'Pleasant Breeze', tempMax: 27, tempMin: 19, pop: 30, icon: 'cloud-sun' },
      { dayName: 'Sat', dateStr: '12 Sep', condition: 'Light Showers', tempMax: 26, tempMin: 19, pop: 50, icon: 'rain' },
      { dayName: 'Sun', dateStr: '13 Sep', condition: 'Scattered Rain', tempMax: 26, tempMin: 20, pop: 60, icon: 'rain' },
      { dayName: 'Mon', dateStr: '14 Sep', condition: 'Cloudy', tempMax: 27, tempMin: 20, pop: 35, icon: 'cloud' },
      { dayName: 'Tue', dateStr: '15 Sep', condition: 'Partly Cloudy', tempMax: 28, tempMin: 21, pop: 25, icon: 'cloud-sun' },
      { dayName: 'Wed', dateStr: '16 Sep', condition: 'Sunny Intervals', tempMax: 29, tempMin: 21, pop: 20, icon: 'sun' },
    ],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    hindiName: 'कोलकाता',
    state: 'West Bengal',
    currentTemp: 32,
    feelsLike: 38,
    condition: 'Warm & Humid',
    humidity: 76,
    windSpeed: 10,
    advice: 'Kolkata aur Gangetic Bengal mein aadrata aur aashik badal. Dupahar me garmi se bachein.',
    englishAdvice: 'Warm and humid conditions in Kolkata with scattered clouds. Stay hydrated during afternoon.',
    initialForecast: [
      { dayName: 'Aaj', dateStr: '10 Sep', condition: 'Partly Cloudy', tempMax: 33, tempMin: 27, pop: 35, icon: 'cloud-sun' },
      { dayName: 'Kal', dateStr: '11 Sep', condition: 'Thunder Showers', tempMax: 32, tempMin: 26, pop: 65, icon: 'thunder' },
      { dayName: 'Sat', dateStr: '12 Sep', condition: 'Passing Rain', tempMax: 32, tempMin: 26, pop: 55, icon: 'rain' },
      { dayName: 'Sun', dateStr: '13 Sep', condition: 'Cloudy & Humid', tempMax: 33, tempMin: 27, pop: 40, icon: 'cloud' },
      { dayName: 'Mon', dateStr: '14 Sep', condition: 'Light Rain', tempMax: 32, tempMin: 26, pop: 50, icon: 'rain' },
      { dayName: 'Tue', dateStr: '15 Sep', condition: 'Partly Sunny', tempMax: 34, tempMin: 27, pop: 30, icon: 'cloud-sun' },
      { dayName: 'Wed', dateStr: '16 Sep', condition: 'Warm', tempMax: 34, tempMin: 28, pop: 25, icon: 'sun' },
    ],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    hindiName: 'चेन्नई',
    state: 'Tamil Nadu',
    currentTemp: 33,
    feelsLike: 39,
    condition: 'Sunny Coastal',
    humidity: 72,
    windSpeed: 16,
    advice: 'Chennai mein tatiya dhoop aur garam hawa. Samudri kinaron par tez hawayein.',
    englishAdvice: 'Sunny and warm coastal weather across Chennai. Breezy coastal conditions in the evening.',
    initialForecast: [
      { dayName: 'Aaj', dateStr: '10 Sep', condition: 'Sunny', tempMax: 35, tempMin: 28, pop: 15, icon: 'sun' },
      { dayName: 'Kal', dateStr: '11 Sep', condition: 'Partly Cloudy', tempMax: 34, tempMin: 27, pop: 25, icon: 'cloud-sun' },
      { dayName: 'Sat', dateStr: '12 Sep', condition: 'Warm & Breezy', tempMax: 35, tempMin: 28, pop: 20, icon: 'sun' },
      { dayName: 'Sun', dateStr: '13 Sep', condition: 'Passing Clouds', tempMax: 34, tempMin: 27, pop: 30, icon: 'cloud-sun' },
      { dayName: 'Mon', dateStr: '14 Sep', condition: 'Isolated Showers', tempMax: 33, tempMin: 26, pop: 45, icon: 'rain' },
      { dayName: 'Tue', dateStr: '15 Sep', condition: 'Partly Cloudy', tempMax: 34, tempMin: 27, pop: 30, icon: 'cloud-sun' },
      { dayName: 'Wed', dateStr: '16 Sep', condition: 'Sunny', tempMax: 35, tempMin: 28, pop: 20, icon: 'sun' },
    ],
  },
  {
    id: 'samastipur',
    name: 'Samastipur',
    hindiName: 'समस्तीपुर',
    state: 'Bihar',
    currentTemp: 31,
    feelsLike: 35,
    condition: 'Good Day to Plan',
    humidity: 68,
    windSpeed: 9,
    advice: 'Samastipur mein khet mein sinchai aur buwai ke liye anukool mausam. Fasal surakshit hai.',
    englishAdvice: 'Favorable weather in Samastipur for irrigation, sowing, and farm activities. Crops safe.',
    initialForecast: [
      { dayName: 'Aaj', dateStr: '10 Sep', condition: 'Favorable', tempMax: 33, tempMin: 26, pop: 20, icon: 'cloud-sun' },
      { dayName: 'Kal', dateStr: '11 Sep', condition: 'Partly Sunny', tempMax: 34, tempMin: 26, pop: 25, icon: 'sun' },
      { dayName: 'Sat', dateStr: '12 Sep', condition: 'Light Clouds', tempMax: 33, tempMin: 25, pop: 30, icon: 'cloud' },
      { dayName: 'Sun', dateStr: '13 Sep', condition: 'Scattered Showers', tempMax: 31, tempMin: 24, pop: 60, icon: 'rain' },
      { dayName: 'Mon', dateStr: '14 Sep', condition: 'Agro Friendly', tempMax: 32, tempMin: 25, pop: 40, icon: 'cloud-sun' },
      { dayName: 'Tue', dateStr: '15 Sep', condition: 'Warm', tempMax: 33, tempMin: 26, pop: 20, icon: 'sun' },
      { dayName: 'Wed', dateStr: '16 Sep', condition: 'Clear', tempMax: 34, tempMin: 26, pop: 15, icon: 'sun' },
    ],
  },
]

function renderWeatherIcon(icon: string, size = 20) {
  switch (icon) {
    case 'sun':
      return <Sun size={size} className="text-amber-300 animate-spin" style={{ animationDuration: '30s' }} />
    case 'rain':
      return <CloudRain size={size} className="text-sky-200" />
    case 'thunder':
      return <CloudLightning size={size} className="text-yellow-300" />
    case 'cloud':
      return <Cloud size={size} className="text-slate-200" />
    case 'cloud-sun':
    default:
      return <CloudSun size={size} className="text-amber-300" />
  }
}

export function TopCitiesWeatherCard() {
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi')
  const [liveData, setLiveData] = useState<Record<string, { currentTemp: number; condition: string; forecast: CityForecastDay[] }>>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const city = TOP_CITIES.find(c => c.id === selectedCityId) || TOP_CITIES[0]

  // Fetch live weather data for the selected city
  useEffect(() => {
    let isCancelled = false

    async function fetchLiveWeather() {
      // Don't refetch if already cached
      if (liveData[city.name]) return

      setIsLoading(true)
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(city.name)}`)
        if (!res.ok) throw new Error('Failed to fetch weather')
        const data = await res.json()

        if (!isCancelled && data && data.current && Array.isArray(data.daily)) {
          const daysNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          const mappedForecast: CityForecastDay[] = data.daily.slice(0, 7).map((d: any, idx: number) => {
            const dateObj = new Date(d.date)
            const dName = idx === 0 ? 'Aaj' : idx === 1 ? 'Kal' : daysNames[dateObj.getDay()] || 'Day'
            const isRain = (d.condition || '').toLowerCase().includes('rain')
            const isCloud = (d.condition || '').toLowerCase().includes('cloud')
            const isThunder = (d.condition || '').toLowerCase().includes('thunder')
            const isSun = (d.condition || '').toLowerCase().includes('sun') || (d.condition || '').toLowerCase().includes('clear')
            const iconType = isThunder ? 'thunder' : isRain ? 'rain' : isCloud ? 'cloud' : isSun ? 'sun' : 'cloud-sun'

            const dayNum = dateObj.getDate()
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const dateStr = !isNaN(dayNum) ? `${dayNum} ${monthNames[dateObj.getMonth()]}` : `Day ${idx + 1}`

            return {
              dayName: dName,
              dateStr,
              condition: d.condition || 'Clear',
              tempMax: d.tempMax ?? 32,
              tempMin: d.tempMin ?? 24,
              pop: Math.round((d.pop ?? 0) * 100),
              icon: iconType,
            }
          })

          setLiveData(prev => ({
            ...prev,
            [city.name]: {
              currentTemp: Math.round(data.current.temp),
              condition: data.current.condition || city.condition,
              forecast: mappedForecast,
            },
          }))
        }
      } catch (err) {
        console.warn(`[TopCitiesCard] Using fallback forecast for ${city.name}:`, err)
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchLiveWeather()

    return () => {
      isCancelled = true
    }
  }, [city.name, liveData])

  const activeWeather = liveData[city.name]
  const displayTemp = activeWeather?.currentTemp ?? city.currentTemp
  const displayCondition = activeWeather?.condition ?? city.condition
  const displayForecast = (activeWeather?.forecast && activeWeather.forecast.length >= 7)
    ? activeWeather.forecast
    : city.initialForecast

  return (
    <div className="relative overflow-hidden rounded-[2.2rem] border border-white/60 bg-gradient-to-br from-[#1b64b3] via-[#16559c] to-[#0f3d75] p-5 sm:p-7 text-white shadow-[0_24px_70px_-20px_rgba(20,80,180,0.5)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_30px_85px_-15px_rgba(20,80,180,0.65)]">
      
      {/* ── Top Cities Tabs Header ── */}
      <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3.5 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
            Top 5 Cities · 7-Day Forecast
          </span>
        </div>
        {isLoading && (
          <span className="flex items-center gap-1 text-[10px] text-blue-200">
            <RefreshCw size={11} className="animate-spin" /> Live Syncing
          </span>
        )}
      </div>

      {/* ── City Selector Pills ── */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-5">
        {TOP_CITIES.map(c => {
          const isSelected = c.id === selectedCityId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCityId(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-blue-900 shadow-md shadow-black/20 scale-105'
                  : 'border border-white/25 bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span>{c.name}</span>
              <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-700' : 'text-white/60'}`}>
                {c.hindiName}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Selected City Main Status ── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-200/90">
            <MapPin size={13} className="text-amber-300" />
            <span>{city.name}, {city.state}</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {displayTemp}°C
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white/90 backdrop-blur-xs">
              {displayCondition}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-white/80 font-medium">
            <span className="flex items-center gap-1">
              <Droplets size={12} className="text-sky-300" /> {city.humidity}% Humidity
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Wind size={12} className="text-blue-200" /> {city.windSpeed} km/h
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-center">
          <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shadow-inner border border-white/20">
            {renderWeatherIcon(displayForecast[0]?.icon || 'cloud-sun', 32)}
          </div>
          <span className="mt-1 text-[10px] text-white/70 font-semibold uppercase tracking-wider">
            Live
          </span>
        </div>
      </div>

      {/* ── Simple Actionable Advice Box ── */}
      <div className="mb-5 rounded-2xl bg-white/15 p-3.5 sm:p-4 text-white backdrop-blur border border-white/20">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/75 mb-1">
          <span>🌿 Mausam Salah (Weather Advice)</span>
          <span className="text-emerald-300">Actionable</span>
        </div>
        <p className="text-xs sm:text-sm font-medium leading-relaxed text-white/95">
          {city.advice}
        </p>
      </div>

      {/* ── 7-Day Forecast Strip ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200/90">
            Agla 7 Din Ka Forecast
          </span>
          <span className="text-[10px] text-white/60">Min / Max Temp</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
          {displayForecast.map((day, idx) => {
            const isToday = idx === 0
            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-between rounded-xl p-2 sm:p-2.5 text-center transition-all ${
                  isToday
                    ? 'bg-white/25 border border-white/40 shadow-sm'
                    : 'bg-white/10 hover:bg-white/15 border border-white/10'
                }`}
              >
                <span className={`text-[11px] font-bold ${isToday ? 'text-amber-300' : 'text-white/90'}`}>
                  {day.dayName}
                </span>
                <span className="text-[9px] text-white/60 mb-1">
                  {day.dateStr}
                </span>

                <div className="my-1">
                  {renderWeatherIcon(day.icon, 18)}
                </div>

                <div className="mt-1 flex items-baseline justify-center gap-1 text-[11px] font-bold">
                  <span>{day.tempMax}°</span>
                  <span className="text-[9px] font-normal text-white/60">{day.tempMin}°</span>
                </div>

                <div className="mt-1 text-[9px] font-medium text-sky-200">
                  💧 {day.pop}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Footer Source & Direct Assistant Prompt ── */}
      <div className="mt-4 pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-300 shrink-0" />
          <span className="text-[11px]">IMD Radar · WeatherAPI · GFS 0.05° High-Res</span>
        </div>
        <button
          type="button"
          onClick={() => {
            const chatEl = document.getElementById('weather-chat-widget')
            if (chatEl) {
              chatEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
              window.dispatchEvent(new Event('focus-weather-chat'))
              setTimeout(() => {
                const inputEl = document.getElementById('weather-chat-input') as HTMLTextAreaElement | null
                if (inputEl) {
                  inputEl.value = `${city.name} ka mausam kaisa hai?`
                  inputEl.focus()
                }
              }, 400)
            } else {
              document.getElementById('assistant')?.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-white hover:text-amber-300 transition cursor-pointer"
        >
          <span>Ask about {city.name}</span>
          <ArrowRight size={12} />
        </button>
      </div>

    </div>
  )
}
