-- Migration: Ajouter la colonne phone à la table users (PostgreSQL)
-- Date: 2025-12-08

-- Ajouter la colonne phone si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(255);
        RAISE NOTICE 'Colonne phone ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne phone existe déjà';
    END IF;
END $$;

-- Vérifier le résultat
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
