import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("sda_session_token")?.value;
  const { pathname } = request.nextUrl;

  // Si l'utilisateur tente d'accéder au dashboard
  // Note: On cible les sous-routes réelles du groupe (admin, catalogue, profil, etc.)
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/admin/memoires") ||
    pathname.startsWith("/catalogue") ||
    pathname.startsWith("/profil") ||
    pathname.startsWith("/memoires") ||
    pathname.startsWith("/stats")
  ) {
    if (!token) {
      // Redirection vers le login si aucun token n'est trouvé
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Vérification de la validité du JWT
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Sécurité supplémentaire : Si la route commence par /admin mais que le rôle n'est pas "admin"
      if (pathname.startsWith("/admin") && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url)); // Redirige les étudiants vers leur dashboard standard
      }

      return NextResponse.next();
    } catch (error) {
      // Token invalide ou expiré -> Redirection vers login et suppression du cookie défectueux
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("sda_session_token");
      return response;
    }
  }

  // Si l'utilisateur est déjà connecté et tente d'aller sur /login ou /register, on le redirige vers le dashboard
  if ((pathname === "/login" || pathname === "/register") && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (e) {
      // Si le token est expiré, on le laisse aller sur login
    }
  }

  return NextResponse.next();
}

// Configuration des routes sur lesquelles le middleware doit s'exécuter
export const config = {
  matcher: [
    "/admin/:path*",
    "/catalogue/:path*",
    "/dashboard/:path*",
    "/profil/:path*",
    "/stats/:path*",
    "/memoires/:path*",
    "/login",
    "/register",
  ],
};