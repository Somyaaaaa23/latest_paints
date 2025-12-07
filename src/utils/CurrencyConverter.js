// Currency Converter - Multi-currency support
export class CurrencyConverter {
  constructor() {
    // Exchange rates (base: USD)
    this.exchangeRates = {
      'USD': 1.00,
      'INR': 83.12,
      'EUR': 0.92,
      'GBP': 0.79,
      'AUD': 1.52,
      'CAD': 1.36,
      'SGD': 1.34,
      'AED': 3.67,
      'SAR': 3.75
    };
    
    this.currencySymbols = {
      'USD': '$',
      'INR': '₹',
      'EUR': '€',
      'GBP': '£',
      'AUD': 'A$',
      'CAD': 'C$',
      'SGD': 'S$',
      'AED': 'د.إ',
      'SAR': 'ر.س'
    };
    
    this.currencyNames = {
      'USD': 'US Dollar',
      'INR': 'Indian Rupee',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'AUD': 'Australian Dollar',
      'CAD': 'Canadian Dollar',
      'SGD': 'Singapore Dollar',
      'AED': 'UAE Dirham',
      'SAR': 'Saudi Riyal'
    };
    
    this.lastUpdated = new Date().toISOString();
  }
  
  // Convert amount from one currency to another
  convert(amount, fromCurrency, toCurrency) {
    if (!this.exchangeRates[fromCurrency] || !this.exchangeRates[toCurrency]) {
      throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
    }
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / this.exchangeRates[fromCurrency];
    const convertedAmount = amountInUSD * this.exchangeRates[toCurrency];
    
    return {
      amount: convertedAmount,
      fromCurrency: fromCurrency,
      toCurrency: toCurrency,
      originalAmount: amount,
      exchangeRate: this.exchangeRates[toCurrency] / this.exchangeRates[fromCurrency],
      formatted: this.format(convertedAmount, toCurrency)
    };
  }
  
  // Format amount with currency symbol
  format(amount, currency) {
    const symbol = this.currencySymbols[currency] || currency;
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // For some currencies, symbol goes after
    if (currency === 'INR' || currency === 'AED' || currency === 'SAR') {
      return `${symbol} ${formattedAmount}`;
    }
    
    return `${symbol}${formattedAmount}`;
  }
  
  // Get exchange rate between two currencies
  getExchangeRate(fromCurrency, toCurrency) {
    if (!this.exchangeRates[fromCurrency] || !this.exchangeRates[toCurrency]) {
      return null;
    }
    
    return this.exchangeRates[toCurrency] / this.exchangeRates[fromCurrency];
  }
  
  // Get all supported currencies
  getSupportedCurrencies() {
    return Object.keys(this.exchangeRates).map(code => ({
      code: code,
      name: this.currencyNames[code],
      symbol: this.currencySymbols[code],
      rate: this.exchangeRates[code]
    }));
  }
  
  // Update exchange rates (in production, fetch from API)
  updateRates(newRates) {
    Object.assign(this.exchangeRates, newRates);
    this.lastUpdated = new Date().toISOString();
  }
  
  // Convert pricing details to different currency
  convertPricingDetails(pricingDetails, targetCurrency, sourceCurrency = 'USD') {
    const converted = {
      ...pricingDetails,
      currency: targetCurrency,
      originalCurrency: sourceCurrency
    };
    
    // Convert all monetary values
    const monetaryFields = [
      'subtotalCost',
      'overheadCost',
      'totalLaborFees',
      'totalTestingCosts',
      'volumeDiscount',
      'finalPrice'
    ];
    
    monetaryFields.forEach(field => {
      if (pricingDetails[field] !== undefined) {
        const result = this.convert(pricingDetails[field], sourceCurrency, targetCurrency);
        converted[field] = result.amount;
        converted[`${field}Formatted`] = result.formatted;
      }
    });
    
    // Convert cost breakdown if exists
    if (pricingDetails.costBreakdown) {
      converted.costBreakdown = {};
      Object.entries(pricingDetails.costBreakdown).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const result = this.convert(value, sourceCurrency, targetCurrency);
          converted.costBreakdown[key] = result.amount;
        } else {
          converted.costBreakdown[key] = value;
        }
      });
    }
    
    return converted;
  }
  
  // Get currency comparison table
  getCurrencyComparison(amount, baseCurrency = 'USD') {
    const comparisons = [];
    
    Object.keys(this.exchangeRates).forEach(currency => {
      if (currency !== baseCurrency) {
        const result = this.convert(amount, baseCurrency, currency);
        comparisons.push({
          currency: currency,
          name: this.currencyNames[currency],
          amount: result.amount,
          formatted: result.formatted,
          exchangeRate: result.exchangeRate
        });
      }
    });
    
    return comparisons.sort((a, b) => a.currency.localeCompare(b.currency));
  }
  
  // Detect currency from text
  detectCurrency(text) {
    const symbols = Object.entries(this.currencySymbols);
    
    for (const [code, symbol] of symbols) {
      if (text.includes(symbol)) {
        return code;
      }
    }
    
    // Check for currency codes
    for (const code of Object.keys(this.exchangeRates)) {
      if (text.toUpperCase().includes(code)) {
        return code;
      }
    }
    
    return 'USD'; // Default
  }
  
  // Parse amount with currency from text
  parseAmount(text) {
    const currency = this.detectCurrency(text);
    const amountMatch = text.match(/[\d,]+\.?\d*/);
    
    if (amountMatch) {
      const amount = parseFloat(amountMatch[0].replace(/,/g, ''));
      return {
        amount: amount,
        currency: currency,
        formatted: this.format(amount, currency)
      };
    }
    
    return null;
  }
}

// Create singleton instance
export const currencyConverter = new CurrencyConverter();

// Helper function to format price with currency
export function formatPrice(amount, currency = 'USD') {
  return currencyConverter.format(amount, currency);
}

// Helper function to convert price
export function convertPrice(amount, fromCurrency, toCurrency) {
  return currencyConverter.convert(amount, fromCurrency, toCurrency);
}
