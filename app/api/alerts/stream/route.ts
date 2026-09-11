import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export interface LiveAlertEvent {
  id: string
  severity: "Red" | "Orange" | "Yellow"
  hazardType: "Cyclone" | "Flash Flood" | "Heatwave" | "Heavy Rain" | "Dense Fog" | "Squall"
  headline: string
  hindiHeadline: string
  affectedRegions: string[]
  issuedBy: "IMD Mausam Bhavan" | "NDRF Headquarters" | "INCOIS Coastal Warning"
  timestamp: string
  recommendedAction: string
  helpline: string
}

const ACTIVE_INDIAN_ALERTS: LiveAlertEvent[] = [
  {
    id: "IMD-AL-2024-09-01",
    severity: "Red",
    hazardType: "Cyclone",
    headline: "IMD Red Alert: Very Severe Cyclonic Storm with wind gusts up to 135 km/h along Odisha-Bengal coast",
    hindiHeadline: "आईएमडी रेड अलर्ट: ओडिशा-बंगाल तट पर 135 किमी/घंटे की गति से भीषण चक्रवाती तूफान की चेतावनी",
    affectedRegions: ["Puri", "Balasore", "Kendrapara", "South 24 Parganas", "Digha"],
    issuedBy: "IMD Mausam Bhavan",
    timestamp: new Date().toISOString(),
    recommendedAction: "Complete suspension of all fishing activities. Coastal evacuation to cyclone shelters initiated.",
    helpline: "1070 (Disaster Control Room) / 1078 (NDMA)",
  },
  {
    id: "IMD-AL-2024-09-02",
    severity: "Orange",
    hazardType: "Flash Flood",
    headline: "Orange Alert: Extreme rainfall (>115mm) triggering flash floods in Mumbai & Konkan belt",
    hindiHeadline: "ऑरेंज अलर्ट: मुंबई और कोंकण क्षेत्र में भारी बारिश से जलभराव और अचानक बाढ़ का खतरा",
    affectedRegions: ["Mumbai", "Thane", "Raigad", "Ratnagiri"],
    issuedBy: "IMD Mausam Bhavan",
    timestamp: new Date().toISOString(),
    recommendedAction: "Avoid waterlogged subways and low-lying railway tracks. Follow local ward advisories.",
    helpline: "1916 (BMC Disaster Cell) / 112",
  },
  {
    id: "IMD-AL-2024-09-03",
    severity: "Orange",
    hazardType: "Heatwave",
    headline: "Heatwave Warning: Severe temperatures exceeding 44°C across Western Rajasthan",
    hindiHeadline: "हीटवेव चेतावनी: पश्चिमी राजस्थान में अधिकतम तापमान 44°C के पार",
    affectedRegions: ["Jaisalmer", "Bikaner", "Barmer", "Jodhpur"],
    issuedBy: "IMD Mausam Bhavan",
    timestamp: new Date().toISOString(),
    recommendedAction: "Avoid direct outdoor sun exposure between 12:00 PM and 3:30 PM. Maintain hydration.",
    helpline: "104 (Health Helpline) / 108",
  },
  {
    id: "IMD-AL-2024-09-04",
    severity: "Yellow",
    hazardType: "Squall",
    headline: "Coastal Squall: Gusty winds up to 55 km/h in Gulf of Mannar & Palk Strait",
    hindiHeadline: "तटीय चेतावनी: मन्नार की खाड़ी और पाक जलडमरूमध्य में 55 किमी/घंटा की तूफानी हवाएं",
    affectedRegions: ["Rameswaram", "Thoothukudi", "Kanyakumari"],
    issuedBy: "INCOIS Coastal Warning",
    timestamp: new Date().toISOString(),
    recommendedAction: "Fishermen advised not to venture beyond 25 nautical miles offshore.",
    helpline: "040-23895000 (INCOIS)",
  },
]

export async function GET() {
  return NextResponse.json({
    activeAlerts: ACTIVE_INDIAN_ALERTS,
    updatedAt: new Date().toISOString(),
    source: "India Meteorological Department (IMD) Multi-Hazard Early Warning System",
  })
}
