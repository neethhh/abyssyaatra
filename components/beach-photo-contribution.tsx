'use client'

import { useState } from 'react'
import { Camera, CheckCircle2, Upload, X } from 'lucide-react'

const beaches = ['Radhanagar Beach', 'Palolem Beach', 'Varkala Beach', 'Marari Beach', 'Baga Beach', 'Puri Beach', 'Kovalam Beach', 'Other beach']

export function BeachPhotoContribution() {
  const [file, setFile] = useState<File | null>(null)
  const [beach, setBeach] = useState('')
  const [state, setState] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file || !beach || !state) return
    setStatus('submitting')
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('beach', beach)
    formData.append('state', state)
    formData.append('name', name)
    formData.append('email', email)
    try {
      const response = await fetch('/api/beach-photos', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')
      setStatus('success')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Please try again.')
      setStatus('error')
    }
  }

  return <section id="contribute" className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"><div className="grid lg:grid-cols-[0.9fr_1.1fr]"><div className="bg-primary p-6 text-primary-foreground lg:p-10"><Camera size={28} /><p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/70">See something beautiful?</p><h2 className="mt-2 font-serif text-4xl leading-tight">Help keep the coast current.</h2><p className="mt-4 text-sm leading-6 text-primary-foreground/75">Share a recent beach photo with fellow travellers. Our team reviews every submission before it appears in the guide.</p><div className="mt-8 flex items-center gap-3 text-sm"><CheckCircle2 size={18} /><span>Thank-you message after every submission</span></div></div><div className="p-6 lg:p-10">{status === 'success' ? <div className="flex min-h-72 flex-col justify-center"><CheckCircle2 size={32} className="text-primary" /><h3 className="mt-4 font-serif text-3xl font-bold">Thank you for helping travellers.</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Your photo is safely with our team and is now pending review. If approved, it will help future visitors see the beach as it is today.</p><button type="button" onClick={() => { setStatus('idle'); setFile(null); setBeach(''); setState(''); setName(''); setEmail('') }} className="mt-6 text-sm font-bold text-primary">Share another photo</button></div> : <form onSubmit={submit} className="grid gap-4"><div><label htmlFor="beach-photo" className="text-sm font-bold">Beach photo</label><label htmlFor="beach-photo" className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-primary/40 bg-secondary p-4"><span className="flex items-center gap-3 text-sm">{file ? file.name : 'Choose a JPG, PNG or WEBP'}</span>{file ? <button type="button" aria-label="Remove selected photo" onClick={(event) => { event.preventDefault(); setFile(null) }}><X size={18} /></button> : <Upload size={18} className="text-primary" />}</label><input id="beach-photo" required type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Beach<select required value={beach} onChange={(event) => setBeach(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm font-normal"><option value="">Select beach</option>{beaches.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-bold">State or region<input required value={state} onChange={(event) => setState(event.target.value)} placeholder="e.g. Goa" className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm font-normal" /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Your name <span className="font-normal text-muted-foreground">(optional)</span><input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm font-normal" /></label><label className="text-sm font-bold">Email <span className="font-normal text-muted-foreground">(optional)</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm font-normal" /></label></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<button disabled={status === 'submitting'} className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-60">{status === 'submitting' ? 'Sending photo…' : 'Submit photo'} <Upload size={16} /></button><p className="text-xs leading-5 text-muted-foreground">Please share only photos you took yourself. We do not publish your contact details.</p></form>}</div></div></div></section>
}

export default BeachPhotoContribution
