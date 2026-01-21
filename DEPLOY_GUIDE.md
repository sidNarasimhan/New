# 🚀 HookCatch Deployment Guide - Render.com

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub (if not already done)

```bash
git add .
git commit -m "Add Render deployment config"
git push origin claude/init-repo-uVIV7
```

### Step 2: Sign Up for Render

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account

### Step 3: Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub account if prompted
3. Find repository: `sidNarasimhan/New`
4. Click "Connect"

### Step 4: Configure Service

Render will auto-detect the `render.yaml` file. Just verify these settings:

- **Name**: `hookcatch` (or choose your own)
- **Branch**: `claude/init-repo-uVIV7`
- **Build Command**: `npm install` (auto-detected)
- **Start Command**: `npm start` (auto-detected)
- **Plan**: Free

### Step 5: Set Environment Variable

Add this ONE environment variable:

- **Key**: `BASE_URL`
- **Value**: (leave blank for now, we'll update after first deploy)

### Step 6: Deploy!

Click "Create Web Service"

⏱️ First deploy takes 2-3 minutes.

### Step 7: Get Your URL

Once deployed, you'll get a URL like:
```
https://hookcatch.onrender.com
```

### Step 8: Update BASE_URL

1. Go to "Environment" tab
2. Update `BASE_URL` to your actual URL:
   - Key: `BASE_URL`
   - Value: `https://hookcatch.onrender.com`
3. Save Changes (will auto-redeploy)

## ✅ Test Your Deployment

```bash
# Replace with your actual URL
export HOOK_URL="https://hookcatch.onrender.com"

# Create endpoint
curl -X POST $HOOK_URL/api/endpoints

# You should get back a webhook URL!
```

## 🎯 Post-Deployment

### Test in Browser

Visit your URL: `https://hookcatch.onrender.com`

You should see the HookCatch landing page!

### Create Your First Webhook

1. Click "Create Webhook Endpoint"
2. Copy the webhook URL
3. Send a test request:

```bash
curl -X POST https://hookcatch.onrender.com/hook/YOUR_ID \
  -H 'Content-Type: application/json' \
  -d '{"test": "hello from production!"}'
```

4. View the request in your browser

## 🚨 Troubleshooting

### Build Failed?

Check the build logs in Render dashboard. Common issues:
- Missing dependencies → Fixed by `npm install`
- Node version → Render uses Node 20 by default (works fine)

### App Won't Start?

Check the logs:
- Database directory permission → Should be handled by disk mount
- Port binding → Render sets PORT automatically

### 404 Errors?

- Make sure BASE_URL is set correctly
- Check that static files are in `public/` directory

## 📊 Free Tier Limits

Render.com Free tier includes:
- ✅ 750 hours/month (enough for 24/7 uptime)
- ✅ Auto-deploy from GitHub
- ✅ Custom domain support
- ✅ SSL/HTTPS included
- ⚠️ Spins down after 15 min of inactivity (first request takes ~30s)

## 🔄 Updates & Redeployment

Every time you push to `claude/init-repo-uVIV7`:
1. Render auto-detects the push
2. Rebuilds the app
3. Deploys new version
4. Zero downtime!

## 🎉 You're Live!

Once deployed, share your URL:
- Reddit: r/webdev, r/SideProject
- Twitter: #buildinpublic
- Hacker News: Show HN
- Indie Hackers: Show IH

## 💡 Pro Tips

1. **Custom Domain**: Add your own domain in Render dashboard
2. **Monitoring**: Enable "Health Check Path" → `/`
3. **Logs**: View real-time logs in Render dashboard
4. **Metrics**: Check CPU/Memory usage to optimize

## 🚀 Next Steps

1. [ ] Deploy to Render (5 min)
2. [ ] Test in production (2 min)
3. [ ] Post on Reddit (30 min)
4. [ ] Post on Twitter (15 min)
5. [ ] Post on Hacker News (15 min)

---

**Need help?** Check Render docs: https://render.com/docs
