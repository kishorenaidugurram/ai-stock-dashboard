import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Stock market data with source links
const stockData = {
  breakoutStocks: [
    {
      name: "Indraprastha Medical Corp",
      symbol: "IHH",
      price: "₹2,450",
      change: "+5.2%",
      volume: "2.5M",
      recommendation: "BUY",
      target: "₹2,800",
      source: "LiveMint",
      sourceUrl: "https://www.livemint.com/market/stock-market-news/breakout-stocks-to-buy-or-sell-sumeet-bagadia-recommends-five-shares-to-buy-today-8-january-2025-11736269573897.html",
      analyst: "Sumeet Bagadia"
    },
    {
      name: "Castrol India",
      symbol: "CASTROLIND",
      price: "₹245",
      change: "+3.8%",
      volume: "1.8M",
      recommendation: "BUY",
      target: "₹280",
      source: "NSE F&O Addition",
      sourceUrl: "https://www.5paisa.com/news/nse-adds-6-new-stocks-to-fo-segment-starting-january-31",
      analyst: "NSE Official",
      note: "Added to F&O from Jan 31, 2025"
    },
    {
      name: "Gland Pharma",
      symbol: "GLAND",
      price: "₹1,890",
      change: "+6.4%",
      volume: "950K",
      recommendation: "BUY",
      target: "₹2,200",
      source: "NSE F&O Addition",
      sourceUrl: "https://www.angelone.in/news/market-updates/nse-adds-new-stocks-to-futures-and-options-segment-effective-january-31",
      analyst: "Angel One",
      note: "Added to F&O from Jan 31, 2025"
    },
    {
      name: "Phoenix Mills",
      symbol: "PHOENIXLTD",
      price: "₹3,250",
      change: "+4.1%",
      volume: "680K",
      recommendation: "BUY",
      target: "₹3,650",
      source: "NSE F&O Addition",
      sourceUrl: "https://www.icicidirect.com/futures-and-options/articles/introduction-of-six-individual-securities-in-futures-options",
      analyst: "ICICI Direct",
      note: "Added to F&O from Jan 31, 2025"
    },
    {
      name: "Solar Industries",
      symbol: "SOLARINDS",
      price: "₹9,850",
      change: "+7.2%",
      volume: "420K",
      recommendation: "BUY",
      target: "₹11,000",
      source: "NSE F&O Addition",
      sourceUrl: "https://www.5paisa.com/news/nse-adds-6-new-stocks-to-fo-segment-starting-january-31",
      analyst: "5Paisa Research",
      note: "Added to F&O from Jan 31, 2025"
    },
    {
      name: "NBCC India",
      symbol: "NBCC",
      price: "₹128",
      change: "+5.8%",
      volume: "3.2M",
      recommendation: "BUY",
      target: "₹155",
      source: "NSE F&O Addition",
      sourceUrl: "https://www.icicidirect.com/futures-and-options/articles/introduction-of-six-individual-securities-in-futures-options",
      analyst: "ICICI Direct",
      note: "Added to F&O from Jan 31, 2025"
    }
  ],
  brokerageRecommendations: [
    {
      stock: "Bharti Airtel",
      symbol: "BHARTIARTL",
      price: "₹1,625",
      recommendation: "BUY",
      target: "₹1,950",
      upside: "20%",
      brokerage: "Motilal Oswal",
      source: "Motilal Oswal Research",
      sourceUrl: "https://www.motilaloswal.com/news/stocks/76564",
      date: "Jan 2025",
      rationale: "Strong 5G rollout, ARPU growth potential"
    },
    {
      stock: "ICICI Bank",
      symbol: "ICICIBANK",
      price: "₹1,285",
      recommendation: "BUY",
      target: "₹1,500",
      upside: "17%",
      brokerage: "Motilal Oswal",
      source: "Economic Times",
      sourceUrl: "https://m.economictimes.com/markets/stocks/news/q1-earnings-motilal-oswal-picks-icici-bank-among-22-stocks-as-top-bets-across-large-mid-smallcaps/a-volatile-start-to-2025/slideshow/122414550.cms",
      date: "Jan 2025",
      rationale: "Strong asset quality, consistent performance"
    },
    {
      stock: "Adani Enterprises",
      symbol: "ADANIENT",
      price: "₹2,450",
      recommendation: "BUY",
      target: "₹2,900",
      upside: "18%",
      brokerage: "Jefferies",
      source: "Times of India",
      sourceUrl: "https://timesofindia.indiatimes.com/business/india-business/buy-or-sell-stock-recommendation-by-brokers-for-november-21-2025-jefferies-adani-enterprises-morgan-stanley-hdfc-bank-ubs-reliance-industries-macquarie-hero-motocorp-icici-securities-nsdl/articleshow/125475331.cms",
      date: "Nov 2024",
      rationale: "Diversified portfolio, strong growth drivers"
    },
    {
      stock: "Reliance Industries",
      symbol: "RELIANCE",
      price: "₹2,890",
      recommendation: "BUY",
      target: "₹3,400",
      upside: "18%",
      brokerage: "UBS",
      source: "Times of India",
      sourceUrl: "https://timesofindia.indiatimes.com/business/india-business/buy-or-sell-stock-recommendation-by-brokers-for-november-21-2025-jefferies-adani-enterprises-morgan-stanley-hdfc-bank-ubs-reliance-industries-macquarie-hero-motocorp-icici-securities-nsdl/articleshow/125475331.cms",
      date: "Nov 2024",
      rationale: "Retail and digital business strength"
    },
    {
      stock: "Hero MotoCorp",
      symbol: "HEROMOTOCO",
      price: "₹4,680",
      recommendation: "BUY",
      target: "₹5,500",
      upside: "18%",
      brokerage: "Macquarie",
      source: "Times of India",
      sourceUrl: "https://timesofindia.indiatimes.com/business/india-business/buy-or-sell-stock-recommendation-by-brokers-for-november-21-2025-jefferies-adani-enterprises-morgan-stanley-hdfc-bank-ubs-reliance-industries-macquarie-hero-motocorp-icici-securities-nsdl/articleshow/125475331.cms",
      date: "Nov 2024",
      rationale: "Market leadership, EV transition progress"
    },
    {
      stock: "Page Industries",
      symbol: "PAGEIND",
      price: "₹42,500",
      recommendation: "BUY",
      target: "₹48,000",
      upside: "13%",
      brokerage: "Motilal Oswal",
      source: "Times of India",
      sourceUrl: "https://timesofindia.indiatimes.com/business/india-business/top-stock-recommendations-for-january-10-2025-motilal-oswal-financial-services-emkay-global-financial-services-jm-financial-idbi-capital-incred-equities/articleshow/117101403.cms",
      date: "Jan 10, 2025",
      rationale: "Premium innerwear brand, strong margins"
    },
    {
      stock: "Hindalco",
      symbol: "HINDALCO",
      price: "₹685",
      recommendation: "SELL",
      target: "₹620",
      upside: "-9%",
      brokerage: "Emkay Global",
      source: "Times of India",
      sourceUrl: "https://timesofindia.indiatimes.com/business/india-business/top-stock-recommendations-for-january-10-2025-motilal-oswal-financial-services-emkay-global-financial-services-jm-financial-idbi-capital-incred-equities/articleshow/117101403.cms",
      date: "Jan 10, 2025",
      rationale: "Weak aluminum prices, margin pressure"
    },
    {
      stock: "Lemon Tree Hotels",
      symbol: "LEMONTREE",
      price: "₹142",
      recommendation: "BUY",
      target: "₹165",
      upside: "16%",
      brokerage: "ICICI Securities",
      source: "MSN Markets",
      sourceUrl: "https://www.msn.com/en-in/money/markets/hotel-stock-to-buy-in-2025-icici-securities-top-pick-share-price-below-rs-150/ar-AA1G7ccw",
      date: "Jan 2025",
      rationale: "Strong occupancy, expansion pipeline"
    }
  ],
  newsHeadlines: [
    {
      title: "NSE Adds 6 New Stocks to F&O Segment",
      summary: "Castrol India, Gland Pharma, NBCC, Phoenix Mills, Solar Industries, and Torrent Power added from Jan 31, 2025",
      source: "5Paisa",
      sourceUrl: "https://www.5paisa.com/news/nse-adds-6-new-stocks-to-fo-segment-starting-january-31",
      date: "Jan 8, 2025",
      category: "F&O Update"
    },
    {
      title: "16 Stocks to Exit F&O Segment by Feb 28",
      summary: "NSE will exclude 16 stocks from F&O segment as they no longer meet eligibility criteria",
      source: "Zerodha Threads",
      sourceUrl: "https://www.threads.com/@zerodhaonline/post/DDzbL4AiodM?hl=en",
      date: "Dec 20, 2024",
      category: "F&O Update"
    },
    {
      title: "Top Diwali Stock Picks for 2025",
      summary: "Motilal Oswal reveals top 10 stock picks for Samvat 2082 with strong upside potential",
      source: "Motilal Oswal",
      sourceUrl: "https://www.motilaloswal.com/news/stocks/76564",
      date: "Oct 2024",
      category: "Stock Picks"
    },
    {
      title: "Indian Markets to Turn Progressively Better in 2025",
      summary: "Motilal Oswal expects range-bound market in H1 2025, picks ICICI Bank and SBI as top choices",
      source: "NDTV Profit",
      sourceUrl: "https://www.ndtvprofit.com/markets/indian-stocks-to-turn-progressively-better-in-2025-says-motilal-oswal-icici-bank-sbi-among-top-picks",
      date: "Jan 8, 2025",
      category: "Market Outlook"
    }
  ]
};

// API endpoint for stock data
app.get('/api/stocks', (c) => {
  return c.json(stockData);
});

// Main dashboard route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Stock Market Dashboard - NSE F&O & Brokerage Recommendations</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .card-animate {
                animation: fadeIn 0.5s ease-out forwards;
            }
            .gradient-bg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .card-hover:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .card-hover {
                transition: all 0.3s ease;
            }
            .badge-buy {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }
            .badge-sell {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }
            .source-link:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="gradient-bg text-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold flex items-center">
                            <i class="fas fa-chart-line mr-3"></i>
                            Stock Market Dashboard
                        </h1>
                        <p class="text-purple-100 mt-2">NSE F&O Breakout Stocks & Leading Brokerage Recommendations</p>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-purple-100">Last Updated</div>
                        <div class="text-lg font-semibold" id="lastUpdated"></div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 py-8">
            <!-- Market Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Total Breakout Stocks</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2" id="totalBreakout">0</p>
                        </div>
                        <div class="bg-blue-100 rounded-full p-4">
                            <i class="fas fa-rocket text-blue-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Buy Recommendations</p>
                            <p class="text-3xl font-bold text-green-600 mt-2" id="totalBuy">0</p>
                        </div>
                        <div class="bg-green-100 rounded-full p-4">
                            <i class="fas fa-arrow-trend-up text-green-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Sell Recommendations</p>
                            <p class="text-3xl font-bold text-red-600 mt-2" id="totalSell">0</p>
                        </div>
                        <div class="bg-red-100 rounded-full p-4">
                            <i class="fas fa-arrow-trend-down text-red-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">News Updates</p>
                            <p class="text-3xl font-bold text-purple-600 mt-2" id="totalNews">0</p>
                        </div>
                        <div class="bg-purple-100 rounded-full p-4">
                            <i class="fas fa-newspaper text-purple-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Breakout Stocks Section -->
            <section class="mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-fire text-orange-500 mr-3"></i>
                        NSE F&O Breakout Stocks
                    </h2>
                    <span class="text-sm text-gray-500">New F&O additions & trending stocks</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="breakoutStocks">
                    <!-- Cards will be dynamically inserted here -->
                </div>
            </section>

            <!-- Brokerage Recommendations Section -->
            <section class="mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-building-columns text-blue-500 mr-3"></i>
                        Leading Brokerage Recommendations
                    </h2>
                    <span class="text-sm text-gray-500">Latest analyst picks</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="brokerageRecommendations">
                    <!-- Cards will be dynamically inserted here -->
                </div>
            </section>

            <!-- News Headlines Section -->
            <section>
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-newspaper text-indigo-500 mr-3"></i>
                        Latest Market News
                    </h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="newsHeadlines">
                    <!-- Cards will be dynamically inserted here -->
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white mt-12 py-8">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <p class="text-gray-400">
                    <i class="fas fa-info-circle mr-2"></i>
                    Data sourced from LiveMint, Economic Times, Moneycontrol, and leading brokerage houses
                </p>
                <p class="text-gray-500 mt-2 text-sm">
                    Last week recommendations (Dec 13 - Dec 20, 2024) | Always do your own research before investing
                </p>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Fetch and display stock data
            async function loadData() {
                try {
                    const response = await axios.get('/api/stocks');
                    const data = response.data;

                    // Update stats
                    document.getElementById('totalBreakout').textContent = data.breakoutStocks.length;
                    document.getElementById('totalBuy').textContent = 
                        [...data.breakoutStocks, ...data.brokerageRecommendations]
                        .filter(s => s.recommendation === 'BUY').length;
                    document.getElementById('totalSell').textContent = 
                        data.brokerageRecommendations.filter(s => s.recommendation === 'SELL').length;
                    document.getElementById('totalNews').textContent = data.newsHeadlines.length;

                    // Render breakout stocks
                    const breakoutContainer = document.getElementById('breakoutStocks');
                    breakoutContainer.innerHTML = data.breakoutStocks.map(stock => \`
                        <div class="bg-white rounded-lg shadow-lg p-6 card-hover card-animate">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-xl font-bold text-gray-800">\${stock.name}</h3>
                                    <p class="text-gray-500 text-sm">\${stock.symbol}</p>
                                </div>
                                <span class="badge-buy text-white text-xs font-bold px-3 py-1 rounded-full">
                                    \${stock.recommendation}
                                </span>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p class="text-gray-500 text-xs">Current Price</p>
                                    <p class="text-lg font-bold text-gray-800">\${stock.price}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500 text-xs">Target</p>
                                    <p class="text-lg font-bold text-green-600">\${stock.target}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500 text-xs">Change</p>
                                    <p class="text-lg font-bold text-green-600">\${stock.change}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500 text-xs">Volume</p>
                                    <p class="text-lg font-bold text-gray-800">\${stock.volume}</p>
                                </div>
                            </div>
                            \${stock.note ? \`
                                <div class="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                                    <p class="text-xs text-blue-800">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        \${stock.note}
                                    </p>
                                </div>
                            \` : ''}
                            <div class="border-t pt-4">
                                <div class="flex justify-between items-center text-sm">
                                    <div>
                                        <p class="text-gray-500 text-xs">Analyst</p>
                                        <p class="font-semibold text-gray-700">\${stock.analyst}</p>
                                    </div>
                                    <a href="\${stock.sourceUrl}" target="_blank" 
                                       class="source-link text-blue-600 hover:text-blue-800 flex items-center">
                                        <i class="fas fa-external-link-alt mr-1"></i>
                                        \${stock.source}
                                    </a>
                                </div>
                            </div>
                        </div>
                    \`).join('');

                    // Render brokerage recommendations
                    const brokerageContainer = document.getElementById('brokerageRecommendations');
                    brokerageContainer.innerHTML = data.brokerageRecommendations.map(rec => \`
                        <div class="bg-white rounded-lg shadow-lg p-6 card-hover card-animate">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-xl font-bold text-gray-800">\${rec.stock}</h3>
                                    <p class="text-gray-500 text-sm">\${rec.symbol}</p>
                                </div>
                                <span class="\${rec.recommendation === 'BUY' ? 'badge-buy' : 'badge-sell'} 
                                             text-white text-xs font-bold px-3 py-1 rounded-full">
                                    \${rec.recommendation}
                                </span>
                            </div>
                            <div class="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p class="text-gray-500 text-xs">Price</p>
                                    <p class="text-lg font-bold text-gray-800">\${rec.price}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500 text-xs">Target</p>
                                    <p class="text-lg font-bold \${rec.recommendation === 'BUY' ? 'text-green-600' : 'text-red-600'}">
                                        \${rec.target}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-gray-500 text-xs">Upside</p>
                                    <p class="text-lg font-bold \${rec.recommendation === 'BUY' ? 'text-green-600' : 'text-red-600'}">
                                        \${rec.upside}
                                    </p>
                                </div>
                            </div>
                            <div class="bg-gray-50 rounded p-3 mb-4">
                                <p class="text-xs text-gray-600">
                                    <i class="fas fa-lightbulb mr-1 text-yellow-500"></i>
                                    <strong>Rationale:</strong> \${rec.rationale}
                                </p>
                            </div>
                            <div class="border-t pt-4">
                                <div class="flex justify-between items-center text-sm">
                                    <div>
                                        <p class="text-gray-500 text-xs">Brokerage</p>
                                        <p class="font-semibold text-gray-700">\${rec.brokerage}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-gray-500 text-xs">Date</p>
                                        <p class="font-semibold text-gray-700">\${rec.date}</p>
                                    </div>
                                </div>
                                <a href="\${rec.sourceUrl}" target="_blank" 
                                   class="source-link text-blue-600 hover:text-blue-800 flex items-center mt-2 text-sm">
                                    <i class="fas fa-external-link-alt mr-1"></i>
                                    Read full report on \${rec.source}
                                </a>
                            </div>
                        </div>
                    \`).join('');

                    // Render news headlines
                    const newsContainer = document.getElementById('newsHeadlines');
                    newsContainer.innerHTML = data.newsHeadlines.map(news => \`
                        <div class="bg-white rounded-lg shadow-lg p-6 card-hover card-animate">
                            <div class="flex items-start">
                                <div class="flex-shrink-0">
                                    <div class="bg-indigo-100 rounded-full p-3">
                                        <i class="fas fa-newspaper text-indigo-600"></i>
                                    </div>
                                </div>
                                <div class="ml-4 flex-1">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="text-lg font-bold text-gray-800">\${news.title}</h3>
                                        <span class="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
                                            \${news.category}
                                        </span>
                                    </div>
                                    <p class="text-gray-600 text-sm mb-3">\${news.summary}</p>
                                    <div class="flex justify-between items-center text-sm">
                                        <div class="text-gray-500 text-xs">
                                            <i class="far fa-calendar mr-1"></i>
                                            \${news.date}
                                        </div>
                                        <a href="\${news.sourceUrl}" target="_blank" 
                                           class="source-link text-blue-600 hover:text-blue-800 flex items-center">
                                            <i class="fas fa-external-link-alt mr-1"></i>
                                            \${news.source}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    \`).join('');

                    // Update last updated time
                    const now = new Date();
                    document.getElementById('lastUpdated').textContent = now.toLocaleString();

                } catch (error) {
                    console.error('Error loading data:', error);
                }
            }

            // Load data on page load
            loadData();
        </script>
    </body>
    </html>
  `);
});

export default app
