import '../stub.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api/client'

function statusBadge(status) {
  const colors = { OPEN: '#16a34a', AWARDED: '#2563eb', CLOSED: '#6b7280' }
  return (
    <span style={{
      background: colors[status] || '#6b7280',
      color: '#fff',
      borderRadius: 4,
      padding: '2px 8px',
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>{status}</span>
  )
}

export default function MyTenders() {
  const navigate = useNavigate()
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiFetch('/api/tenders/me')
      .then((data) => setTenders(data.tenders || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleClose(tenderId) {
    if (!window.confirm('Close this tender and auto-award to the best bid?')) return
    try {
      await apiFetch(`/api/tenders/${tenderId}/close`, { method: 'POST' })
      setTenders((prev) =>
        prev.map((t) => t.id === tenderId ? { ...t, status: 'AWARDED' } : t)
      )
    } catch (err) {
      alert(err.message || 'Failed to close tender')
    }
  }

  if (loading) return <div className="stub-page"><p>Loading...</p></div>
  if (error) return <div className="stub-page"><p style={{ color: 'red' }}>{error}</p></div>

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>My Tenders</h1>
        <button onClick={() => navigate('/employer/create-tender')}>+ New Tender</button>
      </div>

      {tenders.length === 0 ? (
        <p>You haven't created any tenders yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Title</th>
              <th style={{ padding: '0.5rem' }}>Category</th>
              <th style={{ padding: '0.5rem' }}>Budget</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
              <th style={{ padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenders.map((tender) => (
              <tr key={tender.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem 0.5rem' }}>{tender.title}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{tender.category}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>KES {Number(tender.budget).toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{statusBadge(tender.status)}</td>
                <td style={{ padding: '0.75rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => navigate(`/employer/tenders/${tender.id}/bids`)}>
                    View Bids
                  </button>
                  <button onClick={() => navigate(`/employer/award/${tender.id}`)}>
                    Award
                  </button>
                  {tender.status === 'OPEN' && (
                    <button onClick={() => handleClose(tender.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>
                      Close &amp; Auto-Award
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
