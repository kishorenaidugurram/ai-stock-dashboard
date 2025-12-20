# 🚀 Quick Setup Guide - Automated Daily Updates

## ✅ Setup Complete!

Your stock dashboard now has **automated daily updates** configured with GitHub Actions!

---

## 📋 What's Been Set Up

✅ **GitHub Actions Workflow** - `.github/workflows/update-stocks.yml`
✅ **Data Fetcher Script** - `scripts/fetch-latest-stocks.js`
✅ **Schedule**: Every day at **9:00 AM IST**
✅ **Auto-Deploy**: Pushes to GitHub → Cloudflare Pages deploys automatically

---

## 🎯 Next Steps to Activate

### Step 1: Push to GitHub

```bash
# Make sure you're in the project directory
cd /home/user/webapp

# Push all changes including automation
git push origin main
```

### Step 2: Verify GitHub Actions

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. You should see: **"Update Stock Dashboard Data"** workflow
4. Workflow will run automatically tomorrow at 9:00 AM IST

### Step 3: Test Manual Trigger (Optional)

1. In GitHub, go to **Actions** tab
2. Click **"Update Stock Dashboard Data"**
3. Click **"Run workflow"** button (top right)
4. Click green **"Run workflow"** button in dropdown
5. Wait ~2 minutes, check workflow run status

---

## ✨ How It Works Daily

```
9:00 AM IST
    ↓
GitHub Actions triggers
    ↓
Fetch latest stock data (Node.js script)
    ↓
Update data/stocks-data.json
    ↓
Git commit & push
    ↓
Cloudflare Pages detects push
    ↓
Auto-deploy (~2 minutes)
    ↓
Dashboard shows fresh data!
```

**Total time: ~3-4 minutes from trigger to live**

---

## 🔍 Monitor Updates

### Check Workflow Runs
- **GitHub**: Repository → Actions tab
- **Status**: ✅ Green checkmark = success
- **Logs**: Click any run to see detailed logs

### Verify Data Updates
- **Dashboard**: Check "Last Updated" timestamp (IST)
- **Git History**: `git log --oneline data/stocks-data.json`
- **File**: Open `data/stocks-data.json` → see `lastUpdated` field

---

## ⚙️ Customize Schedule

Want different update times? Edit `.github/workflows/update-stocks.yml`:

```yaml
schedule:
  - cron: '30 3 * * *'  # 9:00 AM IST (default)
```

**Popular schedules:**
```yaml
- cron: '30 0 * * *'  # 6:00 AM IST
- cron: '0 6 * * *'   # 11:30 AM IST
- cron: '30 3 * * 1-5'  # 9 AM IST, weekdays only
- cron: '30 3,9 * * *'  # 9 AM & 3 PM IST (twice daily)
```

After editing, commit and push:
```bash
git add .github/workflows/update-stocks.yml
git commit -m "chore: Update automation schedule"
git push
```

---

## 🛠️ Troubleshooting

### Workflow Not Showing in GitHub
**Solution**: Push `.github/workflows/update-stocks.yml` to GitHub
```bash
git push origin main
```

### Workflow Not Running
1. Check if GitHub Actions is enabled: Settings → Actions → General
2. Verify repository is active (inactive repos pause Actions after 60 days)
3. Check workflow syntax in Actions tab

### Data Not Updating
1. Check workflow logs in Actions tab for errors
2. Run manual trigger to test immediately
3. Verify script works locally: `cd scripts && node fetch-latest-stocks.js`

### Cloudflare Not Deploying
1. Check Cloudflare Pages deployment logs
2. Verify GitHub integration is connected
3. Ensure git push was successful

---

## 📊 Usage & Costs

**GitHub Actions Free Tier:**
- 2,000 minutes/month FREE
- This workflow uses ~2 minutes/day
- Monthly usage: ~60 minutes
- **Cost: $0 (completely free!)**

**Cloudflare Pages:**
- Unlimited deployments on free tier
- **Cost: $0**

**Total Monthly Cost: $0** 🎉

---

## 🎯 Summary

You now have:
- ✅ **Fully automated daily updates** at 9 AM IST
- ✅ **No manual intervention needed**
- ✅ **Free forever** (GitHub Actions free tier)
- ✅ **Manual trigger option** anytime from GitHub
- ✅ **Git history tracking** all updates
- ✅ **Auto-deployment** to Cloudflare Pages

**Just push to GitHub and you're done! The dashboard will update automatically every day.** 🚀

---

## 📞 Need Help?

Check detailed docs: `AUTOMATION.md`

Test script locally:
```bash
cd scripts
node fetch-latest-stocks.js
```

View workflow file:
```bash
cat .github/workflows/update-stocks.yml
```

**Your dashboard is now maintenance-free!** 🎊
