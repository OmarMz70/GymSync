export const MUSCLES = [
  { id: 'chest', name: 'Chest' },
  { id: 'front-delts', name: 'Front Delts' },
  { id: 'side-delts', name: 'Side Delts' },
  { id: 'rear-delts', name: 'Rear Delts' },
  { id: 'traps', name: 'Traps' },
  { id: 'lats', name: 'Lats' },
  { id: 'upper-back', name: 'Upper Back' },
  { id: 'lower-back', name: 'Lower Back' },
  { id: 'biceps', name: 'Biceps' },
  { id: 'triceps', name: 'Triceps' },
  { id: 'abs', name: 'Abs' },
  { id: 'quads', name: 'Quads' },
  { id: 'hamstrings', name: 'Hamstrings' },
  { id: 'glutes', name: 'Glutes' },
  { id: 'calves', name: 'Calves' },
];

export const EXERCISES = [
  // ── Chest ──
  { id: 'bench-press', name: 'Bench Press (Barbell)', muscle: 'chest' },
  { id: 'incline-barbell-press', name: 'Incline Barbell Press', muscle: 'chest' },
  { id: 'decline-barbell-press', name: 'Decline Barbell Press', muscle: 'chest' },
  { id: 'flat-dumbbell-press', name: 'Flat Dumbbell Press', muscle: 'chest' },
  { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', muscle: 'chest' },
  { id: 'machine-chest-press', name: 'Chest Press (Machine)', muscle: 'chest' },
  { id: 'incline-machine-press', name: 'Incline Chest Press (Machine)', muscle: 'chest' },
  { id: 'smith-bench-press', name: 'Bench Press (Smith Machine)', muscle: 'chest' },
  { id: 'smith-incline-press', name: 'Incline Press (Smith Machine)', muscle: 'chest' },
  { id: 'floor-press', name: 'Floor Press', muscle: 'chest' },
  { id: 'dumbbell-fly', name: 'Dumbbell Fly', muscle: 'chest' },
  { id: 'incline-dumbbell-fly', name: 'Incline Dumbbell Fly', muscle: 'chest' },
  { id: 'pec-deck', name: 'Pec Deck Fly (Machine)', muscle: 'chest' },
  { id: 'cable-crossover', name: 'Cable Crossover (High-to-Low)', muscle: 'chest' },
  { id: 'low-cable-fly', name: 'Cable Fly (Low-to-High)', muscle: 'chest' },
  { id: 'seated-cable-fly', name: 'Seated Cable Fly', muscle: 'chest' },
  { id: 'chest-dips', name: 'Dips (Chest)', muscle: 'chest' },
  { id: 'push-ups', name: 'Push-Ups', muscle: 'chest' },
  { id: 'deficit-push-ups', name: 'Deficit Push-Ups', muscle: 'chest' },

  // ── Front Delts ──
  { id: 'overhead-press', name: 'Overhead Press (Barbell)', muscle: 'front-delts' },
  { id: 'push-press', name: 'Push Press', muscle: 'front-delts' },
  { id: 'standing-dumbbell-press', name: 'Standing Dumbbell Press', muscle: 'front-delts' },
  { id: 'seated-dumbbell-press', name: 'Seated Dumbbell Shoulder Press', muscle: 'front-delts' },
  { id: 'arnold-press', name: 'Arnold Press', muscle: 'front-delts' },
  { id: 'machine-shoulder-press', name: 'Shoulder Press (Machine)', muscle: 'front-delts' },
  { id: 'smith-shoulder-press', name: 'Shoulder Press (Smith Machine)', muscle: 'front-delts' },
  { id: 'dumbbell-front-raise', name: 'Front Raise (Dumbbell)', muscle: 'front-delts' },
  { id: 'cable-front-raise', name: 'Front Raise (Cable)', muscle: 'front-delts' },
  { id: 'plate-front-raise', name: 'Front Raise (Plate)', muscle: 'front-delts' },
  { id: 'landmine-press', name: 'Landmine Press', muscle: 'front-delts' },

  // ── Side Delts ──
  { id: 'dumbbell-lateral-raise', name: 'Lateral Raise (Dumbbell)', muscle: 'side-delts' },
  { id: 'cable-lateral-raise', name: 'Lateral Raise (Cable)', muscle: 'side-delts' },
  { id: 'machine-lateral-raise', name: 'Lateral Raise (Machine)', muscle: 'side-delts' },
  { id: 'seated-lateral-raise', name: 'Seated Lateral Raise', muscle: 'side-delts' },
  { id: 'lean-in-lateral-raise', name: 'Lean-In Lateral Raise', muscle: 'side-delts' },
  { id: 'behind-back-cable-lateral', name: 'Behind-the-Back Cable Lateral', muscle: 'side-delts' },
  { id: 'cross-body-y-raise', name: 'Cross-Body Cable Y-Raise', muscle: 'side-delts' },
  { id: 'upright-row', name: 'Upright Row', muscle: 'side-delts' },
  { id: 'lu-raise', name: 'Lu Raise', muscle: 'side-delts' },

  // ── Rear Delts ──
  { id: 'reverse-pec-deck', name: 'Reverse Pec Deck (Machine)', muscle: 'rear-delts' },
  { id: 'dumbbell-rear-delt-fly', name: 'Rear Delt Fly (Dumbbell)', muscle: 'rear-delts' },
  { id: 'chest-supported-rear-fly', name: 'Chest-Supported Rear Delt Fly', muscle: 'rear-delts' },
  { id: 'cable-reverse-fly', name: 'Reverse Fly (Cable)', muscle: 'rear-delts' },
  { id: 'face-pull', name: 'Face Pull', muscle: 'rear-delts' },
  { id: 'rear-delt-row', name: 'Rear Delt Row', muscle: 'rear-delts' },

  // ── Traps ──
  { id: 'barbell-shrug', name: 'Barbell Shrug', muscle: 'traps' },
  { id: 'dumbbell-shrug', name: 'Dumbbell Shrug', muscle: 'traps' },
  { id: 'incline-dumbbell-shrug', name: 'Incline Dumbbell Shrug', muscle: 'traps' },
  { id: 'cable-shrug', name: 'Cable Shrug', muscle: 'traps' },
  { id: 'smith-shrug', name: 'Shrug (Smith Machine)', muscle: 'traps' },
  { id: 'trap-bar-shrug', name: 'Trap Bar Shrug', muscle: 'traps' },
  { id: 'kelso-shrug', name: 'Kelso Shrug (Chest-Supported)', muscle: 'traps' },
  { id: 'rack-pull', name: 'Rack Pull', muscle: 'traps' },
  { id: 'farmers-carry', name: "Farmer's Carry", muscle: 'traps' },

  // ── Lats ──
  { id: 'pull-ups', name: 'Pull-Ups', muscle: 'lats' },
  { id: 'chin-ups', name: 'Chin-Ups', muscle: 'lats' },
  { id: 'weighted-pull-up', name: 'Weighted Pull-Up', muscle: 'lats' },
  { id: 'assisted-pull-up', name: 'Assisted Pull-Up (Machine)', muscle: 'lats' },
  { id: 'lat-pulldown', name: 'Lat Pulldown (Wide Grip)', muscle: 'lats' },
  { id: 'close-grip-pulldown', name: 'Close-Grip Pulldown', muscle: 'lats' },
  { id: 'neutral-grip-pulldown', name: 'Neutral-Grip Pulldown', muscle: 'lats' },
  { id: 'single-arm-pulldown', name: 'Single-Arm Lat Pulldown', muscle: 'lats' },
  { id: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', muscle: 'lats' },
  { id: 'machine-pullover', name: 'Pullover (Machine)', muscle: 'lats' },
  { id: 'dumbbell-pullover', name: 'Dumbbell Pullover', muscle: 'lats' },

  // ── Upper Back ──
  { id: 'barbell-row', name: 'Barbell Row', muscle: 'upper-back' },
  { id: 'pendlay-row', name: 'Pendlay Row', muscle: 'upper-back' },
  { id: 'dumbbell-row', name: 'Dumbbell Row', muscle: 'upper-back' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', muscle: 'upper-back' },
  { id: 'wide-grip-cable-row', name: 'Wide-Grip Cable Row', muscle: 'upper-back' },
  { id: 't-bar-row', name: 'T-Bar Row', muscle: 'upper-back' },
  { id: 'chest-supported-row', name: 'Chest-Supported Row (Dumbbell)', muscle: 'upper-back' },
  { id: 'seal-row', name: 'Seal Row', muscle: 'upper-back' },
  { id: 'machine-row', name: 'Row (Machine)', muscle: 'upper-back' },
  { id: 'machine-high-row', name: 'High Row (Machine)', muscle: 'upper-back' },
  { id: 'machine-low-row', name: 'Low Row (Machine)', muscle: 'upper-back' },
  { id: 'meadows-row', name: 'Meadows Row', muscle: 'upper-back' },
  { id: 'inverted-row', name: 'Inverted Row', muscle: 'upper-back' },

  // ── Lower Back ──
  { id: 'deadlift', name: 'Deadlift', muscle: 'lower-back' },
  { id: 'back-extension', name: 'Back Extension (45°)', muscle: 'lower-back' },
  { id: 'reverse-hyperextension', name: 'Reverse Hyperextension', muscle: 'lower-back' },
  { id: 'good-morning', name: 'Good Morning', muscle: 'lower-back' },
  { id: 'superman-hold', name: 'Superman Hold', muscle: 'lower-back' },
  { id: 'bird-dog', name: 'Bird Dog', muscle: 'lower-back' },

  // ── Biceps ──
  { id: 'barbell-curl', name: 'Barbell Curl', muscle: 'biceps' },
  { id: 'ez-bar-curl', name: 'EZ-Bar Curl', muscle: 'biceps' },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', muscle: 'biceps' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscle: 'biceps' },
  { id: 'cable-hammer-curl', name: 'Cable Hammer Curl (Rope)', muscle: 'biceps' },
  { id: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', muscle: 'biceps' },
  { id: 'preacher-curl', name: 'Preacher Curl (EZ-Bar)', muscle: 'biceps' },
  { id: 'machine-preacher-curl', name: 'Preacher Curl (Machine)', muscle: 'biceps' },
  { id: 'cable-curl', name: 'Cable Curl', muscle: 'biceps' },
  { id: 'bayesian-curl', name: 'Bayesian Curl (Cable)', muscle: 'biceps' },
  { id: 'concentration-curl', name: 'Concentration Curl', muscle: 'biceps' },
  { id: 'spider-curl', name: 'Spider Curl', muscle: 'biceps' },
  { id: 'drag-curl', name: 'Drag Curl', muscle: 'biceps' },
  { id: 'reverse-curl', name: 'Reverse Curl', muscle: 'biceps' },
  { id: 'zottman-curl', name: 'Zottman Curl', muscle: 'biceps' },

  // ── Triceps ──
  { id: 'rope-pushdown', name: 'Cable Pushdown (Rope)', muscle: 'triceps' },
  { id: 'bar-pushdown', name: 'Cable Pushdown (Bar)', muscle: 'triceps' },
  { id: 'single-arm-pushdown', name: 'Single-Arm Cable Pushdown', muscle: 'triceps' },
  { id: 'cross-body-extension', name: 'Cross-Body Cable Extension', muscle: 'triceps' },
  { id: 'skull-crushers', name: 'Skull Crushers', muscle: 'triceps' },
  { id: 'jm-press', name: 'JM Press', muscle: 'triceps' },
  { id: 'overhead-cable-extension', name: 'Overhead Cable Extension', muscle: 'triceps' },
  { id: 'overhead-dumbbell-extension', name: 'Overhead Dumbbell Extension', muscle: 'triceps' },
  { id: 'close-grip-bench-press', name: 'Close-Grip Bench Press', muscle: 'triceps' },
  { id: 'machine-tricep-extension', name: 'Tricep Extension (Machine)', muscle: 'triceps' },
  { id: 'machine-dip', name: 'Seated Dip (Machine)', muscle: 'triceps' },
  { id: 'tricep-dips', name: 'Dips (Triceps)', muscle: 'triceps' },
  { id: 'bench-dips', name: 'Bench Dips', muscle: 'triceps' },
  { id: 'dumbbell-kickback', name: 'Dumbbell Kickback', muscle: 'triceps' },

  // ── Abs ──
  { id: 'crunch', name: 'Crunch', muscle: 'abs' },
  { id: 'machine-crunch', name: 'Crunch (Machine)', muscle: 'abs' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscle: 'abs' },
  { id: 'decline-sit-up', name: 'Decline Sit-Up', muscle: 'abs' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscle: 'abs' },
  { id: 'hanging-knee-raise', name: 'Hanging Knee Raise', muscle: 'abs' },
  { id: 'captains-chair', name: "Captain's Chair Leg Raise", muscle: 'abs' },
  { id: 'lying-leg-raise', name: 'Lying Leg Raise', muscle: 'abs' },
  { id: 'plank', name: 'Plank', muscle: 'abs' },
  { id: 'side-plank', name: 'Side Plank', muscle: 'abs' },
  { id: 'dead-bug', name: 'Dead Bug', muscle: 'abs' },
  { id: 'hollow-hold', name: 'Hollow Hold', muscle: 'abs' },
  { id: 'russian-twist', name: 'Russian Twist', muscle: 'abs' },
  { id: 'cable-woodchopper', name: 'Cable Woodchopper', muscle: 'abs' },
  { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', muscle: 'abs' },

  // ── Quads ──
  { id: 'barbell-squat', name: 'Squat (Barbell)', muscle: 'quads' },
  { id: 'front-squat', name: 'Front Squat', muscle: 'quads' },
  { id: 'smith-machine-squat', name: 'Squat (Smith Machine)', muscle: 'quads' },
  { id: 'goblet-squat', name: 'Goblet Squat', muscle: 'quads' },
  { id: 'leg-press', name: 'Leg Press', muscle: 'quads' },
  { id: 'single-leg-press', name: 'Single-Leg Press', muscle: 'quads' },
  { id: 'hack-squat', name: 'Hack Squat (Machine)', muscle: 'quads' },
  { id: 'pendulum-squat', name: 'Pendulum Squat (Machine)', muscle: 'quads' },
  { id: 'v-squat', name: 'V-Squat (Machine)', muscle: 'quads' },
  { id: 'belt-squat', name: 'Belt Squat', muscle: 'quads' },
  { id: 'leg-extension', name: 'Leg Extension (Machine)', muscle: 'quads' },
  { id: 'sissy-squat', name: 'Sissy Squat', muscle: 'quads' },
  { id: 'reverse-nordic', name: 'Reverse Nordic Curl', muscle: 'quads' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscle: 'quads' },
  { id: 'walking-lunge', name: 'Walking Lunge', muscle: 'quads' },
  { id: 'reverse-lunge', name: 'Reverse Lunge', muscle: 'quads' },
  { id: 'trap-bar-deadlift', name: 'Trap Bar Deadlift', muscle: 'quads' },

  // ── Hamstrings ──
  { id: 'romanian-deadlift', name: 'Romanian Deadlift (Barbell)', muscle: 'hamstrings' },
  { id: 'dumbbell-rdl', name: 'Romanian Deadlift (Dumbbell)', muscle: 'hamstrings' },
  { id: 'stiff-leg-deadlift', name: 'Stiff-Leg Deadlift', muscle: 'hamstrings' },
  { id: 'lying-leg-curl', name: 'Lying Leg Curl (Machine)', muscle: 'hamstrings' },
  { id: 'seated-leg-curl', name: 'Seated Leg Curl (Machine)', muscle: 'hamstrings' },
  { id: 'standing-leg-curl', name: 'Standing Single-Leg Curl (Machine)', muscle: 'hamstrings' },
  { id: 'nordic-curl', name: 'Nordic Curl', muscle: 'hamstrings' },
  { id: 'glute-ham-raise', name: 'Glute-Ham Raise', muscle: 'hamstrings' },
  { id: 'single-leg-rdl', name: 'Single-Leg Romanian Deadlift', muscle: 'hamstrings' },

  // ── Glutes ──
  { id: 'hip-thrust', name: 'Hip Thrust (Barbell)', muscle: 'glutes' },
  { id: 'machine-hip-thrust', name: 'Hip Thrust (Machine)', muscle: 'glutes' },
  { id: 'b-stance-hip-thrust', name: 'B-Stance Hip Thrust', muscle: 'glutes' },
  { id: 'kas-glute-bridge', name: 'KAS Glute Bridge', muscle: 'glutes' },
  { id: 'glute-bridge', name: 'Glute Bridge', muscle: 'glutes' },
  { id: 'sumo-deadlift', name: 'Sumo Deadlift', muscle: 'glutes' },
  { id: 'cable-kickback', name: 'Cable Kickback', muscle: 'glutes' },
  { id: 'machine-glute-kickback', name: 'Glute Kickback (Machine)', muscle: 'glutes' },
  { id: 'cable-pull-through', name: 'Cable Pull-Through', muscle: 'glutes' },
  { id: 'hip-abduction', name: 'Hip Abduction (Machine)', muscle: 'glutes' },
  { id: 'step-ups', name: 'Step-Ups', muscle: 'glutes' },

  // ── Calves ──
  { id: 'standing-calf-raise', name: 'Standing Calf Raise (Machine)', muscle: 'calves' },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise (Machine)', muscle: 'calves' },
  { id: 'leg-press-calf-raise', name: 'Leg Press Calf Raise', muscle: 'calves' },
  { id: 'smith-machine-calf-raise', name: 'Calf Raise (Smith Machine)', muscle: 'calves' },
  { id: 'donkey-calf-raise', name: 'Donkey Calf Raise', muscle: 'calves' },
  { id: 'single-leg-calf-raise', name: 'Single-Leg Calf Raise (Dumbbell)', muscle: 'calves' },
  { id: 'tibialis-raise', name: 'Tibialis Raise', muscle: 'calves' },
];

export const getMuscleName = (muscleId) =>
  MUSCLES.find(m => m.id === muscleId)?.name || muscleId;

export const getExercisesByMuscle = (muscleId) =>
  EXERCISES.filter(ex => ex.muscle === muscleId);

export const searchExercises = (query = '', muscleIds = null) => {
  // Match each word independently so "machine incline" finds "Incline Chest Press (Machine)"
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return EXERCISES.filter(ex => {
    if (muscleIds && muscleIds.length > 0 && !muscleIds.includes(ex.muscle)) return false;
    const name = ex.name.toLowerCase();
    return words.every(w => name.includes(w));
  });
};
