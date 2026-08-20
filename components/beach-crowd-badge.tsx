"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type CrowdLevel = "busy" | "moderate" | "free"

const styles: Record<CrowdLevel, string> = {
  busy: "bg-destructive/15 text-destructive",
  moderate: "bg-accent text-accent-foreground",
  free: "bg-primary/15 text-primary",
}

export function BeachCrowdBadge({ beachId }: { beachId: string }) {
  const [level, setLevel] = useState<CrowdLevel | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from("beach_reports").select("crowd_level").eq("beach_id", beachId).order("created_at", { ascending: false }).limit(1).maybeSingle().then(({ data }: { data: { crowd_level: CrowdLevel } | null }) => setLevel(data?.crowd_level ?? null))
  }, [beachId])

  if (!level) return <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground">No crowd report</span>
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${styles[level]}`}>{level}</span>
}

export function CrowdLegend() {
  return <div className="flex flex-wrap gap-2 text-xs font-bold"><span className={`rounded-full px-2.5 py-1 ${styles.free}`}>Free</span><span className={`rounded-full px-2.5 py-1 ${styles.moderate}`}>Moderate</span><span className={`rounded-full px-2.5 py-1 ${styles.busy}`}>Busy</span></div>
}
