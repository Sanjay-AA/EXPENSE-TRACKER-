import { useState, useEffect } from 'react'

export default function Rewards({ transactions, limit, monthExpense }) {
  const [healthScore, setHealthScore] = useState(0)
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [achievements, setAchievements] = useState([])

  // Calculate health score based on financial behavior
  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setHealthScore(50) // Neutral score for new users
      return
    }

    let score = 50 // Base score
    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthTransactions = transactions.filter(t => 
      t.date && t.date.startsWith(currentMonth)
    )

    // Calculate income vs expense ratio
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    
    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    if (income > 0) {
      const savingsRatio = (income - expense) / income
      score += savingsRatio * 30 // Up to 30 points for savings
    }

    // Bonus for staying under limit
    if (limit && expense <= limit) {
      score += 15
    }

    // Penalty for going over limit
    if (limit && expense > limit) {
      score -= Math.min(20, (expense - limit) / limit * 20)
    }

    // Bonus for consistent tracking (more transactions = more engagement)
    const transactionCount = monthTransactions.length
    if (transactionCount >= 10) score += 10
    else if (transactionCount >= 5) score += 5

    // Bonus for diverse income sources
    const incomeSources = new Set(
      monthTransactions
        .filter(t => t.type === 'income')
        .map(t => t.description)
    ).size
    if (incomeSources > 1) score += 5

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)))

    // Animate score change
    setScoreAnimation(true)
    setTimeout(() => setScoreAnimation(false), 1000)

    setHealthScore(score)
  }, [transactions, limit, monthExpense])

  // Generate achievements based on behavior
  useEffect(() => {
    const newAchievements = []
    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthTransactions = transactions.filter(t => 
      t.date && t.date.startsWith(currentMonth)
    )

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    
    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    // Savings achievements
    if (income > 0 && (income - expense) / income > 0.3) {
      newAchievements.push({
        id: 'savings_master',
        title: 'Savings Master',
        description: 'Saved over 30% of your income this month',
        icon: '💰',
        color: '#10b981'
      })
    }

    // Limit achievements
    if (limit && expense <= limit * 0.8) {
      newAchievements.push({
        id: 'limit_champion',
        title: 'Limit Champion',
        description: 'Stayed 20% under your spending limit',
        icon: '🎯',
        color: '#3b82f6'
      })
    }

    // Tracking achievements
    if (monthTransactions.length >= 15) {
      newAchievements.push({
        id: 'tracking_pro',
        title: 'Tracking Pro',
        description: 'Tracked 15+ transactions this month',
        icon: '📊',
        color: '#8b5cf6'
      })
    }

    // Income diversity
    const incomeSources = new Set(
      monthTransactions
        .filter(t => t.type === 'income')
        .map(t => t.description)
    ).size
    if (incomeSources >= 2) {
      newAchievements.push({
        id: 'income_diversifier',
        title: 'Income Diversifier',
        description: 'Multiple income sources this month',
        icon: '🌱',
        color: '#f59e0b'
      })
    }

    setAchievements(newAchievements)
  }, [transactions, limit])

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981' // Green
    if (score >= 60) return '#f59e0b' // Yellow
    if (score >= 40) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Financial Genius! 🧠'
    if (score >= 80) return 'Excellent! Keep it up! 🚀'
    if (score >= 70) return 'Good job! 👍'
    if (score >= 60) return 'On the right track! 📈'
    if (score >= 50) return 'Room for improvement 📊'
    if (score >= 40) return 'Need some work 💪'
    if (score >= 30) return 'Time to focus on finances 🎯'
    return 'Let\'s turn this around! 🔄'
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
          🏆
        </div>
        <div>
          <h3>Financial Health Score</h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Your personalized financial wellness rating
          </p>
        </div>
      </div>

      {/* Health Score Circle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Background circle */}
          <svg width="200" height="200" style={{ position: 'absolute' }}>
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="var(--border-primary)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={getScoreColor(healthScore)}
              strokeWidth="8"
              strokeDasharray={`${(healthScore / 100) * 502.4} 502.4`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{
                transition: 'stroke-dasharray 1s ease-in-out',
                filter: scoreAnimation ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))' : 'none'
              }}
            />
          </svg>
          
          {/* Score display */}
          <div style={{
            textAlign: 'center',
            zIndex: 1
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: getScoreColor(healthScore),
              marginBottom: '4px',
              transform: scoreAnimation ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}>
              {healthScore}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              fontWeight: '500'
            }}>
              / 100
            </div>
          </div>
        </div>
      </div>

      {/* Score Message */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          color: getScoreColor(healthScore),
          marginBottom: '8px'
        }}>
          {getScoreMessage(healthScore)}
        </div>
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          {healthScore >= 80 ? 'You\'re crushing your financial goals!' :
           healthScore >= 60 ? 'You\'re making good progress!' :
           healthScore >= 40 ? 'Keep working on your financial habits!' :
           'Focus on saving more and spending less!'}
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
            🏅 Recent Achievements
          </h4>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            {achievements.map(achievement => (
              <div key={achievement.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: `${achievement.color}10`,
                border: `1px solid ${achievement.color}30`,
                borderRadius: 'var(--radius-md)',
                animation: 'slideInRight 0.5s ease-out'
              }}>
                <div style={{
                  fontSize: '24px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}>
                  {achievement.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: achievement.color,
                    marginBottom: '2px'
                  }}>
                    {achievement.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips for improvement */}
      {healthScore < 80 && (
        <div style={{
          padding: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 'var(--radius-md)'
        }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#3b82f6',
            fontSize: '16px'
          }}>
            💡 Tips to Improve Your Score
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            {healthScore < 60 && <li>Track all your expenses regularly</li>}
            {healthScore < 70 && <li>Try to save at least 20% of your income</li>}
            {limit && monthExpense > limit && <li>Stay within your monthly spending limit</li>}
            <li>Diversify your income sources</li>
            <li>Review your spending patterns monthly</li>
          </ul>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
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
