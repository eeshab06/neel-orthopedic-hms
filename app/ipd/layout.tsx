export default function IPDLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-6">
        <h1 className="text-lg font-semibold text-gray-800">IPD Management</h1>
        <nav className="flex gap-4 text-sm">
          <a href="/ipd" className="text-blue-600 hover:underline">Admissions</a>
          <a href="/ipd/notes" className="text-blue-600 hover:underline">Indoor Notes</a>
          <a href="/ipd/discharge" className="text-blue-600 hover:underline">Discharge</a>
        </nav>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}