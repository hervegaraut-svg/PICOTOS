"use client";

import { useEffect, useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type RecorderStatus = "idle" | "recording" | "preview" | "saving";

type VoiceRecorderProps = {
  onSaved: () => Promise<void> | void;
};

export function VoiceRecorder({ onSaved }: VoiceRecorderProps) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [previewUrl]);

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    setError("");

    if (!title.trim()) {
      setError("Ajoute un titre avant d'enregistrer.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      streamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setDurationSeconds(0);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopTimer();
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setPreviewUrl(URL.createObjectURL(blob));
        setStatus("preview");
      };

      mediaRecorder.start();
      setStatus("recording");
      timerRef.current = window.setInterval(() => {
        setDurationSeconds((previous) => previous + 1);
      }, 1000);
    } catch {
      setError("Micro non autorisé. Active l'accès micro dans ton navigateur puis réessaie.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const saveRecording = async () => {
    if (status !== "preview") return;

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    if (!blob.size) {
      setError("Enregistrement invalide. Réessaie.");
      return;
    }

    setStatus("saving");
    setError("");

    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("idle");
      setError("Session expirée. Reconnecte-toi.");
      return;
    }

    const path = `${user.id}/${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage.from("voices").upload(path, blob, {
      contentType: "audio/webm",
      upsert: true,
    });

    if (uploadError) {
      setStatus("preview");
      setError("Impossible d'envoyer le message audio.");
      return;
    }

    const { data: publicData } = supabase.storage.from("voices").getPublicUrl(path);

    const { error: insertError } = await supabase.from("voice_memories").insert({
      author_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      audio_url: publicData.publicUrl,
      duration_seconds: durationSeconds,
    });

    if (insertError) {
      setStatus("preview");
      setError("Le message est enregistré mais l'ajout en base a échoué.");
      return;
    }

    setTitle("");
    setDescription("");
    setDurationSeconds(0);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    chunksRef.current = [];
    setStatus("idle");
    await onSaved();
  };

  return (
    <div className="space-y-3 rounded-2xl border border-sand bg-cream p-4 text-brown">
      <h3 className="font-semibold">🎙️ Nouveau message</h3>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Titre du souvenir"
        className="w-full rounded-xl border border-sand bg-white px-3 py-2"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Contexte (optionnel)"
        className="min-h-24 w-full rounded-xl border border-sand bg-white px-3 py-2"
      />

      {status === "recording" ? (
        <p className="text-sm font-semibold text-terracotta">🔴 Enregistrement... {durationSeconds}s</p>
      ) : null}

      {previewUrl ? <audio controls src={previewUrl} className="w-full" /> : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={startRecording} disabled={status === "recording" || status === "saving"} className="btn-main">
          🔴 Enregistrer
        </button>
        <button type="button" onClick={stopRecording} disabled={status !== "recording"} className="btn-outline">
          ⏹️ Stop
        </button>
        <button type="button" onClick={saveRecording} disabled={status !== "preview"} className="btn-outline">
          💾 Sauvegarder
        </button>
      </div>

      {error ? <p className="text-sm text-terracotta">{error}</p> : null}
    </div>
  );
}
