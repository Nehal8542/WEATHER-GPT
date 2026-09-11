import { type NextRequest, NextResponse } from 'next/server'
import {
  normalizePhoneNumber,
  sendTwilioMessage,
} from '@/lib/notifications'
import { getMongoDb } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      phoneNumber,
      affectedArea,
      hazard = 'Severe Weather Hazard',
      headline = 'Emergency weather warning issued for your region',
      action = 'Stay indoors and follow official safety guidelines.',
      severity = 'Red',
      channels = ['sms'],
    } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number is required' },
        { status: 400 }
      )
    }

    if (!affectedArea) {
      return NextResponse.json(
        { success: false, error: 'Affected area / district is required' },
        { status: 400 }
      )
    }

    const cleanPhone = normalizePhoneNumber(phoneNumber)
    const validChannels = (Array.isArray(channels) ? channels : [channels]).filter(
      (c: string) => c === 'sms' || c === 'whatsapp'
    ) as ('sms' | 'whatsapp')[]

    if (validChannels.length === 0) {
      validChannels.push('sms')
    }

    // Build high-priority Emergency Bulletin for Affected Area
    const badge = severity.toUpperCase() === 'RED' ? '🔴 RED ALERT' : '🟠 WARNING'
    const emergencyBulletin =
      `🚨 [WeatherGPT EMERGENCY BROADCAST]\n` +
      `📍 Affected Area: ${affectedArea}\n` +
      `⚠️ Level: ${badge} (${hazard})\n\n` +
      `📢 ${headline}\n\n` +
      `🛡️ Safety Action:\n${action}\n\n` +
      `📞 Helplines: 1070 (NDMA) | 1077 (District Control) | 112\n` +
      `Stay alert & safe!`

    const results = []
    for (const ch of validChannels) {
      const res = await sendTwilioMessage({
        to: cleanPhone,
        channel: ch,
        body: emergencyBulletin,
      })
      results.push(res)
    }

    const allSuccessful = results.every((r) => r.success)
    const isSimulated = results.some((r) => r.simulated)

    // Log to MongoDB emergency_dispatches
    try {
      const db = await getMongoDb()
      await db.collection('emergency_dispatches').insertOne({
        phoneNumber: cleanPhone,
        affectedArea,
        hazard,
        severity,
        headline,
        channels: validChannels,
        simulated: isSimulated,
        createdAt: new Date().toISOString(),
      })
    } catch (_) {}

    return NextResponse.json({
      success: allSuccessful,
      affectedArea,
      recipient: cleanPhone,
      channels: validChannels,
      results,
      simulated: isSimulated,
      message: isSimulated
        ? `Direct alert for ${affectedArea} simulated to ${cleanPhone} (Add Twilio credentials in .env.local for physical delivery)`
        : `Direct emergency alert sent successfully to ${cleanPhone} for ${affectedArea}!`,
    })
  } catch (err: any) {
    console.error('Direct alert error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to dispatch direct alert' },
      { status: 500 }
    )
  }
}
