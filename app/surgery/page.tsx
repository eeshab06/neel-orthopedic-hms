'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SurgeryPage() {
  const [surgeries, setSurgeries] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [implants, setImplants] = useState<any[]>([])
  const [form, setForm] = useState({
    patient_id: '', surgery_type: '', surgery_date: '',
    ot_number: '', implant_id: '', assistant_surgeon: '',
    anaesthesia_doctor: 'Dr. Vijay Rangani'
  })
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: s }, { data: p }, { data: i }] = await Promise.all([
      supabase.from('surgery').select('*, patient:patient_id (name, uhid)').order('surgery_date'),
      supabase.from('patient').select('id, name, uhid'),
      supabase.from('implant').select('id, name, stock_quantity')
    ])
    setSurgeries(s || []); setPatients(p || []); setImplants(i || [])
  }

  async function addSurgery() {
    if (!form.patient_id || !form.surgery_type || !form.surgery_date || !form.ot_number) {
      setMsg('Fill required fields'); return
    }
    const { error } = await supabase.from('surgery').insert([form])
    if (error) { setMsg(error.message); return }
    setMsg('Surgery scheduled!'); fetchAll()
    setForm({ patient_id:'', surgery_type:'', surgery_date:'', ot_number:'', implant_id:'', assistant_surgeon:'', anaesthesia_doctor:'Dr. Vijay Rangani' })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Schedule Surgery</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Patient *</label>
            <select value={form.patient_id} onChange={e => setForm(f=>({...f,patient_id:e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.uhid})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Surgery Type *</label>
            <input value={form.surgery_type} onChange={e => setForm(f=>({...f,surgery_type:e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Knee Replacement" />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Date *</label>
            <input type="date" value={form.surgery_date} onChange={e => setForm(f=>({...f,surgery_date:e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">OT Number *</label>
            <input value={form.ot_number} onChange={e => setForm(f=>({...f,ot_number:e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="OT1 / OT2" />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Implant (optional)</label>
            <select value={form.implant_id} onChange={e => setForm(f=>({...f,implant_id:e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">None</option>
              {implants.map(i => <option key={i.id} value={i.id}>{i.name} (stock: {i.stock_quantity})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Assistant Surgeon</label>
            <input value={form.assistant_surgeon} onChange={e => setForm(f=>({...f,assistant_surgeon:e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Anaesthesia Doctor</label>
            <input value={form.anaesthesia_doctor} onChange={e => setForm(f=>({...f,anaesthesia_doctor:e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        {msg && <p className="text-sm mt-3 text-blue-700">{msg}</p>}
        <button onClick={addSurgery}
          className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-teal-700">
          Schedule Surgery
        </button>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Upcoming Surgeries</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-gray-500 text-left">
            <th className="pb-2">Patient</th><th className="pb-2">Surgery</th>
            <th className="pb-2">Date</th><th className="pb-2">OT</th><th className="pb-2">Anaesthesia</th>
          </tr></thead>
          <tbody>
            {surgeries.map(s => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{s.patient?.name}</td>
                <td className="py-2">{s.surgery_type}</td>
                <td className="py-2">{s.surgery_date}</td>
                <td className="py-2">{s.ot_number}</td>
                <td className="py-2">{s.anaesthesia_doctor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}