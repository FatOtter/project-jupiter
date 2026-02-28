import React from 'react';
import { GameLayout } from './GameLayout';

export const GameScreen: React.FC = () => {
  return (
    <div className="game-screen w-full h-screen">
      <GameLayout />
    </div>
  );
};
