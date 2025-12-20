/**
 * AI-Enhanced Dashboard Frontend JavaScript
 * Loads and displays AI analysis alongside stock data
 */

// Global state
let allStocksData = [];
let aiAnalysisData = {};
let marketSummary = {};
let topAIPicks = [];
let smartAlerts = [];

// Initialize dashboard
async function initializeDashboard() {
    try {
        showLoading();
        
        // Load all data in parallel
        await Promise.all([
            loadStockData(),
            loadAIAnalysis(),
            loadMarketSummary(),
            loadTopPicks(),
            loadSmartAlerts()
        ]);
        
        // Render all sections
        renderMarketSummary();
        renderSmartAlerts();
        renderTopAIPicks();
        renderStockCards();
        
        hideLoading();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

// Load stock data
async function loadStockData() {
    const response = await fetch('/api/stocks');
    const data = await response.json();
    allStocksData = [
        ...(data.breakoutStocks || []),
        ...(data.brokerageRecommendations || [])
    ];
}

// Load AI analysis
async function loadAIAnalysis() {
    const response = await fetch('/api/ai/analyze');
    const data = await response.json();
    
    // Create lookup map
    aiAnalysisData = {};
    data.stocks.forEach(stock => {
        aiAnalysisData[stock.symbol] = stock.aiAnalysis;
    });
}

// Load market summary
async function loadMarketSummary() {
    const response = await fetch('/api/ai/summary');
    const data = await response.json();
    marketSummary = data.summary;
}

// Load top AI picks
async function loadTopPicks() {
    const response = await fetch('/api/ai/top-picks');
    const data = await response.json();
    topAIPicks = data.topPicks || [];
}

// Load smart alerts
async function loadSmartAlerts() {
    const response = await fetch('/api/ai/alerts');
    const data = await response.json();
    smartAlerts = data.alerts || [];
}

// Render market summary card
function renderMarketSummary() {
    const container = document.getElementById('marketSummary');
    if (!container || !marketSummary) return;
    
    const sentimentClass = getSentimentClass(marketSummary.marketSentiment);
    
    container.innerHTML = `
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-md">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-chart-line mr-2 text-blue-600"></i>
                AI Market Overview
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                    <div class="text-3xl font-bold text-blue-600">${marketSummary.totalStocks || 0}</div>
                    <div class="text-sm text-gray-600">Total Stocks</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold ${sentimentClass}">${marketSummary.marketSentiment || 'N/A'}</div>
                    <div class="text-sm text-gray-600">Sentiment</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-green-600">${marketSummary.averageUpside || 0}%</div>
                    <div class="text-sm text-gray-600">Avg Upside</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-purple-600">${marketSummary.highConfidenceCount || 0}</div>
                    <div class="text-sm text-gray-600">High Confidence</div>
                </div>
            </div>
        </div>
    `;
}

// Render smart alerts banner
function renderSmartAlerts() {
    const container = document.getElementById('smartAlerts');
    if (!container) return;
    
    if (smartAlerts.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    const alertsHTML = smartAlerts.slice(0, 3).map(stock => `
        <div class="flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm">
            <i class="fas fa-star text-yellow-500"></i>
            <div class="flex-1">
                <span class="font-bold text-gray-800">${stock.symbol}</span>
                <span class="text-sm text-gray-600 ml-2">${stock.upside} upside</span>
            </div>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                ${stock.aiAnalysis.recommendation}
            </span>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 shadow-md mb-6">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-bell mr-2 text-orange-600"></i>
                    🔥 Smart Alerts - High Potential Stocks
                </h3>
                <span class="text-sm text-gray-600">${smartAlerts.length} alerts</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                ${alertsHTML}
            </div>
        </div>
    `;
}

// Render top AI picks section
function renderTopAIPicks() {
    const container = document.getElementById('topAIPicks');
    if (!container || topAIPicks.length === 0) return;
    
    const picksHTML = topAIPicks.slice(0, 5).map((stock, index) => `
        <div class="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        ${index + 1}
                    </div>
                    <div>
                        <div class="font-bold text-gray-800">${stock.symbol}</div>
                        <div class="text-xs text-gray-500">${stock.source}</div>
                    </div>
                </div>
                ${getAIRecommendationBadge(stock.aiAnalysis.recommendation)}
            </div>
            
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Upside:</span>
                    <span class="font-bold text-green-600">${stock.upside}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Risk:</span>
                    ${getRiskBadge(stock.aiAnalysis.riskScore)}
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Momentum:</span>
                    ${getMomentumBar(stock.aiAnalysis.momentum)}
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-trophy mr-2 text-yellow-500"></i>
                🎯 Top AI Picks
                <span class="ml-3 text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    AI-Ranked
                </span>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                ${picksHTML}
            </div>
        </section>
    `;
}

// Render stock cards with AI enhancements
function renderStockCards() {
    // Implementation will enhance existing card rendering with AI badges
    // This connects to existing loadData() function
}

// Helper: Get AI recommendation badge
function getAIRecommendationBadge(recommendation) {
    const badges = {
        'STRONG BUY': '<span class="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">STRONG BUY</span>',
        'BUY': '<span class="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">BUY</span>',
        'HOLD': '<span class="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">HOLD</span>',
        'AVOID': '<span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">AVOID</span>'
    };
    return badges[recommendation] || badges['HOLD'];
}

// Helper: Get risk badge
function getRiskBadge(riskScore) {
    let color = 'green';
    let label = 'Low';
    
    if (riskScore > 6) {
        color = 'red';
        label = 'High';
    } else if (riskScore > 3) {
        color = 'yellow';
        label = 'Med';
    }
    
    return `
        <div class="flex items-center space-x-2">
            <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-${color}-500" style="width: ${(10 - riskScore) * 10}%"></div>
            </div>
            <span class="text-xs font-bold text-${color}-600">${riskScore}/10</span>
        </div>
    `;
}

// Helper: Get momentum bar
function getMomentumBar(momentum) {
    return `
        <div class="flex items-center space-x-2">
            <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500" style="width: ${momentum * 10}%"></div>
            </div>
            <span class="text-xs font-bold text-blue-600">${momentum}/10</span>
        </div>
    `;
}

// Helper: Get sentiment class
function getSentimentClass(sentiment) {
    if (!sentiment) return 'text-gray-600';
    const lower = sentiment.toLowerCase();
    if (lower.includes('bullish')) return 'text-green-600';
    if (lower.includes('bearish')) return 'text-red-600';
    return 'text-gray-600';
}

// Loading states
function showLoading() {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="loadingOverlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 text-center">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3"></i>
                <div class="text-gray-700">Loading AI features...</div>
            </div>
        </div>
    `);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

function showError(message) {
    console.error(message);
    alert(message);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);
