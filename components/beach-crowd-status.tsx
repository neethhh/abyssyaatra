"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type CrowdLevel = "busy" | "moderate" | "free"

const options: { value: CrowdLevel; label: string; detail: string }[] = [
  { value: "busy", label: "Busy", detail: "Lots of people" },
  { value: "moderate", label: "Moderate", detail: "Comfortably active" },
  { value: "free", label: "Free", detail: "Plenty of space" },
]

export function BeachCrowdStatus({ beachId, beachName, state }: { beachId: string; beachName: string; state: string }) {
  const [level, setLevel] = useState<CrowdLevel | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => setUser(data.user ? { id: data.user.id } : null))
    supabase.from("beach_reports").select("crowd_level").eq("beach_id", beachId).order("created_at", { ascending: false }).limit(1).maybeSingle().then(({ data }: { data: { crowd_level: CrowdLevel } | null }) => setLevel(data?.crowd_level ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => setUser(session?.user ? { id: session.user.id } : null))
    return () => listener.subscription.unsubscribe()
  }, [beachId])

  async function submit(next: CrowdLevel) {
    if (!user) return
    setSaving(true); setMessage("")
    const response = await fetch("/api/beach-updates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ beachName, state, crowdLevel: next, notes: `Current crowd level reported as ${next}.` }) })
    setSaving(false)
    if (response.ok) { setLevel(next); setMessage("Thanks — your update is pending review.") }
    else setMessage("We could not save that update. Please try again.")
  }

  return <section aria-labelledby={`${beachId}-crowd-title`} className="rounded-3xl border border-border bg-card/80 p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Live beach pulse</p><h3 id={`${beachId}-crowd-title`} className="mt-1 font-serif text-xl font-bold">How crowded is {beachName}?</h3><p className="mt-1 text-sm text-muted-foreground">Recent approved reports help everyone plan a better visit.</p></div>
      {level && <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${level === "busy" ? "bg-destructive/15 text-destructive" : level === "moderate" ? "bg-accent text-accent-foreground" : "bg-primary/15 text-primary"}`}>{level}</span>}
    </div>
    {user ? <div className="mt-4 grid grid-cols-3 gap-2">{options.map((option) => <button key={option.value} type="button" disabled={saving} onClick={() => submit(option.value)} className={`rounded-2xl border px-2 py-3 text-left transition hover:-translate-y-0.5 disabled:opacity-60 ${level === option.value ? "border-primary bg-primary/10" : "border-border bg-background"}`}><span className="block text-sm font-bold">{option.label}</span><span className="mt-1 block text-[11px] leading-tight text-muted-foreground">{option.detail}</span></button>)}</div> : <div className="mt-4 rounded-2xl bg-muted p-3 text-sm text-muted-foreground"> <Link className="font-semibold text-primary underline underline-offset-4" href="/auth/login">Sign in</Link> to report the current crowd level.</div>}
    {message && <p role="status" className="mt-3 text-xs font-medium text-muted-foreground">{message}</p>}
  </section>
}
