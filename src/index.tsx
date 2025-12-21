import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import stocksData from '../data/stocks-data.json'
import TradingEdgeAI from './trading-edge-ai.js'
import TechnicalAnalysis from './technical-analysis.js'

const app = new Hono()

// Initialize AI Trading Edge
const tradingAI = new TradingEdgeAI(process.env.GENSPARK_API_KEY || 'e5fc86a6-d252-4a07-8479-6566d442162c')

// Enable CORS for API routes
app.use('/api/*', cors())

// API endpoint to get current stock data from JSON
app.get('/api/stocks', (c) => {
  return c.json(stocksData);
});

// API endpoint to trigger dashboard update
app.post('/api/trigger-update', async (c) => {
  try {
    // Log the update request
    const timestamp = new Date().toISOString();
    
    // Configured thread URL - opens this specific chat thread
    const specificThreadUrl = 'https://www.genspark.ai/agents?id=6b4fab73-6af0-428f-b6ad-a03d83e87586';
    
    // Return instructions for user
    return c.json({
      success: true,
      status: 'update_requested',
      message: 'Update request received! Please complete the update process.',
      timestamp: timestamp,
      instructions: {
        step1: 'Copy this command to your clipboard',
        command: 'Update the stock dashboard with latest data',
        step2: 'This chat thread will open in a new tab',
        step3: 'Paste the command and send it',
        step4: 'Wait 2-3 minutes for AI to complete the update',
        step5: 'Refresh this dashboard to see new data'
      },
      aiChatUrl: specificThreadUrl,
      estimatedTime: '2-3 minutes'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to process update request'
    }, 500);
  }
});

// API endpoint for legacy refresh (kept for compatibility)
app.post('/api/refresh', async (c) => {
  return c.json({
    success: true,
    message: 'Please use /api/trigger-update endpoint',
    lastUpdated: new Date().toISOString()
  });
});

// 🤖 AI-POWERED ENDPOINTS

// Get AI analysis for all stocks
app.get('/api/ai/analyze', (c) => {
  try {
    const allStocks = [
      ...(stocksData.breakoutStocks || []),
      ...(stocksData.brokerageRecommendations || [])
    ];

    const analyzed = allStocks.map(stock => ({
      ...stock,
      aiAnalysis: tradingAI.analyzeStock(stock)
    }));

    return c.json({
      success: true,
      stocks: analyzed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get daily AI-powered summary
app.get('/api/ai/summary', (c) => {
  try {
    const allStocks = [
      ...(stocksData.breakoutStocks || []),
      ...(stocksData.brokerageRecommendations || [])
    ];

    const summary = tradingAI.generateDailySummary(allStocks);

    return c.json({
      success: true,
      summary: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get top picks based on AI analysis
app.get('/api/ai/top-picks', (c) => {
  try {
    const allStocks = [
      ...(stocksData.breakoutStocks || []),
      ...(stocksData.brokerageRecommendations || [])
    ];

    // Remove duplicates by symbol
    const uniqueStocks = [];
    const seenSymbols = new Set();
    
    for (const stock of allStocks) {
      const symbol = stock.symbol || stock.stock;
      if (!seenSymbols.has(symbol)) {
        seenSymbols.add(symbol);
        uniqueStocks.push(stock);
      }
    }

    const analyzed = uniqueStocks
      .map(stock => ({
        ...stock,
        aiAnalysis: tradingAI.analyzeStock(stock)
      }))
      .filter(s => 
        s.aiAnalysis.recommendation === 'STRONG BUY' || 
        s.aiAnalysis.recommendation === 'BUY'
      )
      .sort((a, b) => {
        // Sort by risk (lower first), then momentum (higher first)
        if (a.aiAnalysis.riskScore !== b.aiAnalysis.riskScore) {
          return a.aiAnalysis.riskScore - b.aiAnalysis.riskScore;
        }
        return b.aiAnalysis.momentum - a.aiAnalysis.momentum;
      })
      .slice(0, 10);

    return c.json({
      success: true,
      topPicks: analyzed,
      count: analyzed.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Check alerts
app.get('/api/ai/alerts', (c) => {
  try {
    const allStocks = [
      ...(stocksData.breakoutStocks || []),
      ...(stocksData.brokerageRecommendations || [])
    ];

    // Remove duplicates by symbol
    const uniqueStocks = [];
    const seenSymbols = new Set();
    
    for (const stock of allStocks) {
      const symbol = stock.symbol || stock.stock;
      if (!seenSymbols.has(symbol)) {
        seenSymbols.add(symbol);
        uniqueStocks.push(stock);
      }
    }

    const alerts = uniqueStocks
      .filter(stock => tradingAI.shouldAlert(stock, {
        minUpside: 20,
        maxRiskScore: 4,
        minMomentum: 7,
        requiredSentiment: ['bullish', 'neutral']
      }))
      .map(stock => ({
        ...stock,
        aiAnalysis: tradingAI.analyzeStock(stock),
        alertReason: `High potential: ${stock.upside}% upside, Low risk, Strong momentum`
      }));

    return c.json({
      success: true,
      alerts: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// AI Chatbot endpoint
app.post('/api/ai/chat', async (c) => {
  try {
    const { query } = await c.req.json();
    
    const allStocks = [
      ...(stocksData.breakoutStocks || []),
      ...(stocksData.brokerageRecommendations || [])
    ];

    // Simple keyword-based responses
    const lowerQuery = query.toLowerCase();
    let response = '';

    if (lowerQuery.includes('best') || lowerQuery.includes('top')) {
      const topPicks = allStocks
        .map(s => ({ ...s, aiAnalysis: tradingAI.analyzeStock(s) }))
        .filter(s => s.aiAnalysis.recommendation === 'STRONG BUY' || s.aiAnalysis.recommendation === 'BUY')
        .sort((a, b) => b.aiAnalysis.momentum - a.aiAnalysis.momentum)
        .slice(0, 3);
      
      response = `Top 3 Buy Recommendations:\n\n${topPicks.map((s, i) => 
        `${i+1}. ${s.symbol} - ${s.company || 'N/A'}\n   ↗ ${s.upside} upside | Risk: ${s.aiAnalysis.riskScore}/10 | Momentum: ${s.aiAnalysis.momentum}/10\n   ${s.aiAnalysis.recommendation} | Source: ${s.source}`
      ).join('\n\n')}`;
    }
    else if (lowerQuery.includes('risk')) {
      const lowRisk = allStocks
        .map(s => ({ ...s, aiAnalysis: tradingAI.analyzeStock(s) }))
        .filter(s => s.aiAnalysis.riskScore <= 3)
        .slice(0, 5);
      
      response = `Low Risk Stocks (Risk ≤ 3/10):\n\n${lowRisk.map(s => 
        `• ${s.symbol} - Risk: ${s.aiAnalysis.riskScore}/10, Upside: ${s.upside}%`
      ).join('\n')}`;
    }
    else if (lowerQuery.includes('upside') || lowerQuery.includes('potential')) {
      const highUpside = allStocks
        .filter(s => s.upside > 20)
        .sort((a, b) => b.upside - a.upside)
        .slice(0, 5);
      
      response = `Highest Upside Potential (>20%):\n\n${highUpside.map(s => 
        `• ${s.symbol} - ${s.upside}% upside to ₹${s.targetPrice}\n  Source: ${s.source}`
      ).join('\n')}`;
    }
    else {
      const summary = tradingAI.generateDailySummary(allStocks);
      response = `Market Overview:\n\n` +
        `📊 Total Stocks: ${summary.totalStocks}\n` +
        `💪 Market Sentiment: ${summary.marketSentiment}\n` +
        `📈 Average Upside: ${summary.averageUpside}%\n` +
        `⭐ High Confidence: ${summary.highConfidenceCount} stocks\n\n` +
        `Ask me about "best stocks", "low risk", or "high upside"!`;
    }

    return c.json({
      success: true,
      query: query,
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      response: 'Sorry, I encountered an error processing your request.',
      error: error.message 
    }, 500);
  }
});

// 📊 TECHNICAL ANALYSIS ENDPOINT
// Provides breakout detection, volume analysis, support/resistance, patterns
app.get('/api/technical/analyze', (c) => {
  try {
    const allStocks = [
      ...(stocksData.breakoutStocks || []),
      ...(stocksData.brokerageRecommendations || [])
    ];

    const technicalData = allStocks.map(stock => {
      const technical = TechnicalAnalysis.analyze(stock);
      return {
        symbol: stock.symbol || stock.stock,
        name: stock.name || stock.company || stock.stock,
        ...stock,
        technical
      };
    });

    return c.json({
      success: true,
      count: technicalData.length,
      stocks: technicalData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Technical analysis for single stock
app.get('/api/technical/stock/:symbol', (c) => {
  try {
    const symbol = c.req.param('symbol');
    const allStocks = [
      ...(stocksData.breakoutStocks || []),
      ...(stocksData.brokerageRecommendations || [])
    ];

    const stock = allStocks.find(s => 
      (s.symbol || s.stock) === symbol
    );

    if (!stock) {
      return c.json({ 
        success: false, 
        error: 'Stock not found' 
      }, 404);
    }

    const technical = TechnicalAnalysis.analyze(stock);

    return c.json({
      success: true,
      symbol,
      technical,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Get historical stock data (OHLCV) - Yahoo Finance proxy
app.get('/api/historical/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const days = c.req.query('days') || '60';
    
    // Use Yahoo Finance API
    const yahooSymbol = symbol + '.NS'; // NSE stocks
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (parseInt(days) * 24 * 60 * 60);
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${startDate}&period2=${endDate}&interval=1d`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      return c.json({
        success: false,
        error: 'No data available',
        symbol: symbol
      }, 404);
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    
    const ohlcv = timestamps.map((ts, idx) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      timestamp: ts,
      open: quote.open[idx],
      high: quote.high[idx],
      low: quote.low[idx],
      close: quote.close[idx],
      volume: quote.volume[idx]
    })).filter(d => d.open && d.high && d.low && d.close); // Remove null values
    
    return c.json({
      success: true,
      symbol: symbol,
      yahooSymbol: yahooSymbol,
      data: ohlcv,
      count: ohlcv.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch historical data'
    }, 500);
  }
});

// Auto-update page route
app.get('/auto-update', serveStatic({ path: './public/auto-update.html' }));

// NSE PCS branded landing page
app.get('/nsepcs', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NSE PCS - Redirecting...</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            max-width: 500px;
        }
        
        .logo {
            font-size: 64px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        
        h1 {
            font-size: 48px;
            margin-bottom: 10px;
            font-weight: 700;
            letter-spacing: 2px;
        }
        
        .subtitle {
            font-size: 18px;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .loader {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-top: 5px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 30px auto;
        }
        
        .info {
            font-size: 14px;
            opacity: 0.8;
            margin-top: 20px;
        }
        
        .manual-link {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            border-radius: 8px;
            color: white;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .manual-link:hover {
            background: white;
            color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">📊</div>
        <h1>NSE PCS</h1>
        <p class="subtitle">NSE Premium Call Stocks</p>
        
        <div class="loader"></div>
        
        <p class="info">Redirecting to your Stock Dashboard...</p>
        
        <a href="/" class="manual-link" id="manualLink">
            Click here if not redirected automatically
        </a>
    </div>
    
    <script>
        // Redirect to main dashboard after 1 second
        setTimeout(function() {
            window.location.href = '/';
        }, 1000);
    </script>
</body>
</html>`);
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
        <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <style>
            /* Modern Design System */
            :root {
                --primary: #6366f1;
                --primary-dark: #4f46e5;
                --secondary: #8b5cf6;
                --success: #10b981;
                --danger: #ef4444;
                --warning: #f59e0b;
                --info: #3b82f6;
                --dark: #1e293b;
                --light: #f8fafc;
            }
            
            * {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            
            body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            
            /* Glassmorphism Effects */
            .glass-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            
            .glass-nav {
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
            }
            
            /* Advanced Animations */
            @keyframes slideUp {
                from { 
                    opacity: 0; 
                    transform: translateY(30px);
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0);
                }
            }
            
            @keyframes scaleIn {
                from { 
                    opacity: 0; 
                    transform: scale(0.9);
                }
                to { 
                    opacity: 1; 
                    transform: scale(1);
                }
            }
            
            @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }
            
            .card-animate {
                animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            
            .scale-in {
                animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            
            /* Modern Card Hover Effects */
            .premium-card {
                background: white;
                border-radius: 16px;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                border: 1px solid rgba(0, 0, 0, 0.05);
                position: relative;
                overflow: hidden;
            }
            
            .premium-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                transition: left 0.5s;
            }
            
            .premium-card:hover::before {
                left: 100%;
            }
            
            .premium-card:hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.1);
                border-color: rgba(99, 102, 241, 0.2);
            }
            
            /* Gradient Backgrounds */
            .gradient-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .gradient-success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }
            
            .gradient-danger {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }
            
            .gradient-warning {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            }
            
            .gradient-info {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            }
            
            .gradient-purple {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            }
            
            .gradient-teal {
                background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
            }
            
            /* Modern Buttons */
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 600;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
            }
            
            .btn-success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 600;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            }
            
            .btn-success:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
            }
            
            /* Navigation System */
            .nav-item {
                position: relative;
                padding: 16px 24px;
                font-weight: 600;
                color: #475569;
                transition: all 0.3s ease;
                cursor: pointer;
                border-radius: 8px;
            }
            
            .nav-item::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%) scaleX(0);
                width: 60%;
                height: 3px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 4px 4px 0 0;
                transition: transform 0.3s ease;
            }
            
            .nav-item:hover {
                color: #667eea;
                background: rgba(102, 126, 234, 0.05);
            }
            
            .nav-item.active {
                color: #667eea;
                background: rgba(102, 126, 234, 0.1);
            }
            
            .nav-item.active::after {
                transform: translateX(-50%) scaleX(1);
            }
            
            /* Badges */
            .badge-modern {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            /* Stat Cards */
            .stat-card {
                background: white;
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                transition: all 0.3s ease;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
            }
            
            .stat-icon {
                width: 56px;
                height: 56px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            /* Page Views */
            .page-view {
                display: none;
                animation: slideUp 0.5s ease-out;
            }
            
            .page-view.active {
                display: block;
            }
            
            /* Progress Bars */
            .progress-bar {
                height: 8px;
                background: #e5e7eb;
                border-radius: 999px;
                overflow: hidden;
                position: relative;
            }
            
            .progress-fill {
                height: 100%;
                border-radius: 999px;
                transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                overflow: hidden;
            }
            
            .progress-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                animation: shimmer 2s infinite;
            }
            
            /* Tooltips */
            .tooltip {
                position: relative;
            }
            
            .tooltip::before {
                content: attr(data-tooltip);
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                padding: 8px 12px;
                background: #1e293b;
                color: white;
                border-radius: 8px;
                font-size: 0.75rem;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s;
                margin-bottom: 8px;
            }
            
            .tooltip:hover::before {
                opacity: 1;
            }
            
            /* Scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            
            ::-webkit-scrollbar-track {
                background: #f1f5f9;
            }
            
            ::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
            }
        </style>
    </head>
    <body class="min-h-screen">
        <!-- Header -->
        <header class="gradient-primary text-white shadow-2xl relative overflow-hidden">
            <!-- Animated Background Pattern -->
            <div class="absolute inset-0 opacity-10">
                <div class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div class="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <div class="flex items-center justify-between flex-wrap gap-6">
                    <div class="flex-1">
                        <div class="flex items-center gap-4 mb-3">
                            <div class="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div>
                                <h1 class="text-4xl font-black tracking-tight">
                                    Stock Market Dashboard
                                </h1>
                                <p class="text-indigo-100 text-sm mt-1 font-medium">
                                    NSE F&O Breakout Stocks & Leading Brokerage Recommendations
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 mb-3">
                            <div class="text-xs text-indigo-100 font-semibold uppercase tracking-wider mb-1">Last Updated</div>
                            <div class="text-2xl font-bold" id="lastUpdated">Loading...</div>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="refreshData()" class="btn-primary flex items-center gap-2">
                                <i class="fas fa-sync-alt"></i>
                                <span>Refresh</span>
                            </button>
                            <button onclick="triggerAIUpdate()" class="btn-success flex items-center gap-2">
                                <i class="fas fa-robot"></i>
                                <span>AI Update</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Navigation Bar -->
        <nav class="glass-nav sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <button onclick="switchView('dashboard')" class="nav-item active" data-view="dashboard">
                            <i class="fas fa-home mr-2"></i>Dashboard
                        </button>
                        <button onclick="switchView('technical')" class="nav-item" data-view="technical">
                            <i class="fas fa-chart-line mr-2"></i>Technical Analysis
                        </button>
                        <button onclick="switchView('ai-insights')" class="nav-item" data-view="ai-insights">
                            <i class="fas fa-robot mr-2"></i>AI Insights
                        </button>
                        <button onclick="switchView('alerts')" class="nav-item" data-view="alerts">
                            <i class="fas fa-bell mr-2"></i>Alerts
                        </button>
                    </div>
                    <div class="flex items-center gap-3 py-3">
                        <span class="text-sm font-semibold text-gray-600">Quick View:</span>
                        <select id="viewSelector" onchange="switchView(this.value)" class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm">
                            <option value="dashboard">Dashboard</option>
                            <option value="technical">Technical</option>
                            <option value="ai-insights">AI Insights</option>
                            <option value="alerts">Alerts</option>
                        </select>
                    </div>
                </div>
            </div>
        </nav>

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
            <!-- Dashboard View (Default) -->
            <div id="view-dashboard" class="page-view active">
                <!-- Market Stats -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="stat-card scale-in" style="animation-delay: 0.1s">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">Total Breakout</p>
                                <p class="text-4xl font-black text-gray-800" id="totalBreakout">0</p>
                            </div>
                            <div class="stat-icon gradient-info">
                                <i class="fas fa-rocket text-white"></i>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card scale-in" style="animation-delay: 0.2s">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">Buy Signals</p>
                                <p class="text-4xl font-black text-green-600" id="totalBuy">0</p>
                            </div>
                            <div class="stat-icon gradient-success">
                                <i class="fas fa-arrow-trend-up text-white"></i>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card scale-in" style="animation-delay: 0.3s">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">Sell Signals</p>
                                <p class="text-4xl font-black text-red-600" id="totalSell">0</p>
                            </div>
                            <div class="stat-icon gradient-danger">
                                <i class="fas fa-arrow-trend-down text-white"></i>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card scale-in" style="animation-delay: 0.4s">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">News Updates</p>
                                <p class="text-4xl font-black text-purple-600" id="totalNews">0</p>
                            </div>
                            <div class="stat-icon gradient-purple">
                                <i class="fas fa-newspaper text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Breakout Stocks Section -->
            <section class="mb-10">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-3xl font-black text-gray-800 flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white">
                                <i class="fas fa-fire"></i>
                            </div>
                            NSE F&O Breakout Stocks
                        </h2>
                        <p class="text-gray-500 text-sm ml-13">This week's trending momentum stocks</p>
                    </div>
                    <span class="badge-modern gradient-info text-white">
                        <i class="fas fa-rocket"></i>
                        <span id="breakoutCount">0</span> Stocks
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="breakoutStocks">
                    <!-- Cards will be dynamically inserted here -->
                </div>
            </section>

            <!-- Brokerage Recommendations Section -->
            <section class="mb-10">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-3xl font-black text-gray-800 flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                                <i class="fas fa-building-columns"></i>
                            </div>
                            Leading Brokerage Recommendations
                        </h2>
                        <p class="text-gray-500 text-sm ml-13">Expert analyst picks and targets</p>
                    </div>
                    <span class="badge-modern gradient-primary text-white">
                        <i class="fas fa-star"></i>
                        <span id="brokerageCount">0</span> Picks
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="brokerageRecommendations">
                    <!-- Cards will be dynamically inserted here -->
                </div>
            </section>

            <!-- News Headlines Section -->
            <section class="mb-10">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-3xl font-black text-gray-800 flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                                <i class="fas fa-newspaper"></i>
                            </div>
                            Latest Market News
                        </h2>
                        <p class="text-gray-500 text-sm ml-13">Breaking news and market updates</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="newsHeadlines">
                    <!-- Cards will be dynamically inserted here -->
                </div>
            </section>

            <!-- Social Sentiment Section -->
            <section>
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-3xl font-black text-gray-800 flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                                <i class="fab fa-twitter"></i>
                            </div>
                            Trending on Social Media
                        </h2>
                        <p class="text-gray-500 text-sm ml-13">Most discussed stocks on Twitter, Reddit & StockTwits</p>
                    </div>
                </div>
                <div class="glass-card rounded-2xl p-6 mb-6">
                    <p class="text-sm text-gray-600 flex items-center gap-2">
                        <i class="fas fa-info-circle text-blue-500"></i>
                        Social sentiment tracked from Twitter/X, Reddit (r/IndianStreetBets, r/IndianStockMarket) and StockTwits
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="trendingStocks">
                    <!-- Cards will be dynamically inserted here -->
                </div>
            </section>
            </div>
            <!-- End Dashboard View -->

            <!-- Technical Analysis View -->
            <div id="view-technical" class="page-view">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-chart-line text-teal-600 mr-3"></i>
                        Technical Analysis
                    </h2>
                    <p class="text-gray-600">Advanced technical indicators including breakout detection, volume analysis, pattern recognition, and momentum indicators.</p>
                    
                    <!-- Test Chart Button -->
                    <div class="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                        <p class="text-sm text-gray-700 mb-2"><strong>🧪 Chart Test:</strong> Click the button below to test if the chart modal appears.</p>
                        <button 
                            onclick="window.showChart('RELIANCE', {name: 'Reliance Industries Ltd'})" 
                            class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition font-semibold shadow-lg">
                            <i class="fas fa-chart-candlestick mr-2"></i>
                            🧪 Test Chart Modal (RELIANCE)
                        </button>
                        <script>
                            // Debug info
                            setTimeout(() => {
                                console.log('=== Chart Debug Info ===');
                                console.log('Plotly loaded:', typeof Plotly);
                                console.log('TradingView loaded:', typeof TradingView);
                                console.log('chartManager:', typeof window.chartManager);
                                console.log('showChart:', typeof window.showChart);
                                if (typeof window.chartManager !== 'undefined') {
                                    console.log('✅ Chart system ready!');
                                } else {
                                    console.error('❌ Chart system NOT ready!');
                                }
                            }, 3000);
                        </script>
                    </div>
                </div>

                <!-- Technical Analysis Cards -->
                <div id="technicalStocks" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Technical cards will be inserted here by JavaScript -->
                </div>
            </div>
            <!-- End Technical View -->

            <!-- AI Insights View -->
            <div id="view-ai-insights" class="page-view">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-robot text-purple-600 mr-3"></i>
                        AI Insights
                    </h2>
                    <p class="text-gray-600">AI-powered market analysis, top picks, and intelligent recommendations.</p>
                </div>

                <div id="aiInsightsContent">
                    <!-- AI Insights will be rendered here -->
                </div>
            </div>
            <!-- End AI Insights View -->

            <!-- Alerts View -->
            <div id="view-alerts" class="page-view">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-bell text-red-600 mr-3"></i>
                        Smart Alerts
                    </h2>
                    <p class="text-gray-600">Real-time alerts for high-potential opportunities and market movers.</p>
                </div>

                <div id="alertsContent">
                    <!-- Alerts will be rendered here -->
                </div>
            </div>
            <!-- End Alerts View -->
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
        <script src="/static/charts.js"></script>
        <script src="/static/app.js"></script>
        <script>
            // Trigger AI Update - Main function called from frontend button
            async function triggerAIUpdate() {
                try {
                    // Call the API endpoint to request update
                    const response = await axios.post('/api/trigger-update');
                    const data = response.data;
                    
                    if (data.success) {
                        // Copy command to clipboard automatically
                        const command = data.instructions.command;
                        await navigator.clipboard.writeText(command);
                        
                        // Open GenSpark AI in new tab
                        window.open(data.aiChatUrl, '_blank');
                        
                        // Show success modal with instructions
                        showAIUpdateModal(data);
                    }
                } catch (error) {
                    console.error('Error triggering AI update:', error);
                    alert('Error triggering update. Please try manually.');
                }
            }

            // Show AI Update Modal with instructions
            function showAIUpdateModal(data) {
                const modalHTML = \`
                    <div id="aiUpdateModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg max-w-lg w-full">
                            <div class="p-6">
                                <div class="text-center mb-6">
                                    <div class="inline-block bg-gradient-to-r from-green-600 to-green-700 rounded-full p-4 mb-4">
                                        <i class="fas fa-robot text-white text-4xl"></i>
                                    </div>
                                    <h2 class="text-2xl font-bold text-gray-800 mb-2">
                                        AI Update Triggered!
                                    </h2>
                                    <p class="text-gray-600">GenSpark AI has opened in a new tab</p>
                                </div>

                                <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
                                    <div class="flex items-start mb-3">
                                        <i class="fas fa-check-circle text-green-600 text-2xl mr-3 mt-1"></i>
                                        <div>
                                            <h3 class="font-bold text-gray-800 mb-1">Command Copied!</h3>
                                            <p class="text-sm text-gray-700">The update command has been copied to your clipboard.</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="bg-white border-2 border-purple-200 rounded-lg p-4 mb-4">
                                    <h3 class="font-bold text-gray-800 mb-2">📋 Next Steps:</h3>
                                    <ol class="list-decimal list-inside space-y-2 text-gray-700 text-sm">
                                        <li>Go to the <strong>GenSpark AI tab</strong> (just opened)</li>
                                        <li><strong>Paste</strong> the command (Ctrl+V or Cmd+V)</li>
                                        <li><strong>Press Send</strong></li>
                                        <li>Wait <strong>\${data.estimatedTime}</strong> for AI to complete</li>
                                        <li>Come back and <strong>refresh this page</strong></li>
                                    </ol>
                                </div>

                                <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                                    <p class="text-xs text-gray-700">
                                        <i class="fas fa-info-circle text-yellow-600 mr-1"></i>
                                        <strong>Command in clipboard:</strong> "\${data.instructions.command}"
                                    </p>
                                </div>

                                <div class="flex gap-3">
                                    <button onclick="closeAIUpdateModal()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded">
                                        Got It!
                                    </button>
                                    <button onclick="window.open('\${data.aiChatUrl}', '_blank')" class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded">
                                        <i class="fas fa-external-link-alt mr-1"></i> Open AI Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                \`;
                
                document.body.insertAdjacentHTML('beforeend', modalHTML);
            }

            // Close AI Update Modal
            function closeAIUpdateModal() {
                const modal = document.getElementById('aiUpdateModal');
                if (modal) {
                    modal.remove();
                }
            }

            // Switch between views
            function switchView(viewName) {
                console.log('Switching to view:', viewName);
                
                // Hide all views
                document.querySelectorAll('.page-view').forEach(view => {
                    view.classList.remove('active');
                });
                
                // Show selected view
                const selectedView = document.getElementById('view-' + viewName);
                if (selectedView) {
                    selectedView.classList.add('active');
                }
                
                // Update navigation buttons
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                const activeNavItem = document.querySelector(\`.nav-item[data-view="\${viewName}"]\`);
                if (activeNavItem) {
                    activeNavItem.classList.add('active');
                }
                
                // Update dropdown selector
                const viewSelector = document.getElementById('viewSelector');
                if (viewSelector) {
                    viewSelector.value = viewName;
                }
                
                // Load data for specific views
                if (viewName === 'technical') {
                    loadTechnicalAnalysis();
                } else if (viewName === 'ai-insights') {
                    loadAIInsights();
                } else if (viewName === 'alerts') {
                    loadAlerts();
                }
            }

            // Load technical analysis data
            async function loadTechnicalAnalysis() {
                const container = document.getElementById('technicalStocks');
                if (!container) return;
                
                container.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i></div>';
                
                try {
                    const response = await axios.get('/api/technical/analyze');
                    if (response.data.success) {
                        const stocks = response.data.stocks;
                        
                        // Sort by technical score
                        stocks.sort((a, b) => (b.technical?.overallScore || 0) - (a.technical?.overallScore || 0));
                        
                        container.innerHTML = stocks.map(stock => {
                            const tech = stock.technical || {};
                            const symbol = stock.symbol || stock.stock;
                            const name = stock.name || stock.company || symbol;
                            
                            // Determine card border color based on recommendation
                            let borderColor = 'border-gray-200';
                            if (tech.recommendation === 'STRONG_BUY') borderColor = 'border-green-500 border-2';
                            else if (tech.recommendation === 'BUY') borderColor = 'border-teal-400 border-2';
                            else if (tech.recommendation === 'WATCH') borderColor = 'border-yellow-400';
                            
                            return \`
                                <div class="bg-white rounded-lg shadow-lg \${borderColor} p-6 card-hover">
                                    <div class="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 class="text-xl font-bold text-gray-800">\${symbol}</h3>
                                            <p class="text-sm text-gray-600">\${name}</p>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-2xl font-bold text-teal-600">\${tech.overallScore || 0}/100</div>
                                            <div class="text-xs text-gray-500">Score</div>
                                        </div>
                                    </div>
                                    
                                    <!-- Breakout Badge -->
                                    \${tech.breakout?.detected ? \`
                                        <div class="mb-3 px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full text-xs font-bold inline-block">
                                            <i class="fas fa-arrow-trend-up mr-1"></i>
                                            \${tech.breakout.type} - Score: \${tech.breakout.score}
                                        </div>
                                    \` : ''}
                                    
                                    <!-- Pattern Badge -->
                                    \${tech.pattern?.detected ? \`
                                        <div class="mb-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold inline-block ml-2">
                                            <i class="fas fa-chart-line mr-1"></i>
                                            \${tech.pattern.type}
                                        </div>
                                    \` : ''}
                                    
                                    <!-- Technical Indicators Grid -->
                                    <div class="grid grid-cols-2 gap-3 mb-4">
                                        <div class="bg-gray-50 rounded p-2">
                                            <div class="text-xs text-gray-600">Volume</div>
                                            <div class="font-bold text-\${tech.volume?.level === 'HIGH' ? 'green' : tech.volume?.level === 'MEDIUM' ? 'yellow' : 'gray'}-600">
                                                \${tech.volume?.level || 'N/A'}
                                            </div>
                                            <div class="text-xs text-gray-500">\${tech.volume?.score || 0}/100</div>
                                        </div>
                                        
                                        <div class="bg-gray-50 rounded p-2">
                                            <div class="text-xs text-gray-600">RSI</div>
                                            <div class="font-bold text-\${tech.indicators?.rsi > 70 ? 'red' : tech.indicators?.rsi < 30 ? 'green' : 'gray'}-600">
                                                \${tech.indicators?.rsi || 'N/A'}
                                            </div>
                                            <div class="text-xs text-gray-500">\${tech.indicators?.rsi > 70 ? 'Overbought' : tech.indicators?.rsi < 30 ? 'Oversold' : 'Neutral'}</div>
                                        </div>
                                        
                                        <div class="bg-gray-50 rounded p-2">
                                            <div class="text-xs text-gray-600">Momentum</div>
                                            <div class="font-bold text-teal-600">\${tech.indicators?.momentum || 0}/100</div>
                                        </div>
                                        
                                        <div class="bg-gray-50 rounded p-2">
                                            <div class="text-xs text-gray-600">Trend</div>
                                            <div class="font-bold text-teal-600">\${tech.indicators?.trendStrength || 0}/100</div>
                                        </div>
                                    </div>
                                    
                                    <!-- Recommendation -->
                                    <div class="mt-4 p-3 rounded \${
                                        tech.recommendation === 'STRONG_BUY' ? 'bg-green-100 text-green-800' :
                                        tech.recommendation === 'BUY' ? 'bg-teal-100 text-teal-800' :
                                        tech.recommendation === 'WATCH' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }">
                                        <div class="font-bold flex items-center justify-between">
                                            <span>\${tech.recommendation || 'HOLD'}</span>
                                            <span class="text-sm">\${tech.confidence || 0}% confidence</span>
                                        </div>
                                        \${tech.reason ? \`<div class="text-xs mt-1">\${tech.reason}</div>\` : ''}
                                    </div>
                                </div>
                            \`;
                        }).join('');
                    }
                } catch (error) {
                    console.error('Error loading technical analysis:', error);
                    container.innerHTML = '<div class="col-span-full text-center py-8 text-red-600">Error loading technical data</div>';
                }
            }

            // Load AI insights
            async function loadAIInsights() {
                const container = document.getElementById('aiInsightsContent');
                if (!container) return;
                
                container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i></div>';
                
                try {
                    const [summaryRes, picksRes] = await Promise.all([
                        axios.get('/api/ai/summary'),
                        axios.get('/api/ai/top-picks')
                    ]);
                    
                    const summary = summaryRes.data;
                    const picks = picksRes.data.picks || [];
                    
                    container.innerHTML = \`
                        <!-- Summary Card -->
                        <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-6 mb-6">
                            <h3 class="text-2xl font-bold mb-4 flex items-center">
                                <i class="fas fa-chart-pie mr-3"></i>
                                Market Summary
                            </h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div class="text-3xl font-bold">\${summary.totalStocks}</div>
                                    <div class="text-sm opacity-90">Total Stocks</div>
                                </div>
                                <div>
                                    <div class="text-3xl font-bold">\${summary.marketSentiment}</div>
                                    <div class="text-sm opacity-90">Sentiment</div>
                                </div>
                                <div>
                                    <div class="text-3xl font-bold">\${summary.averageUpside}%</div>
                                    <div class="text-sm opacity-90">Avg Upside</div>
                                </div>
                                <div>
                                    <div class="text-3xl font-bold">\${summary.highConfidenceCount}</div>
                                    <div class="text-sm opacity-90">High Confidence</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Top Picks -->
                        <h3 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-star text-yellow-500 mr-3"></i>
                            Top AI Picks
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            \${picks.slice(0, 6).map((pick, index) => \`
                                <div class="bg-white rounded-lg shadow-lg border-2 border-purple-300 p-6">
                                    <div class="flex justify-between items-start mb-3">
                                        <div>
                                            <span class="text-2xl font-bold text-purple-600">#\${index + 1}</span>
                                            <h4 class="text-xl font-bold text-gray-800">\${pick.symbol}</h4>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-2xl font-bold text-green-600">\${pick.upside}%</div>
                                            <div class="text-xs text-gray-500">Upside</div>
                                        </div>
                                    </div>
                                    
                                    <div class="space-y-2 mb-3">
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-600">Risk Level:</span>
                                            <span class="font-bold text-\${pick.riskLevel <= 3 ? 'green' : pick.riskLevel <= 6 ? 'yellow' : 'red'}-600">
                                                \${pick.riskLevel}/10
                                            </span>
                                        </div>
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-600">Momentum:</span>
                                            <span class="font-bold text-teal-600">\${pick.momentum}/10</span>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-purple-50 rounded p-2 text-sm">
                                        <div class="font-semibold text-gray-700">Source:</div>
                                        <div class="text-gray-600">\${pick.source}</div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    \`;
                } catch (error) {
                    console.error('Error loading AI insights:', error);
                    container.innerHTML = '<div class="text-center py-8 text-red-600">Error loading AI insights</div>';
                }
            }

            // Load alerts
            async function loadAlerts() {
                const container = document.getElementById('alertsContent');
                if (!container) return;
                
                container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i></div>';
                
                try {
                    const response = await axios.get('/api/ai/alerts');
                    const alerts = response.data.alerts || [];
                    
                    container.innerHTML = \`
                        <div class="mb-6">
                            <div class="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-lg p-6">
                                <h3 class="text-2xl font-bold mb-2 flex items-center">
                                    <i class="fas fa-exclamation-triangle mr-3"></i>
                                    \${alerts.length} High-Potential Alerts!
                                </h3>
                                <p class="text-white opacity-90">Stocks with strong breakout signals and high momentum</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            \${alerts.map((alert, index) => \`
                                <div class="bg-white rounded-lg shadow-lg border-l-4 border-red-500 p-6">
                                    <div class="flex justify-between items-start mb-3">
                                        <div>
                                            <div class="text-sm text-red-600 font-bold mb-1">ALERT #\${index + 1}</div>
                                            <h4 class="text-xl font-bold text-gray-800">\${alert.symbol}</h4>
                                            <p class="text-sm text-gray-600">\${alert.name}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="space-y-2 mb-3">
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-600">Upside:</span>
                                            <span class="font-bold text-green-600">\${alert.upside}%</span>
                                        </div>
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-600">Risk:</span>
                                            <span class="font-bold text-green-600">\${alert.riskLevel}/10</span>
                                        </div>
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-600">Momentum:</span>
                                            <span class="font-bold text-teal-600">\${alert.momentum}/10</span>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-red-50 rounded p-2 text-sm text-gray-700">
                                        \${alert.reason || 'Strong technical setup'}
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    \`;
                } catch (error) {
                    console.error('Error loading alerts:', error);
                    container.innerHTML = '<div class="text-center py-8 text-red-600">Error loading alerts</div>';
                }
            }

            // Show update instructions modal (legacy)
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

            // NSE F&O Stock List (Top 175+ stocks with F&O available)
            const fnoStocks = new Set([
                'ICICIBANK', 'HDFCBANK', 'SBIN', 'AXISBANK', 'KOTAKBANK', 'INDUSINDBK', 'BANKBARODA', 'PNB', 'IDFCFIRSTB', 'FEDERALBNK',
                'TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM', 'LTIM', 'COFORGE', 'PERSISTENT', 'MPHASIS',
                'RELIANCE', 'ONGC', 'BPCL', 'IOC', 'HINDPETRO', 'GAIL', 'ADANIGREEN', 'ADANIPORTS', 'ADANIENT', 'ADANITRANS',
                'TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'VEDL', 'SAIL', 'JINDALSTEL', 'COALINDIA', 'NMDC',
                'MARUTI', 'M&M', 'TATAMOTORS', 'BAJAJ-AUTO', 'EICHERMOT', 'HEROMOTOCO', 'TVSMOTOR', 'ASHOKLEY', 'ESCORTS',
                'BHARTIARTL', 'IDEA', 'INDIGO', 'ITC', 'TITAN', 'DABUR', 'BRITANNIA', 'NESTLEIND', 'MARICO', 'TATACONSUM', 'UBL', 'GODREJCP',
                'ASIANPAINT', 'PIDILITIND', 'BERGER', 'KANSAINER',
                'LT', 'SIEMENS', 'ABB', 'HAVELLS', 'CROMPTON', 'VOLTAS', 'CUMMINSIND', 'BOSCHLTD',
                'APOLLOHOSP', 'DRREDDY', 'CIPLA', 'SUNPHARMA', 'DIVISLAB', 'BIOCON', 'AUROPHARMA', 'LUPIN', 'TORNTPHARM',
                'BAJFINANCE', 'BAJAJFINSV', 'CHOLAFIN', 'SBILIFE', 'HDFCLIFE', 'ICICIPRULI', 'LICHSGFIN', 'MUTHOOTFIN',
                'ULTRACEMCO', 'AMBUJACEM', 'GRASIM', 'ACC', 'SHREECEM', 'RAMCOCEM',
                'DLF', 'GODREJPROP', 'OBEROIRLTY', 'PHOENIXLTD', 'PRESTIGE', 'BRIGADE', 'LODHA',
                'TRENT', 'DMART', 'PAGEIND', 'JUBLFOOD', 'ABFRL', 'APLAPOLLO',
                'ZOMATO', 'NYKAA', 'PVR', 'INOXLEISUR',
                'POWERGRID', 'NTPC', 'TATAPOWER', 'ADANIPOWER', 'RECLTD', 'PFC',
                'SUNTV', 'ZEEL', 'STAR',
                'VRL', 'CONCOR', 'GESHIP', 'APSEZ',
                'IGL', 'MGL', 'GUJGASLTD',
                'ASTRAL', 'POLYCAB', 'KEI', 'GUJGASLTD',
                'MCDOWELL-N', 'RADICO', 'DELTACORP',
                'COLPAL', 'HINDUNILVR', 'EMAMILTD',
                'GROWW', 'PAYTM', 'POLICYBZR'
            ]);

            function isFNO(symbol) {
                return fnoStocks.has(symbol);
            }

            function getFNOBadge(symbol) {
                if (isFNO(symbol)) {
                    return '<span class="badge-modern gradient-success text-white text-xs px-2 py-1"><i class="fas fa-chart-line mr-1"></i>F&O</span>';
                } else {
                    return '<span class="badge-modern bg-gray-300 text-gray-700 text-xs px-2 py-1"><i class="fas fa-ban mr-1"></i>Cash</span>';
                }
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
                        <div class="premium-card p-6 card-animate" data-symbol="\${stock.symbol}">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-xl font-bold text-gray-800">\${stock.name}</h3>
                                    <p class="text-gray-500 text-sm">\${stock.symbol}</p>
                                </div>
                                <div class="flex flex-col gap-2 items-end">
                                    \${getFNOBadge(stock.symbol)}
                                    <span class="badge-modern gradient-success text-white text-xs px-3 py-1 rounded-full">
                                        \${stock.recommendation}
                                    </span>
                                </div>
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
                                    \${stock.socialSentiment.twitter.keywords ? stock.socialSentiment.twitter.keywords.slice(0, 3).join(', ') : 'N/A'}
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
                        <div class="premium-card p-6 card-animate" data-symbol="\${rec.symbol}">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-xl font-bold text-gray-800">\${rec.name}</h3>
                                    <p class="text-gray-500 text-sm">\${rec.symbol}</p>
                                </div>
                                <div class="flex flex-col gap-2 items-end">
                                    \${getFNOBadge(rec.symbol)}
                                    <span class="\${rec.recommendation === 'BUY' ? 'badge-modern gradient-success' : 'badge-modern gradient-danger'} 
                                                 text-white text-xs px-3 py-1 rounded-full">
                                        \${rec.recommendation}
                                    </span>
                                </div>
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
                                    Read full report on \${rec.sourceUrl.includes('livemint') ? 'LiveMint' : 
                                                          rec.sourceUrl.includes('economictimes') ? 'Economic Times' : 
                                                          rec.sourceUrl.includes('moneycontrol') ? 'MoneyControl' : 
                                                          rec.sourceUrl.includes('motilaloswal') ? 'Motilal Oswal' : 
                                                          'Source'}
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
                            <div class="premium-card p-6 card-animate border-l-4 border-\${stock.sentiment === 'Bullish' ? 'green' : stock.sentiment === 'Bearish' ? 'red' : 'yellow'}-500" data-symbol="\${stock.symbol}">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="text-2xl font-bold text-gray-400">#\${stock.rank}</span>
                                            <h3 class="text-lg font-bold text-gray-800">\${stock.name}</h3>
                                        </div>
                                        <p class="text-gray-500 text-sm">\${stock.symbol}</p>
                                    </div>
                                    <div class="flex flex-col gap-2 items-end">
                                        \${getFNOBadge(stock.symbol)}
                                        <span class="badge-modern gradient-\${stock.sentiment === 'Bullish' ? 'success' : stock.sentiment === 'Bearish' ? 'danger' : 'warning'} text-white">
                                            \${stock.sentiment} \${stock.sentiment === 'Bullish' ? '📈' : stock.sentiment === 'Bearish' ? '📉' : '➡️'}
                                        </span>
                                    </div>
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
                                        <strong>Keywords:</strong> \${stock.keywords ? stock.keywords.join(', ') : 'N/A'}
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

                    // Update last updated time to IST
                    const lastUpdate = new Date(data.lastUpdated);
                    const istTime = lastUpdate.toLocaleString('en-IN', { 
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    });
                    document.getElementById('lastUpdated').textContent = istTime + ' IST';

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
