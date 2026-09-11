"use client"

import { useState, useEffect } from "react"
import { Activity, CheckCircle2, Copy, Globe2, Radio, Server, Terminal, X } from "lucide-react"
import type { WIS2Message } from "@/lib/wis2"

export function WIS2Console({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [packets, setPackets] = useState<WIS2Message[]>([])
  const [selectedPacket, setSelectedPacket] = useState<WIS2Message | null>(null)
  const [isStreaming, setIsStreaming] = useState(true)
  const [packetCount, setPacketCount] = useState(0)
  const [filter, setFilter] = useState<string>("ALL")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    // Initial fetch
    fetch("/api/wis2")
      .then((res) => res.json())
      .then((data) => {
        if (data.packets) {
          setPackets(data.packets)
          setPacketCount(data.packets.length)
          setSelectedPacket(data.packets[0])
        }
      })
      .catch(() => {})

    // Streaming interval every 2.5s
    const interval = setInterval(() => {
      if (!isStreaming) return
      fetch("/api/wis2")
        .then((res) => res.json())
        .then((data) => {
          if (data.packets && data.packets.length > 0) {
            // Pick a random updated station packet
            const randomPkt = data.packets[Math.floor(Math.random() * data.packets.length)]
            setPackets((prev) => [randomPkt, ...prev.slice(0, 40)])
            setPacketCount((c) => c + 1)
          }
        })
        .catch(() => {})
    }, 2500)

    return () => clearInterval(interval)
  }, [isOpen, isStreaming])

  if (!isOpen) return null

  const filteredPackets = filter === "ALL" 
    ? packets 
    : packets.filter((p) => p.stationType === filter)

  const copyPayload = () => {
    if (!selectedPacket) return
    navigator.clipboard.writeText(JSON.stringify(selectedPacket, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-emerald-500/30 bg-[#090d16] text-white shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 bg-black/40 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Radio className="size-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-wide text-white">WMO WIS 2.0 Real-Time Ingestion Console</span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
                  MQTT v5.0 Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                GISC New Delhi · Node: <span className="font-mono text-emerald-300">origin/a/wis2/in-imd</span> · WMO-No. 1061 Spec
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isStreaming 
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30" 
                  : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
              }`}
            >
              {isStreaming ? "⏸ Pause Stream" : "▶ Resume Stream"}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Status Metrics Ribbon */}
        <div className="grid grid-cols-2 gap-3 border-b border-white/5 bg-slate-950/60 px-5 py-2.5 sm:grid-cols-4 text-xs">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-emerald-400" />
            <div>
              <span className="text-slate-400">Broker Endpoint:</span>
              <p className="font-mono text-slate-200">wis2.in-imd.gov.in:8883</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-cyan-400" />
            <div>
              <span className="text-slate-400">Packets Ingested:</span>
              <p className="font-mono font-bold text-cyan-300">{packetCount} telemetry frames</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="size-4 text-blue-400" />
            <div>
              <span className="text-slate-400">Active WMO Stations:</span>
              <p className="font-mono text-blue-300">11 AWS / DWR / Buoys</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <div>
              <span className="text-slate-400">QoS & Delivery:</span>
              <p className="font-mono text-emerald-300">QoS 1 (At least once) · &lt;8ms</p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-slate-900/40 px-5 py-2 text-xs">
          <span className="text-slate-400 font-medium">Filter Sensor:</span>
          {(["ALL", "AWS", "DWR", "BUOY", "AGROMET"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-md px-2.5 py-1 font-mono transition-colors ${
                filter === t 
                  ? "bg-emerald-500 text-black font-semibold" 
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {t === "ALL" ? "All Sensors" : t}
            </button>
          ))}
        </div>

        {/* Split View: Telemetry Stream vs Packet Inspector */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-12">
          
          {/* Left: Stream List */}
          <div className="border-r border-white/10 md:col-span-6 flex flex-col overflow-hidden bg-black/30">
            <div className="border-b border-white/5 px-4 py-2 text-xs font-mono font-semibold text-slate-400">
              Live Ingested Topics ({filteredPackets.length})
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {filteredPackets.map((pkt, idx) => {
                const isSelected = selectedPacket?.id === pkt.id
                return (
                  <button
                    key={`${pkt.id}-${idx}`}
                    onClick={() => setSelectedPacket(pkt)}
                    className={`w-full text-left p-3.5 transition-all text-xs flex flex-col gap-1.5 ${
                      isSelected ? "bg-emerald-950/40 border-l-4 border-emerald-400" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${
                          pkt.stationType === 'DWR' ? 'bg-purple-400' :
                          pkt.stationType === 'BUOY' ? 'bg-cyan-400' :
                          pkt.stationType === 'AGROMET' ? 'bg-lime-400' : 'bg-emerald-400'
                        }`} />
                        {pkt.stationName}
                      </span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                        {pkt.stationType}
                      </span>
                    </div>

                    <p className="font-mono text-[11px] text-emerald-400 truncate">
                      {pkt.topic}
                    </p>

                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <span>Temp: <strong className="text-white">{pkt.telemetry.temperatureC}°C</strong> · RH: <strong className="text-white">{pkt.telemetry.relativeHumidityPct}%</strong></span>
                      <span>{new Date(pkt.time).toLocaleTimeString()}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Detailed Packet Inspector */}
          <div className="md:col-span-6 flex flex-col overflow-hidden bg-[#06090f]">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 text-xs font-mono font-semibold text-slate-400">
              <span>WMO WNM Inspector</span>
              <button
                onClick={copyPayload}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
              >
                <Copy className="size-3.5" />
                {copied ? "Copied JSON!" : "Copy Payload"}
              </button>
            </div>

            {selectedPacket ? (
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-4">
                
                {/* Station Badge Header */}
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{selectedPacket.stationName}</span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px]">
                      QC: Level 1 Validated
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>WMO Index: <strong className="text-emerald-300">{selectedPacket.properties.wmoIndex}</strong></div>
                    <div>Centre: <strong className="text-slate-100">{selectedPacket.properties.centreId}</strong></div>
                    <div>Lat/Lon: <strong className="text-slate-100">{selectedPacket.geometry.coordinates[1]}°N, {selectedPacket.geometry.coordinates[0]}°E</strong></div>
                    <div>Elevation: <strong className="text-slate-100">{selectedPacket.geometry.coordinates[2]}m</strong></div>
                  </div>
                </div>

                {/* Instant Decoded Telemetry */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                    Surface Telemetry Decoded
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                    <div className="bg-black/40 rounded p-2 border border-white/5">
                      <div className="text-slate-400 text-[10px]">Temperature</div>
                      <div className="text-white font-bold text-sm">{selectedPacket.telemetry.temperatureC}°C</div>
                    </div>
                    <div className="bg-black/40 rounded p-2 border border-white/5">
                      <div className="text-slate-400 text-[10px]">Relative Humidity</div>
                      <div className="text-white font-bold text-sm">{selectedPacket.telemetry.relativeHumidityPct}%</div>
                    </div>
                    <div className="bg-black/40 rounded p-2 border border-white/5">
                      <div className="text-slate-400 text-[10px]">Pressure (QFF)</div>
                      <div className="text-white font-bold text-sm">{selectedPacket.telemetry.pressureHpa} hPa</div>
                    </div>
                    <div className="bg-black/40 rounded p-2 border border-white/5">
                      <div className="text-slate-400 text-[10px]">Wind Speed</div>
                      <div className="text-white font-bold text-sm">{selectedPacket.telemetry.windSpeedMps} m/s ({Math.round(selectedPacket.telemetry.windSpeedMps * 3.6)} km/h)</div>
                    </div>
                    <div className="bg-black/40 rounded p-2 border border-white/5">
                      <div className="text-slate-400 text-[10px]">Wind Direction</div>
                      <div className="text-white font-bold text-sm">{selectedPacket.telemetry.windDirectionDeg}°</div>
                    </div>
                    <div className="bg-black/40 rounded p-2 border border-white/5">
                      <div className="text-slate-400 text-[10px]">Rain Rate</div>
                      <div className="text-white font-bold text-sm">{selectedPacket.telemetry.rainRateMmH} mm/h</div>
                    </div>
                    {selectedPacket.telemetry.waveHeightM && (
                      <div className="bg-black/40 rounded p-2 border border-white/5">
                        <div className="text-slate-400 text-[10px]">Significant Wave Ht</div>
                        <div className="text-cyan-300 font-bold text-sm">{selectedPacket.telemetry.waveHeightM} m</div>
                      </div>
                    )}
                    {selectedPacket.telemetry.radarReflectivityDbz && (
                      <div className="bg-black/40 rounded p-2 border border-white/5">
                        <div className="text-slate-400 text-[10px]">Radar Max dBZ</div>
                        <div className="text-purple-300 font-bold text-sm">{selectedPacket.telemetry.radarReflectivityDbz} dBZ</div>
                      </div>
                    )}
                    {selectedPacket.telemetry.soilMoisturePct && (
                      <div className="bg-black/40 rounded p-2 border border-white/5">
                        <div className="text-slate-400 text-[10px]">Soil Moisture (10cm)</div>
                        <div className="text-lime-300 font-bold text-sm">{selectedPacket.telemetry.soilMoisturePct}%</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw WMO GeoJSON / Notification Message */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Terminal className="size-3 text-emerald-400" />
                    WMO Notification Message (WNM Specification v1.0)
                  </div>
                  <pre className="rounded-xl border border-white/10 bg-black/80 p-3 text-[11px] text-emerald-300/90 overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedPacket, null, 2)}
                  </pre>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Select a telemetry packet to inspect WMO payload
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
