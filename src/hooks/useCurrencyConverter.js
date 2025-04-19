import { useState, useEffect } from 'react';

// Using free API from exchangerate.host
const BASE_URL = 'https://api.exchangerate.host';

export function useCurrencyConverter() {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(`${BASE_URL}/latest?base=USD`);
      const data = await response.json();
      if (data.rates) {
        setRates(data.rates);
        setLoading(false);
      } else {
        throw new Error('Failed to get exchange rates');
      }
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      setError('Failed to fetch exchange rates');
      setLoading(false);
      // Fallback rates for major currencies
      setRates({
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        INR: 75.0
      });
    }
  };

  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      console.log('Missing rate for', fromCurrency, 'or', toCurrency);
      return amount;
    }
    
    try {
      // Convert to USD first (base currency)
      const amountInUSD = amount / rates[fromCurrency];
      // Convert from USD to target currency
      const convertedAmount = amountInUSD * rates[toCurrency];
      return Number(convertedAmount.toFixed(2));
    } catch (err) {
      console.error('Conversion error:', err);
      return amount;
    }
  };

  return { 
    convertAmount, 
    loading, 
    error,
    rates // Export rates for debugging
  };
} 