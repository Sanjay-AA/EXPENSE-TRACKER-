import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './contexts/AuthContext.jsx'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import TransactionForm from './components/TransactionForm.jsx'
import TransactionList from './components/TransactionList.jsx'
import LinkBank from './components/LinkBank.jsx'
import ExpenseChart from './components/ExpenseChart.jsx'
import OCRScanner from './components/OCRScanner.jsx'
import VoiceAssistant from './components/VoiceAssistant.jsx'
import UserProfile from './components/UserProfile.jsx'
import BankIntegration from './components/BankIntegration.jsx'
import AuthPage from './components/AuthPage.jsx'
import Rewards from './components/Rewards.jsx'
import { getTransactions, getLimit, setLimit, migrateData, addTransaction } from './lib/api.js'

export default function App(){
  const { currentUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimitState] = useState(null)
  const [view, setView] = useState('dashboard')
  const [note, setNote] = useState('')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showLimitAlert, setShowLimitAlert] = useState(false)
  const [lastLimitCheck, setLastLimitCheck] = useState(null)

  async function load(){
    try{ 
      console.log('Loading data for user:', currentUser?.uid)
      setLoading(true); 
      
      // Always load fresh data from backend for the current user
      const [tx, lim] = await Promise.all([getTransactions(), getLimit().catch(()=>null)]); 
      console.log('Loaded transactions for user:', currentUser?.uid, tx?.length || 0, 'transactions')
      console.log('Loaded limit:', lim)
      
      // Set the data (will be empty array for new users)
      setTransactions(tx || []); 
      setLimitState(lim?.amount ?? 50000)
      
      // Show welcome message only for truly new users (0 transactions)
      if (!tx || tx.length === 0) {
        setShowWelcome(true)
        setTimeout(() => setShowWelcome(false), 5000)
      }
      
    }catch(e){ 
      console.error('Error loading data:', e) 
      // On error, ensure clean state
      setTransactions([])
      setLimitState(50000)
    }finally{ 
      setLoading(false) 
    }
  }

  useEffect(() => {
    if (currentUser) {
      console.log('User changed, loading data for:', currentUser.uid)
      // Clear state first to prevent showing old data
      setTransactions([])
      setLimitState(50000)
      setLoading(true)
      
      // Load user-specific data from backend
      load()
    } else {
      console.log('No user, clearing all data')
      // Clear all data when no user
      setTransactions([])
      setLimitState(50000)
      setLoading(false)
    }
  }, [currentUser])

  const totals = useMemo(()=>{ let income=0, expense=0; for(const t of transactions){ if(t.type==='income') income+=Number(t.amount||0); else expense+=Number(t.amount||0) } return { income, expense, balance: income-expense } },[transactions])

  const monthKey = new Date().toISOString().slice(0,7)
  const monthExpense = useMemo(()=> transactions.filter(t=>t.type==='expense' && (t.date||'').startsWith(monthKey)).reduce((s,t)=>s+Number(t.amount||0),0),[transactions,monthKey])
  const overLimit = limit!==null && monthExpense >= Number(limit||0)

  // Monitor spending limit and show alerts
  useEffect(() => {
    if (limit !== null && monthExpense >= Number(limit)) {
      // Only show alert if we haven't shown it recently for this limit breach
      const limitKey = `${limit}_${Math.floor(monthExpense / 1000)}`
      if (lastLimitCheck !== limitKey) {
        setShowLimitAlert(true)
        setLastLimitCheck(limitKey)
        
        // Auto-hide alert after 10 seconds
        setTimeout(() => setShowLimitAlert(false), 10000)
      }
    }
  }, [monthExpense, limit, lastLimitCheck])

  async function handleSetLimit(amount){ try{ const res = await setLimit(Number(amount||0)); setLimitState(res.amount); setNote('Limit updated'); setTimeout(()=>setNote(''),2000) }catch(e){ setNote('Failed to set limit') } }

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen)
  }

  const handleNavigate = (viewName) => {
    setView(viewName)
    setIsMobileNavOpen(false) // Close mobile nav when navigating
  }

  // If user is not authenticated, show login page
  if (!currentUser) {
    return <AuthPage />
  }

  return (
    <div className="layout">
      <Sidebar 
        onNavigate={handleNavigate} 
        currentView={view} 
        isMobileOpen={isMobileNavOpen}
      />
      <div className="main">
        <Header onMobileNavToggle={handleMobileNavToggle} />
        <div className="container">
          {/* Welcome Message */}
          {showWelcome && (
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              marginBottom: '24px',
              animation: 'slideInDown 0.5s ease-out'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--bg-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🎉
                </div>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                    Welcome to Your Personal Expense Tracker!
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                  }}>
                    Start tracking your expenses, set budgets, and manage your finances with ease. 
                    Your data is now securely stored and will be available whenever you log back in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Limit Alert Notification */}
          {showLimitAlert && (
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 101, 101, 0.1) 100%)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              marginBottom: '24px',
              animation: 'shake 0.5s ease-in-out',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ef4444, #f56565, #ef4444)',
                animation: 'pulse 2s infinite'
              }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  animation: 'pulse 1s infinite'
                }}>
                  ⚠️
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    Spending Limit Reached!
                    <span style={{ fontSize: '16px' }}>🚨</span>
                  </h3>
                  <p style={{ 
                    margin: '0 0 12px 0', 
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                  }}>
                    You've reached your monthly spending limit of ₹{limit?.toLocaleString()}. 
                    Current spending: ₹{monthExpense.toLocaleString()}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowLimitAlert(false)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      Dismiss
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowLimitAlert(false)
                        setView('form')
                      }}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      Review Expenses
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLimitAlert(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.1)'
                    e.target.style.color = '#ef4444'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none'
                    e.target.style.color = 'var(--text-secondary)'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          {/* Only show SummaryCards on dashboard view */}
          {view === 'dashboard' && (
            <SummaryCards totals={totals} monthExpense={monthExpense} limit={limit} />
          )}
          
          {/* Debug section - only show on dashboard */}
          {view === 'dashboard' && (
            <div className="card" style={{marginTop:24, background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)'}}>
              <h3>🔧 Debug Information</h3>
              <p><strong>User ID:</strong> {currentUser?.uid || 'Not authenticated'}</p>
              <p><strong>Transactions Count:</strong> {transactions.length}</p>
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <button 
                onClick={load} 
                className="btn btn-primary"
                style={{marginRight: '10px'}}
              >
                🔄 Reload Data
              </button>
              <button 
                onClick={() => console.log('Current state:', { currentUser, transactions, loading })} 
                className="btn btn-secondary"
                style={{marginRight: '10px'}}
              >
                📊 Log State
              </button>
              <button 
                onClick={async () => {
                  try {
                    const testTx = {
                      type: 'expense',
                      amount: 100,
                      description: 'Test Transaction',
                      category: 'Test',
                      note: 'Debug test',
                      date: new Date().toISOString().slice(0, 10)
                    };
                    console.log('Adding test transaction:', testTx);
                    await addTransaction(testTx);
                    console.log('Test transaction added successfully');
                    load(); // Reload data
                  } catch (e) {
                    console.error('Failed to add test transaction:', e);
                  }
                }} 
                className="btn btn-success"
              >
                ➕ Add Test Transaction
              </button>
            </div>
          )}

          {/* Expense Limit - only show on dashboard */}
          {view === 'dashboard' && (
            <div className="card" style={{marginTop:24}}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
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
                  ⚠️
                </div>
                <div>
                  <h3>Expense Limit</h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    Set and monitor your monthly spending limit
                  </p>
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gap: '16px',
                alignItems: 'end'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}>
                    Monthly Limit (₹)
                  </label>
                  <input 
                    className="input" 
                    type="number" 
                    defaultValue={limit||''} 
                    id="limitInput" 
                    placeholder="Set monthly limit" 
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)'
                    }}
                  />
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={()=>handleSetLimit(document.getElementById('limitInput').value)}
                  >
                    💾 Save Limit
                  </button>
                  
                  {overLimit ? (
                    <div className="badge badge-warning">
                      ⚠️ Limit reached: ₹ {monthExpense.toLocaleString()}
                    </div>
                  ) : (
                    <div style={{
                      padding: '8px 16px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-primary)'
                    }}>
                      Month expense: ₹ {monthExpense.toLocaleString()}
                    </div>
                  )}
                </div>
                
                {note && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#10b981',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    {note}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{marginTop:24}} className="grid-3">
            <div style={{display:view==='form' ? 'block':'none'}} id="form">
              <TransactionForm onAdded={load} />
            </div>
            <div style={{display:view==='link' ? 'block':'none'}} id="link">
              <LinkBank onLinked={load} />
            </div>
            <div style={{display:view==='ocr' ? 'block':'none'}} id="ocr">
              <OCRScanner onAdded={load} />
            </div>
            <div style={{display:view==='voice' ? 'block':'none'}} id="voice">
              <VoiceAssistant onAdded={load} />
            </div>
          </div>

          <div style={{marginTop:24, display: view==='profile' ? 'block':'none'}} id="profile">
            <UserProfile />
          </div>

          <div style={{marginTop:24, display: view==='chart' ? 'block':'none'}} id="chart">
            <ExpenseChart transactions={transactions} />
          </div>

          <div style={{marginTop:24, display: view==='rewards' ? 'block':'none'}} id="rewards">
            <Rewards transactions={transactions} limit={limit} monthExpense={monthExpense} />
          </div>

          <div style={{marginTop:24, display: view==='bank' ? 'block':'none'}}>
            <div className="card">
              <BankIntegration refresh={load} />
            </div>
          </div>

          {/* Dashboard View - Show all components */}
          {view === 'dashboard' && (
            <>
              <div style={{marginTop:24}} className="grid-3">
                <div id="form">
                  <TransactionForm onAdded={load} />
                </div>
                <div id="link">
                  <LinkBank onLinked={load} />
                </div>
                <div id="ocr">
                  <OCRScanner onAdded={load} />
                </div>
                <div id="voice">
                  <VoiceAssistant onAdded={load} />
                </div>
              </div>

              <div style={{marginTop:24}} id="rewards">
                <Rewards transactions={transactions} limit={limit} monthExpense={monthExpense} />
              </div>

              <div style={{marginTop:24}} id="chart">
                <ExpenseChart transactions={transactions} />
              </div>

              <div style={{marginTop:24}}>
                <div className="card">
                  <BankIntegration refresh={load} />
                </div>
              </div>
            </>
          )}

          <div style={{marginTop:24}}>
            {loading ? (
              <div className="card">
                <div className="loading">
                  <div className="loading-spinner"></div>
                  Loading transactions...
                </div>
              </div>
            ) : (
              <TransactionList items={transactions} onDeleted={load} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}