/**
 * AI Trading Edge Features
 * Powered by GenSpark AI API
 */

export class TradingEdgeAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.genspark.ai/v1';
  }

  /**
   * Analyze stock and provide AI insights
   */
  analyzeStock(stock) {
    try {
      const riskScore = this.calculateRiskScore(stock);
      const momentum = this.calculateMomentum(stock);
      const sentiment = this.analyzeSentiment(stock);
      const confidence = this.calculateConfidence(stock);
      
      let recommendation = 'HOLD';

      // Determine recommendation based on analysis
      if (riskScore < 3 && momentum > 7 && sentiment === 'bullish') {
        recommendation = 'STRONG BUY';
      } else if (riskScore < 5 && momentum > 5) {
        recommendation = 'BUY';
      } else if (riskScore > 7 || momentum < 3) {
        recommendation = 'AVOID';
      }

      return {
        riskScore,
        momentum,
        sentiment,
        confidence,
        recommendation
      };
    } catch (error) {
      console.error('Error analyzing stock:', error);
      return {
        riskScore: 5,
        momentum: 5,
        sentiment: 'neutral',
        confidence: 5,
        recommendation: 'HOLD'
      };
    }
  }

  /**
   * Calculate risk score (0-10, lower is better)
   */
  calculateRiskScore(stock) {
    let score = 5; // Base score

    // Adjust based on upside potential
    const upside = this.parseUpside(stock.upside);
    if (upside < 10) score += 2;
    else if (upside > 25) score -= 2;

    // Adjust based on social sentiment
    if (stock.socialSentiment) {
      const sentimentScore = stock.socialSentiment.score || 5;
      if (sentimentScore > 7) score -= 1;
      else if (sentimentScore < 4) score += 1;
    }

    // Adjust based on brokerage reputation
    const premiumBrokerages = ['Jefferies', 'Citi', 'Nuvama', 'ICICI Securities'];
    if (premiumBrokerages.includes(stock.source)) {
      score -= 1;
    }

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Parse upside from string (e.g., "26.8%" or 26.8)
   */
  parseUpside(upside) {
    if (!upside) return 0;
    if (typeof upside === 'number') return upside;
    if (typeof upside === 'string') {
      return parseFloat(upside.replace('%', '')) || 0;
    }
    return 0;
  }

  /**
   * Calculate momentum indicator (0-10, higher is better)
   */
  calculateMomentum(stock) {
    let momentum = 5;

    // Based on upside potential
    const upside = this.parseUpside(stock.upside);
    if (upside > 30) momentum += 3;
    else if (upside > 20) momentum += 2;
    else if (upside > 10) momentum += 1;

    // Based on social sentiment
    if (stock.socialSentiment) {
      const sentiment = stock.socialSentiment.sentiment;
      if (sentiment === 'bullish') momentum += 2;
      else if (sentiment === 'bearish') momentum -= 2;
    }

    // Based on recommendation strength
    if (stock.recommendation === 'BUY') momentum += 1;
    else if (stock.recommendation === 'STRONG BUY') momentum += 2;

    return Math.max(0, Math.min(10, momentum));
  }

  /**
   * Analyze sentiment from various sources
   */
  analyzeSentiment(stock) {
    if (stock.socialSentiment) {
      return stock.socialSentiment.sentiment || 'neutral';
    }
    
    // Default sentiment based on upside
    const upside = this.parseUpside(stock.upside);
    if (upside > 20) return 'bullish';
    if (upside < 5) return 'bearish';
    return 'neutral';
  }

  /**
   * Calculate confidence level (0-10)
   */
  calculateConfidence(stock) {
    let confidence = 5;

    // Premium brokerages get higher confidence
    const premiumBrokerages = ['Jefferies', 'Citi', 'Nuvama', 'ICICI Securities', 'Motilal Oswal'];
    if (premiumBrokerages.includes(stock.source)) {
      confidence += 2;
    }

    // Higher upside with analyst = higher confidence
    if (stock.analyst && stock.upside > 15) {
      confidence += 1;
    }

    // Social sentiment alignment
    if (stock.socialSentiment && stock.socialSentiment.score > 7) {
      confidence += 1;
    }

    return Math.max(0, Math.min(10, confidence));
  }

  /**
   * Generate daily market summary
   */
  generateDailySummary(stocks) {
    const topPicks = stocks
      .map(stock => ({
        ...stock,
        analysis: this.analyzeStock(stock)
      }))
      .filter(s => s.analysis.recommendation === 'STRONG BUY' || s.analysis.recommendation === 'BUY')
      .sort((a, b) => {
        // Sort by risk score (lower first) then momentum (higher first)
        if (a.analysis.riskScore !== b.analysis.riskScore) {
          return a.analysis.riskScore - b.analysis.riskScore;
        }
        return b.analysis.momentum - a.analysis.momentum;
      })
      .slice(0, 5);

    const summary = {
      date: new Date().toISOString().split('T')[0],
      totalStocks: stocks.length,
      topPicks: topPicks,
      marketSentiment: this.calculateOverallSentiment(stocks),
      averageUpside: this.calculateAverageUpside(stocks),
      highConfidenceCount: stocks.filter(s => this.calculateConfidence(s) >= 7).length
    };

    return summary;
  }

  calculateOverallSentiment(stocks) {
    const bullishCount = stocks.filter(s => {
      const sentiment = this.analyzeSentiment(s);
      return sentiment === 'bullish';
    }).length;

    const ratio = bullishCount / stocks.length;
    if (ratio > 0.6) return 'Strongly Bullish';
    if (ratio > 0.4) return 'Moderately Bullish';
    if (ratio > 0.3) return 'Neutral';
    return 'Cautious';
  }

  calculateAverageUpside(stocks) {
    const total = stocks.reduce((sum, s) => sum + this.parseUpside(s.upside), 0);
    return (total / stocks.length).toFixed(1);
  }

  /**
   * Check if stock meets alert criteria
   */
  shouldAlert(stock, criteria = {}) {
    const {
      minUpside = 15,
      maxRiskScore = 5,
      minMomentum = 6,
      requiredSentiment = ['bullish']
    } = criteria;

    const analysis = this.analyzeStock(stock);
    const upside = this.parseUpside(stock.upside);

    return (
      upside >= minUpside &&
      analysis.riskScore <= maxRiskScore &&
      analysis.momentum >= minMomentum &&
      requiredSentiment.includes(analysis.sentiment)
    );
  }
}

export default TradingEdgeAI;
