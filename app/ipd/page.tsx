'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function IPDPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [admitted, setAdmitted] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [form, setForm] = useState({ patient_id: '', room_number: '', admit_date: '', status: 'admitted', notes: '' })
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchAdmitted() }, [])

  async function fetchAdmitted() {
    const { data } = await supabase
      .from('ipd_record')
      .select('*, patient:patient_id (name, phone, uhid)')
      .eq('status', 'admitted')
      .order('admit_date', { ascending: false })
    if (data) setAdmitted(data)
  }

  async function searchPatient(q: string) {
    setSearch(q)
    if (q.length < 2) { setSearchResults([]); return }
    const { data } = await supabase
      .from('patient')
      .select('id, name, phone, uhid')
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%,uhid.ilike.%${q}%`)
      .limit(5)
    setSearchResults(data || [])
  }

  function selectPatient(p: any) {
    setSelectedPatient(p)
    setForm(f => ({ ...f, patient_id: p.id }))
    setSearch(p.name)
    setSearchResults([])
  }

  async function admitPatient() {
    if (!form.patient_id || !form.room_number || !form.admit_date) {
      setMsg('Please fill all required fields'); return
    }
    setLoading(true)
    const { error } = await supabase.from('ipd_record').insert([form])
    setLoading(false)
    if (error) { setMsg('Error: ' + error.message); return }
    setMsg('Patient admitted successfully!')
    setForm({ patient_id: '', room_number: '', admit_date: '', status: 'admitted', notes: '' })
    setSelectedPatient(null); setSearch('')
    fetchAdmitted()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Admission Form */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold mb-4">Admit Patient</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Search Patient (name / phone / UHID)</label>
            <input value={search} onChange={e => searchPatient(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Start typing..." />
            {searchResults.length > 0 && (
              <div className="absolute z-10 bg-white border rounded-lg mt-1 w-full shadow-sm">
                {searchResults.map(p => (
                  <div key={p.id} onClick={() => selectPatient(p)}
                    className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                    {p.name} — {p.phone} — {p.uhid}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedPatient && (
            <div className="col-span-2 bg-blue-50 rounded-lg px-4 py-2 text-sm text-blue-800">
              Selected: <strong>{selectedPatient.name}</strong> | UHID: {selectedPatient.uhid}
            </div>
          )}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Room Number *</label>
            <input value={form.room_number} onChange={e => setForm(f => ({...f, room_number: e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. 101" />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Admit Date *</label>
            <input type="date" value={form.admit_date} onChange={e => setForm(f => ({...f, admit_date: e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Initial Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
          </div>
        </div>
        {msg && <p className="text-sm mt-3 text-blue-700">{msg}</p>}
        <button onClick={admitPatient} disabled={loading}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Admitting...' : 'Admit Patient'}
        </button>
      </div>

      {/* Admitted Patients */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold mb-4">Currently Admitted</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500 text-left">
              <th className="pb-2">Name</th><th className="pb-2">UHID</th>
              <th className="pb-2">Room</th><th className="pb-2">Admitted</th><th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
             {admitted.map((r, index) => (
                <tr key={r.id ?? index} className="border-b hover:bg-gray-50">
                <td className="py-2">{r.patient?.name}</td>
                <td className="py-2 font-mono text-xs">{r.patient?.uhid}</td>
                <td className="py-2">{r.room_number}</td>
                <td className="py-2">{r.admit_date}</td>
                <td className="py-2 flex gap-2">
                  <a href={`/ipd/notes?id=${r.id}`} className="text-blue-600 text-xs hover:underline">Notes</a>
                  <a href={`/ipd/discharge?id=${r.id}`} className="text-red-600 text-xs hover:underline">Discharge</a>
                </td>
              </tr>
            ))}
            {admitted.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-400">No patients admitted</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}