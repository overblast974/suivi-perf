# 💾 Persistance des Données - TrainSmart

## ✅ Garantie de Persistance

**TOUTES les données de TrainSmart sont stockées dans Supabase (cloud PostgreSQL).**

Aucune donnée n'est stockée localement dans le navigateur. Vos données :
- ✅ Persistent après déconnexion/reconnexion
- ✅ Sont accessibles depuis n'importe quel appareil
- ✅ Sont sauvegardées en temps réel
- ✅ Sont sécurisées avec Row Level Security (RLS)
- ✅ Survivent au nettoyage du cache du navigateur

## 📊 Types de Données Stockées

### 1. Profil Utilisateur (`users_profile`)

Stocké dans Supabase table `users_profile` :

```javascript
{
    userInfo: {
        name: string,        // Nom complet
        age: number,         // Âge
        gender: string,      // 'male', 'female', 'other'
        role: string         // 'user' ou 'admin'
    },
    anthropo: {
        weight: number,      // Poids en kg
        height: number,      // Taille en cm
        bodyFat: number,     // % masse grasse
        bmi: number          // Indice de masse corporelle
    },
    metrics: {
        vo2max: number,      // VO2max en ml/kg/min
        vma: number,         // VMA en km/h
        fcMax: number,       // FC maximale en bpm
        fcRepos: number      // FC de repos en bpm
    },
    reminder: {
        enabled: boolean,    // Notifications activées
        time: string,        // Heure du rappel
        message: string      // Message personnalisé
    }
}
```

**Persistance:** ✅ Toutes modifications sont immédiatement sauvegardées dans Supabase

### 2. Séances d'Entraînement (`workouts`)

Stockées dans Supabase table `workouts` :

```javascript
{
    type: string,              // 'musculation' ou 'running'
    date: string,              // Format ISO (YYYY-MM-DD)
    duration: number,          // Durée en minutes
    notes: string,             // Notes personnelles
    status: string,            // 'planned' ou 'completed'

    // Musculation spécifique
    exercises: array,          // Liste des exercices
    total_volume: number,      // Volume total en kg

    // Course spécifique
    distance: number,          // Distance en km
    pace: string,              // Allure (mm:ss/km)
    elevation: number,         // Dénivelé en m
    heart_rate: number,        // FC moyenne

    // Métriques communes
    rpe: number,               // Échelle RPE (1-10)
    forme: number,             // Forme ressentie (1-10)
    trimp: number              // Training Impulse
}
```

**Persistance:** ✅ Chaque séance est sauvegardée immédiatement après création/modification

### 3. Objectifs (`goals`)

Stockés dans Supabase table `goals` :

```javascript
{
    type: string,          // 'general', 'musculation', 'running'
    description: string,   // Description de l'objectif
    target: number,        // Valeur cible
    unit: string,          // Unité (km, kg, etc.)
    deadline: string,      // Date limite (YYYY-MM-DD)
    status: string         // 'active' ou 'completed'
}
```

**Persistance:** ✅ Objectifs sauvegardés en temps réel

## 🔄 Opérations CRUD

Toutes les opérations passent par la classe `SupabaseDatabase` :

### Création (Create)
```javascript
await db.addWorkout(workout);    // Retourne l'ID
await db.addGoal(goal);          // Retourne l'ID
await db.saveProfile(profile);   // Upsert automatique
```

### Lecture (Read)
```javascript
await db.getAllWorkouts();       // Toutes les séances
await db.getWorkout(id);         // Une séance spécifique
await db.getAllGoals();          // Tous les objectifs
await db.getGoal(id);            // Un objectif spécifique
await db.getProfile();           // Profil complet
```

### Mise à jour (Update)
```javascript
await db.updateWorkout(id, data);
await db.updateGoal(id, data);
await db.saveProfile(profile);
```

### Suppression (Delete)
```javascript
await db.deleteWorkout(id);
await db.deleteGoal(id);
```

## 🔒 Sécurité et Isolation

### Row Level Security (RLS)

Chaque donnée est liée au `user_id` via RLS :

```sql
-- Exemple de politique RLS
CREATE POLICY "Users can view own workouts"
    ON workouts FOR SELECT
    USING (auth.uid() = user_id);
```

**Garanties :**
- ✅ Un utilisateur ne peut voir que SES données
- ✅ Impossible d'accéder aux données d'autres utilisateurs
- ✅ Validation côté serveur (PostgreSQL)

### Authentification

- Session gérée par Supabase Auth
- Token JWT sécurisé
- Auto-redirect si non authentifié

## 🧪 Vérification de la Persistance

### Option 1: Script de Test

Ouvrez `test-persistence.html` dans votre navigateur :

```bash
# Ouvrir le fichier de test
open test-persistence.html
```

Le script effectuera automatiquement :
1. ✓ Vérification de l'authentification
2. ✓ Lecture du profil
3. ✓ Création d'une séance test
4. ✓ Vérification de la persistance
5. ✓ Création d'un objectif test
6. ✓ Vérification de la persistance
7. ✓ Modification du profil
8. ✓ Vérification des modifications
9. ✓ Nettoyage des données test

### Option 2: Test Manuel

1. **Créer des données** :
   - Ajoutez une séance d'entraînement
   - Créez un objectif
   - Modifiez votre profil

2. **Déconnexion** :
   - Menu → Déconnexion

3. **Reconnexion** :
   - Connectez-vous avec le même compte

4. **Vérification** :
   - ✅ Toutes vos données sont toujours présentes
   - ✅ Rien n'a été perdu

### Option 3: Console Développeur

```javascript
// Dans la console du navigateur
const db = new SupabaseDatabase();
await db.init();

// Vérifier les données
const workouts = await db.getAllWorkouts();
console.log('Séances:', workouts);

const profile = await db.getProfile();
console.log('Profil:', profile);

const goals = await db.getAllGoals();
console.log('Objectifs:', goals);
```

## 📱 Multi-Appareils

Vos données sont synchronisées automatiquement :

1. **Smartphone** : Créez une séance
2. **Ordinateur** : La séance est immédiatement visible
3. **Tablette** : Toutes les données sont accessibles

**Aucune action manuelle requise** - Tout est automatique !

## 🚫 Ce qui N'est PAS Stocké Localement

- ❌ Aucune donnée dans `localStorage`
- ❌ Aucune donnée dans `sessionStorage`
- ❌ Aucune donnée dans `IndexedDB`
- ❌ Aucune donnée dans les cookies

**Exception** : Le service worker met en cache les fichiers statiques (HTML, CSS, JS) pour le mode hors ligne, mais JAMAIS les données utilisateur.

## ⚡ Performance

### Optimisations

1. **Requêtes optimisées** :
   - Index sur `user_id`, `date`, `type`
   - Requêtes filtrées au niveau SQL
   - Tri côté serveur

2. **Cache Service Worker** :
   - Fichiers statiques en cache
   - Réduction des requêtes réseau
   - Mode hors ligne pour l'interface

3. **Chargement paresseux** :
   - Données chargées à la demande
   - Pas de chargement inutile

## 🔄 Migration depuis IndexedDB

Si vous aviez utilisé une version antérieure avec IndexedDB :

### Ancien Code (supprimé)

```javascript
// ANCIEN - N'est plus utilisé
class DatabaseManager {
    async init() {
        const request = indexedDB.open(...);
        // ...
    }
}
```

### Nouveau Code (actuel)

```javascript
// ACTUEL - Supabase uniquement
class App {
    constructor() {
        this.db = new SupabaseDatabase();  // ✅
    }
}
```

**Note** : L'ancien code `DatabaseManager` a été complètement supprimé du fichier `app.js`.

## 📊 Monitoring

### Vérifier l'état dans Supabase

1. Connectez-vous à : https://lgdmjxphmpksqaaljgav.supabase.co
2. Table Editor → Visualisez vos tables
3. SQL Editor → Exécutez des requêtes personnalisées

### Exemple de requête SQL

```sql
-- Compter vos séances
SELECT COUNT(*) FROM workouts WHERE user_id = auth.uid();

-- Voir vos 10 dernières séances
SELECT * FROM workouts
WHERE user_id = auth.uid()
ORDER BY date DESC
LIMIT 10;

-- Vos objectifs actifs
SELECT * FROM goals
WHERE user_id = auth.uid()
AND status = 'active'
ORDER BY deadline ASC;
```

## ✅ Checklist de Vérification

Avant de déployer en production :

- [x] ✅ Schéma Supabase créé (`database-schema.sql` exécuté)
- [x] ✅ RLS activé sur toutes les tables
- [x] ✅ Politiques RLS créées
- [x] ✅ Authentification configurée
- [x] ✅ Ancien code IndexedDB supprimé
- [x] ✅ Tous les appels utilisent `SupabaseDatabase`
- [x] ✅ Tests de persistance réussis

## 🆘 Support

### En cas de problème

1. **Données non sauvegardées** :
   - Vérifiez votre connexion internet
   - Consultez la console (F12) pour les erreurs
   - Vérifiez que vous êtes bien connecté

2. **Données non retrouvées** :
   - Vérifiez que vous utilisez le bon compte
   - Consultez Supabase Table Editor
   - Vérifiez les politiques RLS

3. **Erreur d'authentification** :
   - Déconnectez-vous et reconnectez-vous
   - Videz le cache si nécessaire
   - Vérifiez les identifiants

## 📚 Documentation Technique

- **Supabase JS Client** : https://supabase.com/docs/reference/javascript
- **PostgreSQL** : https://www.postgresql.org/docs/
- **Row Level Security** : https://supabase.com/docs/guides/auth/row-level-security

---

**Résumé** : TrainSmart utilise 100% Supabase pour le stockage des données. Aucune donnée utilisateur n'est stockée localement. Tout est persistant, sécurisé et synchronisé automatiquement.

**Version** : 2.0 - 2024-11-08
