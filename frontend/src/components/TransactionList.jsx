import { useState, useEffect } from 'react'

export default function TransactionList({ items, onDeleted }) {
  const [visibleItems, setVisibleItems] = useState([])
  const [deletingId, setDeletingId] = useState(null)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Healthcare': '🏥',
      'Shopping': '🛍️',
      'Utilities': '💡',
      'Entertainment': '🎬',
      'Education': '📚',
      'Income': '💰',
      'OCR Receipt': '📷',
      'General': '📋'
    }
    return icons[category] || '📋'
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': '#f59e0b',
      'Transportation': '#3b82f6',
      'Healthcare': '#ef4444',
      'Shopping': '#8b5cf6',
      'Utilities': '#10b981',
      'Entertainment': '#ec4899',
      'Education': '#06b6d4',
      'Income': '#10b981',
      'OCR Receipt': '#667eea',
      'General': '#6b7280'
    }
    return colors[category] || '#6b7280'
  }

  // Animate items appearing
  useEffect(() => {
    if (items && items.length > 0) {
      const timer = setTimeout(() => {
        setVisibleItems(items)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [items])

  // Handle delete with animation
  const handleDelete = async (id) => {
    setDeletingId(id)
    
    // Wait for animation to complete
    setTimeout(async () => {
      try {
        await onDeleted(id)
        setDeletingId(null)
      } catch (error) {
        setDeletingId(null)
        console.error('Delete failed:', error)
      }
    }, 300)
  }

  // Add ripple effect
  const addRippleEffect = (event) => {
    const button = event.currentTarget
    const ripple = document.createElement('span')
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(239, 68, 68, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleEffect 0.6s linear;
      pointer-events: none;
    `

    button.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  if (!items || items.length === 0) {
    return (
      <div className="card">
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
            No Transactions Yet
          </h3>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            Start tracking your expenses by adding your first transaction
          </p>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'var(--bg-accent)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ➕ Add Transaction
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h3>Recent Transactions</h3>
        <div style={{
          padding: '6px 12px',
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          {items.length} transaction{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {visibleItems.map((item, index) => (
          <div 
            key={item.id} 
            className={`transaction-item stagger-item ${deletingId === item.id ? 'deleting' : ''}`}
            style={{
              animationDelay: `${index * 0.1}s`,
              transform: deletingId === item.id ? 'translateX(100px) scale(0.8)' : 'translateX(0) scale(1)',
              opacity: deletingId === item.id ? 0 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            <div className="transaction-info">
              <div 
                className="transaction-icon" 
                style={{
                  background: `linear-gradient(135deg, ${getCategoryColor(item.category)} 0%, ${getCategoryColor(item.category)}dd 100%)`
                }}
              >
                {getCategoryIcon(item.category)}
              </div>
              <div className="transaction-details">
                <h4>{item.category}</h4>
                <p style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '13px'
                }}>
                  <span>{formatDate(item.date)}</span>
                  {item.note && (
                    <>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span>{item.note}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px' 
            }}>
              <div className={`transaction-amount ${item.type}`}>
                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
              </div>
              
              <button
                onClick={(e) => {
                  addRippleEffect(e)
                  handleDelete(item.id)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'var(--transition)',
                  fontSize: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                  e.target.style.color = '#ef4444'
                  e.target.style.transform = 'scale(1.1) rotate(5deg)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                  e.target.style.color = 'var(--text-muted)'
                  e.target.style.transform = 'scale(1) rotate(0deg)'
                }}
                title="Delete transaction"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes rippleEffect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .transaction-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .transaction-item:hover {
          background: var(--bg-secondary);
          margin: 0 -24px;
          padding: 16px 24px;
          border-radius: var(--radius-md);
          transform: scale(1.02);
        }
        
        .transaction-item.deleting {
          transform: translateX(100px) scale(0.8);
          opacity: 0;
        }
        
        .transaction-icon {
          transition: all 0.3s ease;
        }
        
        .transaction-item:hover .transaction-icon {
          transform: rotate(360deg) scale(1.1);
        }
        
        .transaction-amount {
          transition: all 0.3s ease;
        }
        
        .transaction-item:hover .transaction-amount {
          transform: scale(1.1);
        }
        
        .stagger-item {
          animation: staggerFadeIn 0.6s ease-out both;
        }
        
        @keyframes staggerFadeIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}