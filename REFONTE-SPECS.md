# Refonte Majeure - Application Suivi Performance

## 📋 Résumé des changements demandés

### 1. SIMPLIFICATION
- ❌ Retirer **CrossFit** et **Hyrox**
- ✅ Garder uniquement **Musculation** et **Course à pied**

### 2. NOUVELLE LOGIQUE DE NAVIGATION
**Ordre** : Accueil → **Programme** → **Séances** → Stats → Profil

### 3. NOUVELLE LOGIQUE FONCTIONNELLE

#### A. ONGLET PROGRAMME (Planification)
**Objectif** : Planifier les séances à l'avance (SIMPLE)

**Fonctionnalités** :
- Calendrier mensuel interactif
- Clic sur un jour → Modal simple :
  - Date (pré-remplie)
  - Type : Musculation | Course à pied
  - Note (optionnelle)
- **PAS de détails** (exercices, poids, etc.)
- Séances "planifiées" visibles sur le calendrier avec couleur
- Status : "Planifiée" (pas encore réalisée)

#### B. ONGLET SÉANCES (Validation/Réalisation)
**Objectif** : Valider et renseigner les détails des séances

**Fonctionnalités** :
- Liste des séances :
  - **Planifiées** (à valider) - Badge "À faire"
  - **Réalisées** (validées) - Badge "Terminé"
- Filtres : Toutes | À faire | Terminées | Musculation | Course
- Tri : Date | Type

**Validation d'une séance :**
- Clic sur séance planifiée → Modal de validation complète

---

## 📝 FORMULAIRE MUSCULATION (Détaillé)

### Champs généraux
- Date (lecture seule si planifiée)
- Durée réelle (minutes)
- **Forme du jour** : Slider 1-10
- **RPE (Effort ressenti)** : Slider 1-10
- Notes

### Liste d'exercices (dynamique)
**Pour chaque exercice** :
```
┌─────────────────────────────────────────────────┐
│ Exercice #1                            [🗑️]     │
│ Nom : [Développé couché        ▼]              │
│                                                  │
│ Série 1 : [80] kg × [10] reps       [➕]       │
│ Série 2 : [82.5] kg × [8] reps      [➕]       │
│ Série 3 : [85] kg × [6] reps        [➕]       │
│                                                  │
│ Volume total : 2370 kg (calculé auto)           │
└─────────────────────────────────────────────────┘
[➕ Ajouter un exercice]
```

**Calculs automatiques** :
- Volume par série = Poids × Reps
- Volume par exercice = Σ (Volume de toutes les séries)
- **Volume total séance** = Σ (Volume de tous les exercices)

---

## 🏃 FORMULAIRE COURSE À PIED (Détaillé)

### Champs généraux
- Date
- Durée réelle (HH:MM:SS)
- **Forme du jour** : Slider 1-10
- **RPE (Effort ressenti)** : Slider 1-10

### Type de séance
**Radio buttons** :
1. ⚪ Continue
2. ⚪ Intervalles

### Si "Continue" sélectionné :
```
Distance : [10.5] km
Allure moyenne : [5:20] min/km (calculée auto si durée+distance)
Dénivelé : [150] m (optionnel)
```

### Si "Intervalles" sélectionné :
```
Distance totale : [12] km

Intervalles de travail :
  Nombre : [8]
  Distance/temps : [400m] ou [1:30]
  Allure : [4:00] min/km

Récupération :
  Type : Passive | Active
  Durée : [1:00] min
  Allure (si active) : [6:30] min/km

Dénivelé total : [50] m (optionnel)
```

**Calculs automatiques** :
- Allure moyenne = Durée totale / Distance totale
- Temps total travail = Nb intervalles × Temps intervalle
- Temps total récup = (Nb intervalles - 1) × Temps récup

### Notes

---

## 📊 ONGLET STATISTIQUES (Amélioré)

### Filtres
- Type : Tous | Musculation | Course
- Période : 7j | 30j | 3 mois | 6 mois | 1 an
- Agrégation : Jour | Semaine | Mois

### Graphiques MUSCULATION

**1. Volume d'entraînement**
- Axe X : Temps
- Axe Y : Volume total (kg)
- Type : Ligne + Barres

**2. Fréquence**
- Nb séances par semaine/mois
- Type : Barres

**3. Charge d'entraînement (scientifique)**
- TRIMP = Durée × RPE
- Acute/Chronic ratio (charge 7j / charge 28j)
- Graphique avec zones :
  - 🟢 Zone optimale (0.8 - 1.3)
  - 🟡 Attention (1.3 - 1.5)
  - 🔴 Risque blessure (> 1.5)

**4. Forme & RPE**
- Courbe : Forme du jour (moyenne)
- Courbe : RPE moyen
- Permet de détecter fatigue/sur-entraînement

### Graphiques COURSE À PIED

**1. Kilométrage**
- Axe Y : Distance (km)
- Par semaine/mois

**2. Allure moyenne**
- Évolution de l'allure moyenne au fil du temps
- Tendance (régression linéaire)

**3. Distribution des allures**
- Histogramme des zones d'allure
- Z1, Z2, Z3, Z4, Z5 (basé sur VMA si renseignée)

**4. Charge d'entraînement (scientifique)**
- TRIMP course = Distance × RPE / 10
- ou TRIMP = Durée × Intensité (% FCmax ou % VMA)
- Acute/Chronic ratio

**5. Forme & RPE**
- Même logique que musculation

### Métriques affichées (cards)

**Musculation** :
- Volume total période
- Volume moyen/séance
- Progression volume (% vs période précédente)
- RPE moyen
- Forme moyenne
- TRIMP total
- Acute/Chronic ratio

**Course** :
- Distance totale
- Distance moyenne/semaine
- Allure moyenne
- Meilleure allure
- RPE moyen
- Forme moyenne
- TRIMP total
- Acute/Chronic ratio

---

## 🧮 CALCULS SCIENTIFIQUES À IMPLÉMENTER

### 1. TRIMP (Training Impulse)
```javascript
// Version simple (RPE-based)
TRIMP = Durée_minutes × RPE

// Version Foster
TRIMP = Durée_minutes × RPE_Foster (1-10)

// Version Edwards (si FC disponible)
TRIMP = Σ(Durée_zone × Coefficient_zone)
```

### 2. Acute/Chronic Workload Ratio (ACWR)
```javascript
Charge_Aiguë = Σ(TRIMP_7_derniers_jours) / 7
Charge_Chronique = Σ(TRIMP_28_derniers_jours) / 28

ACWR = Charge_Aiguë / Charge_Chronique

Interprétation:
- < 0.8  : Sous-entraînement
- 0.8-1.3 : Zone optimale
- 1.3-1.5 : Attention
- > 1.5  : Risque élevé blessure
```

### 3. TSS (Training Stress Score) pour course
```javascript
// Si VMA connue
TSS = (Durée_secondes × Intensité × IF) / 3600 × 100

// Sinon approximation RPE
TSS = Durée_minutes × RPE × 0.67
```

### 4. Monotonie et Strain
```javascript
Monotonie = Charge_moyenne_semaine / Écart_type_semaine
Strain = Charge_totale_semaine × Monotonie

// Monotonie élevée + Strain élevé = Risque
```

---

## 💾 STRUCTURE DE DONNÉES

### Séance planifiée
```javascript
{
  id: auto,
  status: "planned" | "completed",
  type: "musculation" | "running",
  date: "2025-11-25",
  plannedAt: "2025-11-20T10:00:00Z",
  note: "Focus jambes"
}
```

### Séance validée - Musculation
```javascript
{
  id: auto,
  status: "completed",
  type: "musculation",
  date: "2025-11-25",
  duration: 75, // minutes
  rpe: 8,
  formeDuJour: 7,
  exercises: [
    {
      name: "Développé couché",
      sets: [
        { weight: 80, reps: 10 },
        { weight: 82.5, reps: 8 },
        { weight: 85, reps: 6 }
      ],
      totalVolume: 2370 // calculé
    },
    {
      name: "Squat",
      sets: [
        { weight: 100, reps: 8 },
        { weight: 105, reps: 6 },
        { weight: 110, reps: 5 }
      ],
      totalVolume: 2145
    }
  ],
  totalVolume: 4515, // calculé
  trimp: 600, // durée × RPE
  notes: "Bonne séance",
  completedAt: "2025-11-25T18:30:00Z"
}
```

### Séance validée - Course
```javascript
{
  id: auto,
  status: "completed",
  type: "running",
  date: "2025-11-25",
  duration: "45:30", // HH:MM:SS ou minutes
  rpe: 6,
  formeDuJour: 8,
  sessionType: "continue" | "intervals",

  // Si continue
  distance: 10.5, // km
  averagePace: "5:20", // min/km
  elevation: 150, // m

  // Si intervalles
  intervals: {
    totalDistance: 12,
    work: {
      count: 8,
      distance: 0.4, // km
      pace: "4:00"
    },
    recovery: {
      type: "active",
      duration: "1:00",
      pace: "6:30"
    },
    elevation: 50
  },

  trimp: 273, // calculé
  notes: "Sensations top",
  completedAt: "2025-11-25T07:00:00Z"
}
```

---

## 🎨 DESIGN

- **Garder le design actuel** (dark mode, couleurs)
- Formulaires plus détaillés mais toujours épurés
- Sliders modernes pour RPE/Forme
- Badges colorés pour status séances
- Graphiques avec zones colorées (vert/jaune/rouge)

---

## 🚀 PRIORITÉS D'IMPLÉMENTATION

### Phase 1 (Critique)
1. ✅ Navigation inversée
2. ✅ Retrait CrossFit/Hyrox
3. Programme : Planification simple
4. Séances : Liste avec status
5. Formulaire Musculation basique

### Phase 2 (Important)
6. Formulaire Course basique
7. RPE + Forme du jour
8. Calculs volume automatiques
9. Stats basiques améliorées

### Phase 3 (Avancé)
10. Intervalles course
11. TRIMP calculation
12. ACWR et zones
13. Graphiques scientifiques
14. Détection sur/sous-entraînement

---

## ❓ QUESTIONS POUR VALIDATION

1. **Exercices musculation** : Liste pré-définie ou saisie libre ?
2. **VMA** : L'utilisateur la renseigne dans le profil ?
3. **FC (Fréquence cardiaque)** : Tracking prévu ou juste RPE ?
4. **Objectifs** : Lier les objectifs aux séances planifiées ?
5. **Alertes** : Notifier si ACWR en zone rouge ?

---

**Cette refonte représente environ :**
- 500+ lignes de HTML à modifier
- 300+ lignes de CSS à ajouter
- 1000+ lignes de JavaScript à recoder

**Temps estimé : 3-4 heures de développement**

**Êtes-vous d'accord avec cette spécification avant que je commence ?**
