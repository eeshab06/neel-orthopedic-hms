'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function NotesContent() {
  const params = useSearchParams()
  const ipdId = params.get('id')
  const [record, setRecord] = useState<any>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [doctor, setDoctor] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ipdId) { fetchRecord(); fetchNotes() }
  }, [ipdId])

  async function fetchRecord() {
    const { data } = await supabase
      .from('ipd_record')
      .select('*, patient:patient_id (name, uhid)')
      .eq('ipd_id', ipdId)
      .single()
    setRecord(data)
  }

  async function fetchNotes() {
    const { data } = await supabase
      .from('ipd_record')
      .select('notes')
      .eq('ipd_id', ipdId)
      .single()
    if (data?.notes) setNotes(JSON.parse(data.notes || '[]'))
  }

  async function addNote() {
    if (!newNote.trim()) return
    setLoading(true)
    const entry = { date: new Date().toISOString(), doctor, text: newNote }
    const updated = [...notes, entry]
    await supabase.from('ipd_record').update({ notes: JSON.stringify(updated) }).eq('ipd_id', ipdId)
    setNotes(updated); setNewNote(''); setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {record && (
        <div className="bg-blue-50 rounded-xl px-5 py-4">
          <p className="font-semibold">{record.patient?.name}</p>
          <p className="text-sm text-gray-600">UHID: {record.patient?.uhid} | Room: {record.room_number} | Admitted: {record.admit_date}</p>
        </div>
      )}
      <div className="bg-white rounded-xl border p-6 space-y-3">
        <h2 className="font-semibold">Add Today&apos;s Note</h2>
        <input value={doctor} onChange={e => setDoctor(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Doctor name" />
        <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm" rows={4} placeholder="Clinical notes..." />
        <button onClick={addNote} disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Note'}
        </button>
      </div>
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Previous Notes</h2>
        {notes.length === 0 && <p className="text-sm text-gray-400">No notes yet</p>}
        {[...notes].reverse().map((n, i) => (
          <div key={i} className="border-b pb-3 mb-3 last:border-0">
            <p className="text-xs text-gray-400">{new Date(n.date).toLocaleString()} — Dr. {n.doctor}</p>
            <p className="text-sm mt-1">{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading...</div>}>
      <NotesContent />
    </Suspense>
  )
}