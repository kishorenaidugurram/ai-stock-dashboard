import { Hono } from 'hono'
import { cors } from 'hono/cors'
import stocksData from '../data/stocks-data.json'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// API endpoint to get current stock data from JSON
app.get('/api/stocks', (c) => {
  return c.json(stocksData);
});

// API endpoint to refresh data (would trigger web searches in production)
app.post('/api/refresh', async (c) => {
  // In production, this would:
  // 1. Call WebSearch APIs for latest data
  // 2. Parse the search results
  // 3. Update the JSON file
  // 4. Return the new data
  
  return c.json({
    success: true,
    message: 'Data refresh endpoint - would fetch latest data from web searches',
    lastUpdated: new Date().toISOString()
  });
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
            .refresh-btn {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            }
            .refresh-btn:hover {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            }
            .sentiment-bullish {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
            }
            .sentiment-neutral {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                color: white;
            }
            .sentiment-bearish {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
            }
            .social-badge {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            .volume-high {
                color: #10b981;
            }
            .volume-medium {
                color: #fbbf24;
            }
            .volume-low {
                color: #9ca3af;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="gradient-bg text-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-6">
                <div class="flex items-center justify-between flex-wrap gap-4">
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
                        <div class="flex gap-2 mt-2">
                            <button onclick="refreshData()" class="refresh-btn text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-sync-alt mr-1"></i> Refresh Display
                            </button>
                            <button onclick="showUpdateInstructions()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-search mr-1"></i> Update Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Loading Indicator -->
        <div id="loadingIndicator" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white rounded-lg p-8 flex flex-col items-center">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                <p class="text-gray-700 font-semibold">Loading latest data...</p>
            </div>
        </div>

        <!-- Update Instructions Modal -->
        <div id="updateModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                            <i class="fas fa-robot text-purple-600 mr-3"></i>
                            AI-Powered Data Update
                        </h2>
                        <button onclick="closeUpdateModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                            <p class="text-gray-700 mb-2">
                                <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                                To update this dashboard with the latest stock data, send a message to your AI assistant.
                            </p>
                        </div>

                        <div class="bg-white border-2 border-purple-200 rounded-lg p-4">
                            <h3 class="font-bold text-gray-800 mb-2 flex items-center">
                                <i class="fas fa-comment-dots text-purple-600 mr-2"></i>
                                Quick Update Command
                            </h3>
                            <div class="bg-gray-50 rounded p-3 mb-2 font-mono text-sm">
                                "Update the stock dashboard with latest data"
                            </div>
                            <button onclick="copyUpdateCommand()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-copy mr-2"></i>Copy Command
                            </button>
                        </div>

                        <div class="border rounded-lg p-4">
                            <h3 class="font-bold text-gray-800 mb-3">📋 What the AI Will Do:</h3>
                            <ul class="space-y-2 text-gray-700">
                                <li class="flex items-start">
                                    <i class="fas fa-check text-green-600 mr-2 mt-1"></i>
                                    <span>Search for latest NSE F&O breakout stocks</span>
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-check text-green-600 mr-2 mt-1"></i>
                                    <span>Get fresh brokerage recommendations (ICICI, Motilal Oswal, etc.)</span>
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-check text-green-600 mr-2 mt-1"></i>
                                    <span>Fetch social sentiment from Twitter & Reddit</span>
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-check text-green-600 mr-2 mt-1"></i>
                                    <span>Update market news headlines</span>
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-check text-green-600 mr-2 mt-1"></i>
                                    <span>Rebuild and restart the dashboard</span>
                                </li>
                            </ul>
                        </div>

                        <div class="border rounded-lg p-4">
                            <h3 class="font-bold text-gray-800 mb-3">⏱️ Update Frequency:</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div class="bg-blue-50 rounded p-3">
                                    <div class="font-semibold text-blue-800">Market Open (9:30 AM)</div>
                                    <div class="text-gray-600">"Update dashboard - market open"</div>
                                </div>
                                <div class="bg-green-50 rounded p-3">
                                    <div class="font-semibold text-green-800">Mid-day (2:00 PM)</div>
                                    <div class="text-gray-600">"Update dashboard - mid-day"</div>
                                </div>
                                <div class="bg-purple-50 rounded p-3">
                                    <div class="font-semibold text-purple-800">Market Close (4:30 PM)</div>
                                    <div class="text-gray-600">"Update dashboard - close"</div>
                                </div>
                                <div class="bg-orange-50 rounded p-3">
                                    <div class="font-semibold text-orange-800">Anytime</div>
                                    <div class="text-gray-600">"Update dashboard for today"</div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 class="font-bold text-yellow-800 mb-2 flex items-center">
                                <i class="fas fa-stopwatch mr-2"></i>
                                Update Time
                            </h3>
                            <p class="text-gray-700">Each update takes approximately 2-3 minutes to complete.</p>
                        </div>

                        <div class="border rounded-lg p-4">
                            <h3 class="font-bold text-gray-800 mb-2">🔗 How to Access AI Assistant:</h3>
                            <ol class="list-decimal list-inside space-y-2 text-gray-700">
                                <li>Open your GenSpark AI chat interface</li>
                                <li>Copy the update command above</li>
                                <li>Paste and send the message</li>
                                <li>Wait 2-3 minutes for the update to complete</li>
                                <li>Refresh this dashboard to see new data</li>
                            </ol>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end gap-3">
                        <button onclick="closeUpdateModal()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded">
                            Close
                        </button>
                        <a href="https://www.genspark.ai" target="_blank" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded inline-flex items-center">
                            <i class="fas fa-external-link-alt mr-2"></i>
                            Open GenSpark AI
                        </a>
                    </div>
                </div>
            </div>
        </div>

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
                    <span class="text-sm text-gray-500">This week's trending stocks</span>
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
            <section class="mb-8">
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

            <!-- Social Sentiment Section -->
            <section>
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fab fa-twitter text-blue-400 mr-2"></i>
                        <i class="fab fa-reddit text-orange-500 mr-3"></i>
                        Trending on Social Media
                    </h2>
                    <span class="text-sm text-gray-500">Most discussed stocks today</span>
                </div>
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-4">
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                        Social sentiment tracked from Twitter/X, Reddit (r/IndianStreetBets, r/IndianStockMarket) and StockTwits
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="trendingStocks">
                    <!-- Cards will be dynamically inserted here -->
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white mt-12 py-8">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <p class="text-gray-400">
                    <i class="fas fa-info-circle mr-2"></i>
                    Data sourced from LiveMint, Economic Times, Moneycontrol, Business Standard and leading brokerage houses
                </p>
                <p class="text-gray-500 mt-2 text-sm">
                    Data from Dec 13-20, 2025 (Last Week) | Always do your own research before investing
                </p>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Show update instructions modal
            function showUpdateInstructions() {
                document.getElementById('updateModal').classList.remove('hidden');
            }

            // Close update modal
            function closeUpdateModal() {
                document.getElementById('updateModal').classList.add('hidden');
            }

            // Copy update command to clipboard
            function copyUpdateCommand() {
                const command = "Update the stock dashboard with latest data";
                navigator.clipboard.writeText(command).then(() => {
                    const btn = event.target.closest('button');
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
                    btn.classList.add('bg-green-600');
                    btn.classList.remove('bg-purple-600');
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.classList.remove('bg-green-600');
                        btn.classList.add('bg-purple-600');
                    }, 2000);
                }).catch(err => {
                    alert('Failed to copy command. Please copy manually.');
                });
            }

            // Fetch and display stock data
            async function loadData() {
                try {
                    document.getElementById('loadingIndicator').classList.remove('hidden');
                    
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
                    if (data.trendingOnSocial && document.getElementById('totalTrending')) {
                        document.getElementById('totalTrending').textContent = data.trendingOnSocial.length;
                    }

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
                            
                            \${stock.socialSentiment ? \`
                            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-2">
                                        <span class="sentiment-\${stock.socialSentiment.overall.toLowerCase()} social-badge">
                                            \${stock.socialSentiment.overall} 
                                            \${stock.socialSentiment.overall === 'Bullish' ? '📈' : stock.socialSentiment.overall === 'Bearish' ? '📉' : '➡️'}
                                        </span>
                                        <span class="text-xs text-gray-600">Score: <strong>\${stock.socialSentiment.score}/10</strong></span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3 text-xs mb-2">
                                    <div class="flex items-center gap-1">
                                        <i class="fab fa-twitter text-blue-400"></i>
                                        <span>\${stock.socialSentiment.twitter.volume}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <i class="fab fa-reddit text-orange-500"></i>
                                        <span>\${stock.socialSentiment.reddit.volume}</span>
                                    </div>
                                </div>
                                <div class="text-xs text-gray-600">
                                    <i class="fas fa-hashtag text-purple-500 mr-1"></i>
                                    \${stock.socialSentiment.twitter.keywords.slice(0, 3).join(', ')}
                                </div>
                            </div>
                            \` : ''}
                            
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
                            <div class="border-t pt-4">
                                <div class="flex justify-between items-center text-sm mb-2">
                                    <div>
                                        <p class="text-gray-500 text-xs">Analyst</p>
                                        <p class="font-semibold text-gray-700">\${stock.analyst}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-gray-500 text-xs">Date</p>
                                        <p class="font-semibold text-gray-700">\${stock.date}</p>
                                    </div>
                                </div>
                                <a href="\${stock.sourceUrl}" target="_blank" 
                                   class="source-link text-blue-600 hover:text-blue-800 flex items-center text-sm">
                                    <i class="fas fa-external-link-alt mr-1"></i>
                                    Read full report on \${stock.source}
                                </a>
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
                            
                            \${rec.socialSentiment ? \`
                            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-2">
                                        <span class="sentiment-\${rec.socialSentiment.overall.toLowerCase()} social-badge">
                                            \${rec.socialSentiment.overall} 
                                            \${rec.socialSentiment.overall === 'Bullish' ? '📈' : rec.socialSentiment.overall === 'Bearish' ? '📉' : '➡️'}
                                        </span>
                                        <span class="text-xs text-gray-600">Score: <strong>\${rec.socialSentiment.score}/10</strong></span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3 text-xs">
                                    <div class="flex items-center gap-1">
                                        <i class="fab fa-twitter text-blue-400"></i>
                                        <span>\${rec.socialSentiment.twitter.volume}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <i class="fab fa-reddit text-orange-500"></i>
                                        <span>\${rec.socialSentiment.reddit.volume}</span>
                                    </div>
                                </div>
                            </div>
                            \` : ''}
                            
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
                                <div class="flex justify-between items-center text-sm mb-2">
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
                                   class="source-link text-blue-600 hover:text-blue-800 flex items-center text-sm">
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

                    // Render trending stocks with social sentiment
                    const trendingContainer = document.getElementById('trendingStocks');
                    if (data.trendingOnSocial) {
                        trendingContainer.innerHTML = data.trendingOnSocial.map(stock => \`
                            <div class="bg-white rounded-lg shadow-lg p-6 card-hover card-animate border-l-4 border-\${stock.sentiment === 'Bullish' ? 'green' : stock.sentiment === 'Bearish' ? 'red' : 'yellow'}-500">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="text-2xl font-bold text-gray-400">#\${stock.rank}</span>
                                            <h3 class="text-lg font-bold text-gray-800">\${stock.name}</h3>
                                        </div>
                                        <p class="text-gray-500 text-sm">\${stock.symbol}</p>
                                    </div>
                                    <span class="sentiment-\${stock.sentiment.toLowerCase()} social-badge">
                                        \${stock.sentiment} \${stock.sentiment === 'Bullish' ? '📈' : stock.sentiment === 'Bearish' ? '📉' : '➡️'}
                                    </span>
                                </div>
                                
                                <div class="mb-4">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i class="fas fa-fire text-orange-500"></i>
                                        <span class="text-sm font-semibold text-gray-700">Social Volume: <span class="text-gray-900">\${stock.socialVolume} mentions</span></span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <i class="fas fa-chart-line \${stock.change24h.startsWith('+') ? 'text-green-500' : 'text-red-500'}"></i>
                                        <span class="text-sm font-semibold \${stock.change24h.startsWith('+') ? 'text-green-600' : 'text-red-600'}">\${stock.change24h}</span>
                                        <span class="text-xs text-gray-500">24h change</span>
                                    </div>
                                </div>

                                <div class="bg-gray-50 rounded p-3 mb-4">
                                    <div class="flex items-center gap-3 mb-2">
                                        <div class="flex items-center gap-1">
                                            <i class="fab fa-twitter text-blue-400"></i>
                                            <span class="text-xs volume-\${stock.platforms.twitter.toLowerCase()}">\${stock.platforms.twitter}</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <i class="fab fa-reddit text-orange-500"></i>
                                            <span class="text-xs volume-\${stock.platforms.reddit.toLowerCase()}">\${stock.platforms.reddit}</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <i class="fas fa-comments text-purple-500"></i>
                                            <span class="text-xs volume-\${stock.platforms.stocktwits.toLowerCase()}">\${stock.platforms.stocktwits}</span>
                                        </div>
                                    </div>
                                    <p class="text-xs text-gray-600">
                                        <i class="fas fa-hashtag text-blue-500 mr-1"></i>
                                        <strong>Keywords:</strong> \${stock.topKeywords.join(', ')}
                                    </p>
                                </div>

                                <div class="border-t pt-3">
                                    <p class="text-xs text-gray-600 mb-2">
                                        <i class="fas fa-comment-dots text-indigo-500 mr-1"></i>
                                        <strong>Discussion:</strong> \${stock.recentDiscussion}
                                    </p>
                                    <div class="flex items-center justify-between text-xs">
                                        <span class="text-gray-500">Sentiment Score: <strong class="text-gray-800">\${stock.score}/10</strong></span>
                                    </div>
                                </div>
                            </div>
                        \`).join('');
                    }

                    // Update last updated time
                    const lastUpdate = new Date(data.lastUpdated);
                    document.getElementById('lastUpdated').textContent = lastUpdate.toLocaleString();

                    document.getElementById('loadingIndicator').classList.add('hidden');

                } catch (error) {
                    console.error('Error loading data:', error);
                    document.getElementById('loadingIndicator').classList.add('hidden');
                    alert('Error loading data. Please try again.');
                }
            }

            // Refresh data function
            async function refreshData() {
                await loadData();
            }

            // Load data on page load
            loadData();
        </script>
    </body>
    </html>
  `);
});

export default app
