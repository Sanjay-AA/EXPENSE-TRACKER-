# Firebase Setup Guide for Expense Tracker

## Prerequisites
- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "expense-tracker-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Google" as a sign-in provider:
   - Click on "Google"
   - Toggle "Enable"
   - Add your project support email
   - Click "Save"
5. Enable "Email/Password" as a sign-in provider:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 3: Create a Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database
5. Click "Done"

## Step 4: Get Firebase Configuration

1. In your Firebase project, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "expense-tracker-web")
6. Copy the Firebase configuration object

## Step 5: Update Firebase Config

1. Open `frontend/src/lib/firebase.js`
2. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
}
```

## Step 6: Install Dependencies

Run the following command in the frontend directory:

```bash
npm install
```

## Step 7: Test the Application

1. Start the frontend development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the app
3. You should see a login page with Google sign-in option
4. Click "Continue with Google" to test authentication

## Security Rules (Optional)

For production, you should set up Firestore security rules. In the Firestore Database section:

1. Click on "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Make sure you're not importing Firebase multiple times

2. **"Permission denied" errors**
   - Check if Firestore security rules are properly configured
   - Ensure authentication is working

3. **Google sign-in not working**
   - Verify Google provider is enabled in Firebase Authentication
   - Check if your domain is authorized

4. **"Invalid API key" errors**
   - Double-check your Firebase configuration
   - Ensure the API key is correct and not truncated

### Support:

If you encounter issues, check:
- Firebase Console for error logs
- Browser console for JavaScript errors
- Network tab for failed requests

## Next Steps

After setting up Firebase:
1. Customize the authentication UI
2. Add more user profile fields
3. Implement data synchronization between users
4. Add offline support with Firebase offline persistence

