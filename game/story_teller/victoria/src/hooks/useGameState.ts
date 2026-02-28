import { useGameStore } from '../store/gameStore';
import type { PlayerCharacter, Era } from '../types/game';
import { createPartyMember } from '../data/party';
import { useCallback } from 'react';

export function useGameState() {
  const store = useGameStore();

  const createPlayer = useCallback((player: PlayerCharacter) => {
    store.setPlayer(player);
  }, [store]);

  const addPartyMember = useCallback((
    name: string,
    identity: string,
    form: Parameters<typeof createPartyMember>[2],
    declaredType: Parameters<typeof createPartyMember>[3],
    background?: string
  ) => {
    if (store.party.length >= 3) return false;
    const member = createPartyMember(name, identity, form, declaredType, background);
    store.addPartyMember(member);
    return true;
  }, [store]);

  const removePartyMember = useCallback((memberId: string) => {
    store.removePartyMember(memberId);
  }, [store]);

  const selectEra = useCallback((era: Era) => {
    store.setEra(era);
  }, [store]);

  const selectScene = useCallback((scene: string) => {
    store.setScene(scene);
  }, [store]);

  const beginGame = useCallback(() => {
    store.startGame();
  }, [store]);

  const resetGame = useCallback(() => {
    store.resetGame();
  }, [store]);

  const saveGame = useCallback(() => {
    store.save();
  }, [store]);

  const loadGame = useCallback(() => {
    return store.load();
  }, [store]);

  return {
    phase: store.phase,
    player: store.player,
    party: store.party,
    selectedEra: store.selectedEra,
    currentScene: store.currentScene,
    victoria: store.victoria,
    triggeredMilestones: store.triggeredMilestones,
    endingTriggered: store.endingTriggered,
    currentStep: store.currentStep,
    setCurrentStep: store.setCurrentStep,

    createPlayer,
    addPartyMember,
    removePartyMember,
    selectEra,
    selectScene,
    beginGame,
    resetGame,
    saveGame,
    loadGame,
  };
}
