# AI-Powered Dashboard Auto-Update System

## Overview

This document explains how to integrate AI-powered web search capabilities into your dashboard to automatically update stock data without manual JSON editing.

## 🎯 Solution: AI Search API Integration

### Option 1: **Server-Side Update Script (RECOMMENDED)**

Create a Node.js script that runs on a schedule to update the dashboard.

#### Architecture:
```
Cron Job (every hour) → Node.js Script → AI API → Parse Results → Update JSON → Rebuild Dashboard
```

#### Implementation:

**1. Create Update Script (`update-stocks.js`):**

```javascript
// update-stocks.js
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Configuration
const AI_API_ENDPOINT = 'YOUR_AI_API_ENDPOINT'; // We'll discuss options
const AI_API_KEY = process.env.AI_API_KEY;

async function searchStocks() {
  const queries = [
    'NSE F&O breakout stocks today India',
    'brokerage stock recommendations today India buy sell',
    'Sensex Nifty market news today India latest',
    'trending stocks twitter reddit India today'
  ];

  const results = [];
  
  for (const query of queries) {
    const response = await fetch(AI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    results.push(data);
  }
  
  return results;
}

async function parseAndStructureData(searchResults) {
  // Use AI to parse search results into structured format
  const prompt = `Parse these search results into structured stock data...`;
  
  // Call AI API to structure the data
  const response = await fetch(AI_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`
    },
    body: JSON.stringify({
      prompt: prompt,
      data: searchResults
    })
  });
  
  return await response.json();
}

async function updateDashboard() {
  console.log('🔍 Starting stock data update...');
  
  try {
    // 1. Search for latest data
    console.log('📊 Searching for latest stock data...');
    const searchResults = await searchStocks();
    
    // 2. Parse and structure the data
    console.log('🤖 Parsing search results with AI...');
    const structuredData = await parseAndStructureData(searchResults);
    
    // 3. Update JSON file
    console.log('💾 Updating stocks-data.json...');
    structuredData.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(
      './data/stocks-data.json',
      JSON.stringify(structuredData, null, 2)
    );
    
    // 4. Rebuild dashboard
    console.log('🔨 Rebuilding dashboard...');
    await execPromise('npm run build');
    
    // 5. Restart service
    console.log('🔄 Restarting service...');
    await execPromise('pm2 restart stock-dashboard');
    
    console.log('✅ Dashboard updated successfully!');
    console.log(`📅 Last updated: ${structuredData.lastUpdated}`);
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
}

// Run update
updateDashboard();
```

**2. Add to package.json:**

```json
{
  "scripts": {
    "update-stocks": "node update-stocks.js",
    "auto-update": "node update-stocks.js && echo 'Update complete'"
  }
}
```

**3. Schedule with Cron:**

```bash
# Edit crontab
crontab -e

# Add this line to update every hour
0 * * * * cd /home/user/webapp && npm run update-stocks >> /var/log/stock-update.log 2>&1

# Or every 4 hours
0 */4 * * * cd /home/user/webapp && npm run update-stocks >> /var/log/stock-update.log 2>&1

# Or daily at 9 AM market open
0 9 * * 1-5 cd /home/user/webapp && npm run update-stocks >> /var/log/stock-update.log 2>&1
```

---

### Option 2: **Dashboard Built-in Update Button (SIMPLER)**

Add an update button that calls a Cloudflare Worker to trigger updates.

#### Implementation:

**1. Add Update API Endpoint to Hono:**

```typescript
// src/index.tsx
import { Hono } from 'hono';

app.post('/api/update-stocks', async (c) => {
  try {
    // This would be called by you through a secure endpoint
    // For now, it just returns a message
    return c.json({
      success: true,
      message: 'Update triggered. Check back in 2 minutes.',
      eta: '2 minutes'
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Add admin endpoint for manual updates
app.post('/api/admin/update-stocks', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  // Simple authentication
  if (authHeader !== `Bearer ${c.env.ADMIN_API_KEY}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // Trigger update process
  // In production, this would:
  // 1. Call external AI API
  // 2. Parse results
  // 3. Update data
  
  return c.json({
    success: true,
    message: 'Update initiated',
    timestamp: new Date().toISOString()
  });
});
```

**2. Add Update Button to Dashboard:**

```html
<!-- Add to dashboard header -->
<div class="flex gap-2">
  <button onclick="refreshData()" class="refresh-btn text-white px-4 py-2 rounded text-sm">
    <i class="fas fa-sync-alt mr-1"></i> Refresh Display
  </button>
  
  <button onclick="updateStockData()" class="update-btn text-white px-4 py-2 rounded text-sm">
    <i class="fas fa-search mr-1"></i> Update Data (2 min)
  </button>
</div>

<script>
async function updateStockData() {
  if (!confirm('This will update stock data from live searches. Takes ~2 minutes. Continue?')) {
    return;
  }
  
  document.getElementById('loadingIndicator').classList.remove('hidden');
  
  try {
    const response = await axios.post('/api/admin/update-stocks', {}, {
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_KEY'
      }
    });
    
    alert('Update started! Refresh page in 2 minutes to see new data.');
    
  } catch (error) {
    alert('Update failed: ' + error.message);
  } finally {
    document.getElementById('loadingIndicator').classList.add('hidden');
  }
}
</script>
```

---

### Option 3: **GenSpark AI Integration (EASIEST FOR YOU)**

Since you're already using GenSpark AI (me!), we can create a simple webhook system.

#### How It Works:

```
You → Send message "update dashboard" → I perform searches → Update JSON → Rebuild → Done
```

#### Implementation:

**1. Create a simple trigger file:**

```bash
# Create trigger script
cat > /home/user/webapp/trigger-update.sh << 'EOF'
#!/bin/bash
echo "📊 Stock Dashboard Update Triggered"
echo "⏰ Time: $(date)"
echo ""
echo "This will:"
echo "1. Perform Google searches for latest stock data"
echo "2. Parse and structure the results"
echo "3. Update stocks-data.json"
echo "4. Rebuild and restart the dashboard"
echo ""
echo "Please run your AI assistant with: 'Update the stock dashboard'"
EOF

chmod +x /home/user/webapp/trigger-update.sh
```

**2. When you want to update:**

Just send me a message saying:
- "Update the stock dashboard"
- "Refresh stock data"
- "Get latest stock recommendations"

And I will:
1. Perform 4 Google searches (breakouts, recommendations, news, social)
2. Parse the results
3. Update the JSON file
4. Rebuild and restart
5. Give you a summary of changes

---

## 🚀 Recommended Approach

### **For Your Use Case: Hybrid Approach**

**Daily Automated Updates:**
- Use **Option 3** (send me a message daily)
- Takes ~2 minutes
- No code maintenance
- I handle all parsing and structuring

**Manual Updates When Needed:**
- Just message me anytime
- "Update dashboard with latest data"
- I perform fresh searches and update everything

**Future: Full Automation:**
- When you're ready, implement **Option 1**
- Scheduled cron job
- Fully autonomous
- No manual intervention

---

## 💡 Immediate Next Steps

### Let's Set Up Option 3 (Easiest):

**1. I'll create a command for you:**

```bash
# Create update command
cat > /home/user/webapp/update-dashboard.txt << 'EOF'
To update the dashboard, send this message to AI:

"Update the stock dashboard with latest data for [DATE]"

Example:
"Update the stock dashboard with latest data for December 21, 2025"

The AI will:
✓ Search for latest breakout stocks
✓ Search for brokerage recommendations
✓ Search for market news
✓ Search for social sentiment
✓ Update JSON file
✓ Rebuild dashboard
✓ Restart service
✓ Provide summary

Time: ~2 minutes
EOF
```

**2. You can also ask me to:**
- Update specific sections only
- Add new stocks to track
- Remove old stocks
- Change data sources
- Adjust search parameters

---

## 📊 Update Frequency Recommendations

### For Indian Stock Market:

- **During Market Hours (9:15 AM - 3:30 PM IST):**
  - Morning: 9:30 AM (after market open)
  - Mid-day: 1:00 PM
  - Close: 4:00 PM (after market close)

- **Outside Market Hours:**
  - Pre-market: 8:30 AM (pre-open analysis)
  - After-hours: 6:00 PM (day summary)

- **Weekends:**
  - Saturday morning: Weekly summary
  - Sunday evening: Week ahead preview

---

## 🎯 Example Update Workflow

### Daily Update (Send me this):

```
"Update stock dashboard for December 21, 2025:
- Get latest NSE F&O breakouts
- Get fresh brokerage recommendations
- Check social sentiment for top 10 stocks
- Include market news"
```

### I will respond with:

```
✅ Dashboard Updated!

📊 Changes:
- Added 3 new breakout stocks
- Updated 5 brokerage recommendations
- Refreshed social sentiment (7 stocks with data)
- Added 4 latest news headlines

📈 Top Changes:
- Infosys: New BUY from ICICI Securities (20% upside)
- HDFC Bank: Social sentiment improved to Bullish (7.5/10)
- Removed: 2 old recommendations (>7 days)

🌐 Live: https://your-dashboard-url

Last Updated: 2025-12-21T09:30:00Z
```

---

## 🔧 Alternative: Use External APIs

If you want fully automated updates without me:

### Option A: Use Yahoo Finance API
```javascript
import yahooFinance from 'yahoo-finance2';

const quote = await yahooFinance.quote('RELIANCE.NS');
// Update your JSON with real-time prices
```

### Option B: Use Alpha Vantage
```javascript
const API_KEY = 'your-key';
const symbol = 'TCS.BSE';
const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
```

### Option C: Use NSE Official API
```javascript
// NSE provides free APIs for market data
const nseUrl = 'https://www.nseindia.com/api/quote-equity?symbol=TCS';
```

---

## 🎊 Summary

**Easiest Solution (Available Now):**
- Just message me: "Update dashboard"
- I'll do everything in ~2 minutes
- No code changes needed
- Works immediately

**Want to try it?** Just say:
"Update the stock dashboard with latest data for today"

And I'll do a fresh update right now! 📊🚀

Would you like me to perform an update right now to show you how it works?
