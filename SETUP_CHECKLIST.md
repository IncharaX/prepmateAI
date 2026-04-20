# 📋 Setup Checklist

Use this checklist to track your progress while setting up the project locally. If you get stuck, refer to the [Local Setup Guide](./INSTALLATION.md).

### 🛠️ 1. Tools & Accounts
- [ ] Installed Node.js (v18+)
- [ ] Installed Git
- [ ] Created a MongoDB Atlas Cluster (and obtained connection string)
- [ ] Created a Firebase Project (and obtained config/service keys)
- [ ] Created a Groq Account (and obtained API Key)

### 📥 2. Repository
- [ ] Cloned the repository (`git clone ...`)
- [ ] Opened the folder in your Code Editor

### ⚙️ 3. Backend Setup
- [ ] Opened terminal and navigated to the `backend` folder (`cd backend`)
- [ ] Ran `npm install` and it finished without errors
- [ ] Created `.env` file in the `backend` folder
- [ ] Filled in all backend `.env` variables (MongoDB, Firebase, Groq, JWT)
- [ ] Ran `npm run dev`
- [ ] Terminal shows "Server running" and "MongoDB Connected"

### 🎨 4. Frontend Setup
- [ ] Opened a **second** terminal window
- [ ] Navigated to the `frontend` folder (`cd frontend`)
- [ ] Ran `npm install` and it finished without errors
- [ ] Created `.env` file in the `frontend` folder
- [ ] Filled in all frontend `.env` variables (Firebase config, API URL)
- [ ] Ran `npm run dev`
- [ ] Vite server started successfully

### ✅ 5. Final Verification
- [ ] Opened `http://localhost:5173` in a web browser
- [ ] The app UI loads correctly
- [ ] Able to sign up / log in (verifies Firebase Auth + Backend connection)

**All checked?** You are ready to start coding! 🚀
