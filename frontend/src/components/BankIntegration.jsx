import { useState } from 'react'

export default function BankIntegration({ refresh }) {
  const [fakeAccount, setFakeAccount] = useState(null)
  const [importing, setImporting] = useState(false)

  const handleLinkBank = async () => {
    try {
      const response = await fetch('/api/bank/link', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setFakeAccount(data.account)
      }
    } catch (err) {
      console.error('Failed to link bank:', err)
    }
  }

  const handleImportTransactions = async () => {
    setImporting(true)
    try {
      const response = await fetch('/api/bank/transactions')
      if (response.ok) {
        const data = await response.json()
        if (data.importedCount > 0) {
          refresh?.()
        }
      }
    } catch (err) {
      console.error('Failed to import transactions:', err)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
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
          🏦
        </div>
        <div>
          <h3>Bank Integration</h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Connect your bank account and import transactions
          </p>
        </div>
      </div>

      {!fakeAccount ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏦</div>
          <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>
            No Bank Account Connected
          </h4>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            Connect your bank account to automatically import transactions and keep your expense tracker in sync
          </p>
          <button
            onClick={handleLinkBank}
            className="btn btn-primary"
            style={{ padding: '16px 32px', fontSize: '16px' }}
          >
            🔗 Connect Bank Account
          </button>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              ✅
            </div>
            <div>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                Bank Account Connected
              </h4>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)',
                margin: 0
              }}>
                Account: {fakeAccount.accountNumber}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px'
              }}>
                Account Holder
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {fakeAccount.holder}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px'
              }}>
                Current Balance
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#10b981'
              }}>
                ₹ {fakeAccount.balance.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px'
              }}>
                Available Transactions
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {fakeAccount.transactions.length}
              </div>
            </div>
          </div>

          <button
            onClick={handleImportTransactions}
            disabled={importing}
            className="btn btn-success"
            style={{ width: '100%' }}
          >
            {importing ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="loading-spinner"></div>
                Importing Transactions...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>📥</span>
                Import Bank Transactions
              </div>
            )}
          </button>
        </div>
      )}

      <div style={{
        background: 'var(--bg-secondary)',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '16px' }}>ℹ️</span>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            How it works:
          </span>
        </div>
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6'
        }}>
          <p style={{ marginBottom: '8px' }}>
            • Connect your bank account to enable automatic transaction import
          </p>
          <p style={{ marginBottom: '8px' }}>
            • Import transactions in bulk to save time on manual entry
          </p>
          <p style={{ marginBottom: '0' }}>
            • Keep your expense tracker synchronized with your bank records
          </p>
        </div>
      </div>
    </div>
  )
}