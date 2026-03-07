-- PICOTOS FAMILY - Seed membres
-- Objectif: créer rapidement des profils liés aux utilisateurs auth.users
-- À exécuter dans Supabase SQL Editor

-- IMPORTANT
-- 1) Crée d'abord les comptes dans Authentication > Users (mot de passe: 1234)
-- 2) L'email auth doit suivre: <numero_sans_+>@picotosfamily.app
--    Ex: +33610000001 -> 33610000001@picotosfamily.app
-- 3) Ce script n'a plus besoin des UUID: il les récupère automatiquement

WITH seed(phone, name, role, avatar, location, first_login, is_admin) AS (
  VALUES
    ('+33609605701', 'Christophe', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33678170696', 'Jacques', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33635350604', 'Robin', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33615310613', 'Rose', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33623163395', 'Karine', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33751693050', 'Marine', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33680532890', 'Sylvie', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33674429426', 'Hervé', 'Membre', '👤', 'France 🇫🇷', true, true),
    ('+33770045271', 'Anne-Sophie', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33624345558', 'Sébastien', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33649427594', 'Antonin', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33783843895', 'Charlène', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33768424726', 'Camille', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33745256633', 'Julien', 'Membre', '👤', 'France 🇫🇷', true, false),
    ('+33625054339', 'Flavio', 'Membre', '👤', 'France 🇫🇷', true, false)
),
mapped AS (
  SELECT
    au.id,
    s.phone,
    s.name,
    s.role,
    s.avatar,
    s.location,
    s.first_login,
    s.is_admin
  FROM seed s
  JOIN auth.users au
    ON au.email = replace(s.phone, '+', '') || '@picotosfamily.app'
)
INSERT INTO profiles (id, phone, name, role, avatar, location, first_login, is_admin)
SELECT id, phone, name, role, avatar, location, first_login, is_admin
FROM mapped
ON CONFLICT (id) DO UPDATE
SET
  phone = EXCLUDED.phone,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  avatar = EXCLUDED.avatar,
  location = EXCLUDED.location,
  first_login = EXCLUDED.first_login,
  is_admin = EXCLUDED.is_admin;

-- Vérification utile: membres seed non trouvés dans auth.users
WITH seed(phone) AS (
  VALUES
    ('+33609605701'), ('+33678170696'), ('+33635350604'), ('+33615310613'), ('+33623163395'),
    ('+33751693050'), ('+33680532890'), ('+33674429426'), ('+33770045271'), ('+33624345558'),
    ('+33649427594'), ('+33783843895'), ('+33768424726'), ('+33745256633'), ('+33625054339')
)
SELECT s.phone AS phone_missing_in_auth
FROM seed s
LEFT JOIN auth.users au
  ON au.email = replace(s.phone, '+', '') || '@picotosfamily.app'
WHERE au.id IS NULL;
