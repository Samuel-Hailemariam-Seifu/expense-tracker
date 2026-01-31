import { useState, useEffect } from 'react';

export function EditExpenseModal({ expense, onSave, onCancel, categories }) {
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount);
  const [category, setCategory] = useState(expense.category);
  const [date, setDate] = useState(expense.date);

  useEffect(() => {
    // Reset form when expense changes
    setDescription(expense.description);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(expense.date);
  }, [expense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...expense,
      description,
      amount: Number(amount),
      category,
      date
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 sm:p-7 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">
          Edit Expense
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm hover:border-gray-400 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm hover:border-gray-400 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm hover:border-gray-400 transition-all duration-200 bg-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm hover:border-gray-400 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-2 sm:pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 
                       transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-200 
                       transition-all duration-200 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 