import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-game-text-dim text-xs uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`bg-black/50 border border-game-border text-game-text font-mono px-3 py-2 focus:outline-none focus:border-game-text transition-colors ${className}`}
        {...props}
      />
      {error && (
        <span className="text-antagonist text-xs">{error}</span>
      )}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-game-text-dim text-xs uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        className={`bg-black/50 border border-game-border text-game-text font-mono px-3 py-2 focus:outline-none focus:border-game-text transition-colors resize-none ${className}`}
        {...props}
      />
      {error && (
        <span className="text-antagonist text-xs">{error}</span>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-game-text-dim text-xs uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`bg-black/50 border border-game-border text-game-text font-mono px-3 py-2 focus:outline-none focus:border-game-text transition-colors ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-game-bg">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
