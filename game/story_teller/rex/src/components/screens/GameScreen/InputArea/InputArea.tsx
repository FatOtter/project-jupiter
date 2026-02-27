import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSend: (input: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const quickActions = [
  { label: '询问', prefix: '我想询问……' },
  { label: '观察', prefix: '我仔细观察……' },
  { label: '行动', prefix: '我决定……' },
  { label: '离开', prefix: '我准备离开……' },
];

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  disabled = false,
  placeholder = '输入你的行动或对话...',
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prefix: string) => {
    setInput(prefix);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-zinc-700 bg-zinc-900 p-4">
      {/* Quick actions */}
      <div className="flex gap-2 mb-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action.prefix)}
            disabled={disabled}
            className="px-3 py-1 text-xs bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 hover:text-zinc-300 disabled:opacity-50 font-mono"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-emerald-400 font-mono text-sm resize-none focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-6 py-2 bg-emerald-600 text-zinc-900 rounded font-mono text-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? '发送中...' : '发送'}
        </button>
      </div>

      <div className="text-xs text-zinc-600 mt-2">
        Enter 发送 · Shift+Enter 换行
      </div>
    </div>
  );
};
