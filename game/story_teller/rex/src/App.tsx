import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { CharacterCreationFlow } from './components/screens/CharacterCreationFlow';
import { GameScreen } from './components/screens/GameScreen';
import { EndingScreen } from './components/screens/EndingScreen';

function App() {
  const { phase, load } = useGameStore();

  useEffect(() => {
    // Try to load saved game on mount
    load();
  }, [load]);

  return (
    <div className="w-full h-screen bg-zinc-900">
      {phase === 'character_creation' && <CharacterCreationFlow />}
      {phase === 'playing' && <GameScreen />}
      {phase === 'ending' && <EndingScreen />}
    </div>
  );
}

export default App;
