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
                font: { size: 18, family: 'Inter', weight: 700 }
            },
            xaxis: {
                rangeslider: { visible: false },
                type: 'date'
            },
            yaxis: {
                title: 'Price (₹)',
                domain: [0.3, 1]
            },
            yaxis2: {
                title: 'Volume',
                domain: [0, 0.25]
            },
            paper_bgcolor: 'rgba(255, 255, 255, 0.95)',
            plot_bgcolor: 'rgba(255, 255, 255, 0.95)',
            hovermode: 'x unified',
            showlegend: true,
            legend: {
                orientation: 'h',
                yanchor: 'bottom',
                y: 1.02,
                xanchor: 'right',
                x: 1
            }
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
        };
        
        Plotly.newPlot(containerId, traces, layout, config);
        
        this.charts[symbol] = {
            containerId,
            ohlcData,
            srLevels
        };
        
        return srLevels;
    }

    // Show chart in modal
    async showChartModal(symbol, stockData) {
        const modalHTML = `
            <div id="chartModal" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onclick="closeChartModal(event)">
                <div class="glass-card rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <h2 class="text-3xl font-black text-gray-800">${symbol}</h2>
                                <p class="text-gray-600 mt-1">${stockData?.name || 'Technical Chart'}</p>
                            </div>
                            <button onclick="closeChartModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div id="plotlyChart" style="width: 100%; height: 600px;">
                            <div class="flex items-center justify-center h-full">
                                <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                                <span class="ml-3 text-gray-600">Loading chart data...</span>
                            </div>
                        </div>
                        
                        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="glass-card rounded-xl p-4">
                                <div class="text-sm text-gray-600 mb-2">Support Levels</div>
                                <div id="supportLevels" class="space-y-2"></div>
                            </div>
                            <div class="glass-card rounded-xl p-4">
                                <div class="text-sm text-gray-600 mb-2">Resistance Levels</div>
                                <div id="resistanceLevels" class="space-y-2"></div>
                            </div>
                            <div class="glass-card rounded-xl p-4">
                                <div class="text-sm text-gray-600 mb-2">Key Metrics</div>
                                <div id="keyMetrics" class="space-y-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Create chart (async)
        const srLevels = await this.createCandlestickChart('plotlyChart', symbol, stockData);
        
        // Populate support levels
        const supportDiv = document.getElementById('supportLevels');
        if (srLevels.support.length > 0) {
            supportDiv.innerHTML = srLevels.support.map(level => 
                `<div class="flex justify-between items-center text-sm">
                    <span class="text-gray-700">S:</span>
                    <span class="font-bold text-green-600">₹${level.toFixed(2)}</span>
                </div>`
            ).join('');
        } else {
            supportDiv.innerHTML = '<div class="text-gray-400 text-sm">No support detected</div>';
        }
        
        // Populate resistance levels
        const resistanceDiv = document.getElementById('resistanceLevels');
        if (srLevels.resistance.length > 0) {
            resistanceDiv.innerHTML = srLevels.resistance.map(level => 
                `<div class="flex justify-between items-center text-sm">
                    <span class="text-gray-700">R:</span>
                    <span class="font-bold text-red-600">₹${level.toFixed(2)}</span>
                </div>`
            ).join('');
        } else {
            resistanceDiv.innerHTML = '<div class="text-gray-400 text-sm">No resistance detected</div>';
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
                    <span class="text-gray-700">Current:</span>
                    <span class="font-bold text-purple-600">₹${srLevels.currentPrice.toFixed(2)}</span>
                </div>
                ${nearest.support ? `
                <div class="flex justify-between mb-2">
                    <span class="text-gray-700">To Support:</span>
                    <span class="font-bold text-green-600">${(((srLevels.currentPrice - nearest.support) / nearest.support) * 100).toFixed(2)}%</span>
                </div>` : ''}
                ${nearest.resistance ? `
                <div class="flex justify-between">
                    <span class="text-gray-700">To Resistance:</span>
                    <span class="font-bold text-red-600">${(((nearest.resistance - srLevels.currentPrice) / srLevels.currentPrice) * 100).toFixed(2)}%</span>
                </div>` : ''}
            </div>
        `;
    }
}

// Global chart manager instance
window.chartManager = new StockChartManager();

// Close chart modal
window.closeChartModal = function(event) {
    if (!event || event.target.id === 'chartModal' || !event) {
        const modal = document.getElementById('chartModal');
        if (modal) {
            modal.remove();
        }
    }
};
