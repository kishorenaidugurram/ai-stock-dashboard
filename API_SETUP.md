# API Setup Guide for Real-Time Stock Data

## Current Status

✅ **Automation Working**: The dashboard updates automatically 4 times daily (7AM, 9AM, 2PM, 4PM IST)
⚠️ **Using Demo Mode**: Currently only updating timestamps, not fetching real-time prices

---

## Option 1: Alpha Vantage API (Free Tier)

### Features:
- ✅ Free tier available (5 API calls/minute, 500 calls/day)
- ✅ Real-time stock quotes
- ✅ No credit card required

### Setup Steps:

1. **Get Free API Key**:
   - Visit: https://www.alphavantage.co/support/#api-key
   - Enter your email
   - Receive API key instantly

2. **Set Environment Variable**:

   **For Local Development:**
   ```bash
   export ALPHA_VANTAGE_API_KEY='your-api-key-here'
   ```

   **For GitHub Actions (Automated Updates):**
   - Go to: https://github.com/kishorenaidugurram/ai-stock-dashboard/settings/secrets/actions
   - Click "New repository secret"
   - Name: `ALPHA_VANTAGE_API_KEY`
   - Value: Your API key
   - Click "Add secret"

3. **Update Workflow File** (`.github/workflows/update-stocks.yml`):
   ```yaml
   - name: Fetch latest stock data
     run: node scripts/fetch-latest-stocks.js
     env:
       TZ: 'Asia/Kolkata'
       ALPHA_VANTAGE_API_KEY: ${{ secrets.ALPHA_VANTAGE_API_KEY }}  # Add this line
   ```

### Limitations:
- **Rate Limit**: 5 calls/minute (script includes automatic 12-second delays)
- **Daily Limit**: 500 calls/day (our 4 daily runs use ~60 calls total)
- **Coverage**: May not have all Indian stocks

---

## Option 2: Yahoo Finance (No API Key Required)

### Features:
- ✅ Completely free, no registration
- ✅ Excellent coverage of Indian stocks
- ✅ No rate limits for reasonable usage

### Implementation:

I can create a Yahoo Finance version that doesn't require any API key. Yahoo Finance allows scraping their data without authentication.

Would you like me to:
- **A)** Create a Yahoo Finance version (no API key needed)
- **B)** Keep Alpha Vantage but help you set up the API key
- **C)** Create both versions so you have a backup

---

## Option 3: NSE India Official API (Free, No Registration)

### Features:
- ✅ Official NSE data
- ✅ No API key required
- ✅ Real-time Indian market data

The NSE provides public APIs that don't require authentication. I can integrate this for real Indian stock prices.

---

## Recommendation

**For Your Use Case:**

I recommend **Yahoo Finance** because:
1. ✅ No API key setup needed
2. ✅ Works immediately after deployment
3. ✅ Excellent Indian stock coverage
4. ✅ Reliable and fast
5. ✅ No rate limits for our usage pattern

**Would you like me to implement the Yahoo Finance version now?**

---

## Current Script Behavior

**Without API Key:**
- ✅ Updates all timestamps to current date/time
- ✅ Updates dates on all recommendations
- ✅ Maintains all stock data structure
- ⚠️ Does NOT update actual stock prices

**With API Key:**
- ✅ All of the above
- ✅ Fetches real-time stock prices
- ✅ Recalculates upside percentages
- ✅ Updates volume data
- ✅ Shows price changes

---

## Quick Test

Test if API key is working:
```bash
cd /home/user/webapp/scripts
ALPHA_VANTAGE_API_KEY='demo' node fetch-latest-stocks.js
```

---

## Next Steps

**Choose one:**

1. **Easy (Recommended)**: Let me create Yahoo Finance version - works immediately
2. **Medium**: Set up Alpha Vantage API key (5 min setup)
3. **Advanced**: Use NSE India official API (most accurate Indian data)

Which would you prefer?
