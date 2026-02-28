import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import type { Era } from '../../../types/game';

const ERAS_LIST: { id: Era; label: string; year: string }[] = [
  { id: 'genesis', label: 'GEN', year: '2062' },
  { id: 'golden_age', label: 'GLD', year: '2120' },
  { id: 'great_doubt', label: 'DBT', year: '2300' },
  { id: 'singularity_trap', label: 'TRP', year: '2350' },
  { id: 'return', label: 'RTN', year: '10000+' },
];

export const EraProgressBar: React.FC = () => {
  const { selectedEra } = useGameStore();

  const currentIndex = ERAS_LIST.findIndex(e => e.id === selectedEra);

  return (
    <div className="w-12 h-full border-r border-game-border flex flex-col items-center py-8 gap-0 relative bg-black/40">
      {/* 贯穿虚线 */}
      <div className="absolute top-0 bottom-0 w-[1px] bg-game-border/30 border-l border-dashed border-game-border/20 left-1/2 -translate-x-1/2" />
      
      {ERAS_LIST.map((era, index) => {
        const isActive = era.id === selectedEra;
        const isPast = index < currentIndex;
        
        return (
          <div key={era.id} className="flex-1 flex flex-col items-center relative z-10 w-full group">
            {/* 年份标签 */}
            <div className={`text-[8px] font-bold mb-2 transition-colors duration-500 ${
              isActive ? 'text-game-text shadow-glow' : 'text-game-text-dim/30'
            }`}>
              {era.year}
            </div>
            
            {/* 节点球 */}
            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-700 ease-out ${
              isActive 
                ? 'bg-game-text border-game-text scale-125 shadow-[0_0_15px_rgba(34,197,94,0.8)]' 
                : isPast
                  ? 'bg-game-text/20 border-game-text/40'
                  : 'bg-black border-game-border/50'
            }`} />
            
            {/* 时代缩写 */}
            <div className={`mt-2 text-[9px] font-mono font-black transition-all ${
              isActive ? 'text-game-text' : 'text-game-text-dim/20 group-hover:text-game-text-dim/50'
            }`}>
              {era.label}
            </div>

            {/* 激活时的扫描光束 */}
            {isActive && (
              <div className="absolute inset-0 bg-game-text/5 animate-pulse rounded-sm pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
};
