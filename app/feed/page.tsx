"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { NewPostBox } from "@/components/feed/NewPostBox";
import { PostCard } from "@/components/feed/PostCard";

type PostRow = {
  id: string;
  content: string;
  photo_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: { name: string; avatar: string | null } | null;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState("");

  const load = async () => {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: postData } = await supabase
      .from("posts")
      .select("id, content, photo_url, likes_count, comments_count, created_at, profiles!posts_author_id_fkey(name, avatar)")
      .order("created_at", { ascending: false });

    const safePosts = (postData ?? []).map((post) => {
      const relation = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
      return {
        id: post.id,
        content: post.content,
        photo_url: post.photo_url,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        created_at: post.created_at,
        profiles: relation
          ? {
              name: relation.name,
              avatar: relation.avatar,
            }
          : null,
      } as PostRow;
    });
    setPosts(safePosts);

    if (!safePosts.length) {
      setLikedMap({});
      return;
    }

    const postIds = safePosts.map((post) => post.id);
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);

    const map: Record<string, boolean> = {};
    (likes ?? []).forEach((like) => {
      map[like.post_id] = true;
    });
    setLikedMap(map);
  };

  useEffect(() => {
    void load();
    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel("feed-likes")
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => {
        void load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => undefined);
    };
  }, []);

  return (
    <section className="space-y-4">
      <NewPostBox onCreated={load} />
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={userId}
          liked={Boolean(likedMap[post.id])}
          onChanged={load}
        />
      ))}
    </section>
  );
}
