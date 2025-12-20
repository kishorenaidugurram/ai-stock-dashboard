# Twitter & Reddit Tracking Integration Guide

## Overview
This document describes how social sentiment from Twitter/Reddit is integrated into the Stock Market Dashboard.

## Implementation Approach

### Phase 1: Web Search-Based Sentiment (CURRENT)
Since we can't access Twitter/Reddit APIs directly in Cloudflare Workers (due to OAuth complexity and rate limits), we use **Google Search** to track social sentiment:

**Search Strategy:**
- `"[STOCK_NAME] twitter sentiment today"`
- `"[STOCK_NAME] reddit discussion stocks today"`
- `"r/wallstreetbets [STOCK_NAME] discussion"`
- `"r/IndianStreetBets [STOCK_NAME] mentions"`

**Data Extracted:**
- Recent discussion volume (High/Medium/Low)
- Sentiment keywords (Bullish/Bearish/Neutral)
- Popular discussion threads
- Trending topics related to stock

### Phase 2: API Integration (FUTURE)
For production deployment with proper API access:

#### Twitter API v2 Requirements
- **Endpoint**: `https://api.twitter.com/2/tweets/search/recent`
- **Cost**: Free tier (500k tweets/month), Basic ($100/month)
- **Rate Limit**: 450 requests/15min (Free tier)
- **Setup**: https://developer.twitter.com/en/portal/dashboard

#### Reddit API Requirements
- **Endpoint**: `https://oauth.reddit.com/search`
- **Cost**: Free (with rate limits)
- **Rate Limit**: 60 requests/minute
- **Setup**: https://www.reddit.com/prefs/apps

## Current Implementation

### New API Endpoints

#### 1. Get Social Sentiment for Stock
```typescript
GET /api/social-sentiment/:symbol

Response:
{
  "symbol": "TCS",
  "sentiment": {
    "overall": "Bullish",      // Bullish/Bearish/Neutral
    "score": 7.5,              // 0-10 scale
    "confidence": "High"        // High/Medium/Low
  },
  "twitter": {
    "volume": "High",          // Discussion volume
    "sentiment": "Bullish",
    "topKeywords": ["buy", "breakout", "earnings"],
    "recentDiscussions": [
      {
        "text": "TCS results expected to beat estimates...",
        "sentiment": "Bullish",
        "source": "Twitter search result",
        "date": "2025-12-20"
      }
    ]
  },
  "reddit": {
    "volume": "Medium",
    "sentiment": "Neutral",
    "topSubreddits": ["r/IndianStreetBets", "r/IndianStockMarket"],
    "recentDiscussions": [
      {
        "title": "TCS Q3 results discussion thread",
        "sentiment": "Neutral",
        "upvotes": 145,
        "comments": 67,
        "subreddit": "r/IndianStreetBets",
        "source": "Reddit search result"
      }
    ]
  },
  "lastUpdated": "2025-12-20T10:30:00Z"
}
```

#### 2. Get Trending Stocks on Social Media
```typescript
GET /api/social-sentiment/trending

Response:
{
  "trending": [
    {
      "symbol": "TATASTEEL",
      "name": "Tata Steel",
      "socialVolume": 1250,
      "sentiment": "Bullish",
      "platforms": {
        "twitter": "High",
        "reddit": "Medium"
      }
    }
  ],
  "lastUpdated": "2025-12-20T10:30:00Z"
}
```

### Frontend UI Components

#### Sentiment Badge Component
```html
<div class="sentiment-badge bullish">
  <i class="fab fa-twitter"></i>
  <i class="fab fa-reddit"></i>
  <span>Social: Bullish 📈</span>
  <small>High Volume</small>
</div>
```

#### Social Sentiment Card
```html
<div class="social-card">
  <h4>Social Sentiment - TCS</h4>
  
  <div class="platform-sentiment">
    <div class="twitter-sentiment">
      <i class="fab fa-twitter"></i>
      <span class="sentiment bullish">Bullish</span>
      <span class="volume">High Volume</span>
    </div>
    
    <div class="reddit-sentiment">
      <i class="fab fa-reddit"></i>
      <span class="sentiment neutral">Neutral</span>
      <span class="volume">Medium Volume</span>
    </div>
  </div>
  
  <div class="recent-discussions">
    <h5>Recent Discussions</h5>
    <div class="discussion-item">
      <span class="platform">Twitter</span>
      <p>"TCS results expected to beat estimates..."</p>
      <span class="sentiment-tag bullish">Bullish</span>
    </div>
  </div>
</div>
```

## Data Collection Process

### Step 1: Search Execution
For each stock in the dashboard:
```javascript
const searches = [
  `"${stockName}" twitter sentiment today`,
  `"${stockName}" reddit discussion r/IndianStreetBets`,
  `"${ticker}" bullish bearish twitter`,
  `"${ticker}" reddit stocks discussion`
];
```

### Step 2: Sentiment Analysis
Using keyword matching on search results:
```javascript
const bullishKeywords = [
  'buy', 'bullish', 'moon', 'breakout', 'rocket',
  'strong buy', 'upside', 'target raised', 'growth'
];

const bearishKeywords = [
  'sell', 'bearish', 'dump', 'breakdown', 'crash',
  'avoid', 'downside', 'target cut', 'loss'
];
```

### Step 3: Volume Calculation
- **High Volume**: 50+ mentions in search results
- **Medium Volume**: 10-49 mentions
- **Low Volume**: 1-9 mentions

## Quality Standards

### Sentiment Data Requirements
1. **Recency**: Only discussions from last 24 hours
2. **Relevance**: Must mention stock ticker or full name
3. **Context**: Must be stock market related (not company news)
4. **Source Credibility**: Prioritize known trading communities

### Filtering Rules
- Exclude bot-generated content
- Exclude promotional posts
- Prioritize posts with high engagement (likes, replies, upvotes)
- Verify stock ticker before including

## Dashboard Integration

### Enhanced Stock Cards
Each stock card now shows:
```
┌─────────────────────────────────┐
│ TCS - Tata Consultancy Services │
│ ₹4,090 • BUY • +25.5% upside    │
│ ICICI Securities • Dec 20, 2025 │
│                                  │
│ 🐦 Twitter: Bullish (High)      │
│ 🔴 Reddit: Neutral (Medium)      │
│ 📊 Social Score: 7.5/10         │
│                                  │
│ View Details →                  │
└─────────────────────────────────┘
```

### New "Social Sentiment" Section
Added below "Latest Market News":
- Top 5 most discussed stocks on Twitter
- Top 5 most discussed stocks on Reddit
- Trending discussion topics
- Sentiment heatmap

## Limitations (Current Implementation)

1. **No Real-time Data**: Based on Google search results, not live APIs
2. **Search-dependent**: Quality depends on Google indexing speed
3. **Volume Estimates**: Approximate, not exact mention counts
4. **No Direct Links**: Can't link to specific tweets/posts (API limitation)
5. **Sentiment is Inferred**: Based on keywords, not ML analysis

## Future Enhancements

### Short-term (With API Access)
- [ ] Real-time Twitter mentions tracking
- [ ] Live Reddit thread monitoring
- [ ] Exact sentiment scoring using NLP
- [ ] Direct links to discussions
- [ ] Historical sentiment trends

### Long-term
- [ ] ML-based sentiment analysis
- [ ] Influencer impact tracking
- [ ] Viral post detection
- [ ] Cross-platform correlation analysis
- [ ] Social trading signals

## API Keys Setup (For Future)

### Twitter API v2
```bash
# Get keys from: https://developer.twitter.com/en/portal/dashboard
npx wrangler secret put TWITTER_API_KEY
npx wrangler secret put TWITTER_API_SECRET
npx wrangler secret put TWITTER_BEARER_TOKEN
```

### Reddit API
```bash
# Get keys from: https://www.reddit.com/prefs/apps
npx wrangler secret put REDDIT_CLIENT_ID
npx wrangler secret put REDDIT_CLIENT_SECRET
npx wrangler secret put REDDIT_USERNAME
npx wrangler secret put REDDIT_PASSWORD
```

## Testing

### Manual Testing
```bash
# Test social sentiment endpoint
curl http://localhost:3000/api/social-sentiment/TCS

# Test trending stocks
curl http://localhost:3000/api/social-sentiment/trending
```

### Expected Response Times
- Social sentiment per stock: 2-5 seconds
- Trending stocks: 5-10 seconds
- Dashboard load with social data: 8-15 seconds

## Compliance & Disclaimers

**Important Notes:**
- Social sentiment is **not financial advice**
- High social volume ≠ Good investment
- Retail sentiment can be wrong or manipulated
- Always verify with professional analysis
- SEBI regulations apply for financial advice

**Data Sources:**
- Twitter discussions (public tweets only)
- Reddit communities (r/IndianStreetBets, r/IndianStockMarket, r/wallstreetbets)
- Public stock market forums

---

**Status**: ✅ Implemented (Web Search-based)  
**Last Updated**: December 20, 2025  
**Next Review**: When API access is available
