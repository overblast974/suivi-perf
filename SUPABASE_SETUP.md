# Configuration Supabase pour TrainSmart

## Étapes d'installation

### 1. Créer le schéma de base de données

1. Connectez-vous à votre projet Supabase : https://lgdmjxphmpksqaaljgav.supabase.co
2. Allez dans le SQL Editor (menu de gauche)
3. Copiez et exécutez le contenu du fichier `database-schema.sql`
4. Vérifiez que toutes les tables ont été créées :
   - `users_profile`
   - `workouts`
   - `goals`

### 2. Vérifier les politiques RLS

Les politiques de sécurité Row Level Security (RLS) sont automatiquement créées par le script SQL. Elles garantissent que :
- Chaque utilisateur ne peut voir que ses propres données
- Les données sont isolées par utilisateur (via `user_id`)

### 3. Activer l'authentification par email

1. Dans Supabase, allez dans Authentication > Providers
2. Activez "Email" si ce n'est pas déjà fait
3. Configurez les paramètres email (ou gardez les par défaut)

### 4. Configuration terminée !

L'application est maintenant prête à être utilisée. Les credentials Supabase sont déjà configurés dans `supabase-client.js`.

## Architecture des données

### Table `users_profile`
- Informations personnelles (nom, âge, sexe)
- Données anthropométriques (poids, taille, IMC, masse grasse)
- Marqueurs physiologiques (VO2max, VMA, FC max, FC repos)
- Paramètres de rappels

### Table `workouts`
- Séances d'entraînement (musculation et course)
- Données spécifiques par type
- Métriques (RPE, Forme, TRIMP)
- Status (planifié/terminé)

### Table `goals`
- Objectifs de l'utilisateur
- Type, description, cible, deadline
- Statut (actif/terminé)

## Flux d'authentification

1. **Première visite** : L'utilisateur est redirigé vers `auth.html`
2. **Inscription** : Création du compte + profil automatique
3. **Connexion** : Authentification et redirection vers l'app
4. **Session** : Vérification automatique au chargement de `index.html`
5. **Déconnexion** : Menu > Déconnexion

## Sécurité

- Toutes les requêtes utilisent les politiques RLS
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- La clé API `anon` est safe pour le frontend (limitations RLS)
- Les mots de passe sont hashés par Supabase Auth

## Migration depuis IndexedDB

L'ancien système IndexedDB (`DatabaseManager`) est toujours présent dans le code mais n'est plus utilisé.
Toutes les données sont maintenant stockées sur Supabase.

Si vous avez des données locales à migrer, vous devrez le faire manuellement via l'export/import.
