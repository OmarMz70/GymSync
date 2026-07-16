export const SPLIT_PRESETS = [
  {
    id: 'ppl',
    name: 'Push Pull Legs',
    description: 'The classic 3-day rotation. Push, pull, then legs.',
    days: [
      { id: 'push', name: 'Push', muscles: ['chest', 'front-delts', 'side-delts', 'triceps'] },
      { id: 'pull', name: 'Pull', muscles: ['lats', 'upper-back', 'rear-delts', 'traps', 'biceps'] },
      { id: 'legs', name: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'] },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower',
    description: 'Everything above the waist one day, everything below the next.',
    days: [
      { id: 'upper', name: 'Upper', muscles: ['chest', 'front-delts', 'side-delts', 'rear-delts', 'lats', 'upper-back', 'biceps', 'triceps'] },
      { id: 'lower', name: 'Lower', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'lower-back', 'abs'] },
    ],
  },
  {
    id: 'pro-split',
    name: 'Pro Split',
    description: 'One muscle group per day, bodybuilder style.',
    days: [
      { id: 'chest-day', name: 'Chest', muscles: ['chest', 'abs'] },
      { id: 'back-day', name: 'Back', muscles: ['lats', 'upper-back', 'lower-back', 'traps'] },
      { id: 'shoulder-day', name: 'Shoulders', muscles: ['front-delts', 'side-delts', 'rear-delts'] },
      { id: 'arm-day', name: 'Arms', muscles: ['biceps', 'triceps'] },
      { id: 'leg-day', name: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
    ],
  },
  {
    id: 'arnold',
    name: 'Arnold Split',
    description: "Arnold's classic — chest with back, shoulders with arms, then legs. Each pairing hits twice a week.",
    days: [
      { id: 'chest-back-a', name: 'Chest & Back A', muscles: ['chest', 'lats', 'upper-back'] },
      { id: 'shoulders-arms-a', name: 'Shoulders & Arms A', muscles: ['front-delts', 'side-delts', 'rear-delts', 'biceps', 'triceps'] },
      { id: 'legs-a', name: 'Legs A', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'] },
      { id: 'chest-back-b', name: 'Chest & Back B', muscles: ['chest', 'lats', 'upper-back'] },
      { id: 'shoulders-arms-b', name: 'Shoulders & Arms B', muscles: ['front-delts', 'side-delts', 'rear-delts', 'biceps', 'triceps'] },
      { id: 'legs-b', name: 'Legs B', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'] },
    ],
  },
  {
    id: 'pplul',
    name: 'PPL + Upper/Lower',
    description: 'Push Pull Legs plus an Upper and a Lower day — 5 days of high frequency.',
    days: [
      { id: 'push', name: 'Push', muscles: ['chest', 'front-delts', 'side-delts', 'triceps'] },
      { id: 'pull', name: 'Pull', muscles: ['lats', 'upper-back', 'rear-delts', 'traps', 'biceps'] },
      { id: 'legs', name: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { id: 'upper', name: 'Upper', muscles: ['chest', 'front-delts', 'side-delts', 'lats', 'upper-back', 'biceps', 'triceps'] },
      { id: 'lower', name: 'Lower', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'lower-back', 'abs'] },
    ],
  },
  {
    id: 'anterior-posterior',
    name: 'Anterior / Posterior',
    description: 'Front of the body one day, back of the body the next.',
    days: [
      { id: 'anterior', name: 'Anterior', muscles: ['chest', 'front-delts', 'side-delts', 'biceps', 'quads', 'abs'] },
      { id: 'posterior', name: 'Posterior', muscles: ['lats', 'upper-back', 'lower-back', 'traps', 'rear-delts', 'triceps', 'hamstrings', 'glutes', 'calves'] },
    ],
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Hit everything in one session.',
    days: [
      { id: 'full-body', name: 'Full Body', muscles: ['chest', 'front-delts', 'lats', 'upper-back', 'quads', 'hamstrings', 'glutes', 'abs'] },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Build your own split from scratch.',
    days: [],
  },
];
