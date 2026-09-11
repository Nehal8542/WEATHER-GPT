import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { NextRequest, NextResponse } from 'next/server'

const baseHandler = toNextJsHandler(auth)

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || ''
  if (cookieHeader.includes('better-auth.session_data')) {
    const cleanedCookie = cookieHeader
      .split(';')
      .filter((c) => !c.trim().startsWith('better-auth.session_data') && !c.trim().startsWith('__Secure-better-auth.session_data'))
      .join(';')
    const headers = new Headers(req.headers)
    headers.set('cookie', cleanedCookie)
    const modifiedReq = new NextRequest(req.url, {
      method: req.method,
      headers,
    })
    const res = await baseHandler.GET(modifiedReq)
    res.headers.append('Set-Cookie', 'better-auth.session_data=; Path=/; Max-Age=0; HttpOnly')
    res.headers.append('Set-Cookie', '__Secure-better-auth.session_data=; Path=/; Max-Age=0; HttpOnly')
    return res
  }
  return baseHandler.GET(req)
}

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || ''
  if (cookieHeader.includes('better-auth.session_data')) {
    const cleanedCookie = cookieHeader
      .split(';')
      .filter((c) => !c.trim().startsWith('better-auth.session_data') && !c.trim().startsWith('__Secure-better-auth.session_data'))
      .join(';')
    const headers = new Headers(req.headers)
    headers.set('cookie', cleanedCookie)
    const bodyText = await req.text()
    const modifiedReq = new NextRequest(req.url, {
      method: req.method,
      headers,
      body: bodyText || undefined,
    })
    const res = await baseHandler.POST(modifiedReq)
    res.headers.append('Set-Cookie', 'better-auth.session_data=; Path=/; Max-Age=0; HttpOnly')
    res.headers.append('Set-Cookie', '__Secure-better-auth.session_data=; Path=/; Max-Age=0; HttpOnly')
    return res
  }
  return baseHandler.POST(req)
}

