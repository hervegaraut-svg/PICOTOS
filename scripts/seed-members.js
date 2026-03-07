const { createClient } = require("@supabase/supabase-js");

const members = [
  { phone: "+33609605701", name: "Christophe", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33678170696", name: "Jacques", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33635350604", name: "Robin", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33615310613", name: "Rose", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33623163395", name: "Karine", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33751693050", name: "Marine", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33680532890", name: "Sylvie", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33674429426", name: "Hervé", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: true },
  { phone: "+33770045271", name: "Anne-Sophie", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33624345558", name: "Sébastien", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33649427594", name: "Antonin", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33783843895", name: "Charlène", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33768424726", name: "Camille", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33745256633", name: "Julien", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
  { phone: "+33625054339", name: "Flavio", role: "Membre", avatar: "👤", location: "France 🇫🇷", first_login: true, is_admin: false },
];

function toAuthEmail(phone) {
  return `${phone.replace(/\D/g, "")}@picotosfamily.app`;
}

async function findUserByEmail(supabase, email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (user) return user;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function ensureAuthUser(supabase, member) {
  const email = toAuthEmail(member.phone);
  const existing = await findUserByEmail(supabase, email);
  if (existing) return { id: existing.id, email, created: false };

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: "1234",
    email_confirm: true,
    user_metadata: { name: member.name, phone: member.phone },
  });

  if (error) throw error;
  return { id: data.user.id, email, created: true };
}

async function upsertProfile(supabase, userId, member) {
  const payload = {
    id: userId,
    phone: member.phone,
    name: member.name,
    role: member.role,
    avatar: member.avatar,
    location: member.location,
    first_login: member.first_login,
    is_admin: member.is_admin,
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error(
      "Variables manquantes: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY. Charge .env.local ou exporte-les avant de lancer le script."
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let createdAuth = 0;
  let updatedAuth = 0;

  for (const member of members) {
    const authUser = await ensureAuthUser(supabase, member);
    if (authUser.created) createdAuth += 1;
    else updatedAuth += 1;

    await upsertProfile(supabase, authUser.id, member);
    console.log(`OK ${member.name} (${member.phone}) -> ${authUser.email}`);
  }

  console.log("\nSeed terminé.");
  console.log(`Auth créés: ${createdAuth}`);
  console.log(`Auth existants réutilisés: ${updatedAuth}`);
  console.log(`Profils upsert: ${members.length}`);
}

main().catch((error) => {
  console.error("Erreur seed-members:", error.message || error);
  process.exit(1);
});
