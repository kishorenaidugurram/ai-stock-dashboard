// Technical Analysis Module
// Converted from Streamlit scanner Python code to JavaScript
// Provides breakout detection, volume analysis, support/resistance, and pattern detection

export class TechnicalAnalysis {
    constructor() {
        this.lookbackDays = 20;
        this.minVolumeRatio = 2.0;
    }

    /**
     * Detect current day breakout
     * Based on resistance breakthrough with volume confirmation
     */
    detectBreakout(stock) {
        try {
            // Mock historical data for now - in production this would come from Yahoo Finance API
            // For MVP, we'll use the upside percentage as a proxy for breakout strength
            
            const upsideValue = parseFloat(stock.upside);
            if (isNaN(upsideValue)) return null;

            // Estimate breakout strength based on upside percentage
            let breakoutScore = 0;
            let hasBreakout = false;

            if (upsideValue >= 25) {
                breakoutScore = 85;
                hasBreakout = true;
            } else if (upsideValue >= 20) {
                breakoutScore = 75;
                hasBreakout = true;
            } else if (upsideValue >= 15) {
                breakoutScore = 65;
                hasBreakout = true;
            } else if (upsideValue >= 10) {
                breakoutScore = 50;
                hasBreakout = false;
            }

            if (!hasBreakout) return null;

            return {
                detected: true,
                score: breakoutScore,
                type: 'RESISTANCE_BREAKOUT',
                upsideTarget: upsideValue,
                confidence: this._getConfidenceLevel(breakoutScore)
            };
        } catch (error) {
            console.error('Breakout detection error:', error);
            return null;
        }
    }

    /**
     * Analyze volume characteristics
     */
    analyzeVolume(stock) {
        try {
            // Estimate volume strength based on available data
            const upsideValue = parseFloat(stock.upside);
            const sentiment = stock.socialSentiment?.overall;

            let volumeScore = 50; // Default medium volume
            let volumeLevel = 'MEDIUM';

            // High upside usually comes with volume
            if (upsideValue >= 20) {
                volumeScore = 85;
                volumeLevel = 'HIGH';
            } else if (upsideValue >= 15) {
                volumeScore = 70;
                volumeLevel = 'ABOVE_AVERAGE';
            } else if (upsideValue >= 10) {
                volumeScore = 55;
                volumeLevel = 'MEDIUM';
            }

            // Social sentiment boost
            if (sentiment === 'Bullish') {
                volumeScore += 10;
                if (volumeLevel === 'MEDIUM') volumeLevel = 'ABOVE_AVERAGE';
            }

            return {
                score: Math.min(volumeScore, 100),
                level: volumeLevel,
                ratio: volumeScore / 50, // Normalized ratio
                interpretation: this._getVolumeInterpretation(volumeLevel)
            };
        } catch (error) {
            console.error('Volume analysis error:', error);
            return null;
        }
    }

    /**
     * Calculate support and resistance levels
     */
    calculateSupportResistance(stock) {
        try {
            const currentPrice = parseFloat(stock.price) || parseFloat(stock.targetPrice);
            const targetPrice = parseFloat(stock.targetPrice || stock.target);
            const upsideValue = parseFloat(stock.upside);

            if (isNaN(currentPrice) || isNaN(targetPrice)) return null;

            // Calculate approximate levels
            const priceRange = targetPrice - currentPrice;
            const supportLevel = currentPrice * 0.95; // 5% below current
            const resistanceLevel = currentPrice + (priceRange * 0.5); // Midpoint
            const targetLevel = targetPrice;

            // Determine proximity to resistance
            const distanceToResistance = ((resistanceLevel - currentPrice) / currentPrice) * 100;
            
            let proximity = 'FAR';
            if (distanceToResistance < 2) proximity = 'VERY_CLOSE';
            else if (distanceToResistance < 5) proximity = 'CLOSE';
            else if (distanceToResistance < 10) proximity = 'MEDIUM';

            return {
                support: supportLevel.toFixed(2),
                resistance: resistanceLevel.toFixed(2),
                target: targetLevel.toFixed(2),
                current: currentPrice.toFixed(2),
                proximityToResistance: proximity,
                distancePercent: distanceToResistance.toFixed(2),
                breakoutPotential: this._calculateBreakoutPotential(proximity, upsideValue)
            };
        } catch (error) {
            console.error('Support/Resistance calc error:', error);
            return null;
        }
    }

    /**
     * Detect chart patterns
     */
    detectPattern(stock) {
        try {
            const upsideValue = parseFloat(stock.upside);
            const sentiment = stock.socialSentiment?.overall;
            const score = stock.socialSentiment?.score || 5;

            // Pattern detection based on characteristics
            let patterns = [];

            // Cup & Handle pattern (high upside + bullish sentiment + consolidation)
            if (upsideValue >= 20 && sentiment === 'Bullish' && score >= 7) {
                patterns.push({
                    type: 'CUP_AND_HANDLE',
                    confidence: 75,
                    description: 'Bullish continuation pattern with strong sentiment support'
                });
            }

            // Flat Base Breakout (high upside + tight range)
            if (upsideValue >= 15 && upsideValue <= 25) {
                patterns.push({
                    type: 'FLAT_BASE',
                    confidence: 70,
                    description: 'Consolidation near highs, potential breakout'
                });
            }

            // Breakout pattern (very high upside)
            if (upsideValue >= 25) {
                patterns.push({
                    type: 'BREAKOUT',
                    confidence: 85,
                    description: 'Strong breakout with momentum'
                });
            }

            // Consolidation (moderate upside + neutral sentiment)
            if (upsideValue >= 10 && upsideValue < 20 && sentiment !== 'Bearish') {
                patterns.push({
                    type: 'CONSOLIDATION',
                    confidence: 60,
                    description: 'Building base for potential move'
                });
            }

            return patterns.length > 0 ? patterns[0] : null;
        } catch (error) {
            console.error('Pattern detection error:', error);
            return null;
        }
    }

    /**
     * Calculate technical indicators
     */
    calculateIndicators(stock) {
        try {
            const upsideValue = parseFloat(stock.upside);
            const sentiment = stock.socialSentiment?.overall;
            const score = stock.socialSentiment?.score || 5;

            // RSI estimation (0-100 scale)
            let rsi = 50; // Neutral
            if (upsideValue >= 20 && sentiment === 'Bullish') {
                rsi = 70; // Overbought but strong
            } else if (upsideValue >= 15) {
                rsi = 65;
            } else if (upsideValue >= 10) {
                rsi = 55;
            } else if (sentiment === 'Bearish') {
                rsi = 35; // Oversold
            }

            // Momentum score (0-100)
            let momentum = 50;
            if (upsideValue >= 25) momentum = 85;
            else if (upsideValue >= 20) momentum = 75;
            else if (upsideValue >= 15) momentum = 65;
            else if (upsideValue >= 10) momentum = 55;

            // Add social sentiment boost
            if (sentiment === 'Bullish') momentum += 10;
            momentum = Math.min(momentum, 100);

            // Trend strength (0-100)
            const trendStrength = (momentum + rsi) / 2;

            return {
                rsi: Math.round(rsi),
                momentum: Math.round(momentum),
                trendStrength: Math.round(trendStrength),
                signal: this._getTechnicalSignal(rsi, momentum)
            };
        } catch (error) {
            console.error('Indicator calculation error:', error);
            return null;
        }
    }

    /**
     * Comprehensive technical analysis
     */
    analyze(stock) {
        try {
            const breakout = this.detectBreakout(stock);
            const volume = this.analyzeVolume(stock);
            const levels = this.calculateSupportResistance(stock);
            const pattern = this.detectPattern(stock);
            const indicators = this.calculateIndicators(stock);

            return {
                breakout,
                volume,
                levels,
                pattern,
                indicators,
                overallScore: this._calculateOverallScore(breakout, volume, pattern, indicators),
                recommendation: this._generateRecommendation(breakout, volume, pattern, indicators)
            };
        } catch (error) {
            console.error('Technical analysis error:', error);
            return null;
        }
    }

    // ======================================
    // HELPER FUNCTIONS
    // ======================================

    _getConfidenceLevel(score) {
        if (score >= 80) return 'VERY_HIGH';
        if (score >= 70) return 'HIGH';
        if (score >= 60) return 'MEDIUM';
        if (score >= 50) return 'MODERATE';
        return 'LOW';
    }

    _getVolumeInterpretation(level) {
        const interpretations = {
            'HIGH': 'Strong buying interest, potential breakout',
            'ABOVE_AVERAGE': 'Increased activity, bullish momentum',
            'MEDIUM': 'Normal trading activity',
            'BELOW_AVERAGE': 'Weak participation',
            'LOW': 'Minimal interest, caution advised'
        };
        return interpretations[level] || 'Unknown';
    }

    _calculateBreakoutPotential(proximity, upside) {
        let potential = 50;
        
        if (proximity === 'VERY_CLOSE' && upside >= 15) potential = 90;
        else if (proximity === 'VERY_CLOSE') potential = 75;
        else if (proximity === 'CLOSE' && upside >= 15) potential = 80;
        else if (proximity === 'CLOSE') potential = 65;
        else if (proximity === 'MEDIUM' && upside >= 20) potential = 70;
        else if (proximity === 'MEDIUM') potential = 55;

        return Math.min(potential, 100);
    }

    _getTechnicalSignal(rsi, momentum) {
        if (momentum >= 70 && rsi < 75) return 'STRONG_BUY';
        if (momentum >= 60 && rsi < 70) return 'BUY';
        if (momentum >= 50) return 'HOLD';
        if (momentum < 50 && rsi < 35) return 'OVERSOLD';
        return 'NEUTRAL';
    }

    _calculateOverallScore(breakout, volume, pattern, indicators) {
        let score = 50; // Base score

        if (breakout?.detected) score += 20;
        if (volume?.level === 'HIGH') score += 15;
        if (pattern) score += 10;
        if (indicators?.signal === 'STRONG_BUY') score += 10;
        if (indicators?.signal === 'BUY') score += 5;

        return Math.min(score, 100);
    }

    _generateRecommendation(breakout, volume, pattern, indicators) {
        const signal = indicators?.signal || 'NEUTRAL';
        const hasBreakout = breakout?.detected;
        const highVolume = volume?.level === 'HIGH' || volume?.level === 'ABOVE_AVERAGE';
        const hasPattern = pattern !== null;

        if (hasBreakout && highVolume && signal === 'STRONG_BUY') {
            return {
                action: 'STRONG_BUY',
                reason: 'Breakout confirmed with high volume and strong momentum',
                confidence: 90
            };
        }

        if (hasBreakout && highVolume) {
            return {
                action: 'BUY',
                reason: 'Breakout detected with volume confirmation',
                confidence: 80
            };
        }

        if (hasPattern && signal === 'BUY') {
            return {
                action: 'BUY',
                reason: 'Pattern formation with positive momentum',
                confidence: 75
            };
        }

        if (signal === 'OVERSOLD') {
            return {
                action: 'WATCH',
                reason: 'Oversold conditions, potential bounce',
                confidence: 60
            };
        }

        return {
            action: 'HOLD',
            reason: 'Wait for better entry conditions',
            confidence: 50
        };
    }
}

// Export singleton instance
export default new TechnicalAnalysis();
