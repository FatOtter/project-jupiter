import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../../../store/gameStore';

export const TextInput: React.FC = () => {
  const { sendPlayerInput, isStreaming } = useGameStore();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const currentInput = input.trim();
    setInput('');
    await sendPlayerInput(currentInput);
  };

  // 点击页面任何地方都聚焦到隐藏输入框
  useEffect(() => {
    const handleGlobalClick = () => {
      inputRef.current?.focus();
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // 初始聚焦
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative font-mono flex items-center min-h-[1.5rem]">
      {/* 隐藏的真实输入框，用于捕获键盘输入 */}
      <form onSubmit={handleSubmit} className="absolute inset-0 opacity-0 z-10">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          autoFocus
          className="w-full h-full cursor-default"
        />
      </form>

      {/* 纯粹的视觉显示：黑底绿字风格 */}
      <div className="flex items-center gap-1 text-game-text">
        <span className={`${isStreaming ? 'text-game-text-dim/50' : 'text-game-text'} font-bold`}>
          {'>'}
        </span>
        
        <div className="flex items-center">
          {/* 已输入的文字内容 */}
          <span className="whitespace-pre tracking-wider">
            {input}
          </span>
          
          {/* 模拟光标 */}
          {!isStreaming && (
            <span className="w-2.5 h-5 bg-game-text animate-[pulse_0.8s_infinite] ml-0.5" />
          )}
          
          {/* 空白时的占位提示（极简风格） */}
          {!input && !isStreaming && (
            <span className="text-game-text-dim/20 text-[10px] uppercase tracking-[0.2em] ml-2">
              WAITING FOR INPUT_
            </span>
          )}
          
          {/* 加载中的状态 */}
          {isStreaming && (
            <span className="text-[10px] text-game-text-dim/40 italic ml-2 animate-pulse">
              [ TRANSMITTING... ]
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
