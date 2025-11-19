# Tests automatisés TrainSmart

Tests unitaires pour le module `WorkoutCalculations`.

## 🚀 Exécution des tests

### Dans le navigateur

1. Ouvrir `test-runner.html` dans un navigateur
2. Cliquer sur "Run All Tests"
3. Voir les résultats dans la console

**URL locale :** `file:///path/to/suivi-perf/tests/test-runner.html`

### Depuis la console du navigateur

```javascript
// Charger la page test-runner.html, puis dans la console :
suite.run()
```

## 📋 Tests inclus

### TRIMP (Training Impulse)
- ✅ Calcul basique (durée × RPE)
- ✅ Gestion durée zéro
- ✅ RPE par défaut à 5 si non spécifié

### Calcul d'allure (Pace)
- ✅ Calcul basique (min/km)
- ✅ Avec heures (format HH:MM:SS)
- ✅ Allures sous 5 min/km
- ✅ Gestion distance zéro

### Distance équivalente trail
- ✅ Avec dénivelé (100m = 1km)
- ✅ Sans dénivelé

### FC Max (Formule Tanaka)
- ✅ Différents âges (208 - 0.7×âge)

### VO2max & VMA
- ✅ Estimation VO2max depuis performance
- ✅ Calcul VMA (VO2max / 3.5)

### Zones d'entraînement
- ✅ 5 zones de fréquence cardiaque (Karvonen)
- ✅ 5 zones d'allure (% VMA)
- ✅ Zones ascendantes et cohérentes

### ACWR (Acute:Chronic Workload Ratio)
- ✅ Calcul avec données suffisantes
- ✅ Gestion données insuffisantes
- ✅ Détection charge élevée (warning)
- ✅ Zones de risque (low/safe/moderate/high)

### Détection de surmenage
- ✅ Pas de surmenage (forme normale)
- ✅ Alerte forme basse
- ✅ Recommandations générées

### Monotonie & Strain
- ✅ Charge constante (monotonie élevée)
- ✅ Charge variée (monotonie basse)
- ✅ Calcul du strain

## 🏗️ Structure des tests

```
tests/
├── workout-calculations.test.js    # Suite de tests
├── test-runner.html                # Interface web pour exécuter les tests
└── README.md                       # Ce fichier
```

## 📊 Couverture

**Modules testés :**
- ✅ `WorkoutCalculations.calculateTRIMP()`
- ✅ `WorkoutCalculations.calculatePace()`
- ✅ `WorkoutCalculations.calculateTrailEquivalent()`
- ✅ `WorkoutCalculations.calculateFCMax()`
- ✅ `WorkoutCalculations.estimateVO2max()`
- ✅ `WorkoutCalculations.calculateVMA()`
- ✅ `WorkoutCalculations.calculateHeartRateZones()`
- ✅ `WorkoutCalculations.calculatePaceZones()`
- ✅ `WorkoutCalculations.calculateACWR()`
- ✅ `WorkoutCalculations.detectOvertraining()`
- ✅ `WorkoutCalculations.calculateMonotonyStrain()`

**Total :** 27 tests

## ✅ Assertions disponibles

```javascript
assert(condition, message)                    // Vérifie condition vraie
assertEqual(actual, expected, message)         // Égalité stricte
assertDeepEqual(actual, expected, message)     // Égalité objets/arrays
assertWithinRange(actual, min, max, message)   // Valeur dans intervalle
```

## 🔧 Ajouter de nouveaux tests

```javascript
suite.test('mon test', () => {
    const result = WorkoutCalculations.maMethode();
    assertEqual(result, expectedValue, 'Description du test');
});
```

Puis recharger `test-runner.html` et ré-exécuter les tests.

## 📝 Notes

- Les tests sont indépendants et peuvent s'exécuter dans n'importe quel ordre
- Aucune dépendance externe (pas de npm, pas de framework)
- Compatible navigateur moderne (ES6+)
- Peut être adapté pour Node.js si nécessaire

## 🐛 Debugging

Si un test échoue :

1. Ouvrir la console du navigateur (F12)
2. Vérifier les logs détaillés
3. Relire le message d'erreur qui indique :
   - La valeur attendue (Expected)
   - La valeur actuelle (Actual)
   - Le contexte du test

## 🚧 Futures améliorations

- [ ] Tests pour les erreurs/edge cases
- [ ] Tests de performance
- [ ] Génération de rapport HTML
- [ ] Intégration CI/CD
- [ ] Coverage metrics
