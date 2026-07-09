import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth()

  async function handleGoogleSignIn() {
    try {
      setError('')
      setLoading(true)
      await signInWithGoogle()
    } catch (error) {
      setError('Failed to sign in with Google: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault()
    
    if (isLogin && (!email || !password)) {
      setError('Please fill in all fields')
      return
    }
    
    if (!isLogin && (!email || !password || !displayName)) {
      setError('Please fill in all fields')
      return
    }

    try {
      setError('')
      setLoading(true)
      
      if (isLogin) {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password, displayName)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>💰 ExpenseTracker</h1>
          <p>Sign in to manage your expenses</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <button 
          className="btn btn-google"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <span>🔍</span>
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleEmailAuth} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                className="input"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            className="btn-link"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  )
}

