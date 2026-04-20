# 📖 Local Setup Guide

Welcome to **PrepMate AI**! This guide will help you set up the project on your local machine. Even if you are a beginner, follow these steps sequentially and you will have the app running in no time!

---

## 🛠️ Prerequisites

Before we start, you need a few tools installed on your computer:
1. **Node.js**: The JavaScript runtime. Download and install from [nodejs.org](https://nodejs.org/). (Version 18 or higher is recommended).
2. **Git**: Used for version control. Download from [git-scm.com](https://git-scm.com/).
3. **MongoDB**: A NoSQL database. We recommend creating a free cloud cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
4. **Code Editor**: We recommend [VS Code](https://code.visualstudio.com/).

---

## 🚀 1. Clone the Repository

First, we need to download the source code to your machine. 

Open your terminal (or Command Prompt) and run the following commands:

```bash
# Clone the repository
git clone https://github.com/IncharaX/prepmateAI.git

# Navigate into the project folder
cd prepmateAI

---

## ⚙️ 2. Backend Setup

The backend handles our API, database connections, and AI integrations (Node.js + Express).

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   This will install all the necessary packages defined in `package.json`.
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a new file named `.env` in the `backend` folder and copy the following template into it. You will need to fill in your own values (Do not share these keys publicly!).

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # Database (MongoDB)
   MONGODB_URI=your_mongodb_atlas_connection_string
   DB_NAME=prepmateAI
   
   # Firebase Admin SDK Configuration (From Firebase Console)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="your_private_key"
   FIREBASE_CLIENT_EMAIL=your_client_email
   
   # Groq AI API (Get from https://console.groq.com/keys)
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=mixtral-8x7b-32768
   
   # JWT Configuration (Security)
   JWT_SECRET=generate_a_random_secret_string
   JWT_EXPIRY=7d
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   *You should see a message saying the server is running on port 5000 and connected to MongoDB.*

---

## 🎨 3. Frontend Setup

The frontend is our user interface built with React, Vite, and Tailwind CSS. **Open a new terminal window** (leave the backend running).

1. **Navigate to the frontend directory:**
   Make sure you are starting from the root `prepmateAI` folder.
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a new file named `.env` in the `frontend` folder and copy the following template:

   ```env
   # Firebase Configuration (From Firebase Console -> Web App Setup)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Backend API Configuration
   VITE_API_URL=http://localhost:5000/api
   
   # Application Settings
   VITE_APP_NAME=PrepMate AI
   VITE_APP_VERSION=1.0.0
   ```

4. **Start the frontend server:**
   ```bash
   npm run dev
   ```

---

## 🎉 4. You're All Set!

Open your browser and navigate to the URL provided in your frontend terminal (usually `http://localhost:5173`). You should now see the PrepMate AI application running locally!
