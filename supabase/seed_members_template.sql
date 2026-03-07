-- PICOTOS FAMILY - Seed membres (template)
-- Objectif: créer rapidement des comptes Auth + profils liés
-- À exécuter dans Supabase SQL Editor (adapté à ton projet)

-- IMPORTANT
-- 1) Remplace les numéros/noms par les vrais membres
-- 2) Les mots de passe initiaux sont 1234
-- 3) Chaque membre devra changer son mot de passe au premier login

-- Notes:
-- - Les utilisateurs Auth peuvent être créés via dashboard Authentication > Users > Add user
-- - Puis colle ici les UUID générés pour alimenter profiles

-- Exemple: premier admin (à adapter)
-- INSERT INTO profiles (id, phone, name, role, avatar, location, first_login, is_admin)
-- VALUES (
--   'UUID_ADMIN',
--   '+33XXXXXXXXX',
--   'Hervé',
--   'Papa',
--   '🧔',
--   'Maurice 🇲🇺',
--   true,
--   true
-- );

-- Exemple: lot de membres standards
-- Remplace UUID_xxx par les UUID créés dans auth.users
INSERT INTO profiles (id, phone, name, role, avatar, location, first_login, is_admin)
VALUES
  ('UUID_001', '+33610000001', 'Sophie', 'Maman', '👩', 'France 🇫🇷', true, false),
  ('UUID_002', '+33610000002', 'Emma', 'Fille', '👧', 'France 🇫🇷', true, false),
  ('UUID_003', '+23057000003', 'Lucas', 'Fils', '👦', 'Maurice 🇲🇺', true, false),
  ('UUID_004', '+23057000004', 'Grand-Mère', 'Aïeule', '👵', 'Maurice 🇲🇺', true, false),
  ('UUID_005', '+23057000005', 'Grand-Père', 'Aïeul', '👴', 'Maurice 🇲🇺', true, false),
  ('UUID_006', '+33610000006', 'Tata Claire', 'Tante', '🧑', 'France 🇫🇷', true, false),
  ('UUID_007', '+33610000007', 'Tonton Marc', 'Oncle', '🧑', 'France 🇫🇷', true, false),
  ('UUID_008', '+23057000008', 'Lina', 'Cousine', '👩', 'Maurice 🇲🇺', true, false),
  ('UUID_009', '+23057000009', 'Noah', 'Cousin', '👨', 'Maurice 🇲🇺', true, false),
  ('UUID_010', '+33610000010', 'Maya', 'Cousine', '👩', 'France 🇫🇷', true, false)
ON CONFLICT (id) DO NOTHING;
