export type Member = {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  role: string | null;
  avatar: string | null;
  location: string | null;
  first_login: boolean;
  is_admin: boolean;
  created_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  content: string;
  photo_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: Pick<Member, "name" | "avatar">;
};

export type Photo = {
  id: string;
  author_id: string;
  title: string;
  emoji: string | null;
  photo_url: string | null;
  event_date: string | null;
  created_at: string;
};

export type FamilyEvent = {
  id: string;
  title: string;
  event_date: string;
  type: string;
  concerned: string | null;
  created_by: string | null;
  created_at: string;
};

export type Track = {
  id: string;
  added_by: string;
  spotify_id: string;
  title: string;
  artist: string;
  album: string | null;
  cover_url: string | null;
  preview_url: string | null;
  spotify_url: string;
  personal_note: string | null;
  likes_count: number;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  category: string;
  question: string;
  options: string[];
  correct_answer: number;
};

export type QuizScore = {
  id: string;
  user_id: string;
  category: string;
  score: number;
  total: number;
  played_at: string;
};

export type Profile = Member;

export interface VoiceMemory {
  id: string;
  author_id: string;
  author?: Profile;
  title: string;
  description?: string;
  audio_url: string;
  duration_seconds?: number;
  likes_count: number;
  created_at: string;
}

export interface TimeCapsule {
  id: string;
  author_id: string;
  author?: Profile;
  title: string;
  message: string;
  photo_url?: string;
  open_date: string;
  is_opened: boolean;
  send_to_all: boolean;
  created_at: string;
}

export interface MemberLocation {
  id: string;
  member_id: string;
  member?: Profile;
  city: string;
  country: string;
  country_flag?: string;
  latitude?: number;
  longitude?: number;
  updated_at: string;
}

export interface WishItem {
  id: string;
  owner_id: string;
  owner?: Profile;
  title: string;
  description?: string;
  category: "birthday" | "travel" | "recipe" | "culture";
  link?: string;
  price_range?: string;
  is_reserved: boolean;
  reserved_by_me?: boolean;
  created_at: string;
}
