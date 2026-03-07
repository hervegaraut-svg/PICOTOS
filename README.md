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

## Nouvelles fonctionnalités (Voix, Capsule, Carte, Souhaits)

### SQL à exécuter dans Supabase SQL Editor

```sql
-- 🎙️ La voix de la mémoire
CREATE TABLE IF NOT EXISTS voice_memories (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
	title VARCHAR(200) NOT NULL,
	description TEXT,
	audio_url TEXT NOT NULL,
	duration_seconds INTEGER,
	likes_count INTEGER DEFAULT 0,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ⏳ Capsule temporelle
CREATE TABLE IF NOT EXISTS time_capsules (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
	title VARCHAR(200) NOT NULL,
	message TEXT NOT NULL,
	photo_url TEXT,
	open_date DATE NOT NULL,
	is_opened BOOLEAN DEFAULT false,
	send_to_all BOOLEAN DEFAULT true,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🗺️ Positions membres
CREATE TABLE IF NOT EXISTS member_locations (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	member_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
	city VARCHAR(100) NOT NULL,
	country VARCHAR(100) NOT NULL,
	country_flag VARCHAR(10),
	latitude DECIMAL(10, 6),
	longitude DECIMAL(10, 6),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🎁 Liste de souhaits
CREATE TABLE IF NOT EXISTS wish_items (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
	title VARCHAR(200) NOT NULL,
	description TEXT,
	category VARCHAR(50) NOT NULL,
	link TEXT,
	price_range VARCHAR(50),
	is_reserved BOOLEAN DEFAULT false,
	reserved_by UUID REFERENCES profiles(id),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE voice_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth only' AND tablename = 'voice_memories') THEN
		CREATE POLICY "Auth only" ON voice_memories FOR ALL USING (auth.role() = 'authenticated');
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth only' AND tablename = 'time_capsules') THEN
		CREATE POLICY "Auth only" ON time_capsules FOR ALL USING (auth.role() = 'authenticated');
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth only' AND tablename = 'member_locations') THEN
		CREATE POLICY "Auth only" ON member_locations FOR ALL USING (auth.role() = 'authenticated');
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth only' AND tablename = 'wish_items') THEN
		CREATE POLICY "Auth only" ON wish_items FOR ALL USING (auth.role() = 'authenticated');
	END IF;
END $$;
```

### Storage bucket à créer

- Bucket public `voices` dans Supabase Storage.

### Variables d'environnement à ajouter

Dans `.env.local` et Vercel :

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=capsule@picotosfamily.app
APP_URL=https://picotos.vercel.app
```

### Edge Function capsule temporelle

Le code est dans `supabase/functions/send-capsules/index.ts`.

Déploiement :

```bash
supabase functions deploy send-capsules
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set RESEND_FROM_EMAIL=capsule@picotosfamily.app
supabase secrets set APP_URL=https://picotos.vercel.app
supabase functions schedule send-capsules --cron "0 8 * * *"
```

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
