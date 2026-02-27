export interface CrewMember {
  id: string
  name: string
  role: string
  portrait?: string // path to image
}

export const CREW: CrewMember[] = [
  { id: 'iron_uncle', name: 'Iron Uncle', role: 'Captain (Cyborg)' },
  { id: 'qiang', name: 'Qiang', role: 'Pilot (Human)' },
  { id: 'viper', name: 'Viper', role: 'Navigator (Android)' },
  { id: 'tank', name: 'Tank', role: 'Engineer (Heavy Frame)' },
  { id: 'ava', name: 'Ava', role: 'Ship AI' },
]

export const OPTIONS = {
  status: ['Alive', 'Dead', 'MIA', 'Transformed', 'Deactivated'],
  cause: ['Gravity Crush', 'Radiation', 'Manual Sacrifice', 'Logic Plague', 'Murder', 'Crossover Protocol'],
  culprit: ['N/A', 'Iron Uncle', 'Qiang', 'Jupiter Storm', 'Ava', 'Saboteur']
}

// The Truth
export const SOLUTION = {
  qiang: { status: 'Transformed', cause: 'Crossover Protocol', culprit: 'Iron Uncle' },
  iron_uncle: { status: 'Alive', cause: 'Logic Plague', culprit: 'Jupiter Storm' },
  // ... simplify others for MVP
}
