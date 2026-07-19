import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production"
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Non autorisé. Aucun jeton trouvé." },
        { status: 401 }
      );
    }

    // 1. Vérifier et décoder le JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // 2. Traitement spécifique si c'est l'administrateur statique
    if (payload.role === "admin") {
      return NextResponse.json(
        {
          id: payload.id,
          email: "admin@sda.digital", // Email fictif pour l'affichage profil admin
          fullName: payload.fullName,
          sex: "M",
          school: "SDA",
          phone: "—",
          filiere: "Administration",
          role: "admin",
        },
        { status: 200 }
      );
    }

    // 3. Récupérer l'étudiant dans la base Turso (avec TOUS les champs nécessaires)
    const userId = payload.id as string;
    const user = await db
      .select({
        id: users.id,
        email: users.email,       // Inclus pour corriger l'affichage du profil
        fullName: users.fullName,
        sex: users.sex,
        school: users.school,
        phone: users.phone,
        filiere: users.filiere,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error("Erreur API /api/auth/me :", error);
    return NextResponse.json(
      { message: "Une erreur interne est survenue ou session expirée." },
      { status: 500 }
    );
  }
}