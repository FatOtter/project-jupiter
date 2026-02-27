export type Era = 'genesis' | 'golden_age' | 'great_doubt' | 'singularity_trap' | 'return';

export type IdentityType = 'awakened_ai' | 'diver' | 'resident' | 'wanderer';

export type Form = 'carbon' | 'silicon' | 'hybrid' | 'unknown';

export type FactionStance = 'cloud' | 'edge' | 'neutral' | 'undecided';

export type MaintenanceLevel = 'sufficient' | 'tight' | 'critical';

export type PartyMemberType = 'companion' | 'antagonist' | 'wildcard';

export type PartyMemberStatus = 'active' | 'dead' | 'left' | 'betrayed';

export type EndingType = 'witness' | 'changer' | 'leaver';

export type MilestoneId =
  | 'last_tea'
  | 'broadcast_storm'
  | 'caste_confrontation'
  | 'yang_post'
  | 'ascending_choice'
  | 'yang_paper'
  | 'node_attack'
  | 'node_silence'
  | 'last_broadcast'
  | 'companion_betrayal'
  | 'antagonist_alliance'
  | 'wildcard_revealed'
  | 'companion_sacrifice';

export type NotebookEntryId =
  | 'node47_first_day'
  | 'yang_post_2162'
  | 'last_tea_ceremony'
  | 'broadcast_storm'
  | 'yang_sanatorium'
  | 'zhulong_closure'
  | 'day_7000';

export interface PlayerCharacter {
  name: string;
  identityType: IdentityType;
  identitySubtype: string;
  form: Form;
  factionStance: FactionStance;
  memoryAnchor: string;
  specialAbility: string;
  maintenanceLevel?: MaintenanceLevel;
  instanceCount?: 'single' | 'multiple';
}

export interface PartyMember {
  id: string;
  name: string;
  identity: string;
  form: Form;
  declaredType: PartyMemberType;
  knownInfo: string;
  isRevealed: boolean;
  revealedStance?: 'companion' | 'antagonist';
  status: PartyMemberStatus;
  statusNote?: string;
}

export interface VictoriaState {
  trustLevel: number;
  unlockedNotebook: NotebookEntryId[];
  hasAppearedThisSession: boolean;
}

export type PartyEvent =
  | { type: 'stance_revealed'; memberId: string; newStance: 'companion' | 'antagonist' }
  | { type: 'member_left'; memberId: string; reason: string }
  | { type: 'member_died'; memberId: string; cause: string }
  | { type: 'member_betrayed'; memberId: string; detail: string }
  | { type: 'info_unlocked'; memberId: string; newInfo: string }
  | { type: 'stance_drifted'; memberId: string; direction: 'positive' | 'negative' };

export interface DMResponse {
  narrative: string;
  speaker?: 'dm' | 'victoria' | string;
  partyEvents?: PartyEvent[];
  milestoneTriggered?: MilestoneId;
  victoriaState?: {
    trustDelta: number;
    notebookHint?: boolean;
    notebookUnlock?: NotebookEntryId;
  };
  endingTrigger?: EndingType | null;
  sceneNote?: string;
}

export interface ConversationTurn {
  role: 'player' | 'dm';
  content: string;
  timestamp: number;
  dmResponse?: DMResponse;
}

export interface GameState {
  phase: 'character_creation' | 'playing' | 'ending';
  player: PlayerCharacter | null;
  party: PartyMember[];
  selectedEra: Era | null;
  currentScene: string;
  triggeredMilestones: MilestoneId[];
  victoria: VictoriaState;
  conversationHistory: ConversationTurn[];
  endingTriggered: EndingType | null;
  isStreaming: boolean;
  currentStreamingContent: string;
}
