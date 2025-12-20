// AI-Enhanced Stock Dashboard - Frontend JavaScript
// This file adds AI features to the stock dashboard UI

console.log('🤖 AI Dashboard Script Loading...');

// Global state
let aiData = null;
let stocksData = null;
let technicalData = null;
let isInitialized = false;

// Wait for page to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIDashboard);
} else {
    // Page already loaded
    setTimeout(initAIDashboard, 2000); // Wait 2 seconds for main data
}

// Main initialization function
async function initAIDashboard() {
    if (isInitialized) return;
    
    console.log('🚀 Initializing AI Dashboard...');
    
    try {
        // Load AI analysis data and technical analysis in parallel
        const [aiResponse, stocksResponse, technicalResponse] = await Promise.all([
            axios.get('/api/ai/analyze'),
            axios.get('/api/stocks'),
            axios.get('/api/technical/analyze')
        ]);
        
        aiData = aiResponse.data.stocks;
        stocksData = stocksResponse.data;
        technicalData = technicalResponse.data.stocks;
        
        console.log('✅ Data loaded:', {
            stocks: aiData.length,
            breakout: stocksData.breakoutStocks?.length || 0,
            brokerage: stocksData.brokerageRecommendations?.length || 0,
            technical: technicalData.length
        });
        
        // Initialize all features
        await renderAlertsBanner();
        await renderMarketSummary();
        await renderTopPicks();
        await renderTechnicalInsights(); // NEW: Technical analysis section
        initChatbot();
        initFilters();
        
        isInitialized = true;
        console.log('✅ AI Dashboard initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing AI dashboard:', error);
        // Retry once after 3 seconds
        if (!isInitialized) {
            console.log('⏳ Retrying in 3 seconds...');
            setTimeout(initAIDashboard, 3000);
        }
    }
}

// ========================================
// 1. SMART ALERTS BANNER
// ========================================
async function renderAlertsBanner() {
    try {
        const response = await axios.get('/api/ai/alerts');
        const alerts = response.data.alerts;
        
        console.log('📢 Alerts:', alerts.length);

        if (alerts.length === 0) {
            console.log('ℹ️ No alerts to display');
            return;
        }

        // Remove existing banner if any
        const existing = document.getElementById('aiAlertsBanner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'aiAlertsBanner';
        banner.className = 'bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 px-6 mb-6 rounded-lg shadow-xl';
        banner.innerHTML = `
            <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                    <i class="fas fa-bell animate-pulse text-3xl"></i>
                    <div>
                        <div class="font-bold text-lg">🚨 ${alerts.length} High-Potential Alerts!</div>
                        <div class="text-sm opacity-90">
                            ${alerts.slice(0, 3).map(a => a.symbol).join(', ')}
                            ${alerts.length > 3 ? ` +${alerts.length - 3} more` : ''}
                        </div>
                    </div>
                </div>
                <button onclick="showAlertsModal()" class="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition shadow">
                    View All <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
        `;

        // Insert at the top of main content
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(banner, main.firstChild);
            console.log('✅ Alerts banner added');
        }
    } catch (error) {
        console.error('Error rendering alerts banner:', error);
    }
}

// ========================================
// 2. MARKET SUMMARY CARD
// ========================================
async function renderMarketSummary() {
    try {
        const response = await axios.get('/api/ai/summary');
        const summary = response.data.summary;
        
        console.log('📊 Summary:', summary);

        // Remove existing summary if any
        const existing = document.getElementById('aiMarketSummary');
        if (existing) existing.remove();

        const summaryCard = document.createElement('div');
        summaryCard.id = 'aiMarketSummary';
        summaryCard.className = 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg shadow-xl p-6 mb-8';
        summaryCard.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-2xl font-bold flex items-center">
                    <i class="fas fa-robot mr-3"></i>
                    AI Market Summary
                </h3>
                <span class="bg-white bg-opacity-20 px-3 py-1 rounded-lg text-sm">
                    ${new Date().toLocaleDateString()}
                </span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div class="text-sm opacity-90">Total Stocks</div>
                    <div class="text-3xl font-bold mt-1">${summary.totalStocks}</div>
                </div>
                <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div class="text-sm opacity-90">Sentiment</div>
                    <div class="text-2xl font-bold mt-1">${summary.marketSentiment}</div>
                </div>
                <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div class="text-sm opacity-90">Avg Upside</div>
                    <div class="text-3xl font-bold mt-1">${summary.averageUpside}%</div>
                </div>
                <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div class="text-sm opacity-90">High Confidence</div>
                    <div class="text-3xl font-bold mt-1">${summary.highConfidenceCount}</div>
                </div>
            </div>
        `;

        // Insert after alerts banner or at top of main
        const main = document.querySelector('main');
        const alertsBanner = document.getElementById('aiAlertsBanner');
        if (alertsBanner) {
            alertsBanner.insertAdjacentElement('afterend', summaryCard);
        } else if (main) {
            main.insertBefore(summaryCard, main.firstChild);
        }
        console.log('✅ Market summary added');
    } catch (error) {
        console.error('Error rendering market summary:', error);
    }
}

// ========================================
// 3. TOP AI PICKS SECTION
// ========================================
async function renderTopPicks() {
    try {
        const response = await axios.get('/api/ai/top-picks');
        const topPicks = response.data.topPicks.slice(0, 5);
        
        console.log('🏆 Top Picks:', topPicks.length);

        if (topPicks.length === 0) {
            console.log('ℹ️ No top picks to display');
            return;
        }

        // Remove existing section if any
        const existing = document.getElementById('aiTopPicksSection');
        if (existing) existing.remove();

        const section = document.createElement('section');
        section.id = 'aiTopPicksSection';
        section.className = 'mb-8';
        section.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fas fa-trophy text-yellow-500 mr-3"></i>
                    Top AI Picks
                </h2>
                <span class="text-sm text-gray-500">Ranked by AI algorithm</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="topAIPicksContainer"></div>
        `;

        // Insert after market summary or alerts
        const main = document.querySelector('main');
        const summaryCard = document.getElementById('aiMarketSummary');
        const alertsBanner = document.getElementById('aiAlertsBanner');
        
        if (summaryCard) {
            summaryCard.insertAdjacentElement('afterend', section);
        } else if (alertsBanner) {
            alertsBanner.insertAdjacentElement('afterend', section);
        } else if (main) {
            main.insertBefore(section, main.firstChild);
        }

        // Render top picks cards
        const container = document.getElementById('topAIPicksContainer');
        if (container) {
            container.innerHTML = topPicks.map((stock, index) => `
                <div class="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg p-6 border-2 border-yellow-400 relative card-hover">
                    <div class="absolute top-4 right-4">
                        <div class="bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                            #${index + 1}
                        </div>
                    </div>
                    
                    <div class="mb-4 pr-12">
                        <h3 class="text-xl font-bold text-gray-800">${stock.symbol}</h3>
                        <p class="text-gray-600 text-sm">${stock.company || stock.name || stock.stock || 'N/A'}</p>
                    </div>

                    <div class="grid grid-cols-3 gap-2 mb-4">
                        <div class="bg-green-100 rounded-lg p-3 text-center">
                            <div class="text-xs text-green-700">Upside</div>
                            <div class="text-xl font-bold text-green-600">${stock.upside}</div>
                        </div>
                        <div class="bg-blue-100 rounded-lg p-3 text-center">
                            <div class="text-xs text-blue-700">Risk</div>
                            <div class="text-xl font-bold text-blue-600">${stock.aiAnalysis.riskScore}/10</div>
                        </div>
                        <div class="bg-purple-100 rounded-lg p-3 text-center">
                            <div class="text-xs text-purple-700">Power</div>
                            <div class="text-xl font-bold text-purple-600">${stock.aiAnalysis.momentum}/10</div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r ${getRecommendationColor(stock.aiAnalysis.recommendation)} text-white rounded-lg px-3 py-2 text-center mb-3">
                        <div class="font-bold">${stock.aiAnalysis.recommendation}</div>
                        <div class="text-xs opacity-90">Confidence: ${stock.aiAnalysis.confidence}%</div>
                    </div>

                    ${renderRiskBar(stock.aiAnalysis.riskScore)}
                    ${renderMomentumBar(stock.aiAnalysis.momentum)}

                    <div class="mt-4 pt-4 border-t text-xs text-gray-500">
                        <i class="fas fa-building mr-1"></i>${stock.source || stock.brokerage}
                    </div>
                </div>
            `).join('');
            console.log('✅ Top picks rendered');
        }
    } catch (error) {
        console.error('Error rendering top picks:', error);
    }
}

// ========================================
// 3.5. TECHNICAL INSIGHTS SECTION
// ========================================
async function renderTechnicalInsights() {
    try {
        if (!technicalData || technicalData.length === 0) {
            console.log('ℹ️ No technical data available');
            return;
        }

        // Get stocks with strong technical signals
        const strongSignals = technicalData
            .filter(stock => stock.technical?.recommendation?.action === 'STRONG_BUY' || stock.technical?.recommendation?.action === 'BUY')
            .sort((a, b) => (b.technical?.overallScore || 0) - (a.technical?.overallScore || 0))
            .slice(0, 6);

        if (strongSignals.length === 0) return;

        console.log('📊 Technical Insights:', strongSignals.length, 'strong signals');

        // Remove existing section if any
        const existing = document.getElementById('technicalInsightsSection');
        if (existing) existing.remove();

        const section = document.createElement('section');
        section.id = 'technicalInsightsSection';
        section.className = 'mb-8';
        section.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fas fa-chart-line text-teal-500 mr-3"></i>
                    Technical Analysis Insights
                </h2>
                <span class="text-sm text-gray-500">Pattern & breakout detection</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="technicalInsightsContainer"></div>
        `;

        // Insert after top picks
        const topPicksSection = document.getElementById('aiTopPicksSection');
        const filterBar = document.getElementById('aiFilterBar');
        
        if (filterBar) {
            filterBar.insertAdjacentElement('afterend', section);
        } else if (topPicksSection) {
            topPicksSection.insertAdjacentElement('afterend', section);
        }

        // Render technical cards
        const container = document.getElementById('technicalInsightsContainer');
        if (container) {
            container.innerHTML = strongSignals.map(stock => {
                const tech = stock.technical;
                if (!tech) return '';

                const breakout = tech.breakout;
                const volume = tech.volume;
                const pattern = tech.pattern;
                const indicators = tech.indicators;
                const recommendation = tech.recommendation;

                return `
                    <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 ${getBorderColor(recommendation?.action)} card-hover">
                        <div class="mb-4">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="text-lg font-bold text-gray-800">${stock.symbol}</h3>
                                <span class="text-xs ${getRecommendationBadgeClass(recommendation?.action)} px-2 py-1 rounded font-semibold">
                                    ${recommendation?.action || 'HOLD'}
                                </span>
                            </div>
                            <p class="text-gray-600 text-sm">${stock.name || 'N/A'}</p>
                        </div>

                        ${breakout?.detected ? `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <div class="flex items-center gap-2 mb-1">
                                <i class="fas fa-arrow-trend-up text-green-600"></i>
                                <span class="text-sm font-semibold text-green-800">Breakout Detected</span>
                            </div>
                            <div class="text-xs text-green-700">
                                ${breakout.type.replace(/_/g, ' ')} • Target: ${breakout.upsideTarget}%
                            </div>
                        </div>
                        ` : ''}

                        ${pattern ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <div class="flex items-center gap-2 mb-1">
                                <i class="fas fa-chart-area text-blue-600"></i>
                                <span class="text-sm font-semibold text-blue-800">${pattern.type.replace(/_/g, ' ')}</span>
                            </div>
                            <div class="text-xs text-blue-700">${pattern.description}</div>
                        </div>
                        ` : ''}

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            ${volume ? `
                            <div class="text-center">
                                <div class="text-xs text-gray-600">Volume</div>
                                <div class="text-lg font-bold ${getVolumeColor(volume.level)}">${volume.level}</div>
                            </div>
                            ` : ''}
                            ${indicators ? `
                            <div class="text-center">
                                <div class="text-xs text-gray-600">RSI</div>
                                <div class="text-lg font-bold ${getRSIColor(indicators.rsi)}">${indicators.rsi}</div>
                            </div>
                            ` : ''}
                        </div>

                        ${indicators ? `
                        <div class="space-y-2">
                            <div>
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-xs text-gray-600">Momentum</span>
                                    <span class="text-xs font-bold">${indicators.momentum}/100</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full" style="width: ${indicators.momentum}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-xs text-gray-600">Trend Strength</span>
                                    <span class="text-xs font-bold">${indicators.trendStrength}/100</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style="width: ${indicators.trendStrength}%"></div>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        ${recommendation ? `
                        <div class="mt-4 pt-4 border-t">
                            <div class="text-xs text-gray-600 mb-1">AI Recommendation:</div>
                            <div class="text-sm text-gray-800">${recommendation.reason}</div>
                            <div class="text-xs text-gray-500 mt-1">Confidence: ${recommendation.confidence}%</div>
                        </div>
                        ` : ''}
                        
                        <!-- View Chart Button -->
                        <button onclick="window.chartManager.showChartModal('${stock.symbol}', ${JSON.stringify({name: stock.name || stock.symbol})})" 
                                class="mt-4 w-full btn-primary flex items-center justify-center gap-2 text-sm py-2">
                            <i class="fas fa-chart-candlestick"></i>
                            View Chart
                        </button>
                    </div>
                `;
            }).join('');
            console.log('✅ Technical insights rendered');
        }
    } catch (error) {
        console.error('Error rendering technical insights:', error);
    }
}

function getBorderColor(action) {
    const colors = {
        'STRONG_BUY': 'border-green-500',
        'BUY': 'border-teal-500',
        'HOLD': 'border-yellow-500',
        'WATCH': 'border-blue-500',
        'OVERSOLD': 'border-purple-500'
    };
    return colors[action] || 'border-gray-300';
}

function getRecommendationBadgeClass(action) {
    const classes = {
        'STRONG_BUY': 'bg-green-600 text-white',
        'BUY': 'bg-teal-600 text-white',
        'HOLD': 'bg-yellow-600 text-white',
        'WATCH': 'bg-blue-600 text-white',
        'OVERSOLD': 'bg-purple-600 text-white'
    };
    return classes[action] || 'bg-gray-600 text-white';
}

function getVolumeColor(level) {
    const colors = {
        'HIGH': 'text-green-600',
        'ABOVE_AVERAGE': 'text-teal-600',
        'MEDIUM': 'text-blue-600',
        'BELOW_AVERAGE': 'text-yellow-600',
        'LOW': 'text-gray-600'
    };
    return colors[level] || 'text-gray-600';
}

function getRSIColor(rsi) {
    if (rsi >= 70) return 'text-red-600'; // Overbought
    if (rsi >= 60) return 'text-orange-600';
    if (rsi >= 40) return 'text-green-600';
    if (rsi >= 30) return 'text-yellow-600';
    return 'text-purple-600'; // Oversold
}

// ========================================
// 4. AI CHATBOT WIDGET
// ========================================
function initChatbot() {
    // Remove existing chatbot if any
    const existingButton = document.getElementById('aiChatButton');
    const existingWidget = document.getElementById('aiChatWidget');
    if (existingButton) existingButton.remove();
    if (existingWidget) existingWidget.remove();

    // Create chatbot floating button
    const chatButton = document.createElement('button');
    chatButton.id = 'aiChatButton';
    chatButton.className = 'fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50';
    chatButton.innerHTML = '<i class="fas fa-robot text-2xl"></i>';
    chatButton.onclick = toggleChatbot;
    document.body.appendChild(chatButton);

    // Create chatbot window
    const chatWidget = document.createElement('div');
    chatWidget.id = 'aiChatWidget';
    chatWidget.className = 'fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl hidden z-50';
    chatWidget.innerHTML = `
        <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i class="fas fa-robot text-2xl"></i>
                <div>
                    <div class="font-bold">AI Stock Assistant</div>
                    <div class="text-xs opacity-90">Ask me anything</div>
                </div>
            </div>
            <button onclick="toggleChatbot()" class="hover:bg-white hover:bg-opacity-20 rounded p-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div id="chatMessages" class="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <div class="bg-white rounded-lg p-3 shadow">
                <div class="text-sm text-gray-700">
                    👋 Hi! Ask me about stocks:
                    <ul class="mt-2 space-y-1 text-xs">
                        <li>• "What are the best stocks?"</li>
                        <li>• "Show me low risk stocks"</li>
                        <li>• "Which have highest upside?"</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="p-4 border-t bg-white rounded-b-lg">
            <div class="flex gap-2">
                <input 
                    type="text" 
                    id="chatInput" 
                    placeholder="Ask about stocks..." 
                    class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onkeypress="if(event.key === 'Enter') sendChatMessage()"
                />
                <button 
                    onclick="sendChatMessage()" 
                    class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:opacity-90"
                >
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatWidget);
    console.log('✅ Chatbot initialized');
}

function toggleChatbot() {
    const widget = document.getElementById('aiChatWidget');
    if (widget) {
        widget.classList.toggle('hidden');
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const query = input.value.trim();
    
    if (!query) return;

    const messagesContainer = document.getElementById('chatMessages');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'bg-purple-600 text-white rounded-lg p-3 ml-auto max-w-xs';
    userMsg.textContent = query;
    messagesContainer.appendChild(userMsg);
    
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'bg-white rounded-lg p-3 shadow typing-indicator';
        typingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin text-purple-600"></i> Analyzing...';
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Call AI chatbot API
        const response = await axios.post('/api/ai/chat', { query });
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add AI response
        const aiMsg = document.createElement('div');
        aiMsg.className = 'bg-white rounded-lg p-3 shadow max-w-xs';
        aiMsg.innerHTML = `<pre class="text-sm text-gray-700 whitespace-pre-wrap font-sans">${response.data.response}</pre>`;
        messagesContainer.appendChild(aiMsg);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Chat error:', error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'bg-red-100 text-red-700 rounded-lg p-3 max-w-xs';
        errorMsg.textContent = 'Sorry, I encountered an error.';
        messagesContainer.appendChild(errorMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Make functions globally available
window.toggleChatbot = toggleChatbot;
window.sendChatMessage = sendChatMessage;

// ========================================
// 5. ENHANCED FILTERS
// ========================================
function initFilters() {
    // Remove existing filter bar if any
    const existing = document.getElementById('aiFilterBar');
    if (existing) existing.remove();

    const filterBar = document.createElement('div');
    filterBar.id = 'aiFilterBar';
    filterBar.className = 'glass-card rounded-2xl shadow-lg p-6 mb-8 sticky top-20 z-30';
    filterBar.innerHTML = `
        <div class="flex flex-wrap gap-4 items-center">
            <div class="flex items-center gap-2">
                <i class="fas fa-filter text-purple-600 text-xl"></i>
                <span class="font-bold text-gray-800 text-lg">Smart Filters:</span>
            </div>
            
            <select id="riskFilter" class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none">
                <option value="">All Risk Levels</option>
                <option value="low">Low Risk (≤3)</option>
                <option value="medium">Medium Risk (4-6)</option>
                <option value="high">High Risk (≥7)</option>
            </select>
            
            <select id="momentumFilter" class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none">
                <option value="">All Momentum</option>
                <option value="strong">Strong (≥8)</option>
                <option value="moderate">Moderate (5-7)</option>
                <option value="weak">Weak (≤4)</option>
            </select>
            
            <input 
                type="text" 
                id="searchFilter" 
                placeholder="🔍 Search by symbol or name..." 
                class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none flex-1 min-w-[200px]"
            />
            
            <button onclick="applyFilters()" class="btn-primary flex items-center gap-2 px-6 py-2">
                <i class="fas fa-play"></i>
                <span>Go</span>
            </button>
            
            <button onclick="clearFilters()" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold">
                <i class="fas fa-times mr-1"></i> Clear
            </button>
        </div>
        
        <!-- Filter Results Display -->
        <div id="filterResults" class="mt-4 hidden">
            <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-check-circle text-green-500"></i>
                <span id="filterResultsText">Showing all stocks</span>
            </div>
        </div>
    `;

    // Insert after alerts banner or at top of main content
    const alertsBanner = document.getElementById('aiAlertsBanner');
    const mainContent = document.querySelector('main .page-view.active');
    
    if (alertsBanner) {
        alertsBanner.insertAdjacentElement('afterend', filterBar);
    } else if (mainContent) {
        mainContent.insertAdjacentElement('afterbegin', filterBar);
    }
    
    console.log('✅ Filters initialized');
}

function applyFilters() {
    const riskFilter = document.getElementById('riskFilter')?.value || '';
    const momentumFilter = document.getElementById('momentumFilter')?.value || '';
    const searchQuery = document.getElementById('searchFilter')?.value.toLowerCase().trim() || '';
    
    console.log('🔍 Applying filters:', { riskFilter, momentumFilter, searchQuery });
    
    if (!aiData || aiData.length === 0) {
        console.warn('No stock data available for filtering');
        return;
    }
    
    // Filter stocks
    let filteredStocks = aiData.filter(stock => {
        const aiAnalysis = stock.aiAnalysis || {};
        const symbol = (stock.symbol || stock.stock || '').toLowerCase();
        const name = (stock.name || stock.company || '').toLowerCase();
        
        // Risk filter
        if (riskFilter) {
            const riskScore = aiAnalysis.riskScore || 5;
            if (riskFilter === 'low' && riskScore > 3) return false;
            if (riskFilter === 'medium' && (riskScore < 4 || riskScore > 6)) return false;
            if (riskFilter === 'high' && riskScore < 7) return false;
        }
        
        // Momentum filter
        if (momentumFilter) {
            const momentum = aiAnalysis.momentum || 5;
            if (momentumFilter === 'strong' && momentum < 8) return false;
            if (momentumFilter === 'moderate' && (momentum < 5 || momentum > 7)) return false;
            if (momentumFilter === 'weak' && momentum > 4) return false;
        }
        
        // Search filter
        if (searchQuery) {
            if (!symbol.includes(searchQuery) && !name.includes(searchQuery)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Update UI with filtered results
    updateFilteredStocksDisplay(filteredStocks, { riskFilter, momentumFilter, searchQuery });
    
    // Show filter results
    const resultsDiv = document.getElementById('filterResults');
    const resultsText = document.getElementById('filterResultsText');
    if (resultsDiv && resultsText) {
        resultsDiv.classList.remove('hidden');
        
        const filterCount = [riskFilter, momentumFilter, searchQuery].filter(f => f).length;
        resultsText.textContent = `Showing ${filteredStocks.length} stocks${filterCount > 0 ? ` (${filterCount} filter${filterCount > 1 ? 's' : ''} active)` : ''}`;
    }
}

function updateFilteredStocksDisplay(filteredStocks, filters) {
    // Find all stock card containers
    const containers = [
        document.getElementById('breakoutStocks'),
        document.getElementById('brokerageRecommendations'),
        document.getElementById('trendingStocks')
    ].filter(c => c);
    
    if (containers.length === 0) {
        console.warn('No stock containers found');
        return;
    }
    
    containers.forEach(container => {
        const cards = container.querySelectorAll('[data-symbol]');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const symbol = card.getAttribute('data-symbol');
            const isVisible = filteredStocks.some(s => 
                (s.symbol || s.stock) === symbol
            );
            
            if (isVisible) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show "no results" message if needed
        let noResultsMsg = container.querySelector('.no-results-message');
        if (visibleCount === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results-message col-span-full text-center py-8';
                noResultsMsg.innerHTML = `
                    <i class="fas fa-search text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500 text-lg">No stocks match your filters</p>
                    <button onclick="clearFilters()" class="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Clear Filters
                    </button>
                `;
                container.appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    });
}

function clearFilters() {
    const risk = document.getElementById('riskFilter');
    const momentum = document.getElementById('momentumFilter');
    const search = document.getElementById('searchFilter');
    
    if (risk) risk.value = '';
    if (momentum) momentum.value = '';
    if (search) search.value = '';
    
    // Show all stocks
    const containers = [
        document.getElementById('breakoutStocks'),
        document.getElementById('brokerageRecommendations'),
        document.getElementById('trendingStocks')
    ].filter(c => c);
    
    containers.forEach(container => {
        const cards = container.querySelectorAll('[data-symbol]');
        cards.forEach(card => {
            card.style.display = '';
        });
        
        // Remove no results message
        const noResultsMsg = container.querySelector('.no-results-message');
        if (noResultsMsg) noResultsMsg.remove();
    });
    
    // Hide filter results
    const resultsDiv = document.getElementById('filterResults');
    if (resultsDiv) {
        resultsDiv.classList.add('hidden');
    }
    
    console.log('✅ Filters cleared');
}

// Make filter functions globally available
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;

// ========================================
// 6. ALERTS MODAL
// ========================================
async function showAlertsModal() {
    try {
        const response = await axios.get('/api/ai/alerts');
        const alerts = response.data.alerts;

        // Remove existing modal if any
        const existing = document.getElementById('alertsModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'alertsModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-t-lg">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-bell mr-3"></i>
                            Smart Alerts (${alerts.length})
                        </h2>
                        <button onclick="document.getElementById('alertsModal').remove()" class="hover:bg-white hover:bg-opacity-20 rounded p-2">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
                
                <div class="p-6 space-y-4">
                    ${alerts.map(stock => `
                        <div class="border-2 border-orange-200 rounded-lg p-4 hover:shadow-lg transition">
                            <div class="flex items-start justify-between mb-3">
                                <div>
                                    <h3 class="text-xl font-bold text-gray-800">${stock.symbol}</h3>
                                    <p class="text-gray-600 text-sm">${stock.company || stock.name || stock.stock || 'N/A'}</p>
                                </div>
                                <div class="bg-gradient-to-r ${getRecommendationColor(stock.aiAnalysis.recommendation)} text-white rounded-lg px-3 py-2 text-center">
                                    <div class="font-bold text-sm">${stock.aiAnalysis.recommendation}</div>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-3 mb-3">
                                <div class="bg-green-50 rounded p-3 text-center">
                                    <div class="text-xs text-green-700">Upside</div>
                                    <div class="text-lg font-bold text-green-600">${stock.upside}</div>
                                </div>
                                <div class="bg-blue-50 rounded p-3 text-center">
                                    <div class="text-xs text-blue-700">Risk</div>
                                    <div class="text-lg font-bold text-blue-600">${stock.aiAnalysis.riskScore}/10</div>
                                </div>
                                <div class="bg-purple-50 rounded p-3 text-center">
                                    <div class="text-xs text-purple-700">Power</div>
                                    <div class="text-lg font-bold text-purple-600">${stock.aiAnalysis.momentum}/10</div>
                                </div>
                            </div>
                            
                            <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                                <div class="text-sm text-gray-700">
                                    <i class="fas fa-lightbulb text-yellow-600 mr-1"></i>
                                    ${stock.alertReason}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error showing alerts:', error);
    }
}

// Make modal function globally available
window.showAlertsModal = showAlertsModal;

// ========================================
// 7. HELPER FUNCTIONS
// ========================================
function getRecommendationColor(recommendation) {
    const colors = {
        'STRONG BUY': 'from-green-600 to-green-700',
        'BUY': 'from-green-500 to-green-600',
        'HOLD': 'from-yellow-500 to-yellow-600',
        'AVOID': 'from-red-500 to-red-600'
    };
    return colors[recommendation] || 'from-gray-500 to-gray-600';
}

function renderRiskBar(riskScore) {
    const percentage = (riskScore / 10) * 100;
    const color = riskScore <= 3 ? 'bg-green-500' : riskScore <= 6 ? 'bg-yellow-500' : 'bg-red-500';
    
    return `
        <div class="mb-3">
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-600">Risk Level</span>
                <span class="text-xs font-bold text-gray-700">${riskScore}/10</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="${color} h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

function renderMomentumBar(momentum) {
    const percentage = (momentum / 10) * 100;
    const color = momentum >= 8 ? 'bg-green-500' : momentum >= 5 ? 'bg-blue-500' : 'bg-gray-500';
    
    return `
        <div class="mb-2">
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-600">Momentum</span>
                <span class="text-xs font-bold text-gray-700">${momentum}/10</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="${color} h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

console.log('✅ AI Dashboard Script Loaded');
