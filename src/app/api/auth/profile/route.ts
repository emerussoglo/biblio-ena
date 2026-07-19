import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production"
);

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Non autorisé. Session expirée." },
        { status: 401 }
      );
    }

    // 1. Décoder le token pour identifier l'utilisateur
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    // 2. Récupérer les données du formulaire
    const body = await request.json();
    const { phone, school, filiere } = body;

    if (!school || !filiere) {
      return NextResponse.json(
        { message: "L'établissement et la filière sont obligatoires." },
        { status: 400 }
      );
    }

    // 3. Mettre à jour l'utilisateur dans la base Turso
    await db
      .update(users)
      .set({
        phone: phone || null,
        school,
        filiere,
        updatedAt: new Date().toISOString(), // Optionnel : met à jour la date de modification
      })
      .where(eq(users.id, userId));

    return NextResponse.json(
      { message: "Profil mis à jour avec succès !" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    return NextResponse.json(
      { message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}