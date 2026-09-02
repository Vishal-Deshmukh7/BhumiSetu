import { useEffect, useState } from 'react'
import { API_BASE } from '../config'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/documents`)
      .then((res) => res.json())
      .then((data) => setDocuments(data.documents || []))
      .catch((error) => console.error('Documents fetch failed:', error))
  }, [])

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processed': return 'bg-green-100 text-green-900'
      case 'processing': return 'bg-blue-100 text-blue-900'
      case 'pending': return 'bg-gray-100 text-gray-900'
      default: return 'bg-gray-100 text-gray-900'
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="text-xs font-body font-semibold text-bhumisetu-muted uppercase tracking-wider mb-2">Documents</div>
        <h1 className="font-display text-5xl leading-tight text-bhumisetu-darkest">Project Document Repository</h1>
      </header>

      {/* Documents Grid */}
      <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">
        {documents.length === 0 ? (
          <div className="text-center py-12 text-gray-600 font-body">
            <div className="text-lg mb-2">No documents found</div>
            <div className="text-sm">Start uploading documents to build your repository.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Document ID</th>
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">Fields Extracted</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-body font-mono text-sm text-gray-600">{doc.id}</span>
                    </td>
                    <td className="px-4 py-4 font-body font-semibold text-bhumisetu-darkest">{doc.name}</td>
                    <td className="px-4 py-4 text-gray-700 font-body text-sm">{doc.projectId}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700 font-body text-sm">{doc.extractedFields}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Document Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-subtle">
          <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Documents</div>
          <div className="font-display text-3xl text-bhumisetu-darkest">{documents.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-subtle">
          <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Processed</div>
          <div className="font-display text-3xl text-green-600">
            {documents.filter(d => d.status === 'Processed').length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-subtle">
          <div className="text-xs font-body font-semibold text-gray-600 uppercase tracking-wider mb-2">Pending</div>
          <div className="font-display text-3xl text-amber-600">
            {documents.filter(d => d.status === 'Pending').length}
          </div>
        </div>
      </section>
    </div>
  )
}
