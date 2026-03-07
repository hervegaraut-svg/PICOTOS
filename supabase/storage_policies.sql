-- PICOTOS FAMILY - Policies Supabase Storage
-- Exécuter dans Supabase SQL Editor

-- 1) Créer le bucket photos (public pour affichage simple via URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Lecture des photos: utilisateurs authentifiés
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Authenticated users can read photos'
      AND tablename = 'objects'
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated users can read photos"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'photos' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- 3) Upload: utilisateurs authentifiés
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Authenticated users can upload photos'
      AND tablename = 'objects'
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated users can upload photos"
      ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- 4) Update/Delete: propriétaire du fichier uniquement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Owners can update photos'
      AND tablename = 'objects'
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Owners can update photos"
      ON storage.objects
      FOR UPDATE
      USING (bucket_id = 'photos' AND auth.uid() = owner)
      WITH CHECK (bucket_id = 'photos' AND auth.uid() = owner);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Owners can delete photos'
      AND tablename = 'objects'
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Owners can delete photos"
      ON storage.objects
      FOR DELETE
      USING (bucket_id = 'photos' AND auth.uid() = owner);
  END IF;
END $$;
