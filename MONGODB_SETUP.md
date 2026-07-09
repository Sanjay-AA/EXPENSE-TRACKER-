# MongoDB Setup Guide for Expense Tracker

## Option 1: Local MongoDB Installation

### Windows Installation:
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service (recommended)
5. Install MongoDB Compass (GUI tool) when prompted

### Start MongoDB Service:
```bash
# Start MongoDB service (if not auto-started)
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

### Verify Installation:
```bash
# Connect to MongoDB shell
mongosh

# In MongoDB shell, create database
use expense-tracker

# Exit shell
exit
```

## Option 2: MongoDB Atlas (Cloud Database)

### Setup Steps:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (choose free tier)
4. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Choose password authentication
   - Set username and password
5. Configure Network Access:
   - Go to Network Access
   - Add IP Address (0.0.0.0/0 for development)
6. Get connection string:
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string

### Update Environment Variables:
```bash
# For MongoDB Atlas, update backend/.env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
```

## Installation Commands

### Install Dependencies:
```bash
# Navigate to backend directory
cd backend

# Install new dependencies
npm install mongoose dotenv

# Start the server
npm run dev
```

## Database Schema

### Users Collection:
```javascript
{
  firebaseUid: "unique-firebase-user-id",
  email: "user@example.com",
  displayName: "User Name",
  photoURL: "profile-image-url",
  limit: {
    amount: 50000,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  lastUpdated: "2024-01-01T00:00:00.000Z"
}
```

### Transactions Collection:
```javascript
{
  userId: "firebase-user-id",
  type: "expense", // or "income"
  amount: 1500,
  description: "Grocery Shopping",
  category: "Food",
  note: "Weekly groceries",
  date: "2024-01-15",
  source: "manual", // manual, bank_import, ocr, voice
  createdAt: "2024-01-15T10:30:00.000Z"
}
```

## Migration from JSON to MongoDB

The app includes automatic migration:
1. Existing JSON data will be automatically migrated to MongoDB
2. Migration happens when user first logs in after MongoDB setup
3. Old JSON files are preserved as backup

## Troubleshooting

### Common Issues:

1. **Connection Error**: 
   - Check if MongoDB service is running
   - Verify connection string in .env file

2. **Authentication Failed**:
   - Check username/password for Atlas
   - Verify network access settings

3. **Database Not Found**:
   - MongoDB creates databases automatically on first write
   - No manual database creation needed

### Verification Steps:
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Test connection with your app
curl http://localhost:5001/api/transactions
```

## Benefits of MongoDB Migration

✅ **Scalability**: Handle thousands of transactions efficiently
✅ **Performance**: Fast queries with proper indexing
✅ **Reliability**: Built-in replication and backup
✅ **Flexibility**: Easy to add new fields and features
✅ **Cloud Ready**: Easy deployment to production

## Next Steps

1. Install MongoDB (local or Atlas)
2. Update .env file with connection string
3. Install dependencies: `npm install`
4. Start backend: `npm run dev`
5. Test the application - data will migrate automatically
