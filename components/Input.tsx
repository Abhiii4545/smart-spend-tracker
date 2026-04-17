import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4 relative group">
      <label className="block text-sm font-medium text-gray-300 mb-1 transition-colors group-focus-within:text-electric-blue">
        {label}
      </label>
      <input
        className={`appearance-none block w-full px-4 py-3 bg-white/5 border rounded-xl shadow-sm placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-electric-blue transition-all sm:text-sm ${error ? 'border-red-500' : 'border-white/10'} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400 animate-shake">{error}</p>}
    </div>
  );
};

export default Input;