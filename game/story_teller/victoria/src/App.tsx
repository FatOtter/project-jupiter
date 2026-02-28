import { useState } from 'react';
import { GameScreen } from './components/screens/GameScreen';

function App() {
  return (
    <div className="min-h-screen bg-game-bg text-game-text font-mono relative overflow-hidden">
      <div className="scanline"></div>
      <GameScreen />
    </div>
  );
}

export default App;
