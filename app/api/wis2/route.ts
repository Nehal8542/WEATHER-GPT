import { NextResponse } from "next/server"
import { INDIAN_WMO_STATIONS, generateWIS2Message, type WIS2Message } from "@/lib/wis2"

export const dynamic = "force-dynamic"

export async function GET() {
  // Generate telemetry batch for active WMO stations
  const packets: WIS2Message[] = INDIAN_WMO_STATIONS.map((st) => generateWIS2Message(st))

  return NextResponse.json({
    protocol: "WIS 2.0",
    specification: "WMO-No. 1061 (Manual on the WMO Information System)",
    broker: "mqtts://wis2.in-imd.gov.in:8883",
    timestamp: new Date().toISOString(),
    nodeCentre: "Global Information System Centre (GISC) New Delhi",
    totalStationsActive: INDIAN_WMO_STATIONS.length,
    packets,
  })
}
