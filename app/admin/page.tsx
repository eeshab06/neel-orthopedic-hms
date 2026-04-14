'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PIN = '2463'

export default function AdminPage() {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ patients: 0, admitted: 0, surgeries: 0 })
  const [patients, setPatients] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [enquiries, setEnquiries] = useState<any[]>([])

  function checkPin() {
    if (pin === ADMIN_PIN) { setUnlocked(true); fetchAll() }
    else { setError('Incorrect PIN'); setPin('') }
  }

  async function fetchAll() {
    const [{ count: pc }, { count: ac }, { count: sc }, { data: p }, { data: l }, { data: e }] = await Promise.all([
      supabase.from('patient').select('*', { count: 'exact', head: true }),
      supabase.from('ipd_record').select('*', { count: 'exact', head: true }).eq('status', 'admitted'),
      supabase.from('surgery').select('*', { count: 'exact', head: true }),
      supabase.from('patient').select('id, name, uhid, phone').order('id', { ascending: false }).limit(20),
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('contact_enquiry').select('*').order('created_at', { ascending: false }).limit(10)
    ])
    setStats({ patients: pc || 0, admitted: ac || 0, surgeries: sc || 0 })
    setPatients(p || []); setLogs(l || []); setEnquiries(e || [])
  }

  if (!unlocked) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border p-8 w-80 space-y-4 text-center">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <p className="text-sm text-gray-500">Enter PIN to continue</p>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkPin()}
          className="w-full border rounded-xl px-4 py-3 text-center text-2xl tracking-widest"
          maxLength={4} placeholder="••••" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button onClick={checkPin}
          className="w-full bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700">
          Enter
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {[['Total Patients', stats.patients], ['Currently Admitted', stats.admitted], ['Surgeries Scheduled', stats.surgeries]].map(([l, v]) => (
          <div key={l as string} className="bg-white rounded-xl border p-5">
            <p className="text-sm text-gray-500">{l}</p>
            <p className="text-3xl font-semibold mt-1">{v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">All Patients</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-gray-500">
            <th className="text-left pb-2">Name</th><th className="text-left pb-2">UHID</th><th className="text-left pb-2">Phone</th>
          </tr></thead>
          <tbody>{patients.map(p => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="py-2">{p.name}</td>
              <td className="py-2 font-mono text-xs">{p.uhid}</td>
              <td className="py-2">{p.phone}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Audit Log</h2>
          {logs.map((l, i) => (
            <div key={i} className="text-xs border-b py-2 text-gray-600">
              <span className="text-gray-400">{new Date(l.created_at).toLocaleString()}</span> — {l.action}
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-gray-400">No logs yet</p>}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Contact Enquiries</h2>
          {enquiries.map((e, i) => (
            <div key={i} className="text-xs border-b py-2">
              <p className="font-medium">{e.name} — {e.email}</p>
              <p className="text-gray-500 mt-0.5">{e.message}</p>
            </div>
          ))}
          {enquiries.length === 0 && <p className="text-sm text-gray-400">No enquiries yet</p>}
        </div>
      </div>
    </div>
  )
}