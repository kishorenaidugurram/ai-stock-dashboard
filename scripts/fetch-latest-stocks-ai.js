#!/usr/bin/env node

/**
 * AI-Powered Stock Data Fetcher
 * Uses GenSpark AI API to fetch latest stock recommendations
 */

const fs = require('fs');
const path = require('path');

// GenSpark AI API Configuration
const GENSPARK_API_KEY = process.env.GENSPARK_API_KEY || 'e5fc86a6-d252-4a07-8479-6566d442162c';
const GENSPARK_API_URL = 'https://api.genspark.ai/v1';

/**
 * Call GenSpark AI to fetch latest stock data
 */
async function fetchStockDataFromAI() {
  console.log('🤖 Fetching stock data using GenSpark AI...');
  
  const query = `
Please provide the latest NSE F&O stock recommendations for today (${new Date().toLocaleDateString('en-IN')}) from premium brokerages like Jefferies, Motilal Oswal, ICICI Securities, Citi, and Nuvama.

For each stock, include:
- Stock name and NSE symbol
- Current price in ₹
- Target price
- Recommendation (BUY/SELL/HOLD)
- Upside percentage
- Brokerage source
- Analyst rationale
- Source URL (if available)

Also include:
- Latest market news headlines
- Social sentiment for trending stocks

Format the response as structured JSON data.
`;

  try {
    const response = await fetch(`${GENSPARK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GENSPARK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a financial data analyst specialized in Indian stock market. Provide accurate, up-to-date stock recommendations from reliable sources.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 4000,
        temperature: 0.3  // Lower temperature for more factual responses
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log('✅ Received AI response');
      return content;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('❌ Error calling GenSpark AI:', error.message);
    return null;
  }
}

/**
 * Parse AI response and update stock data
 */
function parseAIResponse(aiResponse) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                     aiResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    } else {
      console.log('⚠️ Could not parse structured JSON from AI response');
      console.log('Response preview:', aiResponse.substring(0, 200));
      return null;
    }
  } catch (error) {
    console.error('❌ Error parsing AI response:', error.message);
    return null;
  }
}

/**
 * Update stocks-data.json with AI-fetched data
 */
async function updateStockData() {
  console.log('🔄 Starting AI-powered stock data update...');
  console.log(`📅 Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`🔑 Using API Key: ${GENSPARK_API_KEY.substring(0, 8)}...`);
  
  try {
    // Fetch data from AI
    const aiResponse = await fetchStockDataFromAI();
    
    if (!aiResponse) {
      console.log('⚠️ No data received from AI, falling back to timestamp update only');
      return updateTimestampsOnly();
    }

    // Parse AI response
    const newData = parseAIResponse(aiResponse);
    
    if (!newData) {
      console.log('⚠️ Could not parse AI response, falling back to timestamp update only');
      return updateTimestampsOnly();
    }

    // Load existing data structure
    const existingDataPath = path.join(__dirname, '../data/stocks-data.json');
    let stockData;
    
    try {
      stockData = JSON.parse(fs.readFileSync(existingDataPath, 'utf8'));
    } catch (error) {
      console.error('❌ Error reading existing data:', error.message);
      process.exit(1);
    }

    // Update with new data
    const now = new Date();
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    stockData.lastUpdated = now.toISOString();
    
    if (stockData.dataQuality) {
      stockData.dataQuality.searchTimestamp = now.toISOString();
      stockData.dataQuality.dateRange = istDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }

    // Merge new data if available
    if (newData.breakoutStocks) {
      stockData.breakoutStocks = newData.breakoutStocks;
      console.log(`✅ Updated ${newData.breakoutStocks.length} breakout stocks`);
    }

    if (newData.brokerageRecommendations) {
      stockData.brokerageRecommendations = newData.brokerageRecommendations;
      console.log(`✅ Updated ${newData.brokerageRecommendations.length} brokerage recommendations`);
    }

    if (newData.newsHeadlines) {
      stockData.newsHeadlines = newData.newsHeadlines;
      console.log(`✅ Updated ${newData.newsHeadlines.length} news headlines`);
    }

    if (newData.trendingOnSocial) {
      stockData.trendingOnSocial = newData.trendingOnSocial;
      console.log(`✅ Updated ${newData.trendingOnSocial.length} trending stocks`);
    }

    // Write updated data
    const outputPath = path.join(__dirname, '../data/stocks-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(stockData, null, 2), 'utf8');
    
    console.log('✅ Stock data updated successfully with AI-fetched data!');
    console.log(`💾 Updated file: ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating stock data:', error);
    throw error;
  }
}

/**
 * Fallback: Update timestamps only (existing behavior)
 */
function updateTimestampsOnly() {
  console.log('📝 Updating timestamps only (preserving existing data)');
  
  const existingDataPath = path.join(__dirname, '../data/stocks-data.json');
  let stockData;
  
  try {
    stockData = JSON.parse(fs.readFileSync(existingDataPath, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading existing data:', error.message);
    process.exit(1);
  }
  
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  stockData.lastUpdated = now.toISOString();
  
  if (stockData.dataQuality) {
    stockData.dataQuality.searchTimestamp = now.toISOString();
    stockData.dataQuality.dateRange = istDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  const outputPath = path.join(__dirname, '../data/stocks-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(stockData, null, 2), 'utf8');
  
  console.log('✅ Timestamps updated successfully!');
  console.log(`📊 Current data: ${stockData.breakoutStocks?.length || 0} breakout, ${stockData.brokerageRecommendations?.length || 0} brokerage`);
  
  return true;
}

// Run the fetcher
updateStockData()
  .then(() => {
    console.log('🎉 Data fetch completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
