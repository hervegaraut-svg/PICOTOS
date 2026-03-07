-- PICOTOS FAMILY - Schéma principal
-- Exécuter dans Supabase SQL Editor

-- Profils membres (liés à Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50),
  avatar VARCHAR(10) DEFAULT '👤',
  location VARCHAR(100),
  first_login BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts du fil d'actualités
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  photo_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes sur les posts
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Commentaires
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Album photo
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  emoji VARCHAR(10) DEFAULT '📸',
  photo_url TEXT,
  event_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agenda familial
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  type VARCHAR(50) DEFAULT 'other',
  concerned VARCHAR(100),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist Spotify
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  added_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  spotify_id VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(200) NOT NULL,
  album VARCHAR(200),
  cover_url TEXT,
  preview_url TEXT,
  spotify_url TEXT NOT NULL,
  personal_note TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Souvenirs "Ce jour-là"
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  memory_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz — questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz — scores
CREATE TABLE IF NOT EXISTS quiz_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS : activer la sécurité par ligne sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : seuls les membres authentifiés accèdent aux données
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users only' AND tablename = 'profiles') THEN
    CREATE POLICY "Authenticated users only" ON profiles FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users only' AND tablename = 'posts') THEN
    CREATE POLICY "Authenticated users only" ON posts FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users only' AND tablename = 'post_likes') THEN
    CREATE POLICY "Authenticated users only" ON post_likes FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users only' AND tablename = 'comments') THEN
    CREATE POLICY "Authenticated users only" ON comments FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users only' AND tablename = 'photos') THEN
    CREATE POLICY "Authenticated users only" ON photos FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users only' AND tablename = 'events') THEN
    CREATE POLICY "Authenticated users only" ON events FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users only' AND tablename = 'playlist_tracks') THEN
    CREATE POLICY "Authenticated users only" ON playlist_tracks FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users only' AND tablename = 'memories') THEN
    CREATE POLICY "Authenticated users only" ON memories FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users only' AND tablename = 'quiz_questions') THEN
    CREATE POLICY "Authenticated users only" ON quiz_questions FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users only' AND tablename = 'quiz_scores') THEN
    CREATE POLICY "Authenticated users only" ON quiz_scores FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Données initiales : questions du quiz
INSERT INTO quiz_questions (category, question, options, correct_answer) VALUES
('Histoire de famille', 'Dans quel pays vit Hervé depuis 2025 ?', '["France","Maurice","Réunion","Madagascar"]', 1),
('Histoire de famille', 'Comment s''appelle le projet professionnel d''Hervé ?', '["GreenNest","BioShop","Naturespan","EcoStore"]', 2),
('Qui a dit ça ?', '"Je pense à vous tous depuis la France !"', '["Sophie","Emma","Grand-Mère","Lucas"]', 2),
('Qui a dit ça ?', '"Regardez ce coucher de soleil depuis Grand Baie !"', '["Papi","Lucas","Hervé","Emma"]', 1),
('Géographie familiale', 'Dans quelle ville vivent Grand-Mère et Grand-Père ?', '["Paris","Lyon","Bordeaux","Marseille"]', 2),
('Géographie familiale', 'Dans quelle partie de Maurice vit la famille ?', '["Sud","Ouest","Nord-Est","Centre"]', 2),
('Devine la photo', 'Quelle plage est la plus proche de chez Hervé ?', '["Belle Mare","Grand Baie","Flic en Flac","Blue Bay"]', 1),
('Devine la photo', 'Quel fruit exotique adore Sophie ?', '["Papaye","Litchi","Mangue","Ananas"]', 2)
ON CONFLICT DO NOTHING;
