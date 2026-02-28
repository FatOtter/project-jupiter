import { useGameStore } from '../store/gameStore';
import { useCallback } from 'react';

export function useDMSession() {
  const {
    conversationHistory,
    isStreaming,
    streamingContent,
    error,
    generateOpening,
    sendPlayerInput,
    phase,
  } = useGameStore();

  const startSession = useCallback(async () => {
    if (phase === 'playing' && conversationHistory.length === 0) {
      await generateOpening();
    }
  }, [phase, conversationHistory.length, generateOpening]);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isStreaming) return;
    await sendPlayerInput(input.trim());
  }, [sendPlayerInput, isStreaming]);

  const retry = useCallback(async () => {
    // 重试最后一条消息
  }, []);

  return {
    conversationHistory,
    isStreaming,
    streamingContent,
    error,
    startSession,
    sendMessage,
    retry,
  };
}
