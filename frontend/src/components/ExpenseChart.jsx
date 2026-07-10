import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function ExpenseChart({ transactions }) {
  // Group transactions by category
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = t.category || 'General'
      acc[category] = (acc[category] || 0) + Number(t.amount || 0)
      return acc
    }, {})

  // Convert to chart format
  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: Math.round(value)
  }))

  // Color palette for categories
  const COLORS = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#a8edea', '#fed6e3'
  ]

  if (chartData.length === 0) {
    return (
      <div className="card">
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
            No Expense Data
          </h3>
          <p style={{ fontSize: '16px' }}>
            Add some expenses to see your spending breakdown
          </p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const total = chartData.reduce((sum, item) => sum + item.value, 0)
      const percentage = ((data.value / total) * 100).toFixed(1)
      
      return (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            color: 'var(--text-primary)',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            {data.name}
          </div>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            ₹{data.value.toLocaleString()} ({percentage}%)
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }) => (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      justifyContent: 'center',
      marginTop: '20px'
    }}>
      {payload.map((entry, index) => (
        <div
          key={entry.value}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: COLORS[index % COLORS.length]
            }}
          />
          <span style={{ color: 'var(--text-primary)' }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )

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
          📈
        </div>
        <div>
          <h3>Expense Breakdown</h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Visual breakdown of your spending by category
          </p>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-primary)',
        marginBottom: '20px'
      }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            Total Expenses
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}>
            ₹{chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            Categories
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}>
            {chartData.length}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            Top Category
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            {chartData.length > 0 ? chartData[0].name : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}