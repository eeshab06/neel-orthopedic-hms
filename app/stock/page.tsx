'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function StockPage() {
  const [medicines, setMedicines] = useState<any[]>([])
  const [implants, setImplants] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [updating, setUpdating] = useState<string | null>(null)
  const [qty, setQty] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: m }, { data: i }, { data: a }] = await Promise.all([
      supabase.from('pharmacy_item').select('*').order('name'),
      supabase.from('implant').select('*').order('name'),
      supabase.from('stock_alert').select('*').eq('resolved', false)
    ])
    setMedicines(m || []); setImplants(i || []); setAlerts(a || [])
  }

  async function updateStock(table: string, id: string, newQty: number) {
    await supabase.from(table).update({ stock_quantity: newQty }).eq('id', id)
    setUpdating(null); setQty(''); fetchAll()
  }

  async function resolveAlert(id: string) {
    await supabase.from('stock_alert').update({ resolved: true }).eq('id', id)
    fetchAll()
  }

  const soon = new Date(); soon.setDate(soon.getDate() + 30)
  const expiring = medicines.filter(m => m.expiry_date && new Date(m.expiry_date) <= soon)

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-5">
          <h2 className="font-semibold text-red-800 mb-3">Low Stock Alerts ({alerts.length})</h2>
          {alerts.map(a => (
            <div key={a.id} className="flex items-center justify-between py-1 text-sm text-red-700">
              <span>{a.item_name} — {a.message}</span>
              <button onClick={() => resolveAlert(a.id)}
                className="text-xs bg-red-100 px-3 py-1 rounded-lg hover:bg-red-200">Mark Resolved</button>
            </div>
          ))}
        </div>
      )}

      {/* Expiring soon */}
      {expiring.length > 0 && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
          <h2 className="font-semibold text-yellow-800 mb-2">Expiring Within 30 Days</h2>
          {expiring.map(m => (
            <p key={m.id} className="text-sm text-yellow-700">{m.name} — expires {m.expiry_date}</p>
          ))}
        </div>
      )}

      {/* Medicines */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Medicines (pharmacy_item)</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-gray-500 text-left">
            <th className="pb-2">Name</th><th className="pb-2">Stock</th>
            <th className="pb-2">Expiry</th><th className="pb-2">Update</th>
          </tr></thead>
          <tbody>
            {medicines.map(m => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{m.name}</td>
                <td className="py-2">
                  <span className={m.stock_quantity < 10 ? 'text-red-600 font-semibold' : ''}>
                    {m.stock_quantity}
                  </span>
                </td>
                <td className="py-2 text-xs text-gray-500">{m.expiry_date || '—'}</td>
                <td className="py-2">
                  {updating === m.id ? (
                    <span className="flex gap-1">
                      <input type="number" value={qty} onChange={e=>setQty(e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-xs" />
                      <button onClick={() => updateStock('pharmacy_item', m.id, Number(qty))}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                    </span>
                  ) : (
                    <button onClick={() => { setUpdating(m.id); setQty(String(m.stock_quantity)) }}
                      className="text-xs text-blue-600 hover:underline">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Implants */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Implants</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-gray-500 text-left">
            <th className="pb-2">Name</th><th className="pb-2">Stock</th><th className="pb-2">Update</th>
          </tr></thead>
          <tbody>
            {implants.map(i => (
              <tr key={i.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{i.name}</td>
                <td className="py-2"><span className={i.stock_quantity < 5 ? 'text-red-600 font-semibold' : ''}>{i.stock_quantity}</span></td>
                <td className="py-2">
                  {updating === i.id ? (
                    <span className="flex gap-1">
                      <input type="number" value={qty} onChange={e=>setQty(e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-xs" />
                      <button onClick={() => updateStock('implant', i.id, Number(qty))}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                    </span>
                  ) : (
                    <button onClick={() => { setUpdating(i.id); setQty(String(i.stock_quantity)) }}
                      className="text-xs text-blue-600 hover:underline">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}