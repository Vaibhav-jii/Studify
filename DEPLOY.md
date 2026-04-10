# 🚀 Deploying Studify to Vercel

## Prerequisites

Before deploying, you need:

1. **A [Vercel](https://vercel.com) account** (free tier works)
2. **A [Supabase](https://supabase.com) project** (free tier works) — for the PostgreSQL database
3. **Your code pushed to GitHub**

---

## Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a **New Project**
2. Choose a name (e.g., `studify`) and set a database password
3. Wait for the project to initialize
4. Go to **Settings → Database** and copy the **Connection string (URI)**
   - It looks like: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
5. Also grab your **Supabase URL** and **Anon Key** from **Settings → API**:
   - `SUPABASE_URL` = `https://xxxx.supabase.co`
   - `SUPABASE_KEY` = `eyJhbG...` (the public anon key)

---

## Step 2: Push Code to GitHub

```bash
cd /Users/vaibhavbansal/.gemini/antigravity/scratch/Studify

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "feat: prepare for Vercel deployment"

# Create a GitHub repo and push
# Option A: Using GitHub CLI
gh repo create Studify --public --push --source=.

# Option B: Manual
# 1. Create repo on github.com
# 2. git remote add origin https://github.com/YOUR_USERNAME/Studify.git
# 3. git push -u origin main
```

---

## Step 3: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your **Studify** repo
4. Vercel will auto-detect the `vercel.json` config — **don't change anything**
5. Click **"Environment Variables"** and add these:

| Variable | Value | Required |
|---|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |
| `DATABASE_URL` | Supabase PostgreSQL connection string | ✅ Yes |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | ⚠️ For file storage |
| `SUPABASE_KEY` | Supabase anon key | ⚠️ For file storage |
| `MONGODB_URI` | MongoDB Atlas connection string | ❌ Optional |

6. Click **Deploy** 🎉

---

## Step 4: Verify Deployment

Once deployed, Vercel will give you a URL like `https://studify-xxx.vercel.app`.

- **Frontend**: Visit the URL directly
- **API Health Check**: Visit `https://your-url.vercel.app/api/health`
- **API Docs**: Visit `https://your-url.vercel.app/api/docs` (FastAPI auto-generated)

---

## ⚠️ Important Notes

### Database
- **SQLite will NOT persist on Vercel** — serverless functions are stateless
- You **must** set `DATABASE_URL` to a PostgreSQL connection string (Supabase free tier is perfect)

### File Uploads
- Uploaded files are temporarily stored in `/tmp` on Vercel (ephemeral per request)
- For persistent file storage, ensure `SUPABASE_URL` and `SUPABASE_KEY` are set — files will be uploaded to Supabase Storage

### MongoDB (Optional)
- Quiz history and study plans are saved to MongoDB
- If you want this feature, create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster and add the `MONGODB_URI` env var
- The app works fine without it — these features just won't persist history

---

## 🔄 Updating Your Deployment

Every time you push to the `main` branch, Vercel will automatically redeploy:

```bash
git add .
git commit -m "your changes"
git push
```

---

## 🛠 Troubleshooting

| Issue | Solution |
|---|---|
| **Build fails** | Check Vercel build logs. Usually a missing dependency. |
| **API returns 500** | Check Vercel Function logs in the dashboard. Likely a missing env var. |
| **CORS errors** | Your domain should auto-detect via `VERCEL_URL`. If using a custom domain, add `FRONTEND_URL` env var. |
| **Login/Register fails** | Make sure `DATABASE_URL` points to your Supabase PostgreSQL. |
| **File uploads fail** | Set `SUPABASE_URL` and `SUPABASE_KEY` for cloud storage. |
