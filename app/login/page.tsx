'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CloudSun, LockKeyhole, Mail } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { signIn, signUp, useSession } from '@/lib/auth-client'
import { SkyBackground } from '@/components/sky-background'

export default function LoginPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user) router.replace('/')
  }, [session, router])

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      const result = await signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/`,
      })
      if (result?.error) {
        throw new Error(result.error.message || 'Google sign-in failed')
      }
      if (result?.data?.url) {
        window.location.href = result.data.url
        return
      }
    } catch (err: unknown) {
      console.error('[Google Sign-In Error]:', err)
      const message = err instanceof Error ? err.message : 'Google sign-in could not be started. Please try again.'
      setError(message)
      setLoading(false)
    }
  }

  async function handleEmail(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'sign-up') {
        const result = await signUp.email({ email, password, name: name || email.split('@')[0] })
        if (result.error) throw new Error(result.error.message || 'Registration failed')
      } else {
        const result = await signIn.email({ email, password })
        if (result.error) throw new Error(result.error.message || 'Login failed')
      }
      router.push('/')
      router.refresh()
    } catch {
      setError(
        mode === 'sign-up'
          ? 'Could not create your account. Try a different email.'
          : 'Wrong email or password. Please try again.',
      )
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen px-5 py-8 text-[#0f2f5a] sm:py-14">
      <SkyBackground />

      <div className="mx-auto max-w-md">
        <div className="mb-10 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-medium text-[#1e6fbf] shadow-sm backdrop-blur hover:bg-white/80 transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to WeatherGPT
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#1b6fc8] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#1557a8] transition-colors"
          >
            Try App →
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-[2rem] border border-blue-100 bg-white/90 p-7 shadow-[0_24px_80px_-20px_rgba(30,111,191,0.25)] backdrop-blur-xl sm:p-10">

          {/* Brand icon */}
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4d9de0] to-[#1446a0] text-white shadow-lg shadow-blue-300/40">
            <CloudSun className="size-8" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#0f2f5a]">
            {mode === 'sign-up' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 leading-7 text-[#4a7aa8]">
            Sign in to keep your saved places and weather history together.
          </p>

          {/* LLM Providers badge strip */}
          <div className="mt-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#7da5c8]">Powered by AI Models</p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "OpenAI GPT",  color: "#10a37f", icon: "🤖" },
                { name: "Gemini",       color: "#4285f4", icon: "✨" },
                { name: "Llama 3",      color: "#7c3aed", icon: "🦙" },
                { name: "Mistral",      color: "#ff7000", icon: "🌪️" },
              ].map(llm => (
                <span
                  key={llm.name}
                  style={{ borderColor: llm.color + "33", background: llm.color + "11", color: llm.color }}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
                >
                  {llm.icon} {llm.name}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[#a0bcd8]">Swap any model via .env — RAG architecture, no hallucinations</p>
          </div>

          {/* ── Google Sign-in Button ── */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="group mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-blue-200 bg-white px-4 py-4 text-sm font-semibold text-[#0f2f5a] shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md disabled:opacity-75 cursor-pointer"
          >
            {loading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent shrink-0" />
            ) : (
              /* Official Google "G" logo SVG */
              <svg className="size-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>{loading ? 'Connecting to Google…' : 'Continue with Google'}</span>
            {!loading && <span className="ml-auto text-blue-400 transition-transform group-hover:translate-x-0.5">→</span>}
          </button>

          {/* Prominent Error Message banner */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium flex items-start gap-2.5">
              <span className="size-2 rounded-full bg-red-500 mt-1 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Divider */}
          <div className="my-7 flex items-center gap-3 text-xs text-[#7da5c8]">
            <span className="h-px flex-1 bg-blue-100" />
            or continue with email
            <span className="h-px flex-1 bg-blue-100" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-4">
            {mode === 'sign-up' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0f2f5a]" htmlFor="name">
                  Your name
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav"
                    className="h-11 w-full bg-transparent text-sm text-[#0f2f5a] outline-none placeholder:text-[#a0bcd8]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0f2f5a]" htmlFor="email">
                Email address
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                <Mail className="size-4 text-[#7da5c8] shrink-0" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full bg-transparent text-sm text-[#0f2f5a] outline-none placeholder:text-[#a0bcd8]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0f2f5a]" htmlFor="password">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                <LockKeyhole className="size-4 text-[#7da5c8] shrink-0" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-11 w-full bg-transparent text-sm text-[#0f2f5a] outline-none placeholder:text-[#a0bcd8]"
                />
              </div>
            </div>

            <button
              id="email-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#4d9de0] to-[#1446a0] px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-300/40 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
            >
              {loading
                ? 'Please wait…'
                : mode === 'sign-up'
                  ? 'Create account'
                  : 'Sign in with email'}
            </button>
          </form>

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-[#7da5c8]">
            {mode === 'sign-up' ? 'Already have an account?' : 'New to WeatherGPT?'}{' '}
            <button
              id="mode-toggle-btn"
              type="button"
              onClick={() => {
                setError('')
                setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')
              }}
              className="font-semibold text-[#1e6fbf] hover:underline"
            >
              {mode === 'sign-up' ? 'Log in' : 'Create one'}
            </button>
          </p>

          <p className="mt-5 text-center text-xs leading-5 text-[#a0bcd8]">
            WeatherGPT gives weather guidance from trusted sources. Always follow official emergency instructions.
          </p>
        </div>
      </div>
    </main>
  )
}
