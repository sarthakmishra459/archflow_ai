import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
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
      <input
        id={id}
        className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-900 border rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-zinc-50 transition-all duration-200 ${
          error
            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-zinc-200 dark:border-zinc-800"
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-500 font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
