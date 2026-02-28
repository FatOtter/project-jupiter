import type { GameState } from '../types/game';

const SAVE_KEY = 'project_jupiter_storyteller_save';
const SAVE_VERSION = '1.0';

interface SaveData {
  version: string;
  savedAt: number;
  state: GameState;
}

export function saveGame(state: GameState): void {
  const saveData: SaveData = {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    state,
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('存档保存失败:', error);
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const data: SaveData = JSON.parse(raw);
    
    if (data.version !== SAVE_VERSION) {
      console.warn('存档版本不兼容，已清除');
      clearGame();
      return null;
    }

    return data.state;
  } catch (error) {
    console.error('存档加载失败:', error);
    return null;
  }
}

export function clearGame(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function getSaveTimestamp(): number | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const data: SaveData = JSON.parse(raw);
    return data.savedAt;
  } catch {
    return null;
  }
}
