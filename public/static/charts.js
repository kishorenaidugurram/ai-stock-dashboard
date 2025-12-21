// Plotly Candlestick Charts with Support/Resistance
// Using K-means clustering for S/R detection

class StockChartManager {
    constructor() {
        this.charts = {};
    }

    // Fetch real OHLC data from API
    async fetchOHLCData(symbol, days = 60) {
        try {
            const response = await fetch(`/api/historical/${symbol}?days=${days}`);
            const result = await response.json();
            
            if (!result.success || !result.data || result.data.length === 0) {
                console.warn(`No historical data for ${symbol}, using mock data`);
                return this.generateOHLCData(symbol, days);
            }
            
            return result.data;
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            return this.generateOHLCData(symbol, days);
        }
    }
    
    // Generate mock OHLC data (fallback when API fails)
    generateOHLCData(symbol, days = 60) {
        const data = [];
        let basePrice = 1000 + Math.random() * 500;
        const now = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            
            const open = basePrice + (Math.random() - 0.5) * 20;
            const trend = (Math.random() - 0.48) * 10; // Slight upward bias
            const high = open + Math.abs(trend) + Math.random() * 10;
            const low = open - Math.abs(trend) - Math.random() * 10;
            const close = low + (high - low) * Math.random();
            
            data.push({
                date: date.toISOString().split('T')[0],
                open: open,
                high: high,
                low: low,
                close: close,
                volume: Math.floor(1000000 + Math.random() * 5000000)
            });
            
            basePrice = close;
        }
        
        return data;
    }

    // K-means clustering for support/resistance
    kMeansClustering(prices, k = 3) {
        if (prices.length < k) return [];
        
        // Initialize centroids randomly
        let centroids = [];
        const sortedPrices = [...prices].sort((a, b) => a - b);
        const step = Math.floor(sortedPrices.length / k);
        
        for (let i = 0; i < k; i++) {
            centroids.push(sortedPrices[Math.min(i * step, sortedPrices.length - 1)]);
        }
        
        // K-means iterations
        for (let iter = 0; iter < 10; iter++) {
            const clusters = Array.from({ length: k }, () => []);
            
            // Assign points to nearest centroid
            prices.forEach(price => {
                let minDist = Infinity;
                let clusterIdx = 0;
                
                centroids.forEach((centroid, idx) => {
                    const dist = Math.abs(price - centroid);
                    if (dist < minDist) {
                        minDist = dist;
                        clusterIdx = idx;
                    }
                });
                
                clusters[clusterIdx].push(price);
            });
            
            // Update centroids
            centroids = clusters.map(cluster => {
                if (cluster.length === 0) return centroids[0]; // Fallback
                return cluster.reduce((a, b) => a + b, 0) / cluster.length;
            });
        }
        
        return centroids.sort((a, b) => a - b);
    }

    // Detect support and resistance levels
    detectSupportResistance(ohlcData) {
        // Extract all significant prices (highs and lows)
        const significantPrices = [];
        
        ohlcData.forEach((candle, idx) => {
            // Local maxima (resistance)
            if (idx > 0 && idx < ohlcData.length - 1) {
                if (candle.high > ohlcData[idx - 1].high && candle.high > ohlcData[idx + 1].high) {
                    significantPrices.push(candle.high);
                }
                // Local minima (support)
                if (candle.low < ohlcData[idx - 1].low && candle.low < ohlcData[idx + 1].low) {
                    significantPrices.push(candle.low);
                }
            }
        });
        
        // Use K-means to find 4 key levels
        const levels = this.kMeansClustering(significantPrices, 4);
        
        const currentPrice = ohlcData[ohlcData.length - 1].close;
        
        // Classify as support or resistance
        const support = levels.filter(l => l < currentPrice);
        const resistance = levels.filter(l => l >= currentPrice);
        
        return {
            support: support,
            resistance: resistance,
            currentPrice: currentPrice
        };
    }

    // Create candlestick chart with support/resistance
    async createCandlestickChart(containerId, symbol, stockData) {
        const ohlcData = await this.fetchOHLCData(symbol);
        const srLevels = this.detectSupportResistance(ohlcData);
        
        // Candlestick trace
        const candlestick = {
            x: ohlcData.map(d => d.date),
            open: ohlcData.map(d => d.open),
            high: ohlcData.map(d => d.high),
            low: ohlcData.map(d => d.low),
            close: ohlcData.map(d => d.close),
            type: 'candlestick',
            name: symbol,
            increasing: { line: { color: '#10b981' } },
            decreasing: { line: { color: '#ef4444' } },
            xaxis: 'x',
            yaxis: 'y'
        };
        
        // Volume trace
        const volume = {
            x: ohlcData.map(d => d.date),
            y: ohlcData.map(d => d.volume),
            type: 'bar',
            name: 'Volume',
            marker: {
                color: ohlcData.map(d => d.close > d.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)')
            },
            xaxis: 'x',
            yaxis: 'y2'
        };
        
        const traces = [candlestick, volume];
        
        // Add support lines
        srLevels.support.forEach((level, idx) => {
            traces.push({
                x: [ohlcData[0].date, ohlcData[ohlcData.length - 1].date],
                y: [level, level],
                mode: 'lines',
                name: `Support ${idx + 1}`,
                line: {
                    color: '#10b981',
                    width: 2,
                    dash: 'dash'
                },
                hovertemplate: `Support: ₹${level.toFixed(2)}<extra></extra>`
            });
        });
        
        // Add resistance lines
        srLevels.resistance.forEach((level, idx) => {
            traces.push({
                x: [ohlcData[0].date, ohlcData[ohlcData.length - 1].date],
                y: [level, level],
                mode: 'lines',
                name: `Resistance ${idx + 1}`,
                line: {
                    color: '#ef4444',
                    width: 2,
                    dash: 'dash'
                },
                hovertemplate: `Resistance: ₹${level.toFixed(2)}<extra></extra>`
            });
        });
        
        // Current price line
        traces.push({
            x: [ohlcData[0].date, ohlcData[ohlcData.length - 1].date],
            y: [srLevels.currentPrice, srLevels.currentPrice],
            mode: 'lines',
            name: 'Current Price',
            line: {
                color: '#8b5cf6',
                width: 3
            },
            hovertemplate: `Current: ₹${srLevels.currentPrice.toFixed(2)}<extra></extra>`
        });
        
        const layout = {
            title: {
                text: `${symbol} - Candlestick Chart with Support/Resistance`,
                font: { size: 18, family: 'Inter', weight: 700, color: '#ffffff' }
            },
            xaxis: {
                rangeslider: { visible: false },
                type: 'date',
                gridcolor: '#333333',
                color: '#9ca3af'
            },
            yaxis: {
                title: { text: 'Price (₹)', font: { color: '#9ca3af' } },
                domain: [0.3, 1],
                gridcolor: '#333333',
                color: '#9ca3af'
            },
            yaxis2: {
                title: { text: 'Volume', font: { color: '#9ca3af' } },
                domain: [0, 0.25],
                gridcolor: '#333333',
                color: '#9ca3af'
            },
            paper_bgcolor: '#0a0a0a',
            plot_bgcolor: '#0a0a0a',
            hovermode: 'x unified',
            showlegend: true,
            legend: {
                orientation: 'h',
                yanchor: 'bottom',
                y: 1.02,
                xanchor: 'right',
                x: 1,
                font: { color: '#9ca3af' },
                bgcolor: 'rgba(0,0,0,0)'
            }
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
        };
        
        // Check if Plotly is loaded
        if (typeof Plotly === 'undefined') {
            console.error('❌ Plotly is not loaded!');
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<div class="flex items-center justify-center h-full text-red-600"><i class="fas fa-exclamation-triangle mr-2"></i>Plotly library not loaded</div>';
            }
            return srLevels;
        }
        
        try {
            Plotly.newPlot(containerId, traces, layout, config);
            console.log('✅ Plotly chart created successfully');
        } catch (error) {
            console.error('❌ Error creating Plotly chart:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<div class="flex items-center justify-center h-full text-red-600"><i class="fas fa-exclamation-triangle mr-2"></i>Error creating chart</div>';
            }
        }
        
        this.charts[symbol] = {
            containerId,
            ohlcData,
            srLevels
        };
        
        return srLevels;
    }

    // Show chart in modal
    async showChartModal(symbol, stockData) {
        // Check if modal already exists and remove it
        const existingModal = document.getElementById('chartModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = `
            <div id="chartModal" class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onclick="window.closeChartModal(event)" style="display: flex !important; position: fixed !important; z-index: 9999 !important; backdrop-filter: blur(4px);">
                <div class="rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onclick="event.stopPropagation()" style="background: #1a1a1a; max-width: 1200px; border: 1px solid #333;">
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <h2 class="text-3xl font-black text-white">${symbol}</h2>
                                <p class="text-gray-400 mt-1">${stockData?.name || 'Technical Chart'}</p>
                            </div>
                            <button onclick="window.closeChartModal()" class="text-gray-400 hover:text-white text-2xl transition">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <!-- Chart Type Tabs -->
                        <div class="flex gap-2 mb-4">
                            <button id="tabPlotly" onclick="window.switchChartTab('plotly', '${symbol}')" class="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition">
                                <i class="fas fa-chart-candlestick mr-2"></i>Technical Analysis
                            </button>
                            <button id="tabTradingView" onclick="window.switchChartTab('tradingview', '${symbol}')" class="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold transition">
                                <i class="fas fa-chart-line mr-2"></i>TradingView Live
                            </button>
                        </div>
                        
                        <!-- Plotly Chart Container -->
                        <div id="plotlyChartContainer">
                            <div id="plotlyChart" style="width: 100%; height: 600px; background: #0a0a0a; border-radius: 12px;">
                                <div class="flex items-center justify-center h-full">
                                    <i class="fas fa-spinner fa-spin text-4xl text-purple-500"></i>
                                    <span class="ml-3 text-gray-400">Loading chart data...</span>
                                </div>
                            </div>
                            
                            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="rounded-xl p-4" style="background: #0a0a0a; border: 1px solid #333;">
                                    <div class="text-sm text-gray-400 mb-2">Support Levels</div>
                                    <div id="supportLevels" class="space-y-2"></div>
                                </div>
                                <div class="rounded-xl p-4" style="background: #0a0a0a; border: 1px solid #333;">
                                    <div class="text-sm text-gray-400 mb-2">Resistance Levels</div>
                                    <div id="resistanceLevels" class="space-y-2"></div>
                                </div>
                                <div class="rounded-xl p-4" style="background: #0a0a0a; border: 1px solid #333;">
                                    <div class="text-sm text-gray-400 mb-2">Key Metrics</div>
                                    <div id="keyMetrics" class="space-y-2"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- TradingView Chart Container (hidden by default) -->
                        <div id="tradingViewContainer" style="display: none;">
                            <div id="tradingview_widget" style="height: 600px; background: #0a0a0a; border-radius: 12px;"></div>
                            <div class="mt-4 p-4 rounded-lg" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3);">
                                <p class="text-sm text-gray-300">
                                    <i class="fas fa-info-circle text-blue-400 mr-2"></i>
                                    <strong class="text-white">TradingView Live Chart:</strong> Real-time market data with advanced indicators and drawing tools.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Create Plotly chart (async)
        const srLevels = await this.createCandlestickChart('plotlyChart', symbol, stockData);
        
        // Populate support levels
        const supportDiv = document.getElementById('supportLevels');
        if (srLevels.support.length > 0) {
            supportDiv.innerHTML = srLevels.support.map(level => 
                `<div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400">S:</span>
                    <span class="font-bold text-green-400">₹${level.toFixed(2)}</span>
                </div>`
            ).join('');
        } else {
            supportDiv.innerHTML = '<div class="text-gray-500 text-sm">No support detected</div>';
        }
        
        // Populate resistance levels
        const resistanceDiv = document.getElementById('resistanceLevels');
        if (srLevels.resistance.length > 0) {
            resistanceDiv.innerHTML = srLevels.resistance.map(level => 
                `<div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400">R:</span>
                    <span class="font-bold text-red-400">₹${level.toFixed(2)}</span>
                </div>`
            ).join('');
        } else {
            resistanceDiv.innerHTML = '<div class="text-gray-500 text-sm">No resistance detected</div>';
        }
        
        // Key metrics
        const metricsDiv = document.getElementById('keyMetrics');
        const nearest = {
            support: srLevels.support.length > 0 ? srLevels.support[srLevels.support.length - 1] : null,
            resistance: srLevels.resistance.length > 0 ? srLevels.resistance[0] : null
        };
        
        metricsDiv.innerHTML = `
            <div class="text-sm">
                <div class="flex justify-between mb-2">
                    <span class="text-gray-400">Current:</span>
                    <span class="font-bold text-purple-400">₹${srLevels.currentPrice.toFixed(2)}</span>
                </div>
                ${nearest.support ? `
                <div class="flex justify-between mb-2">
                    <span class="text-gray-400">To Support:</span>
                    <span class="font-bold text-green-400">${(((srLevels.currentPrice - nearest.support) / nearest.support) * 100).toFixed(2)}%</span>
                </div>` : ''}
                ${nearest.resistance ? `
                <div class="flex justify-between">
                    <span class="text-gray-400">To Resistance:</span>
                    <span class="font-bold text-red-400">${(((nearest.resistance - srLevels.currentPrice) / srLevels.currentPrice) * 100).toFixed(2)}%</span>
                </div>` : ''}
            </div>
        `;
    }
}

// Global chart manager instance
window.chartManager = new StockChartManager();

// Global showChart function
window.showChart = async function(symbol, name) {
    console.log('📊 Opening chart for:', symbol, name);
    await window.chartManager.showChartModal(symbol, name);
};

// Close chart modal
window.closeChartModal = function(event) {
    if (!event || event.target.id === 'chartModal' || !event) {
        const modal = document.getElementById('chartModal');
        if (modal) {
            modal.remove();
        }
    }
};

// Switch between chart tabs
window.switchChartTab = function(tabType, symbol) {
    const plotlyTab = document.getElementById('tabPlotly');
    const tradingViewTab = document.getElementById('tabTradingView');
    const plotlyContainer = document.getElementById('plotlyChartContainer');
    const tradingViewContainer = document.getElementById('tradingViewContainer');
    
    if (tabType === 'plotly') {
        // Switch to Plotly
        plotlyTab.className = 'px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold';
        tradingViewTab.className = 'px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300';
        plotlyContainer.style.display = 'block';
        tradingViewContainer.style.display = 'none';
    } else {
        // Switch to TradingView
        plotlyTab.className = 'px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300';
        tradingViewTab.className = 'px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold';
        plotlyContainer.style.display = 'none';
        tradingViewContainer.style.display = 'block';
        
        // Load TradingView widget if not already loaded
        if (!tradingViewContainer.dataset.loaded) {
            loadTradingViewWidget(symbol);
            tradingViewContainer.dataset.loaded = 'true';
        }
    }
};

// Load TradingView Widget
function loadTradingViewWidget(symbol) {
    // NSE symbols need .NS suffix for TradingView
    const tvSymbol = `NSE:${symbol}`;
    
    new TradingView.widget({
        "autosize": true,
        "symbol": tvSymbol,
        "interval": "D",
        "timezone": "Asia/Kolkata",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#0a0a0a",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_widget",
        "studies": [
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies",
            "Volume@tv-basicstudies"
        ],
        "hide_side_toolbar": false,
        "details": true,
        "hotlist": true,
        "calendar": true,
        "support_host": "https://www.tradingview.com"
    });
}
