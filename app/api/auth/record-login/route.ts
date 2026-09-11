import { type NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    let name = session?.user?.name || 'User'
    let email = session?.user?.email
    let userId = session?.user?.id

    if (!email) {
      try {
        const body = await req.json()
        if (body.email) email = body.email
        if (body.name) name = body.name
        if (body.userId) userId = body.userId
      } catch (_) {}
    }

    if (!email) {
      return NextResponse.json({ success: false, error: 'No active user session' }, { status: 400 })
    }

    const now = new Date()
    const loginRecord = {
      name,
      email,
      userId: userId || null,
      provider: 'google',
      loginTime: now,
      loginDateFormatted: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      userAgent: req.headers.get('user-agent') || 'Browser',
      ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      status: 'SUCCESSFUL_LOGIN',
      createdAt: now.toISOString(),
    }

    const db = await getMongoDb('weathergpt')
    await db.collection('login_history').insertOne(loginRecord)

    // Also sync to test database
    try {
      const testDb = await getMongoDb('test')
      await testDb.collection('login_history').insertOne(loginRecord)
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Login recorded to MongoDB login_history successfully!',
      record: loginRecord,
    })
  } catch (err: any) {
    console.error('Error recording login history:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
