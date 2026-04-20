# 🚀 Production Deployment Guide

Ready to share **PrepMate AI** with the world? This guide explains how to deploy the Backend to **Render** and the Frontend to **Vercel** for free.

---

## 📦 1. Pre-Deployment Checklist

Before you start:
- Make sure all your code is pushed to your GitHub repository.
- Have your production Database URI ready (e.g., MongoDB Atlas).
- Have your production API Keys ready (Groq, Firebase, etc.).
- Create free accounts on [Vercel](https://vercel.com/) and [Render](https://render.com/).

---

## ⚙️ 2. Deploying the Backend (Render)

Render is an excellent platform for Node.js Express servers.

1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Connect your GitHub account and select the `prepmateAI` repository.
3. **Configure the Service:**
   - **Name:** `prepmateai-api` (or any name you prefer)
   - **Root Directory:** `backend` *(⚠️ VERY IMPORTANT: Do not leave this blank!)*
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment Variables:**
   Click on the **Advanced** section and add all the variables from your backend `.env` file (e.g., `MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`, etc.).
   *(Note: You do NOT need to add `PORT`, Render handles that automatically).*
5. Click **Create Web Service**.
6. Wait a few minutes for the build to complete. Once done, copy the provided URL (e.g., `https://prepmateai-api.onrender.com`).

---

## 🎨 3. Deploying the Frontend (Vercel)

Vercel is optimized for React and Vite applications.

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Import your `prepmateAI` repository from GitHub.
3. **Configure the Project:**
   - **Framework Preset:** Vercel should automatically detect **Vite**.
   - **Root Directory:** Click `Edit` and select the `frontend` folder. *(⚠️ VERY IMPORTANT!)*
4. **Environment Variables:**
   Expand the Environment Variables section and add everything from your frontend `.env`.
   - **🔥 CRITICAL STEP:** Change `VITE_API_URL` to point to your new Render Backend URL (e.g., `https://prepmateai-api.onrender.com/api`). Do not use `localhost`!
5. Click **Deploy**.
6. Vercel will build your app and provide you with a live, production URL!

---

## 🔄 4. Final Testing

1. Open your live Vercel URL.
2. Test a flow that requires the backend (like signing in or submitting data).
3. If it fails, check the logs on Vercel (for frontend issues) or Render (for backend issues) and ensure all environment variables were copied correctly.

🎉 **Congratulations! Your application is live!**
