type PasswordStrengthProps = {
  password: string;
};

const getScore = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = getScore(password);
  const labels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];
  const width = `${(score / 4) * 100}%`;

  return (
    <div className="space-y-1">
      <div className="h-2 w-full rounded-full bg-sand">
        <div className="h-2 rounded-full bg-terracotta transition-all" style={{ width }} />
      </div>
      <p className="text-xs text-brown/80">Force: {labels[score]}</p>
    </div>
  );
}
