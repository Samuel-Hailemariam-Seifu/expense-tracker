import React from 'react';

export function Logo({ size = 40, className = "" }) {
  return (
    <div 
      className={`flex items-center justify-center rounded-lg font-bold text-white ${className}`}
      style={{ 
        width: size, 
        height: size,
        background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.5)'
      }}
    >
      <span style={{ fontSize: size * 0.4 }}>ET</span>
    </div>
  );
} 