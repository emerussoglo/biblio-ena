import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, sex, userType, phone, school, filiere, email, password } = body;

    // 1. Validation de base
    if (!fullName || !sex || !userType || !email || !password) {
      return NextResponse.json(
        { message: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 }
      );
    }

    // Validation conditionnelle pour les étudiants
    if (userType === "etudiant" && (!school || !filiere)) {
      return NextResponse.json(
        { message: "L'établissement et la filière sont obligatoires pour un étudiant." },
        { status: 400 }
      );
    }

    // 2. Vérifier si l'utilisateur existe déjà
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .get();

    if (existingUser) {
      return NextResponse.json(
        { message: "Un compte avec cet email existe déjà." },
        { status: 409 }
      );
    }

    // 3. Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insérer le nouvel utilisateur
    const newUserId = crypto.randomUUID();
    await db.insert(users).values({
      id: newUserId,
      fullName,
      sex,
      userType,
      phone: phone || null,
      school: userType === "etudiant" ? school : null,
      filiere: userType === "etudiant" ? filiere : null,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "student",
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