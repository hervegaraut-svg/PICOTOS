export function QuizCard({
  question,
  onAnswer,
  selected,
}: {
  question: { question: string; options: string[]; correct_answer: number };
  onAnswer: (index: number) => void;
  selected: number | null;
}) {
  return (
    <article className="card-soft space-y-3">
      <h3 className="font-semibold">{question.question}</h3>
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = selected !== null && index === question.correct_answer;
          return (
            <button
              key={`${option}-${index}`}
              disabled={selected !== null}
              onClick={() => onAnswer(index)}
              className={`block w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                isCorrect
                  ? "border-green-500 bg-green-50"
                  : isSelected
                    ? "border-red-400 bg-red-50"
                    : "border-sand bg-white"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {selected !== null ? (
        <p className="text-sm">{selected === question.correct_answer ? "✅ Bonne réponse" : "❌ Mauvaise réponse"}</p>
      ) : null}
    </article>
  );
}
