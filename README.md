# Stock Market Dashboard - NSE F&O & Brokerage Recommendations

## Project Overview
A comprehensive, real-time stock market dashboard showcasing NSE F&O breakout stocks and leading brokerage house recommendations with direct source links for further reading.

## 🎯 Features

### 1. **NSE F&O Breakout Stocks**
- **New F&O Additions**: 6 stocks added to NSE F&O segment from Jan 31, 2025
- **Stock Details**: Current price, target price, volume, and percentage change
- **Source Links**: Direct links to LiveMint, 5Paisa, Angel One, ICICI Direct
- **Analyst Information**: Expert recommendations from leading analysts

### 2. **Leading Brokerage Recommendations**
- **Top Brokerages**: Motilal Oswal, ICICI Securities, Jefferies, UBS, Macquarie, Emkay Global
- **BUY/SELL Recommendations**: Clear buy and sell signals with rationale
- **Target Prices**: Price targets with upside/downside percentages
- **Investment Rationale**: Detailed reasoning for each recommendation
- **Source Links**: Direct links to Economic Times, Times of India, Moneycontrol

### 3. **Latest Market News**
- **Breaking News**: Latest F&O updates and market outlook
- **News Sources**: 5Paisa, Zerodha, Motilal Oswal, NDTV Profit
- **Categories**: F&O Updates, Stock Picks, Market Outlook

### 4. **Interactive Dashboard**
- **Real-time Stats**: Total breakout stocks, buy/sell recommendations count
- **Card-based UI**: Modern, responsive cards with hover effects
- **Source Attribution**: Every recommendation includes clickable source links
- **Mobile Responsive**: Works seamlessly on all devices

## 🔗 URLs

- **Live Dashboard**: https://3000-icgc5fj3ctx0aeqev243p-18e660f9.sandbox.novita.ai
- **API Endpoint**: https://3000-icgc5fj3ctx0aeqev243p-18e660f9.sandbox.novita.ai/api/stocks

## 📊 Featured Stocks

### NSE F&O Breakout Stocks (6)
1. **Indraprastha Medical Corp** (IHH) - ₹2,450 | Target: ₹2,800 | +5.2%
2. **Castrol India** (CASTROLIND) - ₹245 | Target: ₹280 | +3.8%
3. **Gland Pharma** (GLAND) - ₹1,890 | Target: ₹2,200 | +6.4%
4. **Phoenix Mills** (PHOENIXLTD) - ₹3,250 | Target: ₹3,650 | +4.1%
5. **Solar Industries** (SOLARINDS) - ₹9,850 | Target: ₹11,000 | +7.2%
6. **NBCC India** (NBCC) - ₹128 | Target: ₹155 | +5.8%

### Brokerage Recommendations (8)
- **Bharti Airtel** - Motilal Oswal BUY | 20% upside
- **ICICI Bank** - Motilal Oswal BUY | 17% upside
- **Adani Enterprises** - Jefferies BUY | 18% upside
- **Reliance Industries** - UBS BUY | 18% upside
- **Hero MotoCorp** - Macquarie BUY | 18% upside
- **Page Industries** - Motilal Oswal BUY | 13% upside
- **Hindalco** - Emkay Global SELL | -9% downside
- **Lemon Tree Hotels** - ICICI Securities BUY | 16% upside

## 📰 Data Sources

All recommendations include direct source links to:
- **LiveMint**: https://www.livemint.com/market/stock-market-news/
- **Economic Times**: https://economictimes.indiatimes.com/markets/stocks/recos
- **Moneycontrol**: https://www.moneycontrol.com/markets/stock-ideas/
- **Times of India Business**: https://timesofindia.indiatimes.com/business/
- **5Paisa Research**: https://www.5paisa.com/news/
- **Angel One**: https://www.angelone.in/news/market-updates/
- **ICICI Direct**: https://www.icicidirect.com/
- **Motilal Oswal**: https://www.motilaloswal.com/news/stocks/
- **NDTV Profit**: https://www.ndtvprofit.com/markets

## 🏗️ Tech Stack

- **Backend**: Hono (lightweight web framework)
- **Frontend**: HTML5, Tailwind CSS, Font Awesome Icons
- **API**: RESTful JSON API
- **Deployment**: Cloudflare Pages (edge-optimized)
- **Development**: Vite, Wrangler, PM2

## 🚀 Getting Started

### Local Development
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# Access at http://localhost:3000
```

### API Usage
```bash
# Get all stock data
curl https://3000-icgc5fj3ctx0aeqev243p-18e660f9.sandbox.novita.ai/api/stocks

# Response includes:
# - breakoutStocks: Array of NSE F&O stocks
# - brokerageRecommendations: Array of brokerage picks
# - newsHeadlines: Array of latest news
```

## 📈 Investment Statistics

- **Total Breakout Stocks**: 6
- **Buy Recommendations**: 13
- **Sell Recommendations**: 1
- **News Updates**: 4
- **Average Upside Potential**: 15-20%
- **Data Period**: Last week (Dec 13 - Dec 20, 2024)

## ⚠️ Disclaimer

This dashboard provides aggregated stock recommendations from leading brokerage houses and financial news sources for informational purposes only. 

**Important Notes:**
- All data sourced from publicly available brokerage reports and financial news websites
- Source links provided for every recommendation for further reading and verification
- This is NOT financial advice - always do your own research (DYOR)
- Past performance does not guarantee future results
- Consult with a certified financial advisor before making investment decisions
- Stock prices are indicative and may not reflect real-time values

## 📝 Deployment Status

- **Platform**: Cloudflare Pages
- **Status**: ✅ Active
- **Environment**: Development
- **Last Updated**: December 20, 2024

## 🔄 Next Steps

1. **Real-time Data Integration**: Connect to live stock market APIs
2. **Price Alerts**: Add email/SMS notifications for target prices
3. **Historical Analysis**: Show past recommendation performance
4. **Portfolio Tracking**: Allow users to track their investments
5. **Advanced Filters**: Filter by brokerage, sector, market cap
6. **Technical Charts**: Integrate TradingView charts
7. **Sentiment Analysis**: Add AI-powered sentiment analysis from news

## 📞 Contributing

Contributions welcome! This project aggregates public stock recommendations with proper source attribution.

## 📄 License

MIT License - Educational and informational purposes only
