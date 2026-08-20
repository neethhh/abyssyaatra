'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(''); const { error } = await createClient().auth.signInWithPassword({ email, password }); setBusy(false); if (error) setError(error.message.toLowerCase().includes('confirm') ? 'Please confirm your email before signing in.' : error.status === 429 ? 'Too many attempts. Please try again later.' : 'Invalid email or password.'); else window.location.href = '/' }
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12"><form onSubmit={submit} className="flex w-full max-w-md flex-col gap-5 rounded-3xl border border-border bg-card p-7 shadow-sm"><div><p className="eyebrow">AbyssYaatra account</p><h1 className="font-serif text-4xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-muted-foreground">Sign in to share trusted beach updates.</p></div>{error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<label className="flex flex-col gap-2 text-sm font-semibold">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" /></label><label className="flex flex-col gap-2 text-sm font-semibold">Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" /></label><Button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button><p className="text-center text-sm text-muted-foreground">New here? <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/sign-up">Create an account</Link></p></form></main>
}
