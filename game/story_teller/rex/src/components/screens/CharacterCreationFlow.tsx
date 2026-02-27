import React, { useState } from 'react';
import { IdentityType, PlayerCharacter, PartyMember, Era } from '../../types/game';
import { IdentityTypeSelect, CharacterForm, PartyCreation, EraSelect } from './CharacterCreation';
import { useGameStore } from '../../store/gameStore';
import { eras } from '../../data/eras';

type CreationStep = 'identity' | 'character' | 'party' | 'era';

export const CharacterCreation: React.FC = () => {
  const [step, setStep] = useState<CreationStep>('identity');
  const [identityType, setIdentityType] = useState<IdentityType | null>(null);
  const [selectedEra, setSelectedEra] = useState<Era | null>(null);
  
  const {
    setPlayer,
    addPartyMember,
    setSelectedEra: setStoreEra,
    setCurrentScene,
    startGame,
  } = useGameStore();

  const handleIdentitySelect = (type: IdentityType) => {
    setIdentityType(type);
    setStep('character');
  };

  const handleCharacterComplete = (character: PlayerCharacter) => {
    setPlayer(character);
    setStep('party');
  };

  const handlePartyComplete = (party: PartyMember[]) => {
    party.forEach((member) => addPartyMember(member));
    setStep('era');
  };

  const handleEraComplete = (era: Era, scene: string) => {
    setSelectedEra(era);
    setStoreEra(era);
    setCurrentScene(eras[era].openingScenes.find(s => s.id === scene)?.name || scene);
    startGame();
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-emerald-400 font-mono">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl text-emerald-400 mb-2">Project Jupiter</h1>
          <p className="text-zinc-500">漫行者纪事 · The Wanderer's Chronicle</p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {(['identity', 'character', 'party', 'era'] as CreationStep[]).map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step === s
                    ? 'bg-emerald-600 text-zinc-900'
                    : i < ['identity', 'character', 'party', 'era'].indexOf(step)
                    ? 'bg-emerald-800 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={`w-8 h-0.5 self-center ${
                    i < ['identity', 'character', 'party', 'era'].indexOf(step)
                      ? 'bg-emerald-600'
                      : 'bg-zinc-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
          {step === 'identity' && (
            <IdentityTypeSelect
              selected={identityType}
              onSelect={handleIdentitySelect}
            />
          )}

          {step === 'character' && identityType && (
            <CharacterForm
              identityType={identityType}
              onComplete={handleCharacterComplete}
              onBack={() => setStep('identity')}
            />
          )}

          {step === 'party' && (
            <PartyCreation
              selectedEra={selectedEra}
              onComplete={handlePartyComplete}
              onBack={() => setStep('character')}
            />
          )}

          {step === 'era' && (
            <EraSelect
              onComplete={handleEraComplete}
              onBack={() => setStep('party')}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zinc-600">
          按 Enter 继续 · 基于 Project Jupiter 世界观
        </div>
      </div>
    </div>
  );
};
