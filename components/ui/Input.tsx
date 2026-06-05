import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ElementType;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, error, className = '', id, ...props }) => {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={18} />
          </span>
        )}
        <input
          id={inputId}
          className={`w-full rounded-md border bg-white py-2.5 text-sm text-slate-800 placeholder:text-slate-400
            transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
            ${Icon ? 'pl-10 pr-3' : 'px-3'}
            ${error ? 'border-error' : 'border-slate-200'}
            ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
