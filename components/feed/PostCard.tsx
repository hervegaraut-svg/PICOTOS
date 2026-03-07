"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Comment = {
  id: string;
  content: string;
  created_at: string;
};

type PostCardProps = {
  post: {
    id: string;
    content: string;
    photo_url: string | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
    profiles: { name: string; avatar: string | null } | null;
  };
  currentUserId: string;
  liked: boolean;
  onChanged: () => void;
};

export function PostCard({ post, currentUserId, liked, onChanged }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const toggleLike = async () => {
    const supabase = createBrowserSupabaseClient();

    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", currentUserId);
      await supabase
        .from("posts")
        .update({ likes_count: Math.max(0, post.likes_count - 1) })
        .eq("id", post.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: currentUserId });
      await supabase.from("posts").update({ likes_count: post.likes_count + 1 }).eq("id", post.id);
    }

    onChanged();
  };

  const loadComments = async () => {
    setShowComments((prev) => !prev);
    if (showComments) return;
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at")
      .eq("post_id", post.id)
      .order("created_at", { ascending: false });
    setComments(data ?? []);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.from("comments").insert({
      post_id: post.id,
      author_id: currentUserId,
      content: newComment,
    });
    await supabase
      .from("posts")
      .update({ comments_count: post.comments_count + 1 })
      .eq("id", post.id);
    setNewComment("");
    await loadComments();
    onChanged();
  };

  return (
    <article className="card-soft fade-up space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p>
          <span className="mr-1">{post.profiles?.avatar ?? "👤"}</span>
          <span className="font-semibold">{post.profiles?.name ?? "Membre"}</span>
        </p>
        <span className="text-xs text-brown/70">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-sm">{post.content}</p>

      {post.photo_url ? (
        <img src={post.photo_url} alt="Photo du post" className="h-52 w-full rounded-xl object-cover" />
      ) : null}

      <div className="flex gap-2">
        <button type="button" onClick={toggleLike} className="btn-outline text-sm">
          ❤️ J'aime ({post.likes_count})
        </button>
        <button type="button" onClick={loadComments} className="btn-outline text-sm">
          💬 Commenter ({post.comments_count})
        </button>
      </div>

      {showComments ? (
        <div className="space-y-2 rounded-xl border border-sand bg-cream/60 p-3">
          <div className="space-y-1">
            {comments.map((comment) => (
              <p key={comment.id} className="rounded-lg bg-white px-2 py-1 text-xs">
                {comment.content}
              </p>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Écrire un commentaire"
              className="flex-1 rounded-lg border border-sand bg-white px-2 py-1 text-sm"
            />
            <button type="button" onClick={addComment} className="btn-main text-sm">
              Envoyer
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
