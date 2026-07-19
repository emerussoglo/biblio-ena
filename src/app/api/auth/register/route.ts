import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, sex, phone, school, filiere, email, password } = body;

    // 1. Validation de base
    if (!fullName || !sex || !school || !filiere || !email || !password) {
      return NextResponse.json(
        { message: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    // 2. Vérifier si l'utilisateur existe déjà
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .get(); // .get() récupère le premier élément trouvé en SQLite

    if (existingUser) {
      return NextResponse.json(
        { message: "Un compte avec cet email existe déjà." },
        { status: 409 }
      );
    }

    // 3. Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insérer le nouvel utilisateur dans Turso
    const newUserId = crypto.randomUUID(); // Génère un ID unique propre
    await db.insert(users).values({
      id: newUserId,
      fullName,
      sex,
      phone: phone || null,
      school,
      filiere,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "student", // Rôle par défaut
    });

    return NextResponse.json(
      { message: "Inscription réussie avec succès !" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json(
      { message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}