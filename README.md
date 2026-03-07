# PICOTOS FAMILY

Application web familiale privée, mobile-first, construite avec Next.js 14 + Supabase + Vercel.
## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth + Database + Storage + Realtime)
- Spotify Web API (Client Credentials Flow)
- Déploiement Vercel
## Variables d'environnement

Copiez `.env.example` vers `.env.local`, puis remplissez les valeurs réelles :
```bash
cp .env.example .env.local
```
## Setup Supabase

1. Créez un projet Supabase.
2. Exécutez `supabase/schema.sql` dans Supabase SQL Editor.
3. Exécutez `supabase/storage_policies.sql` dans Supabase SQL Editor.
4. Vérifiez que les clés sont définies dans `.env.local`.
5. (Optionnel) Préparez vos membres via `supabase/seed_members_template.sql`.
## Lancement local

```bash
npm install
npm run dev
```
Ouvrir http://localhost:3000.

## Authentification par numéro
- Le membre se connecte avec son numéro + mot de passe.
- Conversion interne automatique du numéro en email fictif :
	- `+33612345678` → `33612345678@picotosfamily.app`
- Mot de passe initial admin : `1234`.
- Première connexion obligatoire via `/first-login`.

## Procédure d'ajout de membre (Admin)
Depuis `/admin` (réservé aux profils `is_admin = true`) :

1. Création utilisateur Supabase Auth (email fictif + mot de passe `1234`)
2. Insertion dans `profiles` avec `first_login = true`

Actions disponibles :
- Ajouter un membre
- Réinitialiser mot de passe (`1234`) + `first_login = true`
- Supprimer membre (auth + profile)

## Démarrage rapide avec 10 membres

1. Créez 10 utilisateurs dans Supabase Authentication (email fictif `NNN...@picotosfamily.app`, mot de passe `1234`).
2. Récupérez leurs UUID.
3. Remplacez les `UUID_...` dans `supabase/seed_members_template.sql`.
4. Exécutez le script dans SQL Editor.
## Créer le premier admin

1. Dashboard Supabase → Authentication → Users → Add User
2. Email : `33XXXXXXXXX@picotosfamily.app`
3. Mot de passe : `1234`
4. Exécuter ensuite :
```sql
INSERT INTO profiles (id, phone, name, role, avatar, location, first_login, is_admin)
VALUES (
	'UUID_COPIÉ_ICI',
	'+33XXXXXXXXX',
	'Hervé',
	'Papa',
	'🧔',
	'Maurice 🇲🇺',
	true,
	true
);
```

## Déploiement Vercel

```bash
vercel
```
Ajoutez toutes les variables d'environnement dans Vercel, dont `SUPABASE_SERVICE_ROLE_KEY` en variable privée (jamais exposée client).

## Routes principales
- `/login`
- `/first-login`
- `/feed`
- `/photos`
- `/calendar`
- `/playlist`
- `/on-this-day`
- `/quiz`
- `/admin`
- `/api/spotify/search`
