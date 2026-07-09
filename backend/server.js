const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/database');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 5002;
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection failed:', err);
});

const DB = path.join(__dirname, 'db.json');

async function init() {
  try {
    const exists = await fs.pathExists(DB);
    if (!exists) {
      console.log('Creating database file...');
      await fs.writeJSON(DB, { users: {} }, { spaces: 2 });
      console.log('Database file created successfully');
    } else {
      console.log('Database file exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Helper function to get or create user data
async function getUserData(userId) {
  try {
    let user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      // Create a new user if doesn't exist
      user = new User({
        firebaseUid: userId,
        email: `user-${userId}@temp.com`, // Temporary email, should be updated from Firebase
        displayName: `User ${userId.slice(0, 8)}`, // Temporary name
        limit: { amount: null }
      });
      await user.save();
    }
    return user;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

// Helper function to save user data
async function saveUserData(userId, userData) {
  try {
    await User.findOneAndUpdate(
      { firebaseUid: userId },
      { ...userData, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}
function genId() { return Math.random().toString(36).slice(2,10); }
function isSameMonth(dateStr, ref = new Date()) {
  const d = new Date(dateStr);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

// Fake bank account storage (in-memory)
let fakeBankAccount = null;

app.post('/api/bank/link', async (req, res) => {
  // create a fake bank account with some sample transactions
  fakeBankAccount = {
    accountNumber: 'FAKE' + Math.floor(Math.random() * 900000 + 100000),
    holder: 'Demo User',
    balance: 25000 + Math.floor(Math.random() * 50000),
    transactions: [
      { id: genId(), description: 'Salary', amount: 30000, type: 'income', date: new Date().toISOString().slice(0,10) },
      { id: genId(), description: 'Grocery Store', amount: 1200, type: 'expense', date: new Date().toISOString().slice(0,10) },
      { id: genId(), description: 'Fuel', amount: 1500, type: 'expense', date: new Date().toISOString().slice(0,10) },
      { id: genId(), description: 'Coffee Shop', amount: 350, type: 'expense', date: new Date().toISOString().slice(0,10) },
      { id: genId(), description: 'Freelance', amount: 5000, type: 'income', date: new Date().toISOString().slice(0,10) }
    ]
  };
  res.json({ ok: true, account: fakeBankAccount });
});

// Fetch bank transactions and optionally import into local DB
app.get('/api/bank/transactions', async (req, res) => {
  try {
    await init();
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'user_id_required' });
    }
    
    if (!fakeBankAccount) return res.status(400).json({ error: 'no_bank' });
    
    const userData = await getUserData(userId);
    // Optionally import: default behavior is to import into db
    const imported = [];
    fakeBankAccount.transactions.forEach(tx => {
      // avoid duplicates by simple check: same description+amount+date
      const exists = (userData.transactions || []).some(t => t.description === tx.description && Number(t.amount) === Number(tx.amount) && t.date === tx.date);
      if (!exists) {
        const newTx = { 
          id: genId(), 
          type: tx.type, 
          amount: tx.amount, 
          description: tx.description,
          category: tx.description, 
          note: 'Imported from bank', 
          date: tx.date,
          userId: userId,
          createdAt: new Date().toISOString()
        };
        userData.transactions.unshift(newTx);
        imported.push(newTx);
      }
    });
    await saveUserData(userId, userData);
    res.json({ ok: true, importedCount: imported.length, imported });
  } catch (e) {
    console.error('Error importing bank transactions:', e);
    res.status(500).json({ error: 'bank_import_failed' });
  }
});

// User endpoints
app.post('/api/users', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { firebaseUid, email, displayName } = req.body;
    
    if (!userId || !firebaseUid) {
      return res.status(400).json({ error: 'user_id_and_firebase_uid_required' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ firebaseUid });
    
    if (!user) {
      // Create new user
      user = new User({
        firebaseUid,
        email: email || '',
        displayName: displayName || email?.split('@')[0] || 'User',
        limit: 50000 // Default limit
      });
      
      await user.save();
      console.log('Created new user in MongoDB:', firebaseUid);
    } else {
      // Update existing user
      user.email = email || user.email;
      user.displayName = displayName || user.displayName;
      user.lastLogin = new Date();
      await user.save();
      console.log('Updated existing user in MongoDB:', firebaseUid);
    }
    
    res.json({ success: true, user });
  } catch (e) {
    console.error('Error creating/updating user:', e);
    res.status(500).json({ error: 'user_creation_failed' });
  }
});

// Transactions endpoints
app.get('/api/transactions', async (req, res) => {
  try { 
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'user_id_required' });
    }
    
    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
    res.json(transactions); 
  } catch (e) { 
    console.error('Error getting transactions:', e);
    res.status(500).json({ error: 'read_error' }); 
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'user_id_required' });
    }
    
    const { type, amount, description, category, note, date, source } = req.body;
    
    // Handle both 'description' and 'category' fields for backward compatibility
    const finalDescription = description || category || (type==='income'?'Income':'Expense');
    
    if (!['income','expense'].includes(type)) return res.status(400).json({ error:'invalid_type' });
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ error:'invalid_amount' });
    
    const transaction = new Transaction({
      userId,
      type, 
      amount: amt, 
      description: finalDescription,
      category: finalDescription,
      note: note || '', 
      date: date || new Date().toISOString().slice(0,10),
      source: source || 'manual'
    });
    
    await transaction.save();
    
    // Calculate current month expense for limit checking
    const currentMonth = new Date().toISOString().slice(0,7);
    const monthExpenseResult = await Transaction.aggregate([
      { $match: { userId, type: 'expense', date: { $regex: `^${currentMonth}` } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const currentMonthExpense = monthExpenseResult[0]?.total || 0;
    
    const user = await getUserData(userId);
    const limit = user.limit?.amount || null;
    
    console.log('Transaction added for user:', userId, transaction);
    res.status(201).json({ 
      ...transaction.toObject(), 
      monthExpense: currentMonthExpense, 
      limit, 
      limitReached: limit !== null && currentMonthExpense >= limit 
    });
  } catch (e) { 
    console.error('Error adding transaction:', e); 
    res.status(500).json({ error: 'write_error' }); 
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try { 
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'user_id_required' });
    }
    
    const result = await Transaction.findOneAndDelete({ _id: req.params.id, userId });
    
    if (!result) {
      return res.status(404).json({ error: 'not_found' }); 
    }
    
    res.json({ ok: true }); 
  } catch (e) { 
    console.error('Error deleting transaction:', e);
    res.status(500).json({ error: 'delete_error' }); 
  }
});

app.post('/api/link-bank', async (req, res) => {
  try { 
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'user_id_required' });
    }
    
    const mock = [
      { type:'income', amount:30000, description:'Salary', category:'Salary', note:'Company', date: new Date().toISOString().slice(0,10) }, 
      { type:'expense', amount:850, description:'Food', category:'Food', note:'Cafe', date: new Date().toISOString().slice(0,10) }, 
      { type:'expense', amount:1200, description:'Groceries', category:'Groceries', note:'Mart', date: new Date().toISOString().slice(0,10) }
    ]; 
    
    const transactions = [];
    for (const m of mock) {
      const transaction = new Transaction({
        userId,
        type: m.type,
        amount: m.amount,
        description: m.description,
        category: m.category,
        note: m.note,
        date: m.date,
        source: 'bank_import'
      });
      await transaction.save();
      transactions.push(transaction);
    }
    
    res.json({ ok: true, added: transactions.length }); 
  } catch (e) { 
    console.error('Error linking bank:', e);
    res.status(500).json({ error: 'link_error' }); 
  }
});

app.get('/api/transactions/limit', async (req, res) => { 
  try { 
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'user_id_required' });
    }
    
    const user = await getUserData(userId);
    res.json(user.limit || null); 
  } catch (e) { 
    console.error('Error getting limit:', e);
    res.status(500).json({ error:'limit_read' }); 
  } 
});

app.post('/api/transactions/limit', async (req, res) => { 
  try { 
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'user_id_required' });
    }
    
    const amount = Number(req.body.amount || 0); 
    const user = await User.findOneAndUpdate(
      { firebaseUid: userId },
      { 
        limit: { amount, createdAt: new Date() },
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );
    
    res.json(user.limit); 
  } catch (e) { 
    console.error('Error setting limit:', e);
    res.status(500).json({ error:'limit_write' }); 
  } 
});


// Data migration endpoint for existing users
app.post('/api/migrate-data', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'user_id_required' });
    }
    
    // Check if old JSON file data exists
    if (await fs.pathExists(DB)) {
      const db = await fs.readJSON(DB);
      let migratedCount = 0;
      
      if (db.transactions && db.transactions.length > 0) {
        // Migrate old global transactions to MongoDB
        for (const tx of db.transactions) {
          const existingTx = await Transaction.findOne({
            userId,
            description: tx.description,
            amount: tx.amount,
            date: tx.date
          });
          
          if (!existingTx) {
            const transaction = new Transaction({
              userId,
              type: tx.type,
              amount: tx.amount,
              description: tx.description,
              category: tx.category || tx.description,
              note: tx.note || '',
              date: tx.date,
              source: 'manual'
            });
            await transaction.save();
            migratedCount++;
          }
        }
        
        // Migrate limit if exists
        if (db.limit) {
          await User.findOneAndUpdate(
            { firebaseUid: userId },
            { limit: db.limit },
            { upsert: true }
          );
        }
        
        // Clear old data
        delete db.transactions;
        delete db.limit;
        await fs.writeJSON(DB, db, { spaces: 2 });
      }
      
      res.json({ 
        ok: true, 
        migratedTransactions: migratedCount,
        message: migratedCount > 0 ? 'Data migrated successfully' : 'No data to migrate'
      });
    } else {
      res.json({ 
        ok: true, 
        message: 'No legacy data found'
      });
    }
  } catch (e) {
    console.error('Error migrating data:', e);
    res.status(500).json({ error: 'migration_failed' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📊 Backend API: http://localhost:${PORT}`);
  console.log(`📁 Database: MongoDB (${process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker'})`);
  console.log('\n📋 Available endpoints:');
  console.log('  POST /api/users - Create/update user');
  console.log('  GET  /api/transactions - Get user transactions');
  console.log('  POST /api/transactions - Add transaction');
  console.log('  DELETE /api/transactions/:id - Delete transaction');
  console.log('  GET  /api/transactions/limit - Get spending limit');
  console.log('  POST /api/transactions/limit - Set spending limit');
  console.log('\n✅ Server ready for connections!\n');
});
