# Vercel Deployment Setup Guide

## Environment Variables Required

After deploying to Vercel, you **MUST** set the following environment variables in your Vercel project settings:

### 1. Go to Your Vercel Project Settings
- Navigate to: https://vercel.com/dashboard
- Select your project: `SmartPrint-Business-System`
- Go to: **Settings** → **Environment Variables**

### 2. Add These Environment Variables

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `DATABASE_URL` | `postgresql+psycopg://user:password@host:5432/dbname` | ✅ Yes | Your PostgreSQL database connection string. Get this from your database provider (e.g., Railway, Vercel Postgres, Supabase) |
| `SECRET_KEY` | `your-random-secret-key-here` | ✅ Yes | Generate a strong random string. Used for JWT token signing. |
| `CORS_ORIGINS` | `https://your-domain.vercel.app,https://another-domain.com` | ✅ Yes | Comma-separated list of allowed origins (your frontend domains) |
| `DEBUG` | `False` | ⚠️ Recommended | Set to `False` for production (never `True`) |
| `ADMIN_USERNAME` | `admin` | ⚠️ Optional | Change from default for security |
| `ADMIN_PASSWORD` | `your-secure-password` | ⚠️ Optional | Change from default for security |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `720` | ⚠️ Optional | JWT token expiration time in minutes |

### 3. Setting Up a PostgreSQL Database

You need a PostgreSQL database. Choose one of these options:

#### Option A: Vercel Postgres (Recommended)
1. In Vercel Dashboard → go to your project
2. Click **Storage** tab
3. Click **Create** → **Postgres**
4. Copy the connection string to `DATABASE_URL`

#### Option B: Railway
1. Go to https://railway.app
2. Create a new PostgreSQL project
3. Copy the connection string to `DATABASE_URL`

#### Option C: Supabase
1. Go to https://supabase.com
2. Create a new project
3. Copy the PostgreSQL connection string to `DATABASE_URL`

#### Option D: Other Services
Use any managed PostgreSQL service and provide the connection string

### 4. Example Environment Variables

```
DATABASE_URL=postgresql+psycopg://user:abc123@pg-xxxxx.railway.app:5432/railway
SECRET_KEY=sk-prod-xyz123randomstring456789
CORS_ORIGINS=https://smartprint-business.vercel.app,https://www.smartprint-business.com
DEBUG=False
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
```

### 5. Redeploy After Setting Variables

After adding environment variables:
1. Go to your Vercel project's **Deployments** tab
2. Click the three dots (•••) on the latest deployment
3. Select **Redeploy**
4. Wait for the deployment to complete

## Testing the Deployment

Once redeployed, test these endpoints:

- **Health Check**: `https://your-domain.vercel.app/health`
  - Should return: `{"status":"ok"}`

- **API Documentation**: `https://your-domain.vercel.app/api/v1/docs`
  - Should show Swagger UI

## Troubleshooting

### Still Getting 500 Errors?
1. Check the Vercel logs: Project → **Logs** → **Function Logs**
2. Verify all environment variables are set correctly
3. Ensure `DATABASE_URL` is valid and the database is accessible
4. Make sure `SECRET_KEY` is a strong random string

### Database Connection Errors?
- Verify the `DATABASE_URL` is correct
- Check if your database allows connections from Vercel IP ranges
- Some managed databases require firewall rules to be updated

### CORS Errors?
- Ensure your frontend domain is in `CORS_ORIGINS`
- Example: `https://smartprint-business.vercel.app` or just `*.vercel.app`
- Separate multiple origins with commas

## Generating a Secure SECRET_KEY

Run this in your terminal to generate a random secret:

```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or using OpenSSL
openssl rand -base64 32
```

## Need Database Migrations?

If your database needs migrations after first deploy:

1. Run locally: `alembic upgrade head`
2. Or use a separate migration step in your CI/CD

For Vercel, you can run migrations before deployment or set up a separate migration job.

---

After completing these steps, your app should be fully functional on Vercel! 🚀

