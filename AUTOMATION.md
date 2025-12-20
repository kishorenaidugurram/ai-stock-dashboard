# Stock Dashboard - Automated Updates

## 🤖 Automated Daily Updates

This dashboard is configured with **GitHub Actions** to automatically update stock data every day at **9:00 AM IST**.

### How It Works

1. **Scheduled Run**: GitHub Actions triggers daily at 9:00 AM IST (3:30 AM UTC)
2. **Fetch Latest Data**: Node.js script fetches latest stock recommendations and news
3. **Update Data File**: Updates `src/stocks-data.json` with fresh data
4. **Auto Commit**: Commits changes to GitHub automatically
5. **Auto Deploy**: Cloudflare Pages detects the git push and deploys automatically

**Result**: Your dashboard always shows the latest data without any manual intervention!

---

## ⚡ Manual Trigger

You can also trigger an update manually anytime:

### Option 1: GitHub Actions UI
1. Go to your GitHub repository
2. Click **"Actions"** tab
3. Select **"Update Stock Dashboard Data"** workflow
4. Click **"Run workflow"** button
5. Wait ~2 minutes for completion

### Option 2: Local Test
```bash
cd scripts
npm install
node fetch-latest-stocks.js
```

---

## 📅 Schedule Configuration

The default schedule is **9:00 AM IST daily**. To change:

Edit `.github/workflows/update-stocks.yml`:

```yaml
schedule:
  - cron: '30 3 * * *'  # 9:00 AM IST
```

**Common schedules:**
- `30 3 * * *` - 9:00 AM IST (default)
- `30 0 * * *` - 6:00 AM IST (early morning)
- `0 6 * * *` - 11:30 AM IST (mid-day)
- `30 3 * * 1-5` - 9:00 AM IST, Monday-Friday only
- `30 3,9 * * *` - 9:00 AM and 3:00 PM IST (twice daily)

**Cron format**: `minute hour day month day-of-week`

---

## 🔧 Setup Instructions

### Prerequisites
- GitHub repository with Actions enabled
- Repository secrets configured (if needed for API keys)

### First-Time Setup
1. Push this repository to GitHub
2. GitHub Actions will automatically detect `.github/workflows/update-stocks.yml`
3. First run will execute at next scheduled time (9:00 AM IST)
4. Check "Actions" tab to monitor runs

### Verify Setup
```bash
# Check workflow file exists
ls .github/workflows/update-stocks.yml

# Check script exists
ls scripts/fetch-latest-stocks.js

# Test script locally
cd scripts && npm install && node fetch-latest-stocks.js
```

---

## 📊 Monitoring Updates

### View Workflow Runs
1. Go to GitHub repository
2. Click **"Actions"** tab
3. See all workflow runs with status (✅ success / ❌ failed)
4. Click any run to see detailed logs

### Check Latest Update
- View `src/stocks-data.json` commit history
- Check `lastUpdated` timestamp in data file
- Dashboard shows "Last Updated" with IST time

---

## 🛠️ Troubleshooting

### Workflow Not Running
- Check if GitHub Actions is enabled in repository settings
- Verify cron schedule syntax
- Check if repository has recent activity (inactive repos may pause Actions)

### Data Not Updating
- Check workflow logs in Actions tab
- Verify script has no errors: `node scripts/fetch-latest-stocks.js`
- Ensure git push permissions are correct

### Dashboard Not Reflecting Changes
- Cloudflare Pages may take 2-3 minutes to deploy
- Check Cloudflare Pages deployment logs
- Hard refresh browser: Ctrl+Shift+R

---

## 🔐 Security Notes

- Workflow uses `GITHUB_TOKEN` (automatically provided)
- No sensitive data exposed in public repository
- All API calls logged in workflow runs
- Data updates tracked in git history

---

## 📈 Future Enhancements

Potential improvements:
- Fetch real-time data from financial APIs
- Add Telegram/Slack notifications on updates
- Implement error alerts if data fetch fails
- Add data validation before committing
- Support multiple data sources with fallbacks

---

## 💡 Cost

**FREE** - GitHub Actions provides 2,000 minutes/month for free
- Daily updates use ~2-3 minutes per day
- ~60-90 minutes per month = **100% free tier usage**

---

## 📞 Support

If you need to modify the automation:
1. Update `.github/workflows/update-stocks.yml` for schedule changes
2. Update `scripts/fetch-latest-stocks.js` for data fetching logic
3. Test locally before pushing to GitHub

**Your dashboard now updates automatically every day at 9:00 AM IST! 🎉**
