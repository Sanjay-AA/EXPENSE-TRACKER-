import { linkBank } from '../lib/api.js'

export default function LinkBank({ onLinked }) {
  const handleLinkBank = async () => {
    try {
      const response = await fetch('/api/link-bank', { method: 'POST' })
      if (response.ok) {
        onLinked?.()
      }
    } catch (err) {
      console.error('Failed to link bank:', err)
    }
  }

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--bg-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          ⚡
        </div>
        <div>
          <h3>Quick Add Sample Data</h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Add sample transactions to get started quickly
          </p>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-accent)'
          }}>
            What you'll get:
          </span>
        </div>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            Sample income transaction
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            Sample expense transactions
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            Different categories to explore
          </li>
        </ul>
      </div>

      <button
        onClick={handleLinkBank}
        className="btn btn-primary"
        style={{ width: '100%' }}
      >
        🚀 Add Sample Data
      </button>
    </div>
  )
}