"use client";

import { useEffect, useMemo, useState } from "react";
import { subDays } from "date-fns";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizResult } from "@/components/quiz/QuizResult";

type Question = {
  id: string;
  category: string;
  question: string;
  options: string[];
  correct_answer: number;
};

type Ranking = {
  name: string;
  score: number;
};

const categories = [
  "👨‍👩‍👧 Histoire de famille",
  "🗣️ Qui a dit ça ?",
  "📸 Devine la photo",
  "🌍 Géographie familiale",
];

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [ranking, setRanking] = useState<Ranking[]>([]);

  const current = questions[index];

  const loadQuestions = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase.from("quiz_questions").select("id, category, question, options, correct_answer");
    setQuestions((data ?? []) as Question[]);
  };

  const loadRanking = async () => {
    const supabase = createBrowserSupabaseClient();
    const since = subDays(new Date(), 7).toISOString();
    const { data: scores } = await supabase
      .from("quiz_scores")
      .select("user_id, score")
      .gte("played_at", since);

    const { data: profiles } = await supabase.from("profiles").select("id, name");
    const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.name]));
    const grouped = new Map<string, number>();

    (scores ?? []).forEach((item) => {
      grouped.set(item.user_id, (grouped.get(item.user_id) ?? 0) + item.score);
    });

    const rows = Array.from(grouped.entries())
      .map(([id, total]) => ({ name: names.get(id) ?? "Membre", score: total }))
      .sort((a, b) => b.score - a.score);

    setRanking(rows);
  };

  useEffect(() => {
    void loadQuestions();
    void loadRanking();
  }, []);

  const categoryLabel = useMemo(() => {
    if (!current?.category) return "";
    const found = categories.find((label) => label.toLowerCase().includes(current.category.toLowerCase()));
    return found ?? current.category;
  }, [current]);

  const answer = async (choice: number) => {
    if (!current || selected !== null) return;
    setSelected(choice);
    const isCorrect = choice === current.correct_answer;
    if (isCorrect) setScore((prev) => prev + 1);

    setTimeout(async () => {
      const nextIndex = index + 1;
      if (nextIndex < questions.length) {
        setIndex(nextIndex);
        setSelected(null);
      } else {
        setFinished(true);
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("quiz_scores").insert({
            user_id: user.id,
            category: current.category,
            score: isCorrect ? score + 1 : score,
            total: questions.length,
          });
        }
        await loadRanking();
      }
    }, 650);
  };

  if (!questions.length) {
    return <div className="card-soft">Chargement du quiz...</div>;
  }

  if (finished) {
    return (
      <section className="space-y-4">
        <QuizResult score={score} total={questions.length} />
        <div className="card-soft">
          <h3 className="mb-2 font-semibold">Classement de la semaine</h3>
          <ol className="space-y-1 text-sm">
            {ranking.map((row, idx) => (
              <li key={`${row.name}-${idx}`}>
                {idx + 1}. {row.name} — {row.score}
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <p className="text-sm text-brown/80">Catégorie: {categoryLabel}</p>
      <QuizCard question={current} selected={selected} onAnswer={answer} />
      <p className="text-xs text-brown/70">
        Question {index + 1}/{questions.length}
      </p>
    </section>
  );
}
