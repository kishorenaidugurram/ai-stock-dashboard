# Stock Market Dashboard - NSE F&O & Brokerage Recommendations

## Project Overview
A **dynamic, JSON-based stock market dashboard** showcasing NSE F&O breakout stocks and leading brokerage house recommendations from **December 13-20, 2025** with direct source links for further reading.

## 🎯 Key Features

### 1. **Dynamic Data Architecture**
- **JSON-Based**: Stock data stored in `/data/stocks-data.json` 
- **Web Search Integration**: Data sourced from real web searches (Dec 13-20, 2025)
- **Refresh API**: `/api/refresh` endpoint ready for automated updates
- **Real-time Display**: Frontend dynamically loads data via REST API

### 2. **NSE F&O Breakout Stocks (6 Stocks This Week)**
- **Crisil** - ₹5,250 → ₹5,800 (+4.5%) | Dec 16, 2025
- **Aries Agro** - ₹285 → ₹310 (+5.2%) | Dec 16, 2025
- **PDS Ltd** - ₹1,450 → ₹1,600 (+6.8%) | Dec 16, 2025
- **Bharti Airtel** - ₹1,681 → ₹1,780 (+3.2%) | Dec 15, 2025
- **DLF** - ₹755 → ₹820 (+4.1%) | Dec 15, 2025
- **Kotak Mahindra Bank** - ₹1,755 → ₹1,900 (+2.8%) | Dec 15, 2025

### 3. **Leading Brokerage Recommendations (6 Stocks This Week)**
✅ **ALL BUY Recommendations:**
- **ITC** - Nuvama (7.4% upside) | Dec 16, 2025
- **ICICI Bank** - Axis Securities (17.2% upside) | Dec 2025
- **ICICI Lombard** - Nuvama (9.4% upside) | Dec 16, 2025
- **SBI** - Axis Securities (27.6% upside) | Dec 2025
- **Kamat Hotels** - Choice Broking (5.4% upside) | Dec 20, 2025
- **Mallcom India** - Choice Broking (6.7% upside) | Dec 20, 2025

### 4. **Latest Market News (4 Headlines This Week)**
- **Dec 19, 2025**: Nifty Snaps Four-Session Losing Streak
- **Dec 19, 2025**: Sensex Jumps 447 Points After Decline
- **Dec 19, 2025**: ICICI Prudential AMC Debuts Strong
- **Dec 19, 2025**: Record IPO Boom Set to Continue

## 🔗 URLs

- **Live Dashboard**: https://3000-icgc5fj3ctx0aeqev243p-18e660f9.sandbox.novita.ai
- **API Endpoint**: https://3000-icgc5fj3ctx0aeqev243p-18e660f9.sandbox.novita.ai/api/stocks
- **JSON Data File**: `/data/stocks-data.json`

## 📊 Data Sources (With Clickable Links)

Every stock recommendation includes **clickable source links** to verify information:

### News Sources
- **MSN Markets** - https://www.msn.com/en-in/money/markets/
- **LiveMint** - https://www.livemint.com/market/stock-market-news/
- **Economic Times** - https://economictimes.indiatimes.com/
- **Moneycontrol** - https://www.moneycontrol.com/
- **Times of India** - https://timesofindia.indiatimes.com/
- **Business Standard** - https://www.business-standard.com/
- **Hindustan Times** - https://www.hindustantimes.com/

### Brokerage Houses
- **Motilal Oswal** - https://www.motilaloswal.com/
- **ICICI Direct** - https://www.icicidirect.com/
- **Axis Securities** - https://www.axissecurities.com/
- **Nuvama** - https://www.nuvama.com/
- **Choice Broking** - https://www.choiceindia.com/

## 🎨 Dashboard Features

### Interactive UI
✨ **Modern Card-Based Design**
- Animated cards with smooth hover effects
- Color-coded badges (Green for BUY, Red for SELL)
- Gradient purple header
- Responsive grid layout
- Font Awesome icons

📊 **Real-time Statistics**
- Total Breakout Stocks: 6
- Total Buy Recommendations: 12
- Total Sell Recommendations: 0
- Total News Updates: 4

🔄 **Refresh Button**
- Manual data refresh capability
- Loading indicator during updates
- Timestamp display of last update

## 🏗️ Technical Architecture

### Backend (Hono Framework)
```
src/index.tsx         - Main Hono application
├── GET /             - Dashboard HTML page
├── GET /api/stocks   - JSON API endpoint
└── POST /api/refresh - Data refresh endpoint
```

### Data Layer
```
data/stocks-data.json - Dynamic data storage
├── lastUpdated       - ISO timestamp
├── breakoutStocks[]  - Array of breakout stocks
├── brokerageRecommendations[] - Array of recommendations
└── newsHeadlines[]   - Array of latest news
```

### Frontend (Vanilla JS + Tailwind)
- **Framework**: None (Vanilla JavaScript)
- **CSS**: Tailwind CSS via CDN
- **Icons**: Font Awesome 6.4.0
- **HTTP Client**: Axios 1.6.0

## 📈 Data Format

### JSON Structure
```json
{
  "lastUpdated": "2024-12-20T04:53:00Z",
  "breakoutStocks": [
    {
      "name": "Stock Name",
      "symbol": "SYMBOL",
      "price": "₹1,000",
      "change": "+5.0%",
      "volume": "1.0M",
      "recommendation": "BUY",
      "target": "₹1,200",
      "source": "Source Name",
      "sourceUrl": "https://...",
      "analyst": "Analyst Name",
      "date": "Dec 20, 2024"
    }
  ],
  "brokerageRecommendations": [...],
  "newsHeadlines": [...]
}
```

## 🚀 Getting Started

### Local Development
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server with PM2
pm2 start ecosystem.config.cjs

# Test the API
curl http://localhost:3000/api/stocks

# Access dashboard
http://localhost:3000
```

### API Usage
```bash
# Get all stock data (JSON)
curl https://3000-icgc5fj3ctx0aeqev243p-18e660f9.sandbox.novita.ai/api/stocks

# Response structure:
{
  "lastUpdated": "...",
  "breakoutStocks": [...],
  "brokerageRecommendations": [...],
  "newsHeadlines": [...]
}
```

### Update Data
To update with latest information:
1. Edit `/data/stocks-data.json` with new data from web searches
2. Run `npm run build`
3. Restart service: `pm2 restart stock-dashboard`

## 📅 Data Timeline

**Current Data Period**: December 13-20, 2025 (This Week)

All recommendations and stock picks are from this specific date range:
- Breakout stocks: Dec 15-16, 2025
- Brokerage recommendations: Dec 16-20, 2025
- Market news: Dec 19, 2025

**Last Updated**: December 20, 2025 at 04:58 UTC

## 📊 Investment Statistics

- **Total Stocks Featured**: 12
- **Total Buy Recommendations**: 12 (100%)
- **Total Sell Recommendations**: 0 (0%)
- **Average Upside Potential**: 10-15%
- **Data Sources**: 7 major financial news platforms
- **Brokerage Houses**: 5 leading firms

## ⚠️ Important Disclaimer

This dashboard provides **aggregated stock recommendations from publicly available sources** for informational purposes only.

**Critical Points:**
- ✅ All data sourced from reputable financial news websites and brokerage reports
- ✅ Every recommendation includes source links for verification
- ✅ Data is from **December 13-20, 2025 only** (one week period)
- ❌ This is **NOT financial advice** - DYOR (Do Your Own Research)
- ❌ Past performance does not guarantee future results
- ❌ Stock prices are indicative and may not reflect real-time values
- ⚠️ Always consult with a certified financial advisor before investing

## 🔄 How Data Updates Work

### Current Approach
1. Web searches performed manually via search tools
2. Results parsed and formatted into JSON
3. JSON file saved to `/data/stocks-data.json`
4. Dashboard reads from JSON file via API

### Future Enhancement (Automated)
The `/api/refresh` endpoint is prepared for automated updates:
1. Scheduled web searches for latest recommendations
2. Automatic parsing of search results
3. JSON file auto-update
4. Real-time dashboard refresh

## 🛠️ Tech Stack

- **Backend**: Hono v4.11.1 (lightweight, fast)
- **Frontend**: HTML5 + Tailwind CSS + Vanilla JS
- **Data Format**: JSON
- **API**: RESTful JSON endpoints
- **Deployment**: Cloudflare Pages (ready)
- **Development**: Vite + Wrangler + PM2
- **Icons**: Font Awesome 6.4.0
- **HTTP Client**: Axios 1.6.0

## 📝 Deployment Status

- **Platform**: Development Sandbox
- **Status**: ✅ Active and Running
- **Environment**: Development
- **Port**: 3000
- **Process Manager**: PM2
- **Last Deployment**: December 20, 2025

## 🔄 Next Steps

### Immediate Enhancements
1. ✅ Dynamic JSON-based data (DONE)
2. ✅ Source links for all recommendations (DONE)
3. ✅ Current week data only (Dec 15-20, 2024) (DONE)
4. 🔄 Automated web search integration
5. 🔄 Scheduled daily updates (cron job)

### Future Features
1. **Real-time Price Updates**: Live stock price tracking
2. **Price Alerts**: Email/SMS notifications for target prices
3. **Historical Performance**: Track recommendation accuracy
4. **Portfolio Tracking**: Allow users to save their picks
5. **Advanced Filters**: Filter by brokerage, sector, market cap
6. **Technical Charts**: Integrate TradingView charts
7. **Sentiment Analysis**: AI-powered sentiment from news
8. **Export Features**: Download data as CSV/Excel

## 📞 Contributing

This project aggregates public stock recommendations with proper source attribution. Contributions welcome!

## 📄 License

MIT License - Educational and informational purposes only

---

**Built with ❤️ using Hono + Cloudflare Pages**

**Last Data Update**: December 20, 2025
**Dashboard Version**: 2.0 (JSON-Based Dynamic)
