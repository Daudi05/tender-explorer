import '../stub.css'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import TenderCard from '../../components/TenderCard'

export default function BrowseTenders() {
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiFetch('/tenders')
      .then((data) => setTenders(data.tenders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = tenders.filter((t) =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  )

  const open = filtered.filter((t) => t.status === 'OPEN')

  if (loading) return <div className="stub-page"><p>Loading tenders…</p></div>

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="dashboard-header">
        <h1>Browse Tenders</h1>
        <p>{open.length} open tender{open.length !== 1 ? 's' : ''} available</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by title or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: 480, padding: '0.75rem 1rem',
            border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius)', fontSize: '0.95rem',
            background: '#fff', outline: 'none', transition: '0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.12)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="stub-page">
          <h2>No tenders found</h2>
          <p>{search ? `No results for "${search}"` : 'Check back soon for new opportunities.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((tender) => (
            <TenderCard key={tender.id} tender={tender} />
          ))}
        </div>
      )}
    </div>
  )
}
