import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const [{ data: badges, error: badgesError }, { data: earned, error: earnedError }, { data: visits }, { data: reports }] = await Promise.all([
    supabase.from('badges').select('id, track, name, threshold, icon, sort_order').order('track').order('sort_order'),
    supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id),
    supabase.from('beach_visits').select('beach_id').eq('user_id', user.id).eq('status', 'approved'),
    supabase.from('beach_reports').select('id').eq('user_id', user.id),
  ])
  if (badgesError || earnedError) return NextResponse.json({ error: 'Unable to load rewards.' }, { status: 500 })
  return NextResponse.json({ badges: badges ?? [], earned: earned ?? [], explorerCount: new Set((visits ?? []).map((visit) => visit.beach_id)).size, pulseCount: reports?.length ?? 0 })
}
