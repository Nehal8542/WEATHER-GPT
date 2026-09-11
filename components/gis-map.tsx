"use client"

import { useEffect, useRef, useState } from "react"
import { Layers, Maximize2, Minimize2, Navigation, Radio } from "lucide-react"

export interface GISMapProps {
  center?: [number, number] // [lat, lon]
  zoom?: number
  city?: string
  initialLayer?: "radar" | "cyclone" | "flood" | "all"
  height?: string
  onClose?: () => void
}

export function GISMap({
  center = [21.5, 78.9629], // India Center
  zoom = 4.8,
  city,
  initialLayer = "all",
  height = "460px",
}: GISMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [layers, setLayers] = useState({
    radar: initialLayer === "radar" || initialLayer === "all",
    cyclone: initialLayer === "cyclone" || initialLayer === "all",
    flood: initialLayer === "flood" || initialLayer === "all",
    stations: true,
  })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeBaseTile, setActiveBaseTile] = useState<"dark" | "light">("dark")

  // Layer groups refs to toggle visibility cleanly
  const layerGroupsRef = useRef<{
    radarLayer?: any
    cycloneLayer?: any
    floodLayer?: any
    stationsLayer?: any
    baseTileLayer?: any
  }>({})

  useEffect(() => {
    let isMounted = true

    async function initMap() {
      if (!mapContainerRef.current) return

      // Dynamically import leaflet to avoid SSR issues
      const L = (await import("leaflet")).default

      if (!isMounted) return

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const isMobile = typeof window !== "undefined" && window.innerWidth < 640
      const initialZoom = isMobile ? Math.max(3.8, zoom - 0.7) : zoom
      const initialCenter: [number, number] = center

      // Initialize map with India focus
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 3.5,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      })
      mapInstanceRef.current = map

      // Zoom control (topleft on mobile to leave bottom clear for layers)
      L.control.zoom({ position: isMobile ? "topleft" : "bottomleft" }).addTo(map)

      // Base Tile Layer (ArcGIS World Dark Gray or OpenStreetMap Light - NO WATERMARKS)
      const baseTileUrl = activeBaseTile === "dark"
        ? "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

      const baseTile = L.tileLayer(baseTileUrl, {
        maxZoom: 18,
        subdomains: "abc",
      }).addTo(map)
      layerGroupsRef.current.baseTileLayer = baseTile

      // ── 1. Live Weather Radar Layer (Precipitation Composite) ──
      const radarGroup = L.layerGroup()
      const radarTile = L.tileLayer(
        "https://tile.rainviewer.com/v2/radar/nowcast_latest/256/{z}/{x}/{y}/2/1_1.png",
        { opacity: 0.65, maxZoom: 12 }
      )
      radarGroup.addLayer(radarTile)
      layerGroupsRef.current.radarLayer = radarGroup
      if (layers.radar) radarGroup.addTo(map)

      // ── 2. Cyclone Track & Cone of Uncertainty Layer ──
      const cycloneGroup = L.layerGroup()
      
      const trackPoints: [number, number][] = [
        [12.5, 88.0],
        [14.2, 87.2],
        [16.0, 86.5],
        [18.1, 85.8],
        [19.8, 85.4],
        [20.8, 86.9], // Landfall near Paradip
        [22.2, 87.5],
      ]

      // Polyline for trajectory
      const trackLine = L.polyline(trackPoints, {
        color: "#ef4444",
        weight: 3.5,
        dashArray: "6, 8",
      })
      cycloneGroup.addLayer(trackLine)

      // Past/Forecast Nodes
      trackPoints.forEach((pt, idx) => {
        const isLandfall = idx === 5
        const marker = L.circleMarker(pt, {
          radius: isLandfall ? 10 : 5,
          color: isLandfall ? "#ffffff" : "#ef4444",
          fillColor: isLandfall ? "#dc2626" : "#f87171",
          fillOpacity: 0.9,
          weight: 2,
        }).bindTooltip(
          isLandfall ? "🔴 Landfall: Paradip Coast (120-135 km/h)" : `Position T+${idx * 6}h`,
          { permanent: isLandfall, direction: "top", className: "cyclone-tooltip font-bold" }
        )
        cycloneGroup.addLayer(marker)
      })

      // Cone of Uncertainty (Odisha / North Andhra / Bengal coast)
      const conePolygon: [number, number][] = [
        [12.5, 88.0],
        [17.5, 83.5], // Vishakhapatnam
        [20.5, 85.5], // Puri
        [22.5, 88.5], // Sunderbans
        [20.8, 89.5],
        [16.0, 89.0],
        [12.5, 88.0],
      ]
      const cone = L.polygon(conePolygon, {
        color: "#ef4444",
        weight: 1.5,
        fillColor: "#ef4444",
        fillOpacity: 0.15,
      }).bindTooltip("IMD 48h Cyclone Cone of Uncertainty (High Risk Coastal Zone)", { sticky: true })
      cycloneGroup.addLayer(cone)

      // Eye of Storm Landfall Pin
      const landfallMarker = L.marker([20.8, 86.9])
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.5; color: #0f172a; padding: 4px;">
            <strong style="color: #dc2626; font-size: 13px;">🌀 Cyclone Landfall Geofence</strong><br/>
            <strong>Region:</strong> Paradip & Kendrapara, Odisha<br/>
            <strong>Max Sustained Winds:</strong> 115-125 km/h (Gusts: 140 km/h)<br/>
            <strong>Storm Surge:</strong> 2.5 - 3.2 meters inundation
          </div>
        `)
      cycloneGroup.addLayer(landfallMarker)

      layerGroupsRef.current.cycloneLayer = cycloneGroup
      if (layers.cyclone) cycloneGroup.addTo(map)

      // ── 3. Coastal & Riverine Flood Inundation Hazard Zones ──
      const floodGroup = L.layerGroup()

      // Inundation Zone 1: Mahanadi Delta / Odisha Coast
      const floodZoneOdisha: [number, number][] = [
        [20.1, 85.8],
        [20.7, 86.8],
        [20.9, 86.5],
        [20.3, 85.5],
      ]
      const floodPoly1 = L.polygon(floodZoneOdisha, {
        color: "#0284c7",
        weight: 2,
        fillColor: "#0284c7",
        fillOpacity: 0.35,
      }).bindTooltip("Critical Flood Inundation Zone: Mahanadi Delta (High Hazard)", { sticky: true })
      floodGroup.addLayer(floodPoly1)

      // Inundation Zone 2: Mumbai Mithi River Basin
      const floodZoneMumbai: [number, number][] = [
        [19.03, 72.82],
        [19.12, 72.91],
        [19.16, 72.86],
        [19.06, 72.81],
      ]
      const floodPoly2 = L.polygon(floodZoneMumbai, {
        color: "#0284c7",
        weight: 2,
        fillColor: "#0284c7",
        fillOpacity: 0.35,
      }).bindTooltip("Urban Flood Hazard: Mithi River Corridor & Kurla Lowlands", { sticky: true })
      floodGroup.addLayer(floodPoly2)

      layerGroupsRef.current.floodLayer = floodGroup
      if (layers.flood) floodGroup.addTo(map)

      // ── 4. Live IMD Automatic Weather Stations (AWS) ──
      const stationsGroup = L.layerGroup()
      const STATIONS = [
        { name: "New Delhi (Safdarjung)", coords: [28.583, 77.209] as [number, number], temp: 32, aqi: 184, rain: 0 },
        { name: "Mumbai (Colaba)", coords: [18.906, 72.815] as [number, number], temp: 29, aqi: 74, rain: 28 },
        { name: "Chennai (Meenambakkam)", coords: [12.990, 80.180] as [number, number], temp: 33, aqi: 62, rain: 2 },
        { name: "Kolkata (Alipore)", coords: [22.530, 88.330] as [number, number], temp: 31, aqi: 110, rain: 14 },
        { name: "Bengaluru (HAL)", coords: [12.950, 77.668] as [number, number], temp: 26, aqi: 48, rain: 0 },
        { name: "Hyderabad (Begumpet)", coords: [17.450, 78.470] as [number, number], temp: 30, aqi: 82, rain: 0 },
        { name: "Puri (Coastal DWR)", coords: [19.813, 85.831] as [number, number], temp: 28, aqi: 42, rain: 48 },
        { name: "Jaipur (Sanganer)", coords: [26.820, 75.800] as [number, number], temp: 38, aqi: 145, rain: 0 },
      ]

      STATIONS.forEach((st) => {
        const circle = L.circleMarker(st.coords, {
          radius: 7,
          fillColor: st.rain > 10 ? "#0284c7" : st.temp > 35 ? "#ef4444" : "#10b981",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 11px; padding: 2px;">
            <strong style="color: #0f172a; font-size: 12px;">IMD AWS: ${st.name}</strong><br/>
            🌡️ Temperature: <strong>${st.temp}°C</strong><br/>
            🌧️ Rain Rate: <strong>${st.rain} mm</strong><br/>
            🍃 AQI: <strong>${st.aqi}</strong>
          </div>
        `)
        stationsGroup.addLayer(circle)
      })

      layerGroupsRef.current.stationsLayer = stationsGroup
      if (layers.stations) stationsGroup.addTo(map)

      // Fix container dimensions and fit to India
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
          mapInstanceRef.current.setView(initialCenter, initialZoom)
        }
      }, 250)
    }

    initMap()

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
      isMounted = false
      window.removeEventListener("resize", handleResize)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom, activeBaseTile])

  // Handle Layer toggles dynamically
  const toggleLayer = (key: keyof typeof layers) => {
    const next = !layers[key]
    setLayers((prev) => ({ ...prev, [key]: next }))

    const map = mapInstanceRef.current
    if (!map) return

    const group = 
      key === "radar" ? layerGroupsRef.current.radarLayer :
      key === "cyclone" ? layerGroupsRef.current.cycloneLayer :
      key === "flood" ? layerGroupsRef.current.floodLayer :
      layerGroupsRef.current.stationsLayer

    if (group) {
      if (next) map.addLayer(group)
      else map.removeLayer(group)
    }
  }

  // Switch Base Tiles
  const toggleTile = async () => {
    const nextTile = activeBaseTile === "dark" ? "light" : "dark"
    setActiveBaseTile(nextTile)
    const map = mapInstanceRef.current
    if (!map) return

    const L = (await import("leaflet")).default
    if (layerGroupsRef.current.baseTileLayer) {
      map.removeLayer(layerGroupsRef.current.baseTileLayer)
    }

    const url = nextTile === "dark"
      ? "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

    layerGroupsRef.current.baseTileLayer = L.tileLayer(url, {
      maxZoom: 18,
      subdomains: "abc",
    }).addTo(map)
  }

  // Center on India
  const resetView = () => {
    if (mapInstanceRef.current) {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640
      mapInstanceRef.current.setView(center, isMobile ? 4 : zoom)
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-blue-200/60 shadow-lg bg-slate-900 transition-all ${
        isFullscreen ? "fixed inset-0 z-[1000000] rounded-none m-0 p-0" : "w-full"
      }`}
      style={{ height: isFullscreen ? "100dvh" : height }}
    >
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Floating Top Header Toolbar */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-[1000] flex items-center justify-between gap-2 pointer-events-none">
        {/* Title badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-900/90 px-2.5 sm:px-3 py-1.5 backdrop-blur-md border border-white/15 text-white text-xs shadow-md pointer-events-auto max-w-[60%] sm:max-w-none">
          <Radio className="size-3.5 text-red-400 animate-pulse shrink-0" />
          <span className="font-bold tracking-wide truncate">
            {city ? `GIS: ${city}` : "India Radar & Hazard GIS"}
          </span>
          <span className="hidden sm:inline-block rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-mono">
            LIVE
          </span>
        </div>

        {/* Action Controls & Close Button */}
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-slate-900/90 p-1 backdrop-blur-md border border-white/15 text-white text-xs shadow-md pointer-events-auto">
          <button
            onClick={toggleTile}
            title="Toggle Light/Dark Map"
            className="rounded-lg px-2 py-1 hover:bg-white/10 transition-colors text-[11px] font-medium"
          >
            {activeBaseTile === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={resetView}
            title="Reset Map to India"
            className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"
          >
            <Navigation className="size-3.5 text-blue-300" />
          </button>
          <button
            onClick={() => {
              const next = !isFullscreen
              setIsFullscreen(next)
              setTimeout(() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.invalidateSize()
                }
              }, 150)
            }}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
            className={`rounded-lg px-2 py-1 transition-colors text-[11px] font-bold flex items-center gap-1 ${
              isFullscreen ? "bg-red-600 hover:bg-red-500 text-white shadow-md" : "hover:bg-white/10 text-white"
            }`}
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            <span>{isFullscreen ? "छोटा करें" : "फुलस्क्रीन"}</span>
          </button>
        </div>
      </div>

      {/* Layer Selector Bar at Bottom (Horizontally scrollable on mobile) */}
      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-14 right-2 sm:right-auto z-[1000] flex items-center gap-1.5 overflow-x-auto no-scrollbar rounded-xl bg-slate-950/90 p-1.5 backdrop-blur-md border border-white/15 text-white text-[11px] shadow-xl">
        <span className="text-slate-400 px-1 font-semibold flex items-center gap-1 shrink-0">
          <Layers className="size-3" /> Layers:
        </span>
        <button
          onClick={() => toggleLayer("radar")}
          className={`rounded-lg px-2.5 py-1 font-medium transition-all whitespace-nowrap shrink-0 ${
            layers.radar ? "bg-blue-600 text-white shadow-sm font-bold" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          📡 Doppler Radar
        </button>
        <button
          onClick={() => toggleLayer("cyclone")}
          className={`rounded-lg px-2.5 py-1 font-medium transition-all whitespace-nowrap shrink-0 ${
            layers.cyclone ? "bg-red-600 text-white shadow-sm font-bold" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          🌀 Cyclone Track
        </button>
        <button
          onClick={() => toggleLayer("flood")}
          className={`rounded-lg px-2.5 py-1 font-medium transition-all whitespace-nowrap shrink-0 ${
            layers.flood ? "bg-cyan-600 text-white shadow-sm font-bold" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          🌊 Flood Hazard
        </button>
        <button
          onClick={() => toggleLayer("stations")}
          className={`rounded-lg px-2.5 py-1 font-medium transition-all whitespace-nowrap shrink-0 ${
            layers.stations ? "bg-emerald-600 text-white shadow-sm font-bold" : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          📍 IMD Stations
        </button>
      </div>

      {/* Radar Intensity Legend (Desktop only) */}
      <div className="absolute bottom-3 right-3 z-[1000] hidden md:flex flex-col gap-1 rounded-xl bg-slate-950/85 p-2 backdrop-blur-md border border-white/10 text-[10px] text-white shadow-lg">
        <span className="font-semibold text-slate-300">Radar Reflectivity (dBZ)</span>
        <div className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm bg-cyan-400" title="Light Rain (15-25 dBZ)" />
          <span className="size-2.5 rounded-sm bg-blue-600" title="Moderate Rain (25-35 dBZ)" />
          <span className="size-2.5 rounded-sm bg-amber-400" title="Heavy Rain (35-45 dBZ)" />
          <span className="size-2.5 rounded-sm bg-red-600" title="Severe / Hail (>45 dBZ)" />
          <span className="ml-1 text-[9px] text-slate-400">15 → 55+ dBZ</span>
        </div>
      </div>
    </div>
  )
}
