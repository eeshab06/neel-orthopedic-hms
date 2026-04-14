'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DischargePage() {
  const params = useSearchParams()
  const ipdId = params.get('id')
  const [record, setRecord] = useState<any>(null)
  const [form, setForm] = useState({ diagnosis: '', medicines: '', follow_up: '', discharge_date: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (ipdId) fetchRecord() }, [ipdId])

  async function fetchRecord() {
    const { data } = await supabase
      .from('ipd_record')
      .select('*, patient:patient_id (name, phone, uhid)')
      .eq('id', ipdId).single()
    setRecord(data)
  }

  async function saveDischarge() {
    const { error } = await supabase.from('discharge').insert([{
      ipd_record_id: ipdId,
      patient_id: record.patient_id,
      ...form
    }])
    if (!error) {
      await supabase.from('ipd_record').update({ status: 'discharged' }).eq('id', ipdId)
      setSaved(true)
    }
  }

  if (!record) return <p className="text-sm text-gray-400 p-6">Loading...</p>

  return (
    <div className="max-w-2xl mx-auto">
      {!saved ? (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Discharge — {record.patient?.name}</h2>
          <p className="text-sm text-gray-500">UHID: {record.patient?.uhid} | Admitted: {record.admit_date}</p>
          {['diagnosis','medicines','follow_up','discharge_date'].map(k => (
            <div key={k}>
              <label className="text-sm text-gray-600 capitalize mb-1 block">{k.replace('_',' ')}</label>
              {k === 'discharge_date' ? (
                <input type="date" value={form[k as keyof typeof form]}
                  onChange={e => setForm(f => ({...f, [k]: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              ) : (
                <textarea value={form[k as keyof typeof form]}
                  onChange={e => setForm(f => ({...f, [k]: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
              )}
            </div>
          ))}
          <button onClick={saveDischarge}
            className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-red-700">
            Discharge Patient
          </button>
        </div>
      ) : (
        <div id="print-card" className="bg-white rounded-xl border p-8 space-y-4">
          <div className="text-center border-b pb-4">
            <h1 className="text-xl font-bold">Neel Orthopaedic HMS</h1>
            <p className="text-sm text-gray-500">Discharge Summary</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-gray-500">Patient:</span> {record.patient?.name}</p>
            <p><span className="text-gray-500">UHID:</span> {record.patient?.uhid}</p>
            <p><span className="text-gray-500">Phone:</span> {record.patient?.phone}</p>
            <p><span className="text-gray-500">Room:</span> {record.room_number}</p>
            <p><span className="text-gray-500">Admitted:</span> {record.admit_date}</p>
            <p><span className="text-gray-500">Discharged:</span> {form.discharge_date}</p>
          </div>
          <div className="border-t pt-4 space-y-2 text-sm">
            <p><strong>Diagnosis:</strong> {form.diagnosis}</p>
            <p><strong>Medicines:</strong> {form.medicines}</p>
            <p><strong>Follow-up:</strong> {form.follow_up}</p>
          </div>
          <button onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 print:hidden">
            Print / Save PDF
          </button>
        </div>
      )}
    </div>
  )
}