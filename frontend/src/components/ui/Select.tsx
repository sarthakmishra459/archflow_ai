import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-900 border rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-zinc-50 appearance-none transition-all duration-200 ${
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-zinc-200 dark:border-zinc-800"
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom Chevron Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs text-rose-500 font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
