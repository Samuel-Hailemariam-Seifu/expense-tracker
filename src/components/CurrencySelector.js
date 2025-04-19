export function CurrencySelector({ currency, onCurrencyChange, loading, currencies }) {
  if (loading) {
    return (
      <div className="flex items-center bg-gray-700 text-white rounded-lg px-3 py-2">
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading rates...
      </div>
    );
  }

  return (
    <select
      value={currency.code}
      onChange={(e) => onCurrencyChange(e.target.value)}
      className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 
                focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
    >
      {currencies.map(curr => (
        <option key={curr.code} value={curr.code}>
          {curr.symbol} {curr.name}
        </option>
      ))}
    </select>
  );
} 