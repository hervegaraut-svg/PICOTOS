import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/login", "/first-login"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!session) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_login, is_admin")
    .eq("id", session.user.id)
    .single();

  if (profile?.first_login && pathname !== "/first-login") {
    return NextResponse.redirect(new URL("/first-login", request.url));
  }

  if (!profile?.first_login && pathname === "/first-login") {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (pathname.startsWith("/admin") && !profile?.is_admin) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL(profile?.first_login ? "/first-login" : "/feed", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
