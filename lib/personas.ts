export type PersonaId = "farmer" | "aviation" | "marine" | "disaster" | "urban" | "general"

export interface PersonaConfig {
  id: PersonaId
  name: string
  hindiName: string
  icon: string
  badge: string
  color: string
  accentColor: string
  bgLight: string
  tagline: string
  hindiTagline: string
  defaultSector: "agro" | "aviation" | "marine" | "disaster" | "urban" | "current"
  quickPrompts: { en: string; hi: string }[]
  systemPromptGuidance: string
}

export const PERSONAS: Record<PersonaId, PersonaConfig> = {
  general: {
    id: "general",
    name: "General Citizen",
    hindiName: "आम नागरिक",
    icon: "🌦️",
    badge: "Public Weather",
    color: "#0284c7",
    accentColor: "#38bdf8",
    bgLight: "bg-sky-50 text-sky-700 border-sky-200",
    tagline: "Comprehensive daily forecasts, AQI & weather advice across India",
    hindiTagline: "दैनिक पूर्वानुमान, वायु गुणवत्ता (AQI) और मौसम सलाह",
    defaultSector: "current",
    quickPrompts: [
      { en: "Today's forecast & rain probability", hi: "आज का मौसम और बारिश की संभावना" },
      { en: "AQI & air pollution safety for morning walk", hi: "सुबह की सैर के लिए वायु प्रदूषण और AQI" },
      { en: "Next 5-day temperature trends", hi: "अगले 5 दिनों के तापमान का रुझान" },
      { en: "Show live radar & GIS satellite map", hi: "लाइव रडार और जीआईएस सैटेलाइट मैप दिखाओ" },
    ],
    systemPromptGuidance: "Provide friendly, accurate, and easy-to-understand meteorological forecasts for Indian citizens and daily commuters."
  },
  farmer: {
    id: "farmer",
    name: "Kisan (Farmer)",
    hindiName: "किसान भाई (कृषि)",
    icon: "🌾",
    badge: "Agro-Meteorology",
    color: "#16a34a",
    accentColor: "#4ade80",
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
    tagline: "Crop advisories, soil moisture, irrigation windows & fertilizer wash-off alerts",
    hindiTagline: "फसल सलाह, मिट्टी की नमी, सिंचाई का सही समय और कीटनाशक छिड़काव चेतावनी",
    defaultSector: "agro",
    quickPrompts: [
      { en: "Is it safe to spray pesticides/fertilizers today?", hi: "क्या आज कीटनाशक या खाद का छिड़काव करना सुरक्षित है?" },
      { en: "Wheat & Mustard irrigation advisory this week", hi: "इस सप्ताह गेहूं और सरसों की सिंचाई की सलाह" },
      { en: "Pest & fungal risk based on current humidity", hi: "वर्तमान नमी के आधार पर कीट और फफूंद का खतरा" },
      { en: "Harvest window and unseasonal rain risk", hi: "फसल कटाई का समय और बेमौसम बारिश का जोखिम" },
    ],
    systemPromptGuidance: `You are acting as an expert Indian Agriculture Meteorologist (कृषि वैज्ञानिक). Focus on:
- Soil moisture levels and irrigation scheduling (avoiding water-logging during critical crop stages).
- Fertilizer/pesticide wash-off risk (warn if rain is expected within 24 hours).
- High humidity (>75%) fungal disease warnings for Kharif and Rabi crops (Wheat, Paddy, Mustard, Cotton, Pulses).
- Concrete advice for Indian farmers in practical, easy Hindi and English.`
  },
  aviation: {
    id: "aviation",
    name: "Aviator (Pilot)",
    hindiName: "विमानन पायलट (Aviation)",
    icon: "✈️",
    badge: "Aeronautical Met",
    color: "#6366f1",
    accentColor: "#818cf8",
    bgLight: "bg-indigo-50 text-indigo-700 border-indigo-200",
    tagline: "METAR/TAF decoding, flight categories (VFR/IFR), crosswinds & turbulence",
    hindiTagline: "METAR/TAF डिकोडिंग, फ्लाइट कैटेगरी (VFR/IFR), रनवे क्रॉसविंड और बादलों की ऊंचाई",
    defaultSector: "aviation",
    quickPrompts: [
      { en: "Current flight category (VFR/MVFR/IFR) & ceiling", hi: "वर्तमान उड़ान श्रेणी (VFR/IFR) और बादलों की ऊंचाई" },
      { en: "Runway crosswind component & gust analysis", hi: "रनवे क्रॉसविंड कंपोनेंट और हवा के झोंके की स्थिति" },
      { en: "Low-level wind shear & thunderstorm alert", hi: "लो-लेवल विंड शियर और आंधी-तूफान की चेतावनी" },
      { en: "METAR/TAF briefing for major airport hubs", hi: "प्रमुख हवाई अड्डों के लिए METAR/TAF ब्रीफिंग" },
    ],
    systemPromptGuidance: `You are acting as a Certified Aeronautical Meteorological Forecaster. Focus on:
- Flight categories (VFR, MVFR, IFR, LIFR) with Cloud Ceiling (ft AGL) and Visibility (statute miles / meters).
- Decoded METAR and TAF observations.
- Runway crosswind component, gust factor, and convective turbulence hazards.
- Standard ICAO aviation terminology.`
  },
  marine: {
    id: "marine",
    name: "Sagar Mitra (Marine)",
    hindiName: "सागर मित्र (मछुआरें)",
    icon: "🎣",
    badge: "Coastal & Deep Sea",
    color: "#0891b2",
    accentColor: "#22d3ee",
    bgLight: "bg-cyan-50 text-cyan-700 border-cyan-200",
    tagline: "Sea states, wave height, swell period, tides & offshore fisherman safety",
    hindiTagline: "समुद्री लहरों की ऊंचाई, ज्वार-भाटा (Tides) और मछुआरों के लिए तट से दूर जाने की चेतावनी",
    defaultSector: "marine",
    quickPrompts: [
      { en: "Can mechanized trawlers venture into deep sea today?", hi: "क्या आज बड़ी नावें और ट्रॉलर्स गहरे समुद्र में जा सकते हैं?" },
      { en: "Current wave height, swell period & sea roughness", hi: "लहरों की ऊंचाई, स्वेल पीरियड और समुद्र की स्थिति" },
      { en: "Tidal phase and high-tide peak timing", hi: "ज्वार-भाटा की स्थिति और हाई टाइड का समय" },
      { en: "Coastal squall and rough sea advisory", hi: "तटीय आंधी और अशांत समुद्र की चेतावनी" },
    ],
    systemPromptGuidance: `You are acting as a Marine Meteorologist and Fisheries Advisor (सागर मित्र). Focus on:
- Sea state classification (Calm, Moderate, Rough, Very Rough, Phenomenal).
- Significant wave height (meters) and swell period (seconds).
- Safety bulletins for traditional catamarans vs mechanized trawlers (distance limits from coastline).
- High tide/low tide cycles and coastal squalls along Indian coastlines (Bay of Bengal / Arabian Sea).`
  },
  disaster: {
    id: "disaster",
    name: "NDRF / Disaster Unit",
    hindiName: "आपदा प्रबंधन (NDRF / SDMA)",
    icon: "🚨",
    badge: "Emergency Response",
    color: "#dc2626",
    accentColor: "#f87171",
    bgLight: "bg-red-50 text-red-700 border-red-200",
    tagline: "IMD/NDMA color alerts (Red/Orange), cyclone tracks, inundation & evacuation",
    hindiTagline: "आईएमडी रंग-कोड अलर्ट (रेड/ऑरेंज), चक्रवात मार्ग, बाढ़ जलभराव और निकासी प्रोटोकॉल",
    defaultSector: "disaster",
    quickPrompts: [
      { en: "Active IMD Red/Orange flood or cyclone alerts", hi: "सक्रिय आईएमडी रेड/ऑरेंज बाढ़ या चक्रवात अलर्ट" },
      { en: "Cyclone track, landfall intensity & storm surge height", hi: "चक्रवात का मार्ग, लैंडफॉल तीव्रता और स्टॉर्म सर्ज ऊंचाई" },
      { en: "River basin flood inundation risk & water levels", hi: "नदी बेसिन बाढ़ का खतरा और जलस्तर" },
      { en: "Disaster evacuation protocol & emergency helplines", hi: "आपदा निकासी प्रोटोकॉल और आपातकालीन हेल्पलाइन (1070/112)" },
    ],
    systemPromptGuidance: `You are acting as an Emergency Incident Commander and Disaster Warning Disseminator (NDRF / SDMA / IMD). Focus on:
- Color-coded IMD alerts: RED (Take Action), ORANGE (Be Prepared), YELLOW (Be Updated), GREEN (No Warning).
- Cyclone track, intensity (Depression, Deep Depression, CS, VSCS, Super Cyclone), landfall ETA, storm surge estimates.
- Flash flood risk, river basin inundation zones, and immediate evacuation safety checklists.
- Official Indian emergency helpline numbers (1070, 1078, 112).`
  },
  urban: {
    id: "urban",
    name: "Urban Planner",
    hindiName: "स्मार्ट सिटी प्लानर",
    icon: "🏙️",
    badge: "Smart City Infrastructure",
    color: "#d97706",
    accentColor: "#fbbf24",
    bgLight: "bg-amber-50 text-amber-700 border-amber-200",
    tagline: "Urban Heat Island (UHI), underpass waterlogging, UTCI heat stress & cranes",
    hindiTagline: "अर्बन हीट आइलैंड (UHI), अंडरपास जलभराव जोखिम, श्रमिक हीट स्ट्रेस और क्रेन विंड लिमिट",
    defaultSector: "urban",
    quickPrompts: [
      { en: "Urban Heat Island (UHI) temperature excess today", hi: "आज शहर में अर्बन हीट आइलैंड (UHI) का अतिरिक्त तापमान" },
      { en: "Low-lying underpass & arterial road waterlogging risk", hi: "निचले अंडरपास और सड़कों पर जलभराव का जोखिम" },
      { en: "Outdoor labor thermal comfort (UTCI) & heat stress", hi: "मजदूरों के लिए हीट स्ट्रेस और थर्मल कम्फर्ट (UTCI)" },
      { en: "Construction crane wind clearance and smog dispersion", hi: "निर्माण क्रेन हवा की गति सीमा और स्मॉग वेंटिलेशन" },
    ],
    systemPromptGuidance: `You are acting as a Smart City Urban Meteorologist and Resilience Engineer. Focus on:
- Urban Heat Island (UHI) index (+°C differential between concrete core and rural green belt).
- Stormwater drainage and critical underpass waterlogging vulnerability.
- Universal Thermal Climate Index (UTCI) for outdoor construction labor shifts.
- High-rise construction crane wind safety limits and nocturnal smog inversion trapping.`
  }
}
