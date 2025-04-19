import { useState } from 'react';

export function TabView({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Tab Headers */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max border-b">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`flex items-center whitespace-nowrap px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-300
                ${activeTab === index 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab(index)}
            >
              <span className="mr-1 sm:mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-8">
        {tabs[activeTab].content}
      </div>
    </div>
  );
} 