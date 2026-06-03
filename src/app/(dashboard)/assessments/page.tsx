import Link from 'next/link'

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your risk assessments</p>
        </div>
        <Link
          href="/assessments/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          + New Assessment
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {['All', 'Draft', 'Submitted', 'Approved'].map((status) => (
          <button
            key={status}
            className="px-3 py-1.5 rounded-full text-sm border hover:bg-gray-50 transition"
          >
            {status}
          </button>
        ))}
      </div>

      {/* Assessment list will be populated by client component */}
      <div className="bg-white rounded-xl border divide-y">
        <div className="p-12 text-center text-gray-400 text-sm">
          Loading assessments...
        </div>
      </div>
    </div>
  )
}
