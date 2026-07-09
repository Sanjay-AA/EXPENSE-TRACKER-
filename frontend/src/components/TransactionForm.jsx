import { useState } from 'react'
import { addTransaction } from '../lib/api.js'

export default function TransactionForm({ onAdded }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'General',
    note: '',
    date: new Date().toISOString().slice(0, 10)
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const categories = [
    'General',
    'Food & Dining',
    'Transportation',
    'Healthcare',
    'Shopping',
    'Utilities',
    'Entertainment',
    'Education'
  ]

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      await addTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      })
      
      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        category: 'General',
        note: '',
        date: new Date().toISOString().slice(0, 10)
      })
      setErrors({})
      
      onAdded?.()
    } catch (err) {
      console.error('Failed to add transaction:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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
          ➕
        </div>
        <div>
          <h3>Add New Transaction</h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Record your income or expense
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Transaction Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Transaction Type
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { value: 'expense', label: 'Expense', icon: '💸', color: '#ef4444' },
              { value: 'income', label: 'Income', icon: '💰', color: '#10b981' }
            ].map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('type', type.value)}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: `2px solid ${formData.type === type.value ? type.color : 'var(--border-primary)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: formData.type === type.value 
                    ? `${type.color}20` 
                    : 'var(--bg-secondary)',
                  color: formData.type === type.value ? type.color : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <span style={{ fontSize: '20px' }}>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="input"
            placeholder="0.00"
            style={{
              borderColor: errors.amount ? '#ef4444' : 'var(--border-primary)'
            }}
          />
          {errors.amount && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '12px', 
              marginTop: '4px' 
            }}>
              {errors.amount}
            </div>
          )}
        </div>

        {/* Category */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="input"
            style={{
              borderColor: errors.category ? '#ef4444' : 'var(--border-primary)'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '12px', 
              marginTop: '4px' 
            }}>
              {errors.category}
            </div>
          )}
        </div>

        {/* Date */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="input"
            style={{
              borderColor: errors.date ? '#ef4444' : 'var(--border-primary)'
            }}
          />
          {errors.date && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '12px', 
              marginTop: '4px' 
            }}>
              {errors.date}
            </div>
          )}
        </div>

        {/* Note */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Note (Optional)
          </label>
          <input
            type="text"
            value={formData.note}
            onChange={(e) => handleInputChange('note', e.target.value)}
            className="input"
            placeholder="Add a note about this transaction..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-success"
          style={{ width: '100%' }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div className="loading-spinner"></div>
              Adding Transaction...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>✅</span>
              Add Transaction
            </div>
          )}
        </button>
      </form>
    </div>
  )
}