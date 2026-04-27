# Vercel Deployment Troubleshooting Guide

## Current Issue: `ModuleNotFoundError: No module named 'fastapi'`

This error means Vercel **found** your Python entrypoint but **failed to install dependencies**. Here's what to do:

## ⚠️ ROOT CAUSE

You have NOT set environment variables on Vercel yet. Even if dependencies install, the app will crash without:
- `DATABASE_URL`
- `SECRET_KEY`  
- `CORS_ORIGINS`

## ✅ COMPLETE FIX (Do This Now)

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select project: **SmartPrint-Business-System**
3. Click **Settings** tab
4. Click **Environment Variables**

### Step 2: Create Variables (Copy & Paste These)

Add these 3 variables with YOUR actual values:

```
DATABASE_URL
postgresql+psycopg://postgres:password@host:5432/database

SECRET_KEY
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz (use any 32+ char random string)

CORS_ORIGINS
https://smart-print-business-system.vercel.app
```

### Step 3: Get a Database URL

**Option A: Vercel Postgres (Easiest)** ⭐
1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database** → **Postgres**
3. Click **Connect** and copy the connection string
4. Paste it in `DATABASE_URL` above

**Option B: Railway** (Also Easy)
1. Go to https://railway.app
2. Create new PostgreSQL project
3. Copy connection string
4. Paste in `DATABASE_URL`

**Option C: Supabase**
1. Go to https://supabase.com
2. Create project, get PostgreSQL URL
3. Paste in `DATABASE_URL`

### Step 4: Generate SECRET_KEY

Run this in PowerShell to generate a random secret:

```powershell
$random = -join ((33..126) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
$random
```

Copy the output and paste as `SECRET_KEY`

### Step 5: Redeploy on Vercel

1. Go to **Deployments** tab
2. Find the latest failed deployment
3. Click three dots (**•••**)
4. Click **Redeploy**
5. Wait 2-3 minutes

### Step 6: Test (You Should See This Now!)

Visit: `https://smart-print-business-system.vercel.app/health`

Expected response:
```json
{"status":"ok"}
```

## 🔍 If Still Getting Errors

### Check 1: Function Logs
1. Go to Vercel Dashboard → **Logs**
2. Click **Function** tab
3. Look at the actual error message

### Check 2: Verify Variables Exist
- Go back to **Environment Variables**
- Make sure ALL THREE variables are there:
  - `DATABASE_URL` ✓
  - `SECRET_KEY` ✓
  - `CORS_ORIGINS` ✓

### Check 3: Database Connection
- Verify `DATABASE_URL` is correct format
- Check if database service is running
- Some databases block Vercel's IP—check firewall rules

### Check 4: Re-Redeploy
After setting variables, always:
1. Go to **Deployments**
2. Redeploy the latest version
3. Wait for build to finish

## 🚀 Everything Working?

Once you see `{"status":"ok"}` on `/health`:

- Your **backend API** is running at: `/api/v1`
- Your **frontend** is served automatically
- Database connection is working
- All systems are GO! 🎉

## 📌 Important Notes

- Variables only apply **after redeploy**
- Database must be accessible from Vercel (allow all IPs or whitelist Vercel)
- `SECRET_KEY` should be different in production (not default)
- If database doesn't exist yet, create it first in your database provider

## 🆘 Still Stuck?

1. Share the exact error from Function Logs
2. Confirm `DATABASE_URL` format is: `postgresql+psycopg://user:pass@host:port/db`
3. Check if database service is running
4. Try redeploying one more time

---

Your app is **almost there**! Just need to complete these environment setup steps. 💪

