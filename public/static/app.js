// AI-Enhanced Stock Dashboard - Frontend JavaScript
// This file adds AI features to the stock dashboard UI

let aiData = null;
let stocksData = null;

// Initialize dashboard
async function initDashboard() {
    try {
        // Load stock data and AI analysis in parallel
        const [stocks, aiAnalysis] = await Promise.all([
            axios.get('/api/stocks'),
            axios.get('/api/ai/analyze')
        ]);

        stocksData = stocks.data;
        aiData = aiAnalysis.data.stocks;

        // Render all sections
        renderAlertsBanner();
        renderMarketSummary();
        renderTopPicks();
        renderStocksWithAI();
        initChatbot();
        initFilters();

        console.log('✅ AI Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// ========================================
// 1. SMART ALERTS BANNER
// ========================================
async function renderAlertsBanner() {
    try {
        const response = await axios.get('/api/ai/alerts');
        const alerts = response.data.alerts;

        if (alerts.length === 0) return;

        const banner = document.createElement('div');
        banner.id = 'aiAlertsBanner';
        banner.className = 'bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-6 mb-6 rounded-lg shadow-lg';
        banner.innerHTML = `
            <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                    <i class="fas fa-bell animate-pulse text-2xl"></i>
                    <div>
                        <div class="font-bold text-lg">🚨 ${alerts.length} High-Potential Alerts!</div>
                        <div class="text-sm opacity-90">
                            ${alerts.slice(0, 3).map(a => a.symbol).join(', ')}
                            ${alerts.length > 3 ? ` +${alerts.length - 3} more` : ''}
                        </div>
                    </div>
                </div>
                <button onclick="showAlertsModal()" class="bg-white text-orange-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition">
                    View All Alerts <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
        `;

        // Insert at the top of main content
        const main = document.querySelector('main');
        main.insertBefore(banner, main.firstChild);
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

        const summaryCard = document.createElement('div');
        summaryCard.className = 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg shadow-xl p-6 mb-8';
        summaryCard.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-2xl font-bold flex items-center">
                    <i class="fas fa-robot mr-2"></i>
                    AI Market Summary
                </h3>
                <span class="bg-white bg-opacity-20 px-3 py-1 rounded text-sm">
                    ${new Date().toLocaleDateString()}
                </span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div class="text-sm opacity-90">Total Stocks</div>
                    <div class="text-3xl font-bold">${summary.totalStocks}</div>
                </div>
                <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div class="text-sm opacity-90">Market Sentiment</div>
                    <div class="text-2xl font-bold">${summary.marketSentiment}</div>
                </div>
                <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div class="text-sm opacity-90">Avg Upside</div>
                    <div class="text-3xl font-bold">${summary.averageUpside}%</div>
                </div>
                <div class="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div class="text-sm opacity-90">High Confidence</div>
                    <div class="text-3xl font-bold">${summary.highConfidenceCount}</div>
                </div>
            </div>

            ${summary.topPicks && summary.topPicks.length > 0 ? `
            <div class="mt-4 pt-4 border-t border-white border-opacity-20">
                <div class="text-sm opacity-90 mb-2">🎯 AI Top Pick Today:</div>
                <div class="text-xl font-bold">${summary.topPicks[0]}</div>
            </div>
            ` : ''}
        `;

        // Insert after alerts banner or at top of main
        const main = document.querySelector('main');
        const alertsBanner = document.getElementById('aiAlertsBanner');
        if (alertsBanner) {
            alertsBanner.insertAdjacentElement('afterend', summaryCard);
        } else {
            main.insertBefore(summaryCard, main.firstChild);
        }
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

        if (topPicks.length === 0) return;

        const section = document.createElement('section');
        section.className = 'mb-8';
        section.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fas fa-trophy text-yellow-500 mr-3"></i>
                    Top AI Picks
                </h2>
                <span class="text-sm text-gray-500">AI-ranked by risk and momentum</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="topAIPicks"></div>
        `;

        // Insert before breakout stocks section
        const breakoutSection = document.querySelector('main section');
        if (breakoutSection) {
            breakoutSection.insertAdjacentElement('beforebegin', section);
        }

        // Render top picks cards
        const container = document.getElementById('topAIPicks');
        container.innerHTML = topPicks.map((stock, index) => `
            <div class="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg p-6 border-2 border-yellow-400 relative">
                <div class="absolute top-4 right-4">
                    <div class="bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                        #${index + 1}
                    </div>
                </div>
                
                <div class="mb-4">
                    <h3 class="text-xl font-bold text-gray-800">${stock.symbol}</h3>
                    <p class="text-gray-600 text-sm">${stock.company || stock.name || stock.stock}</p>
                </div>

                <div class="flex gap-2 mb-4">
                    <div class="flex-1 bg-green-100 rounded-lg p-3">
                        <div class="text-xs text-green-700">Upside</div>
                        <div class="text-2xl font-bold text-green-600">${stock.upside}</div>
                    </div>
                    <div class="flex-1 bg-blue-100 rounded-lg p-3">
                        <div class="text-xs text-blue-700">Risk</div>
                        <div class="text-2xl font-bold text-blue-600">${stock.aiAnalysis.riskScore}/10</div>
                    </div>
                    <div class="flex-1 bg-purple-100 rounded-lg p-3">
                        <div class="text-xs text-purple-700">Momentum</div>
                        <div class="text-2xl font-bold text-purple-600">${stock.aiAnalysis.momentum}/10</div>
                    </div>
                </div>

                <div class="space-y-2">
                    ${renderAIBadge(stock.aiAnalysis)}
                    ${renderRiskBar(stock.aiAnalysis.riskScore)}
                    ${renderMomentumBar(stock.aiAnalysis.momentum)}
                </div>

                <div class="mt-4 pt-4 border-t">
                    <div class="text-xs text-gray-500">Source: ${stock.source || stock.brokerage}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering top picks:', error);
    }
}

// ========================================
// 4. RENDER STOCKS WITH AI BADGES
// ========================================
function renderStocksWithAI() {
    if (!aiData || !stocksData) return;

    // Add AI badges to existing stock cards
    const allStocks = [
        ...(stocksData.breakoutStocks || []),
        ...(stocksData.brokerageRecommendations || [])
    ];

    allStocks.forEach(stock => {
        // Find matching AI analysis
        const aiStock = aiData.find(s => 
            s.symbol === stock.symbol || 
            s.stock === stock.stock || 
            s.name === stock.name
        );

        if (aiStock && aiStock.aiAnalysis) {
            // This would normally inject AI badges into existing cards
            // Since cards are rendered dynamically in the main HTML,
            // we'll enhance them after they're rendered
            console.log(`AI data available for ${stock.symbol || stock.stock}`);
        }
    });
}

// ========================================
// 5. AI CHATBOT WIDGET
// ========================================
function initChatbot() {
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
                    <div class="text-xs opacity-90">Ask me anything about stocks</div>
                </div>
            </div>
            <button onclick="toggleChatbot()" class="hover:bg-white hover:bg-opacity-20 rounded p-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div id="chatMessages" class="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <div class="bg-white rounded-lg p-3 shadow">
                <div class="text-sm text-gray-700">
                    👋 Hi! I'm your AI stock assistant. Ask me about:
                    <ul class="mt-2 space-y-1 text-xs">
                        <li>• "What are the best stocks?"</li>
                        <li>• "Show me low risk stocks"</li>
                        <li>• "Which stocks have highest upside?"</li>
                        <li>• "What's the market sentiment?"</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="p-4 border-t">
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
}

function toggleChatbot() {
    const widget = document.getElementById('aiChatWidget');
    widget.classList.toggle('hidden');
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
    
    // Clear input
    input.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'bg-white rounded-lg p-3 shadow';
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
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Chat error:', error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'bg-red-100 text-red-700 rounded-lg p-3 max-w-xs';
        errorMsg.textContent = 'Sorry, I encountered an error. Please try again.';
        messagesContainer.appendChild(errorMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// ========================================
// 6. ENHANCED FILTERS
// ========================================
function initFilters() {
    const filterBar = document.createElement('div');
    filterBar.className = 'bg-white rounded-lg shadow-lg p-4 mb-8 sticky top-4 z-40';
    filterBar.innerHTML = `
        <div class="flex flex-wrap gap-4 items-center">
            <div class="flex items-center gap-2">
                <i class="fas fa-filter text-purple-600"></i>
                <span class="font-semibold text-gray-700">Smart Filters:</span>
            </div>
            
            <select id="riskFilter" onchange="applyFilters()" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">All Risk Levels</option>
                <option value="low">Low Risk (≤3)</option>
                <option value="medium">Medium Risk (4-6)</option>
                <option value="high">High Risk (≥7)</option>
            </select>
            
            <select id="momentumFilter" onchange="applyFilters()" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">All Momentum</option>
                <option value="strong">Strong (≥8)</option>
                <option value="moderate">Moderate (5-7)</option>
                <option value="weak">Weak (≤4)</option>
            </select>
            
            <select id="recommendationFilter" onchange="applyFilters()" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">All Recommendations</option>
                <option value="STRONG BUY">Strong Buy</option>
                <option value="BUY">Buy</option>
                <option value="HOLD">Hold</option>
                <option value="AVOID">Avoid</option>
            </select>
            
            <input 
                type="text" 
                id="searchFilter" 
                placeholder="Search stocks..." 
                oninput="applyFilters()"
                class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 flex-1 min-w-[200px]"
            />
            
            <button onclick="clearFilters()" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                <i class="fas fa-times mr-1"></i> Clear
            </button>
        </div>
    `;

    // Insert after market summary or at top
    const main = document.querySelector('main');
    const summaryCard = main.querySelector('.bg-gradient-to-br');
    if (summaryCard) {
        summaryCard.insertAdjacentElement('afterend', filterBar);
    } else {
        main.insertBefore(filterBar, main.firstChild);
    }
}

function applyFilters() {
    // This would filter the stock cards based on AI analysis
    console.log('Applying filters...');
    // Implementation would filter aiData and re-render
}

function clearFilters() {
    document.getElementById('riskFilter').value = '';
    document.getElementById('momentumFilter').value = '';
    document.getElementById('recommendationFilter').value = '';
    document.getElementById('searchFilter').value = '';
    applyFilters();
}

// ========================================
// 7. HELPER FUNCTIONS - AI BADGES
// ========================================
function renderAIBadge(aiAnalysis) {
    const colors = {
        'STRONG BUY': 'bg-green-600',
        'BUY': 'bg-green-500',
        'HOLD': 'bg-yellow-500',
        'AVOID': 'bg-red-500'
    };
    
    return `
        <div class="flex items-center justify-between bg-gradient-to-r ${colors[aiAnalysis.recommendation] || 'bg-gray-500'} text-white rounded-lg px-3 py-2">
            <span class="font-bold">${aiAnalysis.recommendation}</span>
            <span class="text-sm opacity-90">Confidence: ${aiAnalysis.confidence}%</span>
        </div>
    `;
}

function renderRiskBar(riskScore) {
    const percentage = (riskScore / 10) * 100;
    const color = riskScore <= 3 ? 'bg-green-500' : riskScore <= 6 ? 'bg-yellow-500' : 'bg-red-500';
    
    return `
        <div>
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-600">Risk Level</span>
                <span class="text-xs font-bold text-gray-700">${riskScore}/10</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="${color} h-2 rounded-full" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

function renderMomentumBar(momentum) {
    const percentage = (momentum / 10) * 100;
    const color = momentum >= 8 ? 'bg-green-500' : momentum >= 5 ? 'bg-blue-500' : 'bg-gray-500';
    
    return `
        <div>
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-600">Momentum</span>
                <span class="text-xs font-bold text-gray-700">${momentum}/10</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="${color} h-2 rounded-full" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

// ========================================
// 8. SHOW ALERTS MODAL
// ========================================
async function showAlertsModal() {
    try {
        const response = await axios.get('/api/ai/alerts');
        const alerts = response.data.alerts;

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
                    <p class="text-sm opacity-90 mt-2">High-potential stocks matching AI criteria</p>
                </div>
                
                <div class="p-6 space-y-4">
                    ${alerts.map(stock => `
                        <div class="border-2 border-orange-200 rounded-lg p-4 hover:shadow-lg transition">
                            <div class="flex items-start justify-between mb-3">
                                <div>
                                    <h3 class="text-xl font-bold text-gray-800">${stock.symbol}</h3>
                                    <p class="text-gray-600 text-sm">${stock.company || stock.name || stock.stock}</p>
                                </div>
                                ${renderAIBadge(stock.aiAnalysis)}
                            </div>
                            
                            <div class="grid grid-cols-3 gap-3 mb-3">
                                <div class="bg-green-50 rounded p-3">
                                    <div class="text-xs text-green-700">Upside</div>
                                    <div class="text-lg font-bold text-green-600">${stock.upside}</div>
                                </div>
                                <div class="bg-blue-50 rounded p-3">
                                    <div class="text-xs text-blue-700">Risk</div>
                                    <div class="text-lg font-bold text-blue-600">${stock.aiAnalysis.riskScore}/10</div>
                                </div>
                                <div class="bg-purple-50 rounded p-3">
                                    <div class="text-xs text-purple-700">Momentum</div>
                                    <div class="text-lg font-bold text-purple-600">${stock.aiAnalysis.momentum}/10</div>
                                </div>
                            </div>
                            
                            <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                                <div class="text-sm text-gray-700">
                                    <i class="fas fa-info-circle text-yellow-600 mr-1"></i>
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

// ========================================
// 9. INITIALIZE ON PAGE LOAD
// ========================================
// Wait for DOM and existing data to load first
window.addEventListener('load', () => {
    setTimeout(initDashboard, 1000); // Wait 1 second for main data to load
});

console.log('🤖 AI Dashboard Module Loaded');
