-- Migration: Ajouter le champ role à la table users_profile
-- Exécutez ce script dans Supabase SQL Editor si la table existe déjà

-- Ajouter la colonne role si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users_profile'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users_profile
        ADD COLUMN role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user';

        -- Mettre à jour les utilisateurs existants avec le rôle 'user'
        UPDATE users_profile SET role = 'user' WHERE role IS NULL;

        RAISE NOTICE 'Colonne role ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne role existe déjà';
    END IF;
END $$;

-- Créer une fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM users_profile
    WHERE user_id = user_uuid;

    RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politique RLS optionnelle pour permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles"
    ON users_profile FOR SELECT
    USING (
        auth.uid() = user_id OR
        is_admin(auth.uid())
    );

-- Note: Cette dernière politique remplacera "Users can view own profile"
-- Vous pouvez la supprimer si vous ne voulez pas que les admins voient tous les profils
