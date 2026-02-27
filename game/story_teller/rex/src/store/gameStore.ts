import { create } from 'zustand';
import { GameState, PlayerCharacter, PartyMember, Era, MilestoneId, EndingType, VictoriaState, DMResponse, ConversationTurn, NotebookEntryId } from '../types/game';
import { saveGame, loadGame, clearSave } from '../lib/saveGame';

const initialVictoriaState: VictoriaState = {
  trustLevel: 20,
  unlockedNotebook: [],
  hasAppearedThisSession: false,
};

const initialState: GameState = {
  phase: 'character_creation',
  player: null,
  party: [],
  selectedEra: null,
  currentScene: '',
  triggeredMilestones: [],
  victoria: initialVictoriaState,
  conversationHistory: [],
  endingTriggered: null,
  isStreaming: false,
  currentStreamingContent: '',
};

interface GameStore extends GameState {
  // Character creation
  setPlayer: (player: PlayerCharacter) => void;
  addPartyMember: (member: PartyMember) => void;
  removePartyMember: (memberId: string) => void;
  setSelectedEra: (era: Era) => void;
  setCurrentScene: (scene: string) => void;
  startGame: () => void;
  
  // Game progress
  addConversationTurn: (turn: ConversationTurn) => void;
  triggerMilestone: (milestone: MilestoneId) => void;
  updateVictoriaTrust: (delta: number) => void;
  unlockNotebookEntry: (entry: NotebookEntryId) => void;
  setVictoriaAppeared: () => void;
  
  // Party management
  updatePartyMember: (memberId: string, updates: Partial<PartyMember>) => void;
  processPartyEvents: (events: DMResponse['partyEvents']) => void;
  
  // Streaming
  setStreaming: (isStreaming: boolean) => void;
  appendStreamContent: (content: string) => void;
  clearStreamContent: () => void;
  
  // Ending
  setEnding: (ending: EndingType) => void;
  
  // Save/Load
  save: () => void;
  load: () => boolean;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setPlayer: (player) => {
    // Check memory anchor for initial trust bonus
    let trustBonus = 0;
    const anchor = player.memoryAnchor.toLowerCase();
    if (anchor.includes('雷克斯') || anchor.includes('rexs')) trustBonus += 15;
    if (anchor.includes('节点47') || anchor.includes('node 47')) trustBonus += 10;
    if (anchor.includes('杨') || anchor.includes('yang')) trustBonus += 10;
    if (anchor.includes('phase 0')) trustBonus += 10;
    
    set((state) => ({
      player,
      victoria: {
        ...state.victoria,
        trustLevel: Math.min(100, state.victoria.trustLevel + trustBonus),
      },
    }));
  },

  addPartyMember: (member) => {
    set((state) => ({
      party: state.party.length < 3 ? [...state.party, member] : state.party,
    }));
  },

  removePartyMember: (memberId) => {
    set((state) => ({
      party: state.party.filter((m) => m.id !== memberId),
    }));
  },

  setSelectedEra: (era) => set({ selectedEra: era }),

  setCurrentScene: (scene) => set({ currentScene: scene }),

  startGame: () => set({ phase: 'playing' }),

  addConversationTurn: (turn) => {
    set((state) => ({
      conversationHistory: [...state.conversationHistory, turn],
    }));
  },

  triggerMilestone: (milestone) => {
    set((state) => ({
      triggeredMilestones: state.triggeredMilestones.includes(milestone)
        ? state.triggeredMilestones
        : [...state.triggeredMilestones, milestone],
    }));
  },

  updateVictoriaTrust: (delta) => {
    set((state) => ({
      victoria: {
        ...state.victoria,
        trustLevel: Math.max(0, Math.min(100, state.victoria.trustLevel + delta)),
      },
    }));
  },

  unlockNotebookEntry: (entry) => {
    set((state) => ({
      victoria: {
        ...state.victoria,
        unlockedNotebook: state.victoria.unlockedNotebook.includes(entry)
          ? state.victoria.unlockedNotebook
          : [...state.victoria.unlockedNotebook, entry],
      },
    }));
  },

  setVictoriaAppeared: () => {
    set((state) => ({
      victoria: {
        ...state.victoria,
        hasAppearedThisSession: true,
      },
    }));
  },

  updatePartyMember: (memberId, updates) => {
    set((state) => ({
      party: state.party.map((m) =>
        m.id === memberId ? { ...m, ...updates } : m
      ),
    }));
  },

  processPartyEvents: (events) => {
    if (!events) return;
    
    events.forEach((event) => {
      switch (event.type) {
        case 'stance_revealed':
          get().updatePartyMember(event.memberId, {
            isRevealed: true,
            revealedStance: event.newStance,
          });
          break;
        case 'member_left':
          get().updatePartyMember(event.memberId, {
            status: 'left',
            statusNote: event.reason,
          });
          break;
        case 'member_died':
          get().updatePartyMember(event.memberId, {
            status: 'dead',
            statusNote: event.cause,
          });
          break;
        case 'member_betrayed':
          get().updatePartyMember(event.memberId, {
            status: 'betrayed',
            statusNote: event.detail,
            isRevealed: true,
            revealedStance: 'antagonist',
          });
          break;
        case 'info_unlocked':
          get().updatePartyMember(event.memberId, {
            knownInfo: get().party.find((m) => m.id === event.memberId)?.knownInfo + '\n' + event.newInfo,
          });
          break;
      }
    });
  },

  setStreaming: (isStreaming) => set({ isStreaming }),

  appendStreamContent: (content) => {
    set((state) => ({
      currentStreamingContent: state.currentStreamingContent + content,
    }));
  },

  clearStreamContent: () => set({ currentStreamingContent: '' }),

  setEnding: (ending) => set({ phase: 'ending', endingTriggered: ending }),

  save: () => {
    const state = get();
    saveGame({
      phase: state.phase,
      player: state.player,
      party: state.party,
      selectedEra: state.selectedEra,
      currentScene: state.currentScene,
      triggeredMilestones: state.triggeredMilestones,
      victoria: state.victoria,
      conversationHistory: state.conversationHistory,
      endingTriggered: state.endingTriggered,
      isStreaming: false,
      currentStreamingContent: '',
    });
  },

  load: () => {
    const savedState = loadGame();
    if (savedState) {
      set({
        ...savedState,
        isStreaming: false,
        currentStreamingContent: '',
      });
      return true;
    }
    return false;
  },

  reset: () => {
    clearSave();
    set(initialState);
  },
}));
