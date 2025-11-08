// Base de données d'exercices de musculation
// Organisée par groupe musculaire

const EXERCISES_DATABASE = {
  // PECTORAUX
  pectoraux: [
    "Développé couché",
    "Développé incliné",
    "Développé décliné",
    "Bench Press", // Anglais pour développé couché
    "Incline Bench Press",
    "Decline Bench Press",
    "Développé avec haltères",
    "Dumbbell Press",
    "Écarté couché",
    "Dumbbell Fly",
    "Écarté incliné",
    "Incline Fly",
    "Écarté à la poulie",
    "Cable Fly",
    "Pompes",
    "Push-ups",
    "Pompes piquées",
    "Pike Push-ups",
    "Dips pectoraux",
    "Chest Dips",
    "Pull-over",
    "Pullover",
    "Pec Deck",
    "Butterfly"
  ],

  // DOS
  dos: [
    "Tractions",
    "Pull-ups",
    "Tractions supination",
    "Chin-ups",
    "Tirage vertical",
    "Lat Pulldown",
    "Tirage horizontal",
    "Seated Row",
    "Rowing barre",
    "Barbell Row",
    "Rowing T-bar",
    "T-Bar Row",
    "Rowing haltère",
    "Dumbbell Row",
    "Rowing un bras",
    "One Arm Row",
    "Rowing Pendlay",
    "Pendlay Row",
    "Soulevé de terre",
    "Deadlift",
    "Soulevé de terre roumain",
    "Romanian Deadlift",
    "Soulevé de terre sumo",
    "Sumo Deadlift",
    "Good Morning",
    "Shrugs trapèzes",
    "Shrugs",
    "Face Pull",
    "Superman",
    "Back Extension"
  ],

  // ÉPAULES
  epaules: [
    "Développé militaire",
    "Military Press",
    "Overhead Press",
    "Développé haltères",
    "Dumbbell Shoulder Press",
    "Développé Arnold",
    "Arnold Press",
    "Élévations latérales",
    "Lateral Raises",
    "Élévations frontales",
    "Front Raises",
    "Oiseau",
    "Rear Delt Fly",
    "Face Pull",
    "Rowing menton",
    "Upright Row",
    "Pike Push-ups",
    "Handstand Push-ups",
    "L-Sit"
  ],

  // BRAS - BICEPS
  biceps: [
    "Curl barre",
    "Barbell Curl",
    "Curl EZ",
    "EZ Bar Curl",
    "Curl haltères",
    "Dumbbell Curl",
    "Curl alterné",
    "Alternating Curl",
    "Curl marteau",
    "Hammer Curl",
    "Curl incliné",
    "Incline Curl",
    "Curl pupitre",
    "Preacher Curl",
    "Curl araignée",
    "Spider Curl",
    "Curl concentration",
    "Concentration Curl",
    "Curl 21",
    "21s Curl",
    "Curl Zottman",
    "Zottman Curl"
  ],

  // BRAS - TRICEPS
  triceps: [
    "Dips",
    "Tricep Dips",
    "Extension nuque",
    "Overhead Extension",
    "Barre au front",
    "Skull Crusher",
    "Extension poulie",
    "Cable Pushdown",
    "Extension poulie corde",
    "Rope Pushdown",
    "Kickback",
    "Tricep Kickback",
    "Extension un bras",
    "Single Arm Extension",
    "Diamond Push-ups",
    "Close Grip Bench Press",
    "Dips prise serrée"
  ],

  // JAMBES - QUADRICEPS
  quadriceps: [
    "Squat",
    "Back Squat",
    "Squat avant",
    "Front Squat",
    "Squat bulgare",
    "Bulgarian Split Squat",
    "Squat sumo",
    "Sumo Squat",
    "Goblet Squat",
    "Leg Press",
    "Presse à cuisses",
    "Hack Squat",
    "Extension jambes",
    "Leg Extension",
    "Fentes",
    "Lunges",
    "Fentes marchées",
    "Walking Lunges",
    "Fentes avant",
    "Forward Lunges",
    "Fentes arrière",
    "Reverse Lunges",
    "Step-ups",
    "Box Jumps"
  ],

  // JAMBES - ISCHIO-JAMBIERS
  ischio: [
    "Soulevé de terre roumain",
    "Romanian Deadlift",
    "Leg Curl",
    "Leg Curl allongé",
    "Lying Leg Curl",
    "Leg Curl assis",
    "Seated Leg Curl",
    "Good Morning",
    "Nordic Curl",
    "Glute Ham Raise",
    "Kettlebell Swing"
  ],

  // FESSIERS
  fessiers: [
    "Hip Thrust",
    "Pont fessier",
    "Glute Bridge",
    "Fentes",
    "Squat sumo",
    "Kickback",
    "Cable Kickback",
    "Abduction hanche",
    "Hip Abduction",
    "Step-ups",
    "Squat bulgare"
  ],

  // MOLLETS
  mollets: [
    "Mollets debout",
    "Standing Calf Raise",
    "Mollets assis",
    "Seated Calf Raise",
    "Mollets à la presse",
    "Leg Press Calf Raise",
    "Mollets un pied",
    "Single Leg Calf Raise"
  ],

  // ABDOMINAUX
  abdominaux: [
    "Crunch",
    "Sit-ups",
    "Relevé de jambes",
    "Leg Raises",
    "Mountain Climbers",
    "Planche",
    "Plank",
    "Planche latérale",
    "Side Plank",
    "Russian Twist",
    "Bicycle Crunch",
    "Ab Wheel",
    "Roue abdominale",
    "Hanging Leg Raise",
    "Dragon Flag",
    "V-Ups",
    "Hollow Hold",
    "Dead Bug",
    "Bird Dog"
  ],

  // EXERCICES OLYMPIQUES
  olympiques: [
    "Clean",
    "Épaulé",
    "Snatch",
    "Arraché",
    "Power Clean",
    "Hang Clean",
    "Clean and Jerk",
    "Épaulé-jeté",
    "Push Press",
    "Push Jerk",
    "Thruster"
  ],

  // EXERCICES FONCTIONNELS
  fonctionnels: [
    "Burpees",
    "Kettlebell Swing",
    "Turkish Get-up",
    "Farmers Walk",
    "Marche du fermier",
    "Sled Push",
    "Sled Pull",
    "Battle Ropes",
    "Box Jumps",
    "Wall Balls",
    "Medicine Ball Slam"
  ]
};

// Liste complète aplatie pour autocomplete
const ALL_EXERCISES = Object.values(EXERCISES_DATABASE)
  .flat()
  .sort((a, b) => a.localeCompare(b, 'fr'));

// Recherche d'exercices
function searchExercises(query) {
  const lowerQuery = query.toLowerCase();
  return ALL_EXERCISES.filter(ex =>
    ex.toLowerCase().includes(lowerQuery)
  );
}

// Exercices par groupe musculaire
function getExercisesByMuscleGroup(group) {
  return EXERCISES_DATABASE[group] || [];
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EXERCISES_DATABASE, ALL_EXERCISES, searchExercises, getExercisesByMuscleGroup };
}
