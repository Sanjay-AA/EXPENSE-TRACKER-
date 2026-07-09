import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Header({ onMobileNavToggle }) {
  const { currentUser, userProfile, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isHovered, setIsHovered] = useState(false)

  const currentDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Add floating particles to status indicator
  const addStatusParticles = () => {
    const statusIndicator = document.querySelector('.status-indicator')
    if (!statusIndicator) return

    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div')
      particle.style.cssText = `
        position: absolute;
        width: 3px;
        height: 3px;
        background: #10b981;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10;
        left: 50%;
        top: 50%;
        animation: statusParticle 2s ease-out forwards;
        animation-delay: ${i * 0.1}s;
      `
      
      statusIndicator.appendChild(particle)
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      }, 2000)
    }
  }

  const addProfileGlow = () => setIsHovered(true)
  const removeProfileGlow = () => setIsHovered(false)

  return (
    <div className="header">
      <div>
        <h1 className="header-title">Financial Dashboard</h1>
        <div className="header-subtitle">{currentDate}</div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile Navigation Toggle */}
        <button
          className="mobile-nav-toggle"
          onClick={onMobileNavToggle}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        {/* Status Indicator */}
        <div 
          className="status-indicator"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={addStatusParticles}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            animation: 'pulse 2s infinite'
          }}></div>
          <span style={{
            fontSize: '14px',
            color: '#10b981',
            fontWeight: '500'
          }}>
            System Online
          </span>
        </div>
        
        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${isHovered ? 'var(--border-accent)' : 'var(--border-primary)'}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={addProfileGlow}
            onMouseLeave={removeProfileGlow}
          >
            {/* Hover glow effect */}
            {isHovered && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: 'var(--radius-md)',
                animation: 'fadeIn 0.3s ease'
              }} />
            )}
          
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)'
            }}>
              👤
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                transition: 'all 0.3s ease'
              }}>
                {userProfile?.displayName || currentUser?.displayName || 'User'}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                transition: 'all 0.3s ease'
              }}>
                {currentUser?.email || 'Account'}
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Logout button clicked')
                try {
                  await logout()
                  console.log('Logout successful')
                } catch (error) {
                  console.error('Logout failed:', error)
                }
              }}
              style={{
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                zIndex: 1000
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)'
                e.target.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                e.target.style.transform = 'scale(1)'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Use plain <style> instead of <style jsx> */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes statusParticle {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1) translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .status-indicator:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }
        
        .header-title {
          transition: all 0.3s ease;
        }
        
        .header-title:hover {
          transform: scale(1.02);
          text-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
        }
        
        .header-subtitle {
          transition: all 0.3s ease;
        }
        
        .header-subtitle:hover {
          color: var(--text-accent);
          transform: translateX(5px);
        }
      `}</style>
    </div>
  )
}
