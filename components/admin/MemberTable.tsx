import { Member } from "@/types";

type MemberTableProps = {
  members: Member[];
  onReset: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

export function MemberTable({ members, onReset, onDelete }: MemberTableProps) {
  return (
    <div className="card-soft overflow-x-auto">
      <h2 className="mb-3 font-title text-xl italic text-terracotta">Membres</h2>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-brown/70">
            <th className="pb-2">Nom</th>
            <th className="pb-2">Numéro</th>
            <th className="pb-2">Rôle</th>
            <th className="pb-2">Statut</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-t border-sand/70">
              <td className="py-2">
                {member.avatar ?? "👤"} {member.name}
              </td>
              <td className="py-2">{member.phone}</td>
              <td className="py-2">{member.role ?? "—"}</td>
              <td className="py-2">
                {member.first_login ? (
                  <span className="rounded-full bg-orange-200 px-2 py-1 text-xs text-orange-900">1re connexion</span>
                ) : (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Actif</span>
                )}
              </td>
              <td className="py-2">
                <div className="flex gap-2">
                  <form action={onReset}>
                    <input type="hidden" name="id" value={member.id} />
                    <button type="submit" className="btn-outline text-xs">
                      Reset
                    </button>
                  </form>
                  <form action={onDelete}>
                    <input type="hidden" name="id" value={member.id} />
                    <button type="submit" className="rounded-xl border border-red-300 px-2 py-1 text-xs text-red-600">
                      Supprimer
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
