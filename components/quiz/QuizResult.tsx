export function QuizResult({ score, total }: { score: number; total: number }) {
  return (
    <div className="card-soft text-center">
      <p className="text-sm text-brown/80">Score final</p>
      <p className="font-title text-4xl italic text-terracotta">
        {score}/{total}
      </p>
    </div>
  );
}
