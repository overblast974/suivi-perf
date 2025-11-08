# ✅ Tests de Vérification de la Persistance

## Test Rapide (2 minutes)

### Étape 1 : Créer des données
1. Ouvrir TrainSmart dans le navigateur
2. Se connecter avec un compte (ou créer un compte)
3. **Ajouter une séance** :
   - Type : Course
   - Date : Aujourd'hui
   - Distance : 5 km
   - Notes : "TEST PERSISTANCE - À VÉRIFIER"
4. **Créer un objectif** :
   - Description : "TEST - Courir 10km"
   - Deadline : Dans 7 jours
5. **Modifier le profil** :
   - Aller dans Profil
   - Changer le nom ou l'âge

### Étape 2 : Déconnexion
1. Menu (☰) → Déconnexion
2. Vous êtes redirigé vers auth.html

### Étape 3 : Reconnexion
1. Se reconnecter avec le même compte
2. **VÉRIFIER** :
   - ✅ La séance "TEST PERSISTANCE" est toujours là
   - ✅ L'objectif "Courir 10km" est toujours là
   - ✅ Les modifications du profil sont conservées

### Étape 4 : Multi-appareil (optionnel)
1. Sur un autre appareil (ou navigateur privé)
2. Se connecter avec le même compte
3. **VÉRIFIER** :
   - ✅ Toutes les données sont synchronisées
   - ✅ Les mêmes séances/objectifs apparaissent

## Test Automatique (5 minutes)

### Option A : Via test-persistence.html

1. Ouvrir `test-persistence.html` dans le navigateur
2. Se connecter si demandé
3. Cliquer sur "Lancer les tests"
4. **Attendre** : Les 8 tests s'exécutent automatiquement
5. **VÉRIFIER** : Tous les tests sont verts ✅

### Option B : Console développeur

1. Ouvrir TrainSmart
2. Appuyer sur F12 (Console)
3. Exécuter ce code :

```javascript
// Test 1 : Vérifier la base de données
const db = new SupabaseDatabase();
await db.init();
console.log('✓ Connexion Supabase OK');

// Test 2 : Créer une séance
const testId = await db.addWorkout({
    type: 'running',
    date: '2024-11-08',
    distance: 5,
    notes: 'TEST CONSOLE',
    status: 'completed'
});
console.log('✓ Séance créée, ID:', testId);

// Test 3 : Récupérer la séance
const workout = await db.getWorkout(testId);
console.log('✓ Séance récupérée:', workout.notes);

// Test 4 : Vérifier le profil
const profile = await db.getProfile();
console.log('✓ Profil récupéré:', profile.userInfo?.name);

// Test 5 : Nettoyage
await db.deleteWorkout(testId);
console.log('✓ Test terminé et nettoyé');

console.log('\n✅ TOUS LES TESTS RÉUSSIS - PERSISTANCE CONFIRMÉE');
```

## Test Supabase Dashboard (3 minutes)

1. **Aller sur** : https://lgdmjxphmpksqaaljgav.supabase.co
2. **Se connecter** avec les credentials Supabase
3. **Table Editor** → Cliquer sur `workouts`
4. **VÉRIFIER** :
   - ✅ Les séances sont listées
   - ✅ Chaque séance a un `user_id`
   - ✅ Les données correspondent à celles de l'app

5. **Table Editor** → Cliquer sur `users_profile`
6. **VÉRIFIER** :
   - ✅ Les profils sont listés
   - ✅ Chaque profil a un `user_id` unique
   - ✅ Le champ `role` existe

7. **Table Editor** → Cliquer sur `goals`
8. **VÉRIFIER** :
   - ✅ Les objectifs sont listés
   - ✅ Chaque objectif a un `user_id`

## Test de Suppression de Cache (5 minutes)

### Chrome/Edge
1. F12 → Application → Storage
2. Cliquer sur "Clear site data"
3. **NE PAS** cocher "Cookies" (garde la session)
4. Cliquer "Clear data"
5. Rafraîchir la page
6. **VÉRIFIER** : Les données sont toujours là ✅

### Firefox
1. F12 → Storage → IndexedDB
2. **VÉRIFIER** : Aucune base "SuiviPerfDB" n'existe ✅
3. Storage → Local Storage
4. **VÉRIFIER** : Aucune donnée métier ✅

## Test de Changement d'Appareil (10 minutes)

1. **Appareil 1** (PC) :
   - Se connecter
   - Créer une séance "TEST MULTI-DEVICE"
   - Noter l'heure de création

2. **Appareil 2** (Mobile/Tablette/Autre PC) :
   - Se connecter avec le même compte
   - **VÉRIFIER** : La séance "TEST MULTI-DEVICE" apparaît
   - Créer un objectif "TEST RETOUR"

3. **Retour Appareil 1** :
   - Rafraîchir la page
   - **VÉRIFIER** : L'objectif "TEST RETOUR" est synchronisé

## ✅ Résultats Attendus

Si tous les tests passent :
- ✅ Les données persistent après déconnexion
- ✅ Les données se synchronisent entre appareils
- ✅ Aucune donnée n'est stockée localement
- ✅ Tout est dans Supabase
- ✅ La persistance est garantie à 100%

## ❌ Si un Test Échoue

### Séance disparue après déconnexion
→ Problème : Données non sauvegardées dans Supabase
→ Vérifier : Console (F12) pour erreurs réseau

### Données non synchronisées entre appareils
→ Problème : Connexion différente ou cache
→ Vérifier : Même email utilisé sur les 2 appareils

### Erreur "No authentication session"
→ Problème : Session expirée
→ Solution : Se reconnecter

### Table vide dans Supabase
→ Problème : Schéma pas exécuté ou RLS trop restrictif
→ Solution : Exécuter database-schema.sql

## 📞 Support

Si un test échoue, fournir :
- Quel test a échoué
- Message d'erreur (console F12)
- Étapes pour reproduire
- Navigateur et version

---

**Tous les tests doivent passer ✅ pour confirmer la persistance à 100%**
