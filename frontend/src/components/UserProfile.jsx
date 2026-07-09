import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function UserProfile() {
  const { userProfile, logout, updateUserProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '')
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!displayName.trim()) return

    try {
      setLoading(true)
      await updateUserProfile({ displayName: displayName.trim() })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (!userProfile) return null

  return (
    <div className="card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--bg-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          overflow: 'hidden'
        }}>
          {userProfile.photoURL ? (
            <img 
              src={userProfile.photoURL} 
              alt={userProfile.displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            userProfile.displayName?.charAt(0)?.toUpperCase() || '👤'
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3>{userProfile.displayName}</h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {userProfile.email}
          </p>
          <p style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)',
            margin: '4px 0 0 0'
          }}>
            Member since {new Date(userProfile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdateProfile} style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            />
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              💾 Save
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsEditing(false)
                setDisplayName(userProfile.displayName || '')
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      ) : (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Profile
          </button>
        </div>
      )}

      <div style={{
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '12px'
        }}>
          📊 Account Statistics
        </div>
        <div style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6'
        }}>
          <div>Last login: {new Date(userProfile.lastLogin).toLocaleString()}</div>
          <div>Account created: {new Date(userProfile.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <button
        className="btn btn-danger"
        onClick={handleLogout}
        style={{ marginTop: '16px', width: '100%' }}
      >
        🚪 Sign Out
      </button>
    </div>
  )
}

