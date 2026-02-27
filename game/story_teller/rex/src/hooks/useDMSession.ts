import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { buildSystemPrompt, buildUserMessage } from '../lib/dmPromptBuilder';
import { sendToDM } from '../lib/apiClient';
import { DMResponse, ConversationTurn } from '../types/game';

export const useDMSession = () => {
  const {
    player,
    party,
    selectedEra,
    currentScene,
    victoria,
    conversationHistory,
    triggeredMilestones,
    isStreaming,
    currentStreamingContent,
    setStreaming,
    appendStreamContent,
    clearStreamContent,
    addConversationTurn,
    triggerMilestone,
    updateVictoriaTrust,
    unlockNotebookEntry,
    setVictoriaAppeared,
    processPartyEvents,
    setEnding,
  } = useGameStore();

  const sendPlayerInput = useCallback(async (input: string) => {
    if (!player || !selectedEra || isStreaming) return;

    const systemPrompt = buildSystemPrompt({
      player,
      party,
      era: selectedEra,
      victoria,
      conversationHistory,
      triggeredMilestones,
      currentScene,
    });

    const userMessage = buildUserMessage(input);

    // Add player turn to history
    const playerTurn: ConversationTurn = {
      role: 'player',
      content: input,
      timestamp: Date.now(),
    };
    addConversationTurn(playerTurn);

    // Start streaming
    setStreaming(true);
    clearStreamContent();

    try {
      await sendToDM(systemPrompt, userMessage, {
        onToken: (token) => {
          appendStreamContent(token);
        },
        onComplete: (response: DMResponse) => {
          // Add DM turn to history
          const dmTurn: ConversationTurn = {
            role: 'dm',
            content: response.narrative,
            timestamp: Date.now(),
            dmResponse: response,
          };
          addConversationTurn(dmTurn);

          // Process milestone
          if (response.milestoneTriggered) {
            triggerMilestone(response.milestoneTriggered);
          }

          // Process Victoria state
          if (response.victoriaState) {
            updateVictoriaTrust(response.victoriaState.trustDelta);
            if (response.victoriaState.notebookUnlock) {
              unlockNotebookEntry(response.victoriaState.notebookUnlock);
            }
          }

          // Mark Victoria as appeared if she spoke
          if (response.speaker === 'victoria') {
            setVictoriaAppeared();
          }

          // Process party events
          if (response.partyEvents) {
            processPartyEvents(response.partyEvents);
          }

          // Check for ending
          if (response.endingTrigger) {
            setEnding(response.endingTrigger);
          }

          setStreaming(false);
        },
        onError: (error) => {
          console.error('DM Error:', error);
          setStreaming(false);
          // Add error message to conversation
          const errorTurn: ConversationTurn = {
            role: 'dm',
            content: `*DM暂时失去了联系……*\n\n错误: ${error.message}`,
            timestamp: Date.now(),
          };
          addConversationTurn(errorTurn);
        },
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setStreaming(false);
    }
  }, [
    player,
    party,
    selectedEra,
    victoria,
    conversationHistory,
    triggeredMilestones,
    currentScene,
    isStreaming,
    setStreaming,
    appendStreamContent,
    clearStreamContent,
    addConversationTurn,
    triggerMilestone,
    updateVictoriaTrust,
    unlockNotebookEntry,
    setVictoriaAppeared,
    processPartyEvents,
    setEnding,
  ]);

  return {
    sendPlayerInput,
    isStreaming,
    currentStreamingContent,
  };
};
