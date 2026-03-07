"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type MemberItem = {
  id: string;
  name: string;
  avatar: string | null;
};

export function MembersStrip() {
  const [members, setMembers] = useState<MemberItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, name, avatar")
        .order("name", { ascending: true })
        .limit(20);
      setMembers(data ?? []);
    };

    void load();
  }, []);

  return (
    <div className="overflow-x-auto border-b border-sand bg-white/60 px-4 py-2">
      <div className="flex min-w-max gap-2">
        {members.map((member) => (
          <div key={member.id} className="rounded-full border border-sand bg-cream px-3 py-1 text-xs">
            <span className="mr-1">{member.avatar ?? "👤"}</span>
            <span>{member.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
