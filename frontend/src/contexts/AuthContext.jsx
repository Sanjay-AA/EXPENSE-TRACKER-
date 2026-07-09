import { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, provider as googleProvider, db } from '../lib/firebase.js'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  async function signInWithGoogle() {
    try {
      console.log('Starting Google sign-in...')
      
      // Configure Google provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      console.log('Google sign-in successful for user:', user.uid, user.email)
      
      // Check if user profile exists in Firestore
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        console.log('Creating new user profile for:', user.uid)
        // Create new user profile
        const userProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
        
        await setDoc(userRef, userProfile)
        setUserProfile(userProfile)
      } else {
        console.log('Updating existing user profile for:', user.uid)
        // Update last login
        const profile = userSnap.data()
        profile.lastLogin = new Date().toISOString()
        await setDoc(userRef, profile)
        setUserProfile(profile)
      }
      
      return user
    } catch (error) {
      console.error('Google sign-in error details:', {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential
      })
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled')
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by browser. Please allow popups and try again.')
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.')
      } else {
        throw new Error('Google sign-in failed: ' + error.message)
      }
    }
  }

  async function signUpWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user
      console.log('Email sign-up successful for new user:', user.uid)
      
      // Create user profile
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
      
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, userProfile)
      setUserProfile(userProfile)
      
      return user
    } catch (error) {
      console.error('Error signing up with email:', error)
      throw error
    }
  }

  async function signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user
      console.log('Email sign-in successful for user:', user.uid)
      
      // Update user profile
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const profile = userSnap.data()
        profile.lastLogin = new Date().toISOString()
        await setDoc(userRef, profile)
        setUserProfile(profile)
      }
      
      return user
    } catch (error) {
      console.error('Error signing in with email:', error)
      throw error
    }
  }

  async function logout() {
    try {
      console.log('Starting logout process...')
      const userId = currentUser?.uid
      
      // Sign out from Firebase
      await signOut(auth)
      console.log('Firebase signOut completed')
      
      // Clear state
      setUserProfile(null)
      setCurrentUser(null)
      
      // Clear localStorage
      localStorage.removeItem('currentUser')
      if (userId) {
        localStorage.removeItem('dataMigrated_' + userId)
      }
      localStorage.clear()
      
      console.log('User logged out successfully')
      
      // Force reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, try to clear local state
      setUserProfile(null)
      setCurrentUser(null)
      localStorage.clear()
      window.location.href = '/'
      throw error
    }
  }

  async function updateUserProfile(updates) {
    try {
      if (!currentUser) return
      
      const userRef = doc(db, 'users', currentUser.uid)
      await setDoc(userRef, updates, { merge: true })
      
      setUserProfile(prev => ({ ...prev, ...updates }))
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  async function fetchUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        setUserProfile(userSnap.data())
      } else {
        // Create a basic profile if none exists
        const basicProfile = {
          uid: uid,
          email: '',
          displayName: '',
          photoURL: '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
        setUserProfile(basicProfile)
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      // Create a fallback profile if Firestore fails
      const fallbackProfile = {
        uid: uid,
        email: '',
        displayName: '',
        photoURL: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
      setUserProfile(fallbackProfile)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Auth state changed - user logged in:', user.uid)
        setCurrentUser(user)
        localStorage.setItem('currentUser', JSON.stringify(user))
        
        // Clear any cached data from previous users
        const previousUserId = localStorage.getItem('previousUserId')
        if (previousUserId && previousUserId !== user.uid) {
          console.log('Different user detected, clearing cached data')
          // Clear all cached data except current user info
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('dataMigrated_') || key.includes('transactions') || key.includes('limit')) {
              localStorage.removeItem(key)
            }
          })
        }
        localStorage.setItem('previousUserId', user.uid)
        
        await fetchUserProfile(user.uid)
        
        // Create user in MongoDB backend
        try {
          const response = await fetch('http://localhost:5002/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-ID': user.uid
            },
            body: JSON.stringify({
              firebaseUid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0]
            })
          })
          
          if (response.ok) {
            console.log('User created/updated in MongoDB')
            setUserProfile(userSnap.data())
          } else {
            // Create a basic profile if none exists
            const basicProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            }
            setUserProfile(basicProfile)
          }
        } catch (error) {
          console.error('Error getting user profile:', error)
          // Create a fallback profile if Firestore fails
          const fallbackProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'User',
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }
          setUserProfile(fallbackProfile)
        }
      } else {
        // Clear user data when logged out
        localStorage.removeItem('currentUser')
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    logout,
    updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#0a0a0a',
          color: 'white'
        }}>
          <div>Loading...</div>
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}
