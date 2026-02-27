import { GameState } from '../types/game';

const SAVE_KEY = 'project_jupiter_storyteller_rex_save';
const SAVE_VERSION = '1.0';

export const saveGame = (state: GameState): void => {
  try {
    const saveData = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      state,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

export const loadGame = (): GameState | null => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    
    const { version, state } = JSON.parse(raw);
    if (version !== SAVE_VERSION) {
      console.warn('Save version mismatch, discarding');
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const clearSave = (): void => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to clear save:', error);
  }
};

export const exportGame = (state: GameState): string => {
  return JSON.stringify({
    version: SAVE_VERSION,
    exportedAt: Date.now(),
    state,
  }, null, 2);
};

export const importGame = (jsonString: string): GameState | null => {
  try {
    const { version, state } = JSON.parse(jsonString);
    if (version !== SAVE_VERSION) {
      console.warn('Import version mismatch');
      return null;
    }
    return state;
  } catch (error) {
    console.error('Failed to import game:', error);
    return null;
  }
};
