# 🔐 Compte Administrateur - TrainSmart

## Identifiants d'accès

### Informations de connexion

```
Email:        admin@trainsmart.app
Mot de passe: Admin2024!TrainSmart
Rôle:         admin
```

## 📋 Instructions de création

### Option 1: Via l'interface web (Recommandé)

1. Ouvrez le fichier `create-admin.html` dans votre navigateur
2. Cliquez sur le bouton "Créer le compte administrateur"
3. Attendez la confirmation
4. Copiez les identifiants si nécessaire

### Option 2: Via SQL Supabase

Si vous préférez créer le compte manuellement dans Supabase :

1. **Connectez-vous à Supabase** : https://lgdmjxphmpksqaaljgav.supabase.co

2. **Exécutez d'abord la migration** (si pas déjà fait) :
   - Allez dans SQL Editor
   - Exécutez le contenu de `migration-add-role.sql`

3. **Créez le compte via Auth** :
   - Allez dans Authentication > Users
   - Cliquez sur "Add user"
   - Email: admin@trainsmart.app
   - Password: Admin2024!TrainSmart
   - Confirmez

4. **Configurez le profil admin** :
   - Allez dans SQL Editor
   - Exécutez cette requête (remplacez USER_ID) :

```sql
-- Récupérer l'ID de l'utilisateur admin
SELECT id, email FROM auth.users WHERE email = 'admin@trainsmart.app';

-- Créer/Mettre à jour le profil avec rôle admin
INSERT INTO users_profile (user_id, name, age, gender, role)
VALUES (
    'USER_ID_FROM_ABOVE',  -- Remplacez par l'ID réel
    'Administrateur',
    35,
    'male',
    'admin'
)
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin';
```

## 🎯 Utilisation

### Se connecter

1. Allez sur l'application TrainSmart
2. Si vous n'êtes pas connecté, vous serez redirigé vers `auth.html`
3. Entrez les identifiants admin
4. Cliquez sur "Se connecter"

### Vérifier le rôle

Une fois connecté, vous pouvez vérifier votre rôle dans la console :

```javascript
// Dans la console du navigateur
const db = new SupabaseDatabase();
await db.init();
const isAdmin = await db.isAdmin();
console.log('Est administrateur:', isAdmin);

const role = await db.getUserRole();
console.log('Rôle:', role);
```

## 🔒 Sécurité

### ⚠️ Important

- **Changez le mot de passe** après la première connexion
- **Ne partagez pas** ces identifiants publiquement
- **Gardez-les en lieu sûr** (gestionnaire de mots de passe recommandé)
- Les comptes admin ont accès à toutes les données

### Modifier le mot de passe

1. Connectez-vous avec le compte admin
2. Allez dans Profil > Paramètres
3. Ou utilisez Supabase Dashboard:
   - Authentication > Users
   - Cliquez sur admin@trainsmart.app
   - "Send password recovery"

## 📊 Privilèges admin

Les comptes administrateur ont les privilèges suivants :

- ✅ Accès complet à leurs propres données
- ✅ Possibilité de voir tous les profils (si RLS configuré)
- ✅ Badge "Admin" dans l'interface (à implémenter)
- ✅ Accès aux fonctionnalités d'administration (à implémenter)

## 🚀 Prochaines étapes

Pour implémenter des fonctionnalités admin spécifiques :

1. **Dashboard Admin** : Vue d'ensemble de tous les utilisateurs
2. **Gestion utilisateurs** : Voir/modifier/supprimer des comptes
3. **Statistiques globales** : Métriques agrégées
4. **Logs d'activité** : Historique des actions

## 📝 Notes techniques

- Le champ `role` est stocké dans `users_profile.role`
- Valeurs possibles: `'user'` ou `'admin'`
- Par défaut, tous les nouveaux comptes sont `'user'`
- Le rôle est vérifié côté serveur via RLS Supabase

## 🔗 Fichiers associés

- `create-admin.html` - Interface de création du compte admin
- `migration-add-role.sql` - Migration SQL pour ajouter le champ role
- `database-schema.sql` - Schéma complet avec support des rôles
- `supabase-db.js` - Méthodes `getUserRole()` et `isAdmin()`

---

**Date de création:** 2024-11-08
**Version:** 1.0
