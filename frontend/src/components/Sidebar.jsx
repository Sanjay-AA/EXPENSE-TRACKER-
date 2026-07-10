export default function Sidebar({ onNavigate, currentView = 'dashboard', isMobileOpen = false }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Overview & Analytics' },
    { id: 'rewards', label: 'Rewards', icon: '🏆', description: 'Health Score & Achievements' },
    { id: 'form', label: 'Add Expense', icon: '➕', description: 'Manual Entry' },
    { id: 'link', label: 'Quick Add', icon: '⚡', description: 'Sample Data' },
    { id: 'ocr', label: 'Scan Receipt', icon: '📷', description: 'OCR Scanner' },
    { id: 'chart', label: 'Charts', icon: '📈', description: 'Visual Analytics' },
    { id: 'bank', label: 'Bank Sync', icon: '🏦', description: 'Connect Bank' }
  ]

  return (
    <div className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">💰 ExpenseTracker</div>
        <div className="sidebar-subtitle">Smart Financial Management</div>
      </div>
      
      <nav className="nav-menu">
        {menuItems.map(item => (
          <div key={item.id} className="nav-item">
            <a
              href="#"
              className={`nav-link ${currentView === item.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                onNavigate(item.id)
              }}
            >
              <div className="nav-icon">{item.icon}</div>
              <div>
                <div className="nav-text">{item.label}</div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-muted)', 
                  marginTop: '2px',
                  fontWeight: '400'
                }}>
                  {item.description}
                </div>
              </div>
            </a>
          </div>
        ))}
      </nav>
      
      {/* Premium Features Section */}
      <div style={{ 
        margin: '32px 24px 0',
        padding: '20px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(102, 126, 234, 0.2)'
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: 'var(--text-accent)',
          marginBottom: '8px'
        }}>
          ✨ Premium Features
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: 'var(--text-secondary)',
          lineHeight: '1.4'
        }}>
          OCR scanning, bank integration, and advanced analytics included
        </div>
      </div>
      
      {/* Quick Stats */}
      <div style={{ 
        margin: '16px 24px 0',
        padding: '16px',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{ 
          fontSize: '12px', 
          color: 'var(--text-muted)',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          💡 Quick Tip
        </div>
        <div style={{ 
          fontSize: '13px', 
          color: 'var(--text-secondary)',
          lineHeight: '1.4'
        }}>
          Use the OCR scanner to quickly add receipts and save time on manual entry
        </div>
      </div>
    </div>
  )
}