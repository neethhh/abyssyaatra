import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    const beach = String(form.get('beach') ?? '').trim()
    const state = String(form.get('state') ?? '').trim()
    const name = String(form.get('name') ?? '').trim().slice(0, 80)
    const email = String(form.get('email') ?? '').trim().slice(0, 160)
    if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Please choose a JPG, PNG or WEBP image under 8 MB.' }, { status: 400 })
    if (beach.length < 2 || beach.length > 120 || state.length < 2 || state.length > 80) return NextResponse.json({ error: 'Please add the beach and state.' }, { status: 400 })
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Please check the email address.' }, { status: 400 })
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `pending/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from('beach-submissions').upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError
    const { error: insertError } = await supabase.from('beach_photo_submissions').insert({ beach_name: beach, state, storage_path: path, contributor_name: name || null, contributor_email: email || null, status: 'pending' })
    if (insertError) {
      await supabase.storage.from('beach-submissions').remove([path])
      throw insertError
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Beach photo submission failed:', error)
    return NextResponse.json({ error: 'We could not receive that photo. Please try again.' }, { status: 500 })
  }
}
