# Social Sentiment Integration Guide
## Twitter & Reddit Tracking for Stock Dashboard

---

## 🎯 **Overview**

Add real-time social media sentiment tracking to show what retail investors are saying about stocks.

**Features:**
- Twitter mentions count & sentiment
- Reddit (r/IndianStreetBets, r/IndiaInvestments) posts tracking
- Trending stocks detection
- Sentiment gauge (Bullish/Bearish/Neutral)
- Historical sentiment trends

---

## 🔑 **API Requirements**

### **Twitter API v2 (Required)**

**Sign up:** https://developer.twitter.com/en/portal/dashboard

**What you need:**
- Bearer Token (Essential access - FREE)
- Academic Research access (for historical data - optional)

**Rate Limits (Free tier):**
- 500,000 tweets/month
- 25 requests/15 min for search

**Cost:**
- Free tier: Good for starting
- Basic ($100/month): 10M tweets
- Pro ($5,000/month): 50M tweets

### **Reddit API (Required)**

**Sign up:** https://www.reddit.com/prefs/apps

**What you need:**
- Client ID
- Client Secret  
- User Agent

**Rate Limits:**
- 60 requests/minute
- FREE forever

---

## 📦 **Installation**

```bash
cd /home/user/webapp

# Install required packages
npm install twitter-api-v2 snoowrap sentiment

# For Cloudflare Workers compatibility
npm install node-fetch
```

---

## 🔧 **Implementation**

### **Step 1: Environment Variables**

Create `.dev.vars` file (for local development):

```bash
# .dev.vars
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=webapp:v1.0.0 (by /u/your_username)
```

For production (Cloudflare):
```bash
# Set secrets for production
npx wrangler secret put TWITTER_BEARER_TOKEN
npx wrangler secret put REDDIT_CLIENT_ID
npx wrangler secret put REDDIT_CLIENT_SECRET
npx wrangler secret put REDDIT_USER_AGENT
```

### **Step 2: Create Social Sentiment Service**

Create `src/services/social-sentiment.ts`:

```typescript
// src/services/social-sentiment.ts
import { TwitterApi } from 'twitter-api-v2';
import Snoowrap from 'snoowrap';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

interface SocialSentimentData {
  stock: string;
  symbol: string;
  twitter: {
    mentionCount: number;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    sentimentScore: number; // -1 to 1
    recentTweets: Array<{
      text: string;
      author: string;
      likes: number;
      retweets: number;
      url: string;
      sentiment: number;
    }>;
  };
  reddit: {
    postCount: number;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    sentimentScore: number;
    recentPosts: Array<{
      title: string;
      author: string;
      upvotes: number;
      comments: number;
      url: string;
      sentiment: number;
      subreddit: string;
    }>;
  };
  overall: {
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    sentimentScore: number;
    totalMentions: number;
    trendingRank?: number;
    changePercent?: number; // vs yesterday
  };
  lastUpdated: string;
}

export class SocialSentimentService {
  private twitterClient: TwitterApi;
  private redditClient: Snoowrap;

  constructor(env: any) {
    // Initialize Twitter client
    this.twitterClient = new TwitterApi(env.TWITTER_BEARER_TOKEN);

    // Initialize Reddit client
    this.redditClient = new Snoowrap({
      clientId: env.REDDIT_CLIENT_ID,
      clientSecret: env.REDDIT_CLIENT_SECRET,
      userAgent: env.REDDIT_USER_AGENT,
      refreshToken: '', // Not needed for read-only
    });
  }

  async getStockSentiment(stock: string, symbol: string): Promise<SocialSentimentData> {
    // Fetch data in parallel
    const [twitterData, redditData] = await Promise.all([
      this.getTwitterSentiment(stock, symbol),
      this.getRedditSentiment(stock, symbol)
    ]);

    // Calculate overall sentiment
    const totalMentions = twitterData.mentionCount + redditData.postCount;
    const overallScore = (
      (twitterData.sentimentScore * twitterData.mentionCount) +
      (redditData.sentimentScore * redditData.postCount)
    ) / totalMentions;

    const overallSentiment = 
      overallScore > 0.3 ? 'Bullish' :
      overallScore < -0.3 ? 'Bearish' :
      'Neutral';

    return {
      stock,
      symbol,
      twitter: twitterData,
      reddit: redditData,
      overall: {
        sentiment: overallSentiment,
        sentimentScore: overallScore,
        totalMentions,
      },
      lastUpdated: new Date().toISOString()
    };
  }

  private async getTwitterSentiment(stock: string, symbol: string) {
    try {
      // Search queries
      const queries = [
        `$${symbol}`,
        `${stock} stock`,
        `#${symbol}`
      ];

      const allTweets: any[] = [];

      // Search Twitter for mentions (last 7 days)
      for (const query of queries) {
        const tweets = await this.twitterClient.v2.search(query, {
          max_results: 100,
          'tweet.fields': ['public_metrics', 'created_at', 'author_id'],
          'user.fields': ['username'],
          start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        });

        if (tweets.data?.data) {
          allTweets.push(...tweets.data.data);
        }
      }

      // Remove duplicates
      const uniqueTweets = Array.from(
        new Map(allTweets.map(t => [t.id, t])).values()
      );

      // Analyze sentiment
      const sentimentScores: number[] = [];
      const recentTweets = uniqueTweets.slice(0, 10).map(tweet => {
        const analysis = sentiment.analyze(tweet.text);
        const score = analysis.score;
        sentimentScores.push(score);

        return {
          text: tweet.text,
          author: tweet.author_id || 'unknown',
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          url: `https://twitter.com/i/status/${tweet.id}`,
          sentiment: score
        };
      });

      // Calculate average sentiment
      const avgSentiment = sentimentScores.length > 0
        ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
        : 0;

      // Normalize to -1 to 1 scale
      const normalizedSentiment = Math.max(-1, Math.min(1, avgSentiment / 10));

      const sentimentLabel =
        normalizedSentiment > 0.3 ? 'Bullish' :
        normalizedSentiment < -0.3 ? 'Bearish' :
        'Neutral';

      return {
        mentionCount: uniqueTweets.length,
        sentiment: sentimentLabel,
        sentimentScore: normalizedSentiment,
        recentTweets
      };

    } catch (error) {
      console.error('Twitter API error:', error);
      return {
        mentionCount: 0,
        sentiment: 'Neutral' as const,
        sentimentScore: 0,
        recentTweets: []
      };
    }
  }

  private async getRedditSentiment(stock: string, symbol: string) {
    try {
      const subreddits = ['IndianStreetBets', 'IndiaInvestments', 'IndiaTech'];
      const allPosts: any[] = [];

      // Search each subreddit
      for (const subreddit of subreddits) {
        try {
          const posts = await this.redditClient
            .getSubreddit(subreddit)
            .search({
              query: `${stock} OR ${symbol}`,
              time: 'week',
              limit: 50
            });

          allPosts.push(...posts);
        } catch (err) {
          console.warn(`Failed to search r/${subreddit}:`, err);
        }
      }

      // Analyze sentiment
      const sentimentScores: number[] = [];
      const recentPosts = allPosts.slice(0, 10).map(post => {
        const text = `${post.title} ${post.selftext || ''}`;
        const analysis = sentiment.analyze(text);
        const score = analysis.score;
        sentimentScores.push(score);

        return {
          title: post.title,
          author: post.author.name,
          upvotes: post.ups,
          comments: post.num_comments,
          url: `https://reddit.com${post.permalink}`,
          sentiment: score,
          subreddit: post.subreddit.display_name
        };
      });

      // Calculate average sentiment
      const avgSentiment = sentimentScores.length > 0
        ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
        : 0;

      // Normalize to -1 to 1 scale
      const normalizedSentiment = Math.max(-1, Math.min(1, avgSentiment / 10));

      const sentimentLabel =
        normalizedSentiment > 0.3 ? 'Bullish' :
        normalizedSentiment < -0.3 ? 'Bearish' :
        'Neutral';

      return {
        postCount: allPosts.length,
        sentiment: sentimentLabel,
        sentimentScore: normalizedSentiment,
        recentPosts
      };

    } catch (error) {
      console.error('Reddit API error:', error);
      return {
        postCount: 0,
        sentiment: 'Neutral' as const,
        sentimentScore: 0,
        recentPosts: []
      };
    }
  }

  async getTrendingStocks(): Promise<Array<{
    stock: string;
    symbol: string;
    mentions: number;
    sentiment: string;
    trendScore: number;
  }>> {
    try {
      // Get trending tickers from Twitter
      const trendingQuery = '$NIFTY OR $SENSEX OR Indian stocks';
      const tweets = await this.twitterClient.v2.search(trendingQuery, {
        max_results: 100,
        'tweet.fields': ['created_at']
      });

      // Extract stock symbols from tweets
      const symbolCounts = new Map<string, number>();
      
      tweets.data?.data?.forEach(tweet => {
        const symbols = tweet.text.match(/\$[A-Z]{2,10}/g) || [];
        symbols.forEach(symbol => {
          const clean = symbol.replace('$', '');
          symbolCounts.set(clean, (symbolCounts.get(clean) || 0) + 1);
        });
      });

      // Sort by mentions
      const trending = Array.from(symbolCounts.entries())
        .map(([symbol, mentions]) => ({
          stock: symbol, // You'd map this to full name
          symbol,
          mentions,
          sentiment: 'Neutral', // Calculate separately
          trendScore: mentions
        }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 10);

      return trending;

    } catch (error) {
      console.error('Error getting trending stocks:', error);
      return [];
    }
  }
}
```

### **Step 3: Add API Routes**

Update `src/index.tsx`:

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SocialSentimentService } from './services/social-sentiment';

type Bindings = {
  TWITTER_BEARER_TOKEN: string;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  REDDIT_USER_AGENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors());

// Get social sentiment for a specific stock
app.get('/api/social-sentiment/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const stock = c.req.query('stock') || symbol;

    const sentimentService = new SocialSentimentService(c.env);
    const data = await sentimentService.getStockSentiment(stock, symbol);

    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to fetch sentiment' }, 500);
  }
});

// Get trending stocks on social media
app.get('/api/social-sentiment/trending', async (c) => {
  try {
    const sentimentService = new SocialSentimentService(c.env);
    const trending = await sentimentService.getTrendingStocks();

    return c.json({ trending });
  } catch (error) {
    return c.json({ error: 'Failed to fetch trending stocks' }, 500);
  }
});

// Existing routes...
app.get('/api/stocks', (c) => {
  // ... existing code
});

export default app;
```

### **Step 4: Add Frontend UI**

Add to your main dashboard HTML:

```html
<!-- Social Sentiment Section -->
<section class="mb-8" id="social-sentiment-section">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
      <i class="fab fa-twitter text-blue-400 mr-3"></i>
      Social Sentiment
    </h2>
    <span class="text-sm text-gray-500">Live retail investor sentiment</span>
  </div>
  
  <!-- Trending Stocks -->
  <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
    <h3 class="text-lg font-bold mb-4">🔥 Trending on Social Media</h3>
    <div id="trending-stocks" class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <!-- Populated by JavaScript -->
    </div>
  </div>

  <!-- Stock-specific sentiment cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="sentiment-cards">
    <!-- Populated by JavaScript -->
  </div>
</section>

<script>
// Fetch and display social sentiment
async function loadSocialSentiment() {
  try {
    // Get stocks from existing recommendations
    const stocksResponse = await axios.get('/api/stocks');
    const stocks = stocksResponse.data.brokerageRecommendations.slice(0, 6);

    const sentimentContainer = document.getElementById('sentiment-cards');
    sentimentContainer.innerHTML = '<div class="col-span-full text-center">Loading social sentiment...</div>';

    // Fetch sentiment for each stock
    const sentimentPromises = stocks.map(stock => 
      axios.get(`/api/social-sentiment/${stock.symbol}?stock=${encodeURIComponent(stock.stock)}`)
        .catch(err => null)
    );

    const sentimentResults = await Promise.all(sentimentPromises);

    sentimentContainer.innerHTML = sentimentResults
      .filter(result => result !== null)
      .map(result => {
        const data = result.data;
        return createSentimentCard(data);
      })
      .join('');

    // Load trending stocks
    loadTrendingStocks();

  } catch (error) {
    console.error('Error loading social sentiment:', error);
    document.getElementById('sentiment-cards').innerHTML = 
      '<div class="col-span-full text-center text-red-600">Failed to load social sentiment</div>';
  }
}

function createSentimentCard(data) {
  const sentimentColor = 
    data.overall.sentiment === 'Bullish' ? 'text-green-600' :
    data.overall.sentiment === 'Bearish' ? 'text-red-600' :
    'text-gray-600';

  const sentimentIcon =
    data.overall.sentiment === 'Bullish' ? 'fa-arrow-trend-up' :
    data.overall.sentiment === 'Bearish' ? 'fa-arrow-trend-down' :
    'fa-minus';

  const sentimentPercent = Math.round((data.overall.sentimentScore + 1) * 50);

  return `
    <div class="bg-white rounded-lg shadow-lg p-6 card-hover card-animate">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-800">${data.stock}</h3>
          <p class="text-gray-500 text-sm">${data.symbol}</p>
        </div>
        <div class="${sentimentColor} text-2xl">
          <i class="fas ${sentimentIcon}"></i>
        </div>
      </div>

      <!-- Sentiment Gauge -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600">Overall Sentiment</span>
          <span class="font-bold ${sentimentColor}">${data.overall.sentiment}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div class="h-3 rounded-full transition-all duration-500" 
               style="width: ${sentimentPercent}%; background: ${getSentimentGradient(data.overall.sentimentScore)}">
          </div>
        </div>
        <div class="text-xs text-gray-500 text-right mt-1">${sentimentPercent}% Bullish</div>
      </div>

      <!-- Twitter Stats -->
      <div class="border-t pt-3 mb-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <i class="fab fa-twitter text-blue-400 mr-2"></i>
            <span class="text-sm font-semibold">Twitter</span>
          </div>
          <span class="text-sm text-gray-600">${data.twitter.mentionCount} mentions</span>
        </div>
        <div class="text-xs ${sentimentColor} font-medium">
          ${data.twitter.sentiment}
        </div>
      </div>

      <!-- Reddit Stats -->
      <div class="border-t pt-3 mb-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <i class="fab fa-reddit text-orange-500 mr-2"></i>
            <span class="text-sm font-semibold">Reddit</span>
          </div>
          <span class="text-sm text-gray-600">${data.reddit.postCount} posts</span>
        </div>
        <div class="text-xs ${sentimentColor} font-medium">
          ${data.reddit.sentiment}
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="border-t pt-3">
        <button onclick="showSentimentDetails('${data.symbol}')" 
                class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
          <i class="fas fa-chart-line mr-1"></i>
          View Recent Posts & Tweets
        </button>
      </div>
    </div>
  `;
}

function getSentimentGradient(score) {
  if (score > 0.3) return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
  if (score < -0.3) return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
  return 'linear-gradient(90deg, #6b7280 0%, #4b5563 100%)';
}

async function loadTrendingStocks() {
  try {
    const response = await axios.get('/api/social-sentiment/trending');
    const trending = response.data.trending;

    const container = document.getElementById('trending-stocks');
    container.innerHTML = trending.slice(0, 5).map((stock, index) => `
      <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
        <div class="text-2xl font-bold text-gray-800">#${index + 1}</div>
        <div class="text-lg font-semibold text-gray-700">${stock.symbol}</div>
        <div class="text-sm text-gray-600">${stock.mentions} mentions</div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading trending stocks:', error);
  }
}

function showSentimentDetails(symbol) {
  // Show modal with detailed tweets and Reddit posts
  alert(`Detailed sentiment view for ${symbol} - Coming soon!`);
  // You can implement a modal here showing recent tweets and Reddit posts
}

// Load social sentiment when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadSocialSentiment();
  
  // Refresh every 15 minutes
  setInterval(loadSocialSentiment, 15 * 60 * 1000);
});
</script>
```

---

## 🎨 **CSS Styles**

Add to your `<style>` section:

```css
.sentiment-gauge {
  position: relative;
  height: 12px;
  background: linear-gradient(90deg, #ef4444 0%, #6b7280 50%, #10b981 100%);
  border-radius: 6px;
}

.sentiment-marker {
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border: 3px solid #333;
  border-radius: 50%;
  top: -4px;
  transform: translateX(-50%);
  transition: left 0.5s ease;
}

.trending-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
```

---

## 🚀 **Testing**

```bash
# 1. Install dependencies
cd /home/user/webapp
npm install

# 2. Set environment variables in .dev.vars
# (Add your API keys)

# 3. Build
npm run build

# 4. Test locally
npm run dev

# 5. Test API endpoint
curl http://localhost:3000/api/social-sentiment/TCS?stock=TCS

# Should return:
# {
#   "stock": "TCS",
#   "symbol": "TCS",
#   "twitter": { ... },
#   "reddit": { ... },
#   "overall": { ... }
# }
```

---

## 📊 **Example Response**

```json
{
  "stock": "TCS",
  "symbol": "TCS",
  "twitter": {
    "mentionCount": 145,
    "sentiment": "Bullish",
    "sentimentScore": 0.62,
    "recentTweets": [
      {
        "text": "$TCS breaking out! Strong Q3 results 🚀",
        "author": "stocktrader123",
        "likes": 45,
        "retweets": 12,
        "url": "https://twitter.com/i/status/123",
        "sentiment": 8
      }
    ]
  },
  "reddit": {
    "postCount": 23,
    "sentiment": "Bullish",
    "sentimentScore": 0.55,
    "recentPosts": [
      {
        "title": "TCS earnings beat expectations",
        "author": "investorguy",
        "upvotes": 89,
        "comments": 34,
        "url": "https://reddit.com/r/IndianStreetBets/...",
        "sentiment": 7,
        "subreddit": "IndianStreetBets"
      }
    ]
  },
  "overall": {
    "sentiment": "Bullish",
    "sentimentScore": 0.59,
    "totalMentions": 168
  },
  "lastUpdated": "2025-12-20T12:00:00Z"
}
```

---

## ⚡ **Performance Optimization**

### **Caching Strategy**

```typescript
// Cache sentiment data for 15 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

app.get('/api/social-sentiment/:symbol', async (c) => {
  const symbol = c.req.param('symbol');
  const cacheKey = `sentiment-${symbol}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < 15 * 60 * 1000) {
    return c.json(cached.data);
  }
  
  // Fetch fresh data
  const sentimentService = new SocialSentimentService(c.env);
  const data = await sentimentService.getStockSentiment(stock, symbol);
  
  // Cache it
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return c.json(data);
});
```

---

## 🎯 **Next Steps**

1. **Get API Keys** (30 minutes)
   - Sign up for Twitter Developer account
   - Sign up for Reddit API

2. **Install & Configure** (30 minutes)
   - Run npm install
   - Set environment variables
   - Test locally

3. **Deploy** (15 minutes)
   - Add secrets to Cloudflare
   - Deploy to production

**Total Time: ~1.5 hours**

---

**Ready to implement? I can help you set this up right now!**

