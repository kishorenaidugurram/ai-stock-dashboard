# Data Quality Standards & Validation Framework

## 🎯 Institutional-Grade Requirements

### 1. **Date Validation Rules**

**CRITICAL:** All recommendations MUST be from the current week (last 7 days from today).

```javascript
// Date validation logic
const TODAY = new Date('2025-12-20');
const SEVEN_DAYS_AGO = new Date(TODAY - 7 * 24 * 60 * 60 * 1000);

function isDateValid(dateString) {
  const publishDate = new Date(dateString);
  return publishDate >= SEVEN_DAYS_AGO && publishDate <= TODAY;
}
```

**Rejection Criteria:**
- ❌ Dates from 2024 or earlier
- ❌ Dates older than 7 days from current date
- ❌ Vague dates like "Dec 2025" without specific day
- ❌ Future dates beyond today

**Acceptance Criteria:**
- ✅ Exact dates: "Dec 20, 2025", "Dec 19, 2025"
- ✅ ISO timestamps: "2025-12-20T09:45:00Z"
- ✅ Relative timestamps: "1 hour ago", "23 hours ago" (with verification)

### 2. **Source Verification Standards**

**Each recommendation MUST include:**

```json
{
  "sourceUrl": "https://...",           // Direct link to article
  "publishedTime": "2025-12-20T09:45:00Z", // ISO 8601 timestamp
  "source": "Economic Times",           // Publisher name
  "brokerage": "ICICI Securities",      // Specific brokerage
  "date": "Dec 20, 2025"               // Human-readable date
}
```

**URL Validation:**
- ✅ Must start with `https://`
- ✅ Must be from verified financial publishers
- ✅ Must lead to specific article (not homepage)
- ✅ Must be accessible (not 404)

**Verified Publisher List:**
- Economic Times (economictimes.indiatimes.com)
- LiveMint (livemint.com)
- Moneycontrol (moneycontrol.com)
- Reuters (reuters.com)
- CNBC (cnbc.com)
- Times of India (timesofindia.indiatimes.com)
- Financial Express (financialexpress.com)
- Business Standard (business-standard.com)

**Verified Brokerage Houses:**
- ICICI Securities
- Motilal Oswal
- Axis Securities
- HDFC Securities
- Kotak Securities
- Sharekhan
- Bajaj Broking

### 3. **Data Freshness Indicators**

**ALL data objects MUST include:**

```json
{
  "dataQuality": {
    "searchTimestamp": "2025-12-20T11:25:00Z",
    "dateRange": "Dec 19-20, 2025",
    "verificationStatus": "VERIFIED" | "UNVERIFIED" | "EXPIRED",
    "totalSources": 8,
    "dataFreshness": "Within 24 hours" | "1-3 days old" | "3-7 days old"
  }
}
```

**Status Definitions:**
- **VERIFIED**: All dates checked, within 7 days, sources validated
- **UNVERIFIED**: Contains some unverified data, use with caution
- **EXPIRED**: Contains data older than 7 days, needs refresh

### 4. **Recommendation Quality Criteria**

**Each recommendation MUST have:**

```json
{
  "stock": "Clear company name",
  "symbol": "NSE/BSE symbol",
  "price": "Current price",
  "recommendation": "BUY" | "SELL" | "HOLD",
  "target": "Target price",
  "upside": "Percentage upside/downside",
  "brokerage": "Specific brokerage name",
  "date": "Exact date (Dec 20, 2025)",
  "publishedTime": "ISO timestamp",
  "rationale": "Clear reasoning (min 20 chars)",
  "source": "Publisher name",
  "sourceUrl": "Direct article URL"
}
```

**Data Quality Checks:**
- ✅ Price must be numeric with ₹ symbol
- ✅ Upside must be calculated: `((target - price) / price) * 100`
- ✅ Rationale must be meaningful (not generic)
- ✅ Date must be specific (day, month, year)
- ✅ PublishedTime must be ISO 8601 format

### 5. **Automated Validation Pipeline**

**Pre-Save Validation:**
```javascript
function validateStockData(data) {
  const errors = [];
  
  // Check date freshness
  if (!isWithinSevenDays(data.date)) {
    errors.push(`Date ${data.date} is older than 7 days`);
  }
  
  // Check required fields
  const required = ['stock', 'symbol', 'price', 'recommendation', 
                    'target', 'brokerage', 'date', 'publishedTime',
                    'rationale', 'source', 'sourceUrl'];
  
  for (const field of required) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Check URL validity
  if (!data.sourceUrl.startsWith('https://')) {
    errors.push('Invalid source URL');
  }
  
  // Check brokerage is recognized
  const validBrokerages = ['ICICI Securities', 'Motilal Oswal', ...];
  if (!validBrokerages.includes(data.brokerage)) {
    errors.push(`Unrecognized brokerage: ${data.brokerage}`);
  }
  
  return errors;
}
```

### 6. **Search Result Filtering**

**When performing Google searches, ONLY accept results that:**

1. **Have explicit dates in snippet or title**
   - ✅ "Dec 20, 2025", "1 hour ago", "23 hours ago"
   - ❌ No date, "2024", "last year"

2. **Come from verified financial sources**
   - ✅ Major financial news sites
   - ✅ Official brokerage websites
   - ❌ Personal blogs, unverified sites

3. **Contain actionable recommendations**
   - ✅ "Buy TCS at ₹3,260, target ₹4,090"
   - ❌ Generic market commentary

4. **Include brokerage attribution**
   - ✅ "ICICI Securities recommends..."
   - ❌ Anonymous "Analysts suggest..."

### 7. **Red Flags & Rejection Criteria**

**IMMEDIATELY REJECT data if:**

❌ Date is from 2024 or earlier
❌ Date is vague ("sometime in December")
❌ Source URL leads to 404
❌ No brokerage attribution
❌ Price/target data is missing
❌ Rationale is generic ("good company")
❌ Published time is older than 7 days
❌ Search result timestamp doesn't match content date

### 8. **Quality Scoring System**

**Each stock gets a quality score (0-100):**

```javascript
function calculateQualityScore(stock) {
  let score = 0;
  
  // Date freshness (40 points)
  const ageHours = getAgeInHours(stock.publishedTime);
  if (ageHours < 24) score += 40;
  else if (ageHours < 72) score += 30;
  else if (ageHours < 168) score += 20;
  
  // Source credibility (30 points)
  if (isTopTierSource(stock.source)) score += 30;
  else if (isRecognizedSource(stock.source)) score += 20;
  
  // Brokerage reputation (20 points)
  if (isTopBrokerage(stock.brokerage)) score += 20;
  else if (isRecognizedBrokerage(stock.brokerage)) score += 15;
  
  // Data completeness (10 points)
  if (hasAllRequiredFields(stock)) score += 10;
  
  return score;
}
```

**Quality Thresholds:**
- **Grade A (80-100)**: Published within 24 hours, top-tier source, complete data
- **Grade B (60-79)**: Published within 72 hours, recognized source, mostly complete
- **Grade C (40-59)**: Published within 7 days, basic requirements met
- **Grade F (<40)**: REJECT - Does not meet minimum standards

### 9. **Dashboard Display Guidelines**

**Visual Indicators:**
```html
<!-- Grade A: Green badge -->
<span class="badge-quality-a">Fresh • Verified</span>

<!-- Grade B: Blue badge -->
<span class="badge-quality-b">Recent • Verified</span>

<!-- Grade C: Yellow badge -->
<span class="badge-quality-c">This Week • Verified</span>

<!-- Age indicator -->
<span class="age-indicator">
  <i class="far fa-clock"></i> 2 hours ago
</span>
```

### 10. **Audit Trail Requirements**

**Every data refresh MUST log:**

```json
{
  "auditLog": {
    "timestamp": "2025-12-20T11:25:00Z",
    "totalSearches": 4,
    "resultsFound": 40,
    "resultsAccepted": 14,
    "resultsRejected": 26,
    "rejectionReasons": {
      "oldDate": 15,
      "noDate": 5,
      "unverifiedSource": 4,
      "missingData": 2
    },
    "qualityDistribution": {
      "gradeA": 8,
      "gradeB": 4,
      "gradeC": 2,
      "gradeF": 0
    }
  }
}
```

### 11. **User Warnings & Disclaimers**

**Display warnings when:**
- Data is 3-7 days old: ⚠️ "This recommendation is 5 days old"
- Source is not top-tier: ℹ️ "Source verification: Basic"
- Brokerage is less known: ℹ️ "Independent brokerage"

## Implementation Checklist

### Before Every Data Update:

- [ ] Perform date validation on all entries
- [ ] Verify source URLs are accessible
- [ ] Check brokerage names against whitelist
- [ ] Calculate quality scores
- [ ] Generate audit log
- [ ] Update dataQuality metadata
- [ ] Flag any entries older than 7 days
- [ ] Remove any entries with dates from 2024

### Quality Assurance:

- [ ] Manual spot-check 3 random recommendations
- [ ] Verify timestamps match article content
- [ ] Confirm target prices are reasonable
- [ ] Check rationales are specific (not generic)
- [ ] Ensure all source URLs work

### Dashboard Requirements:

- [ ] Display quality indicators (Fresh/Recent/This Week)
- [ ] Show time since publication
- [ ] Include "Last Updated" timestamp
- [ ] Provide "Data Quality Report" link
- [ ] Show verification status badge

---

## Example: Grade A Recommendation

```json
{
  "stock": "TCS (Tata Consultancy Services)",
  "symbol": "TCS",
  "price": "₹3,260",
  "recommendation": "BUY",
  "target": "₹4,090",
  "upside": "25.5%",
  "brokerage": "ICICI Securities",
  "source": "Economic Times",
  "sourceUrl": "https://m.economictimes.com/markets/stocks/news/tcs-among-icici-securities-top-5-bets-with-upside-potential-of-up-to-26-in-1-year/slideshow/126088270.cms",
  "date": "Dec 20, 2025",
  "publishedTime": "2025-12-20T09:45:00Z",
  "rationale": "Strong IT sector outlook, digital transformation tailwinds, 12-month target Rs 4,090 with stop loss at Rs 2,840",
  "qualityScore": 95,
  "qualityGrade": "A",
  "ageHours": 2,
  "verificationStatus": "VERIFIED"
}
```

**This meets all institutional standards:**
- ✅ Published 2 hours ago
- ✅ Top-tier source (Economic Times)
- ✅ Reputable brokerage (ICICI Securities)
- ✅ Complete data with specific rationale
- ✅ Verified and accessible URL
- ✅ Quality Score: 95/100 (Grade A)

---

**Last Updated**: Dec 20, 2025
**Version**: 1.0 (Institutional Standards)
