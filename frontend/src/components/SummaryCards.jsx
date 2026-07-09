import { useState, useEffect, useRef } from 'react'

export default function SummaryCards({ totals, monthExpense, limit }) {
  const [animatedValues, setAnimatedValues] = useState({
    income: 0,
    expense: 0,
    balance: 0
  })
  const [isVisible, setIsVisible] = useState(false)
  const cardsRef = useRef(null)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long' })
  }

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (cardsRef.current) {
      observer.observe(cardsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Animate numbers when visible
  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      setAnimatedValues({
        income: Math.round(totals.income * easeOutQuart),
        expense: Math.round(monthExpense * easeOutQuart),
        balance: Math.round(totals.balance * easeOutQuart)
      })

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isVisible, totals, monthExpense])

  // Add floating particles effect
  const addFloatingParticles = (event) => {
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div')
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${i % 2 === 0 ? '#667eea' : '#764ba2'};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${Math.random() * rect.width}px;
        top: ${rect.height}px;
        animation: floatParticle 1s ease-out forwards;
      `
      
      card.appendChild(particle)
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      }, 1000)
    }
  }

  return (
    <div className="summary-grid" ref={cardsRef}>
      {/* Income Card */}
      <div 
        className="summary-card income morph-shape"
        onMouseEnter={addFloatingParticles}
        style={{ cursor: 'pointer' }}
      >
        <div className="summary-label">Monthly Income</div>
        <div className="summary-value">
          {isVisible ? formatCurrency(animatedValues.income) : '₹0'}
        </div>
        <div className="summary-change">
          <span style={{ color: '#10b981' }}>↗</span> 
          This month
        </div>
      </div>

      {/* Expense Card */}
      <div 
        className="summary-card expense morph-shape"
        onMouseEnter={addFloatingParticles}
        style={{ cursor: 'pointer' }}
      >
        <div className="summary-label">Monthly Expenses</div>
        <div className="summary-value">
          {isVisible ? formatCurrency(animatedValues.expense) : '₹0'}
        </div>
        <div className="summary-change">
          <span style={{ color: '#ef4444' }}>↘</span> 
          {getMonthName()} {new Date().getFullYear()}
        </div>
      </div>

      {/* Balance Card */}
      <div 
        className="summary-card balance morph-shape"
        onMouseEnter={addFloatingParticles}
        style={{ cursor: 'pointer' }}
      >
        <div className="summary-label">Current Balance</div>
        <div className="summary-value">
          {isVisible ? formatCurrency(animatedValues.balance) : '₹0'}
        </div>
        <div className="summary-change">
          <span style={{ color: animatedValues.balance >= 0 ? '#10b981' : '#ef4444' }}>
            {animatedValues.balance >= 0 ? '↗' : '↘'}
          </span> 
          Net position
        </div>
      </div>

      {/* Limit Status Card */}
      {limit !== null && (
        <div 
          className="summary-card morph-shape"
          style={{
            background: monthExpense >= limit 
              ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #059669 0%, #047857 100%)'
          }}
          onMouseEnter={addFloatingParticles}
        >
          <div className="summary-label">Spending Limit</div>
          <div className="summary-value">{formatCurrency(limit)}</div>
          <div className="summary-change">
            {monthExpense >= limit ? (
              <span style={{ color: '#fecaca' }}>⚠️ Limit Reached</span>
            ) : (
              <span style={{ color: '#bbf7d0' }}>
                ₹{formatCurrency(limit - monthExpense)} remaining
              </span>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes floatParticle {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }
        
        .summary-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .summary-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }
        
        .summary-value {
          transition: all 0.3s ease;
        }
        
        .summary-card:hover .summary-value {
          transform: scale(1.1);
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}