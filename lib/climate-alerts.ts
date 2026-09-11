/**
 * SIH DEMO: Climate Threshold Monitoring & Automatic SMS Alert Engine
 * 
 * Reusable core logic for:
 * 1. Climate threshold comparison
 * 2. Duplicate prevention / debounce cooldown
 * 3. Safe SMS notification dispatch (Twilio / SMS Gateway with simulated fallback)
 * 4. Dedicated MongoDB collection: 'climate_alerts'
 */

import { getMongoDb } from '@/lib/mongodb'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export interface ClimateAlertRecord {
  userId: string
  parameter: string
  currentValue: number
  threshold: number
  status: 'NORMAL' | 'WARNING' | 'CRITICAL'
  alertType: string
  reason: string
  smsStatus: string
  city: string
  isDemo?: boolean
  createdAt: string
}

export interface ClimateCheckResult {
  parameter: string
  currentValue: number
  threshold: number
  status: 'NORMAL' | 'WARNING' | 'CRITICAL'
  isLimitCrossed: boolean
  reason: string
  smsStatus: string
  city: string
  lastCheckedAt: string
  lastAlertAt?: string
  isDemo?: boolean
  simulated?: boolean
  cooldownActive?: boolean
}

// In-memory alert history for cooldown tracking & offline demo fallback
let lastAlertCache: {
  timestamp: number
  parameter: string
  city: string
  status: string
} | null = null

/**
 * Centrally retrieve configured climate thresholds from environment variables
 */
export function getClimateThresholds() {
  return {
    // Threshold 1: Max Temperature in °C (Default: 40.0°C)
    threshold1: parseFloat(process.env.CLIMATE_THRESHOLD_1 || '40.0'),
    // Threshold 2: Thermal Anomaly deviation in °C vs 30-Yr IMD normal (Default: 4.5°C)
    threshold2: parseFloat(process.env.CLIMATE_THRESHOLD_2 || '4.5'),
    // Threshold 3: Precipitation in mm (Default: 100.0mm)
    threshold3: parseFloat(process.env.CLIMATE_THRESHOLD_3 || '100.0'),
    // Cooldown in minutes to prevent duplicate SMS (Default: 30 minutes)
    cooldownMinutes: parseInt(process.env.CLIMATE_ALERT_COOLDOWN_MINUTES || '30', 10),
  }
}

/**
 * Safe SMS dispatch function using server-side environment variables.
 * If credentials are missing, operates in Safe Simulation Mode without crashing.
 */
export async function sendClimateSms({
  to,
  city,
  parameter,
  currentValue,
  threshold,
  status,
  reason,
}: {
  to?: string
  city: string
  parameter: string
  currentValue: number
  threshold: number
  status: string
  reason: string
}): Promise<{ success: boolean; simulated: boolean; status: string; sid?: string; error?: string }> {
  const accountSid = process.env.SMS_API_KEY || process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.SMS_API_SECRET || process.env.TWILIO_AUTH_TOKEN
  const fromPhone = process.env.SMS_FROM || process.env.TWILIO_PHONE_NUMBER
  const destinationPhone = to || process.env.SMS_TO || '+919876543210'

  const messageBody =
    `🚨 [WeatherGPT Climate Alert: ${city.toUpperCase()}]\n` +
    `Status: ${status}\n` +
    `Parameter: ${parameter}\n` +
    `Current Value: ${currentValue}°C\n` +
    `Threshold: ${threshold}°C\n` +
    `Reason: ${reason}\n` +
    `Time: ${new Date().toLocaleTimeString('en-IN')}\n` +
    `Stay safe and take protective precautions!`

  // Check if live credentials exist
  const hasLiveCredentials =
    accountSid &&
    authToken &&
    fromPhone &&
    accountSid.startsWith('AC') &&
    !accountSid.includes('your_') &&
    !authToken.includes('your_')

  if (!hasLiveCredentials) {
    // Safe Server-Side Simulation Log
    console.log('\n======================================================')
    console.log('📢 [DEMO SMS ALERT - SIMULATED DELIVERY]')
    console.log(`To: ${destinationPhone}`)
    console.log(`From: ${fromPhone || '+1234567890 (Simulated)'}`)
    console.log(`Message Body:\n${messageBody}`)
    console.log('======================================================\n')

    return {
      success: true,
      simulated: true,
      status: 'SMS configuration not available (Simulated Delivery)',
      sid: `SIM_SMS_${Date.now()}`,
    }
  }

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`

    const params = new URLSearchParams()
    params.append('From', fromPhone)
    params.append('To', destinationPhone)
    params.append('Body', messageBody)

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Twilio SMS delivery error:', data)
      return {
        success: false,
        simulated: false,
        status: `SMS Delivery Failed: ${data.message || 'Twilio Error'}`,
        error: data.message,
      }
    }

    return {
      success: true,
      simulated: false,
      status: 'Sent',
      sid: data.sid,
    }
  } catch (err: any) {
    console.error('Twilio Network Error:', err)
    return {
      success: false,
      simulated: false,
      status: `SMS Error: ${err.message || 'Connection failed'}`,
      error: err.message,
    }
  }
}

/**
 * Reusable Core Logic: checkClimateThreshold
 * Used identically for both REAL climate data and DEMO test triggers.
 */
export async function checkClimateThreshold(
  currentValue: number,
  threshold: number,
  options?: {
    parameter?: string
    city?: string
    isDemo?: boolean
    userId?: string
    forceSms?: boolean
  }
): Promise<ClimateCheckResult> {
  const parameter = options?.parameter || 'Temperature'
  const city = options?.city || 'Delhi'
  const isDemo = options?.isDemo || false
  const now = new Date()
  const nowIso = now.toISOString()
  const nowMs = now.getTime()

  const { cooldownMinutes } = getClimateThresholds()
  const cooldownMs = cooldownMinutes * 60 * 1000

  // Threshold comparison logic
  const isLimitCrossed = currentValue >= threshold

  let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL'
  let reason = 'Within safe climate baseline limits.'
  let smsStatus = 'Not Required'
  let cooldownActive = false

  if (isLimitCrossed) {
    // If significantly above threshold (>= threshold + 2°C), flag as CRITICAL
    status = currentValue >= threshold + 2 ? 'CRITICAL' : 'WARNING'
    reason = 'Climate threshold exceeded.'

    // Check cooldown to prevent duplicate SMS spam on page reloads
    if (
      !options?.forceSms &&
      lastAlertCache &&
      lastAlertCache.parameter === parameter &&
      lastAlertCache.city.toLowerCase() === city.toLowerCase() &&
      nowMs - lastAlertCache.timestamp < cooldownMs
    ) {
      const minutesRemaining = Math.ceil((cooldownMs - (nowMs - lastAlertCache.timestamp)) / 60000)
      smsStatus = `Cooldown Active (${minutesRemaining}m remaining - duplicate SMS prevented)`
      cooldownActive = true
    } else {
      // Trigger SMS notification
      const smsResult = await sendClimateSms({
        city,
        parameter,
        currentValue,
        threshold,
        status,
        reason,
      })

      smsStatus = smsResult.status

      // Update cooldown cache
      lastAlertCache = {
        timestamp: nowMs,
        parameter,
        city,
        status,
      }
    }

    // Save alert record to separate 'climate_alerts' collection in MongoDB
    try {
      const db = await getMongoDb()
      const alertDoc: ClimateAlertRecord = {
        userId: options?.userId || 'demo_guest',
        parameter,
        currentValue,
        threshold,
        status,
        alertType: isDemo ? 'SIH_DEMO_CLIMATE_ALERT' : 'CLIMATE_THRESHOLD_ALERT',
        reason,
        smsStatus,
        city,
        isDemo,
        createdAt: nowIso,
      }

      await db.collection('climate_alerts').insertOne(alertDoc)
    } catch (dbErr) {
      console.warn('MongoDB note: could not persist to climate_alerts:', dbErr)
    }
  }

  return {
    parameter,
    currentValue,
    threshold,
    status,
    isLimitCrossed,
    reason,
    smsStatus,
    city,
    lastCheckedAt: nowIso,
    lastAlertAt: isLimitCrossed ? nowIso : lastAlertCache ? new Date(lastAlertCache.timestamp).toISOString() : undefined,
    isDemo,
    cooldownActive,
  }
}

/**
 * Server session lookup using Better Auth
 */
export async function getAuthenticatedUserId(): Promise<string> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session?.user?.id || 'demo_guest'
  } catch (_) {
    return 'demo_guest'
  }
}
