import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Roda antes de toda página. Faz duas coisas:
// 1) renova a sessão do Supabase quando precisa;
// 2) manda quem não está logado para /login (e quem já está logado sai de /login e /cadastro).
export async function proxy(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verificação rápida (só olha o token). A checagem "de verdade" fica em lib/auth.ts.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims;

  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/cadastro";

  if (!isLoggedIn && !isAuthPage) {
    return redirectKeepingCookies(request, "/login", response);
  }
  if (isLoggedIn && isAuthPage) {
    return redirectKeepingCookies(request, "/inicio", response);
  }

  return response;
}

function redirectKeepingCookies(request: NextRequest, to: string, from: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = to;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
