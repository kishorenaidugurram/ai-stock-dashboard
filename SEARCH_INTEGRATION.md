# Live Google Search Integration - Stock Market Dashboard

## Overview

This dashboard now features **AI-powered live Google search integration** that fetches real stock market data directly from the web.

## How It Works

### 1. Search Execution (Performed by AI)

When a refresh is requested, the AI assistant performs 4 strategic Google searches:

```
Search 1: "NSE F&O breakout stocks December 20 2025 today India"
  → Returns: Top breakout stocks from Screener, Trendlyne, Dhan
  → Sources: Technical analysis and F&O market data

Search 2: "stock recommendations buy today December 20 2025 Motilal Oswal ICICI Securities"
  → Returns: Latest brokerage recommendations
  → Sources: Economic Times, Motilal Oswal, Financial Express

Search 3: "Sensex Nifty market news today December 20 2025 India latest"
  → Returns: Latest market news and indices performance
  → Sources: Reuters, LiveMint, Moneycontrol, Equitymaster

Search 4: "intraday stock picks today December 20 2025 India F&O trading"
  → Returns: Active trading stocks with high volume
  → Sources: NSE India, ICICI Direct, 5paisa
```

### 2. Data Extraction

From each search, the AI extracts:

**For Breakout Stocks:**
- Stock name and symbol
- Current price
- Price change percentage
- Trading volume
- Analyst/source name
- Source URL for verification
- Date of analysis

**For Brokerage Recommendations:**
- Stock name and symbol
- Current price
- BUY/SELL recommendation
- Target price
- Upside/downside potential
- Brokerage house name
- Rationale/reasoning
- Source URL
- Date of recommendation

**For Market News:**
- Headline title
- Summary description
- News source
- Source URL
- Date and time
- Category (Market Rally, IPO Success, etc.)

### 3. Data Structure

All extracted data is formatted into this JSON structure:

```json
{
  "lastUpdated": "2025-12-20T10:15:00Z",
  "breakoutStocks": [
    {
      "name": "Hindustan Copper",
      "symbol": "HINDCOPPER",
      "price": "₹387.55",
      "change": "+8.5%",
      "volume": "4.8M",
      "recommendation": "BUY",
      "target": "₹450",
      "source": "Screener",
      "sourceUrl": "https://www.screener.in/screens/209239/breakout-stocks/",
      "analyst": "Technical Breakout Analysis",
      "date": "Dec 20, 2025"
    }
    // ... 5 more breakout stocks
  ],
  "brokerageRecommendations": [
    {
      "stock": "TCS (Tata Consultancy Services)",
      "symbol": "TCS",
      "price": "₹3,260",
      "recommendation": "BUY",
      "target": "₹4,090",
      "upside": "25.5%",
      "brokerage": "ICICI Securities",
      "source": "Economic Times",
      "sourceUrl": "https://m.economictimes.com/...",
      "date": "Dec 20, 2025",
      "rationale": "Strong IT sector outlook, digital transformation tailwinds"
    }
    // ... 7 more recommendations
  ],
  "newsHeadlines": [
    {
      "title": "VIX India Hits Record Low at 9.52",
      "summary": "India VIX came close to 52-week low indicating lower volatility",
      "source": "LiveMint",
      "sourceUrl": "https://www.livemint.com/...",
      "date": "Dec 20, 2025 (2 hours ago)",
      "category": "Market Sentiment"
    }
    // ... 3 more news items
  ]
}
```

### 4. Update Flow

```
┌─────────────────┐
│  User Requests  │
│  Data Refresh   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  AI Performs 4 Google       │
│  Searches in Parallel       │
│  Time: ~5-10 seconds        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Parse Search Results       │
│  Extract Structured Data    │
│  Time: ~10-15 seconds       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Write to stocks-data.json  │
│  Time: ~1 second            │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  npm run build              │
│  Time: ~3-5 seconds         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  pm2 restart stock-dashboard│
│  Time: ~2 seconds           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Dashboard Shows Fresh Data │
│  Total Time: ~30-40 seconds │
└─────────────────────────────┘
```

## Data Sources

### Stock Screeners
- **Screener** (screener.in) - Breakout stock analysis
- **Trendlyne** (trendlyne.com) - 52-week high F&O stocks
- **Dhan** (dhan.co) - Live breakout shares
- **NSE India** (nseindia.com) - Official market data

### News Publishers
- **Reuters** - Global financial news
- **LiveMint** - Indian market analysis
- **Economic Times** - Business and stock news
- **Moneycontrol** - Market updates and analysis
- **Financial Express** - Economic news
- **Equitymaster** - Investment insights

### Brokerage Houses
- **ICICI Securities** - Research reports and recommendations
- **Motilal Oswal** - Stock picks and analysis

## Search Result Quality

### What Makes Data Reliable

1. **Multiple Source Verification**: 
   - Cross-reference data from 8+ financial platforms
   - Each stock has source URL for user verification

2. **Timestamp Accuracy**:
   - All data includes publication date/time
   - "X hours ago" indicators show recency
   - Last updated timestamp always visible

3. **Brokerage Attribution**:
   - Clear attribution to specific analysts
   - Named brokerages (ICICI Securities, Motilal Oswal)
   - Rationale included for each recommendation

4. **Technical Indicators**:
   - Price, volume, change percentage
   - Target prices with upside potential
   - Stop loss levels where available

## Limitations

### Current Constraints

1. **Manual Trigger**: 
   - AI must be asked to perform searches
   - Not automated on a schedule (yet)

2. **Search API Limitations**:
   - Relies on Google search results quality
   - Subject to search engine algorithm changes
   - May miss very recent (last hour) updates

3. **Data Parsing**:
   - Requires consistent formatting from sources
   - Some manual interpretation by AI
   - Numbers/prices extracted from snippets

4. **No Real-Time Exchange Data**:
   - Data is from news/analysis sites, not live exchange feeds
   - Prices may have slight delay (15-30 minutes)

## Future Enhancements

### Planned Improvements

1. **Automated Scheduled Searches**:
   ```bash
   # Cron job to trigger searches every hour
   0 * * * * /usr/bin/node refresh-data.js
   ```

2. **Real-Time Stock Prices**:
   - Integrate with NSE/BSE APIs for live prices
   - WebSocket connections for tick-by-tick data

3. **Historical Tracking**:
   - Archive past recommendations
   - Track recommendation accuracy
   - Show performance metrics

4. **User Customization**:
   - Allow users to specify search queries
   - Save favorite stocks/brokerages
   - Custom alert thresholds

5. **Enhanced Parsing**:
   - Better extraction of technical levels
   - Sentiment analysis of news
   - Automatic categorization

## How to Request Fresh Data

### For Users

Simply ask the AI assistant:
- "Refresh the dashboard with latest data"
- "Update stock recommendations"
- "Get today's breakout stocks"
- "Search for latest brokerage picks"

The AI will:
1. Perform fresh Google searches
2. Parse and structure results
3. Update the JSON file
4. Rebuild and restart the dashboard
5. Confirm the update with new data summary

### For Developers

The system is designed to be triggered programmatically:

```javascript
// Pseudo-code for automated refresh
async function refreshDashboard() {
  // 1. Perform searches
  const searches = await Promise.all([
    googleSearch("NSE F&O breakout stocks today"),
    googleSearch("stock recommendations today India brokerage"),
    googleSearch("Sensex Nifty news today"),
    googleSearch("intraday F&O picks today")
  ]);
  
  // 2. Parse results
  const data = parseSearchResults(searches);
  
  // 3. Update JSON
  await fs.writeFile('data/stocks-data.json', JSON.stringify(data));
  
  // 4. Rebuild
  await exec('npm run build');
  
  // 5. Restart
  await exec('pm2 restart stock-dashboard');
}
```

## Verification

### How to Verify Data Accuracy

Every stock/recommendation includes a **source URL**. Users should:

1. **Click Source Links**: 
   - Each card has "Read full report on [Source]" link
   - Opens original article/analysis in new tab

2. **Cross-Reference**:
   - Compare dashboard data with source page
   - Verify prices, targets, recommendations

3. **Check Timestamps**:
   - Ensure data is from stated date/time
   - Look for "X hours ago" indicators

4. **Consult Multiple Sources**:
   - Don't rely on single recommendation
   - Check 2-3 brokerages for same stock

## Disclaimer

⚠️ **Important**: This dashboard aggregates publicly available information via Google searches. While we strive for accuracy:

- Data is extracted from search snippets, not APIs
- Slight delays possible (15-30 minutes typical)
- Always verify via source links before investing
- Not a substitute for professional financial advice
- AI parsing may occasionally misinterpret data

## Support

For issues or questions:
- Check source URLs to verify original data
- Review search query results manually
- Contact support with specific data discrepancies
- Provide screenshots showing differences

---

**Last Updated**: December 20, 2025
**Version**: 1.0 (Live Search Integration)
