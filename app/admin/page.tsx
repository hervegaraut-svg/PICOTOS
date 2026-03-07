import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { AddMemberForm } from "@/components/admin/AddMemberForm";
import { MemberTable } from "@/components/admin/MemberTable";
import { isAdmin, requireAuth } from "@/lib/auth";
import { normalizePhone, phoneToPseudoEmail } from "@/lib/phone";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Member } from "@/types";

const createAdminClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

const assertAdmin = async () => {
  const session = await requireAuth();
  const allowed = await isAdmin(session.user.id);
  if (!allowed) {
    redirect("/feed");
  }
  return session;
};

export default async function AdminPage() {
  await assertAdmin();
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  const members = (data ?? []) as Member[];

  async function addMemberAction(formData: FormData) {
    "use server";
    await assertAdmin();

    const phone = String(formData.get("phone") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();
    const avatar = String(formData.get("avatar") ?? "👤").trim();
    const location = String(formData.get("location") ?? "").trim();
    if (!phone || !name) return;

    const adminClient = createAdminClient();
    const email = phoneToPseudoEmail(phone);

    const { data: created, error } = await adminClient.auth.admin.createUser({
      email,
      password: "1234",
      email_confirm: true,
    });

    if (error || !created.user) return;

    await adminClient.from("profiles").insert({
      id: created.user.id,
      phone: phone.startsWith("+") ? phone : `+${normalizePhone(phone)}`,
      name,
      role: role || null,
      avatar: avatar || "👤",
      location: location || null,
      first_login: true,
      is_admin: false,
    });

    revalidatePath("/admin");
  }

  async function resetMemberAction(formData: FormData) {
    "use server";
    await assertAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const adminClient = createAdminClient();

    await adminClient.auth.admin.updateUserById(id, {
      password: "1234",
    });

    await adminClient.from("profiles").update({ first_login: true }).eq("id", id);
    revalidatePath("/admin");
  }

  async function deleteMemberAction(formData: FormData) {
    "use server";
    await assertAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const adminClient = createAdminClient();
    await adminClient.auth.admin.deleteUser(id);
    await adminClient.from("profiles").delete().eq("id", id);
    revalidatePath("/admin");
  }

  return (
    <section className="space-y-4">
      <AddMemberForm action={addMemberAction} />
      <MemberTable members={members} onReset={resetMemberAction} onDelete={deleteMemberAction} />
    </section>
  );
}
