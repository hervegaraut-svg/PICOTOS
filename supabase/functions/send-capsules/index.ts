// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

type CapsuleRow = {
  id: string;
  author_id: string;
  title: string;
  message: string;
  photo_url: string | null;
  open_date: string;
  is_opened: boolean;
};

type ProfileRow = {
  id: string;
  name: string;
  phone: string;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const resendFrom = Deno.env.get("RESEND_FROM_EMAIL") ?? "capsule@picotosfamily.app";
const appUrl = Deno.env.get("APP_URL") ?? "https://picotos.vercel.app";

const supabase = createClient(supabaseUrl, serviceRoleKey);
const resend = new Resend(resendApiKey);

const phoneToPseudoEmail = (phone: string) => `${phone.replace(/\D+/g, "")}@picotosfamily.app`;

Deno.serve(async () => {
  const today = new Date().toISOString().slice(0, 10);

  const { data: capsules, error: capsuleError } = await supabase
    .from("time_capsules")
    .select("id, author_id, title, message, photo_url, open_date, is_opened")
    .lte("open_date", today)
    .eq("is_opened", false);

  if (capsuleError) {
    return new Response(JSON.stringify({ error: capsuleError.message }), { status: 500 });
  }

  if (!capsules?.length) {
    return new Response(JSON.stringify({ message: "No capsules to open" }), { status: 200 });
  }

  const { data: allProfiles, error: profilesError } = await supabase.from("profiles").select("id, name, phone");
  if (profilesError || !allProfiles) {
    return new Response(JSON.stringify({ error: profilesError?.message ?? "Profiles unavailable" }), { status: 500 });
  }

  const profileMap = new Map(allProfiles.map((profile) => [profile.id, profile]));

  for (const capsule of capsules as CapsuleRow[]) {
    const author = profileMap.get(capsule.author_id);
    const authorName = author?.name ?? "Un membre";

    const html = `
      <div style="font-family: Arial, sans-serif; color: #5c4a3a; background: #faf7f2; padding: 16px;">
        <div style="background:#c47a45;color:#fff;padding:12px 16px;border-radius:12px 12px 0 0;font-weight:700;">💌 Une capsule de ${authorName} s'est ouverte !</div>
        <div style="border:1px solid #e8d5c0;border-top:none;border-radius:0 0 12px 12px;padding:16px;background:#fff;">
          <h2 style="margin:0 0 8px 0;">${capsule.title}</h2>
          <p style="white-space:pre-wrap;line-height:1.5;">${capsule.message}</p>
          ${capsule.photo_url ? `<img src="${capsule.photo_url}" alt="capsule" style="max-width:100%;border-radius:10px;margin-top:12px;" />` : ""}
          <p style="margin-top:16px;"><a href="${appUrl}" style="color:#c47a45;">Ouvrir PICOTOS FAMILY</a></p>
        </div>
      </div>
    `;

    for (const member of allProfiles as ProfileRow[]) {
      const email = phoneToPseudoEmail(member.phone);
      await resend.emails.send({
        from: resendFrom,
        to: email,
        subject: `💌 Une capsule de ${authorName} s'est ouverte !`,
        html,
      });
    }

    await supabase.from("time_capsules").update({ is_opened: true }).eq("id", capsule.id);
  }

  return new Response(JSON.stringify({ processed: capsules.length }), { status: 200 });
});
