"use client"

import { useState } from 'react';

const Input = ({ label, type = "text", placeholder, value, onChange, required = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-remedy-gray)' }}>
        {label} {required && <span style={{ color: '#C44536' }}>*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-remedy-primary)',
          color: 'var(--color-remedy-secondary)',
          boxShadow: isFocused ? '0 0 0 3px rgba(58, 175, 169, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};
export default Input;