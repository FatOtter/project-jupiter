import { create } from 'zustand';
import type { 
  GameState, 
  PlayerCharacter, 
  PartyMember, 
  Era, 
  VictoriaState, 
  ConversationTurn,
  DMResponse,
  MilestoneId,
  EndingType,
  NotebookEntryId,
  PartyEvent,
  IdentityType,
  Form,
  FactionStance
} from '../types/game';
import { saveGame, loadGame, clearGame } from '../lib/saveGame';
import { buildSystemPrompt, buildUserMessage, buildCharacterCreationPrompt } from '../lib/dmPromptBuilder';
import { streamDMResponse } from '../lib/apiClient';
import { getInitialTrustLevel } from '../data/victoria';

interface CharacterCreationState {
  isComplete: boolean;
  name: string | null;
  identityType: IdentityType | null;
  identitySubtype: string | null;
  form: Form | null;
  factionStance: FactionStance | null;
  era: Era | null;
  suggestedOptions: string[]; // 引导选项
}

interface GameStore extends GameState {
  characterCreation: CharacterCreationState;
  setCurrentStep: (step: number) => void;
  currentStep: number;
  
  setPlayer: (player: PlayerCharacter) => void;
  updatePlayerPartial: (updates: Partial<PlayerCharacter>) => void;
  addPartyMember: (member: PartyMember) => void;
  removePartyMember: (memberId: string) => void;
  updatePartyMember: (memberId: string, updates: Partial<PartyMember>) => void;
  
  setEra: (era: Era) => void;
  setScene: (scene: string) => void;
  
  addConversationTurn: (turn: ConversationTurn) => void;
  
  updateVictoriaTrust: (delta: number) => void;
  unlockNotebookEntry: (entryId: NotebookEntryId) => void;
  
  triggerMilestone: (milestone: MilestoneId) => void;
  triggerEnding: (ending: EndingType) => void;
  
  processPartyEvents: (events: PartyEvent[]) => void;
  
  startGame: () => void;
  resetGame: () => void;
  
  save: () => void;
  load: () => boolean;
  
  initNarrative: () => Promise<void>;
  sendPlayerInput: (input: string) => Promise<void>;
  parseCharacterFromResponse: (response: any) => Partial<CharacterCreationState>;
  
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}

const initialVictoria: VictoriaState = {
  trustLevel: 35,
  unlockedNotebook: [],
  hasAppearedThisSession: false,
};

const initialCharacterCreation: CharacterCreationState = {
  isComplete: false,
  name: null,
  identityType: null,
  identitySubtype: null,
  form: null,
  factionStance: null,
  era: null,
  suggestedOptions: []
};

const initialState: GameState = {
  phase: 'playing',
  player: null,
  party: [],
  selectedEra: null,
  currentScene: '',
  triggeredMilestones: [],
  victoria: initialVictoria,
  conversationHistory: [],
  endingTriggered: null,
};

function extractJsonValue(text: string): string | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  characterCreation: initialCharacterCreation,
  currentStep: 0,
  isStreaming: false,
  streamingContent: '',
  error: null,

  setCurrentStep: (step) => set({ currentStep: step }),

  setPlayer: (player) => {
    const trustLevel = player.memoryAnchor 
      ? getInitialTrustLevel(player.memoryAnchor)
      : 35;
    set({ 
      player, 
      victoria: { ...get().victoria, trustLevel },
      characterCreation: { ...get().characterCreation, isComplete: true },
    });
  },

  updatePlayerPartial: (updates) => {
    const current = get().player;
    if (current) {
      set({ player: { ...current, ...updates } });
    }
  },

  addPartyMember: (member) => set((state) => ({
    party: [...state.party, member],
  })),

  removePartyMember: (memberId) => set((state) => ({
    party: state.party.filter((m) => m.id !== memberId),
  })),

  updatePartyMember: (memberId, updates) => set((state) => ({
    party: state.party.map((m) => 
      m.id === memberId ? { ...m, ...updates } : m
    ),
  })),

  setEra: (era) => set({ selectedEra: era }),

  setScene: (scene) => set({ currentScene: scene }),

  addConversationTurn: (turn) => set((state) => ({
    conversationHistory: [...state.conversationHistory, turn],
  })),

  updateVictoriaTrust: (delta) => set((state) => ({
    victoria: {
      ...state.victoria,
      trustLevel: Math.max(0, Math.min(100, state.victoria.trustLevel + delta)),
    },
  })),

  unlockNotebookEntry: (entryId) => set((state) => ({
    victoria: {
      ...state.victoria,
      unlockedNotebook: [...new Set([...state.victoria.unlockedNotebook, entryId])],
    },
  })),

  triggerMilestone: (milestone) => set((state) => ({
    triggeredMilestones: [...new Set([...state.triggeredMilestones, milestone])],
  })),

  triggerEnding: (ending) => set({ 
    endingTriggered: ending, 
    phase: 'ending' 
  }),

  processPartyEvents: (events) => {
    const state = get();
    events.forEach((event) => {
      switch (event.type) {
        case 'stance_revealed':
          state.updatePartyMember(event.memberId, {
            isRevealed: true,
            revealedStance: event.newStance,
          });
          break;
        case 'member_left':
          state.updatePartyMember(event.memberId, {
            status: 'left',
            statusNote: event.reason,
          });
          break;
        case 'member_died':
          state.updatePartyMember(event.memberId, {
            status: 'dead',
            statusNote: event.cause,
          });
          break;
        case 'member_betrayed':
          state.updatePartyMember(event.memberId, {
            status: 'betrayed',
            statusNote: event.detail,
            isRevealed: true,
            revealedStance: 'antagonist',
          });
          break;
        case 'info_unlocked': {
          const member = state.party.find((m) => m.id === event.memberId);
          if (member) {
            state.updatePartyMember(event.memberId, {
              knownInfo: member.knownInfo 
                ? `${member.knownInfo}\n${event.newInfo}`
                : event.newInfo,
            });
          }
          break;
        }
        case 'stance_drifted':
          break;
      }
    });
  },

  startGame: () => {
    const state = get();
    if (!state.player || !state.selectedEra) return;
    
    set({ 
      phase: 'playing',
      victoria: { ...state.victoria, hasAppearedThisSession: false },
    });
    get().save();
  },

  resetGame: () => {
    clearGame();
    set({
      ...initialState,
      characterCreation: initialCharacterCreation,
      currentStep: 0,
      isStreaming: false,
      streamingContent: '',
      error: null,
    });
  },

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
    });
  },

  load: () => {
    const savedState = loadGame();
    if (savedState) {
      set(savedState);
      return true;
    }
    return false;
  },

  parseCharacterFromResponse: (parsed) => {
    const result: Partial<CharacterCreationState> = {};
    
    if (parsed.characterInfo) {
      const info = parsed.characterInfo;
      if (info.name) result.name = info.name;
      if (info.identityType) result.identityType = info.identityType as IdentityType;
      if (info.identitySubtype) result.identitySubtype = info.identitySubtype;
      if (info.form) result.form = info.form as Form;
      if (info.factionStance) result.factionStance = info.factionStance as FactionStance;
      if (info.era) result.era = info.era as Era;
      // 强制校验必要字段是否齐全
      if (info.name && info.identityType && info.form && info.era) {
          result.isComplete = true;
      }
    }
    
    if (parsed.suggestedOptions) {
        result.suggestedOptions = parsed.suggestedOptions;
    }
    
    return result;
  },

  initNarrative: async () => {
    const state = get();
    if (state.conversationHistory.length > 0 || state.isStreaming) return;

    set({ isStreaming: true, streamingContent: '', error: null });

    const systemPrompt = buildCharacterCreationPrompt();
    const welcomePrompt = `玩家刚刚进入游戏，请以叙事化的方式欢迎他们，并引导他们建立自己的角色身份。
    
要求：
1. 用老友重逢或者神秘面试官的语气开场
2. 必须包含suggestedOptions数组，提供3个供玩家点击的简短回答选项
3. 必须返回JSON格式，包含narrative和suggestedOptions字段`;

    let fullContent = '';

    try {
      for await (const chunk of streamDMResponse(systemPrompt, welcomePrompt)) {
        fullContent += chunk;
        set({ streamingContent: fullContent });
      }

      let narrative = fullContent;
      let dmResponse: any = null;
      try {
        const parsed = JSON.parse(fullContent);
        narrative = parsed.narrative || fullContent;
        dmResponse = parsed;
        
        const updates = get().parseCharacterFromResponse(parsed);
        set(s => ({ characterCreation: { ...s.characterCreation, ...updates } }));
      } catch {
        // JSON 解析失败
      }

      set((s) => ({
        conversationHistory: [
          ...s.conversationHistory,
          {
            role: 'dm',
            content: narrative,
            timestamp: Date.now(),
            dmResponse
          },
        ],
        isStreaming: false,
        streamingContent: '',
      }));

    } catch {
      set({ 
        error: 'DM暂时失去了联系……请重试。',
        isStreaming: false,
      });
    }
  },

  sendPlayerInput: async (input: string) => {
    const state = get();
    if (state.isStreaming) return;

    set({ isStreaming: true, streamingContent: '', error: null });

    get().addConversationTurn({
      role: 'player',
      content: input,
      timestamp: Date.now(),
    });

    const updatedHistory = get().conversationHistory;

    let systemPrompt: string;
    let userMessage: string;

    if (!state.characterCreation.isComplete || !state.player) {
      systemPrompt = buildCharacterCreationPrompt();
      const characterProgress = get().characterCreation;
      
      const historySummary = updatedHistory.slice(-8).map(h => 
        `${h.role === 'player' ? '玩家' : 'DM'}: ${h.content}`
      ).join('\n');

      userMessage = `=== 对话上下文 ===
${historySummary}

=== 最新输入 ===
玩家说：${input}

=== 当前角色创建进度 ===
- 名字：${characterProgress.name || '未知'}
- 身份类型：${characterProgress.identityType || '未知'}
- 形态：${characterProgress.form || '未知'}
- 时代：${characterProgress.era || '未知'}

请：
1. 根据对话内容更新 characterInfo 字段。
2. **必须包含 suggestedOptions 数组**，提供3个简短的对话选项。
3. 当 [名字、身份、形态、时代] 都确定后，设置 characterInfo.isComplete = true 并生成正式开场白。
4. 返回JSON格式。`;
    } else {
      systemPrompt = buildSystemPrompt({
        player: state.player,
        party: state.party,
        era: state.selectedEra!,
        victoria: state.victoria,
        conversationHistory: updatedHistory,
        triggeredMilestones: state.triggeredMilestones,
        currentScene: state.currentScene,
      });
      userMessage = buildUserMessage(input);
    }

    let fullContent = '';

    try {
      for await (const chunk of streamDMResponse(systemPrompt, userMessage)) {
        fullContent += chunk;
        set({ streamingContent: fullContent });
      }

      let dmResponse: any;
      try {
        dmResponse = JSON.parse(fullContent);
      } catch {
        dmResponse = { narrative: fullContent, speaker: 'dm' };
      }

      set((s) => ({
        conversationHistory: [
          ...s.conversationHistory,
          {
            role: 'dm',
            content: dmResponse.narrative,
            timestamp: Date.now(),
            dmResponse,
          },
        ],
        isStreaming: false,
        streamingContent: '',
      }));

      const characterUpdates = get().parseCharacterFromResponse(dmResponse);
      if (Object.keys(characterUpdates).length > 0) {
        set((s) => ({
          characterCreation: { ...s.characterCreation, ...characterUpdates },
        }));
        
        const cc = get().characterCreation;
        if (cc.isComplete && cc.name && cc.identityType && cc.form && cc.era) {
          const newPlayer: PlayerCharacter = {
            name: cc.name,
            identityType: cc.identityType,
            identitySubtype: cc.identitySubtype || 'unknown',
            form: cc.form,
            factionStance: cc.factionStance || 'undecided',
            memoryAnchor: '',
            specialAbility: '',
          };
          
          set({ 
              player: newPlayer,
              selectedEra: cc.era,
              phase: 'playing' 
          });
          
          get().save();
        }
      }

      if (state.player && dmResponse.victoriaState) {
        get().updateVictoriaTrust(dmResponse.victoriaState.trustDelta);
      }

      if (dmResponse.partyEvents) {
        get().processPartyEvents(dmResponse.partyEvents);
      }

      if (dmResponse.milestoneTriggered) {
        get().triggerMilestone(dmResponse.milestoneTriggered);
      }

      get().save();
    } catch {
      set({ 
        error: 'DM暂时失去了联系……请重试。',
        isStreaming: false,
      });
    }
  },
}));
