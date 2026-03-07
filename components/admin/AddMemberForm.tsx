type AddMemberFormProps = {
  action: (formData: FormData) => Promise<void>;
};

export function AddMemberForm({ action }: AddMemberFormProps) {
  return (
    <form action={action} className="card-soft space-y-3">
      <h2 className="font-title text-xl italic text-terracotta">Ajouter un membre</h2>
      <input name="phone" required placeholder="+33612345678" className="w-full rounded-xl border border-sand px-3 py-2" />
      <input name="name" required placeholder="Prénom" className="w-full rounded-xl border border-sand px-3 py-2" />
      <input name="role" placeholder="Rôle familial" className="w-full rounded-xl border border-sand px-3 py-2" />
      <input name="avatar" placeholder="Emoji avatar (👤)" className="w-full rounded-xl border border-sand px-3 py-2" />
      <input name="location" placeholder="Lieu" className="w-full rounded-xl border border-sand px-3 py-2" />
      <button type="submit" className="btn-main">
        Créer (mot de passe provisoire: 1234)
      </button>
    </form>
  );
}
