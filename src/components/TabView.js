import { useState } from 'react';

export function TabView({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Tab Headers */}
      <div className="overflow-x-auto scrollbar-hide bg-gray-50/50">
        <div className="flex min-w-max border-b border-gray-200">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`flex items-center whitespace-nowrap px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 relative
                ${activeTab === index 
                  ? 'text-blue-600 bg-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'}`}
              onClick={() => setActiveTab(index)}
            >
              {activeTab === index && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600"></span>
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-8">
        {tabs[activeTab].content}
      </div>
    </div>
  );
} 