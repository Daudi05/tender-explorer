import '../stub.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api/client'

const STATUS_STYLES = {
  OPEN:    { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' },
  AWARDED: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
  CLOSED:  { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' },
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.CLOSED
  return (
    <span style={{
      ...style,
      borderRadius: 9999,
      padding: '3px 12px',
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
    }}>{status}</span>
  )
}

export default function MyTenders() {
  const navigate = useNavigate()
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [closeMsg, setCloseMsg] = useState(null)

  useEffect(() => {
    apiFetch('/tenders/me')
      .then((data) => setTenders(data.tenders || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleClose(tenderId) {
    setCloseMsg(null)
    try {
      await apiFetch(`/tenders/${tenderId}/close`, { method: 'POST' })
      setTenders((prev) =>
        prev.map((t) => t.id === tenderId ? { ...t, status: 'AWARDED' } : t)
      )
      setCloseMsg({ type: 'success', text: 'Tender closed and best bid awarded.' })
    } catch (err) {
      setCloseMsg({ type: 'error', text: err.message || 'Failed to close tender' })
    }
  }

  if (loading) return <div className="stub-page"><p>Loading your tenders…</p></div>
  if (error) return <div className="stub-page"><p style={{ color: '#ef4444' }}>{error}</p></div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>My Tenders</h1>
          <p>{tenders.length} tender{tenders.length !== 1 ? 's' : ''} created</p>
        </div>
        <button
          onClick={() => navigate('/employer/create-tender')}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
          }}
        >
          + New Tender
        </button>
      </div>

      {closeMsg && (
        <div className={`toast toast-${closeMsg.type}`} style={{ marginBottom: '1rem' }}>
          {closeMsg.type === 'success' ? '✓' : '✕'} {closeMsg.text}
        </div>
      )}

      {tenders.length === 0 ? (
        <div className="stub-page">
          <h2>No tenders yet</h2>
          <p>Create your first tender to start receiving bids.</p>
        </div>
      ) : (
        <div className="dashboard-section">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((tender) => (
                <tr key={tender.id}>
                  <td style={{ fontWeight: 600, maxWidth: 200 }}>{tender.title}</td>
                  <td style={{ color: '#6b7280' }}>{tender.category}</td>
                  <td style={{ fontWeight: 600 }}>KES {Number(tender.budget).toLocaleString()}</td>
                  <td><StatusBadge status={tender.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => navigate(`/employer/tenders/${tender.id}/bids`)}
                        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #c4b5fd', background: '#f5f3ff', color: '#7c3aed', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        View Bids
                      </button>
                      <button
                        onClick={() => navigate(`/employer/award/${tender.id}`)}
                        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Award
                      </button>
                      {tender.status === 'OPEN' && (
                        <button
                          onClick={() => handleClose(tender.id)}
                          style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Close &amp; Auto-Award
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
