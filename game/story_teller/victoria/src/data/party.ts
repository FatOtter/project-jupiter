import type { PartyMember, PartyMemberType, Form } from '../types/game';

export function generateMemberId(): string {
  return `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createPartyMember(
  name: string,
  identity: string,
  form: Form,
  declaredType: PartyMemberType,
  background?: string
): PartyMember {
  return {
    id: generateMemberId(),
    name,
    identity,
    form,
    declaredType,
    knownInfo: background || '',
    isRevealed: false,
    status: 'active',
  };
}

export const PARTY_TYPE_ICONS: Record<PartyMemberType, string> = {
  companion: '[▲]',
  antagonist: '[▼]',
  wildcard: '[?]',
};

export const FORM_NAMES: Record<Form, string> = {
  carbon: '碳基',
  silicon: '硅基',
  hybrid: '混合',
  unknown: '未知',
};

export const PARTY_TYPE_NAMES: Record<PartyMemberType, string> = {
  companion: '同伴',
  antagonist: '敌对者',
  wildcard: '神秘人物',
};
