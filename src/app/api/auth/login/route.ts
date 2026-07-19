import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Veuillez remplir tous les champs." },
        { status: 400 }
      );
    }

    // --- INTERCEPTION DE LA CONNEXION ADMIN FIXE ---
    if (email.trim() === process.env.ADMIN_USERNAME) {
      if (password === process.env.ADMIN_PASSWORD) {
        // Génération du JWT pour l'admin
        const token = await new SignJWT({ 
          id: "admin-fixed-id", 
          email: "admin@sda", 
          role: "admin",
          fullName: "Administrateur" 
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("2h")
          .sign(JWT_SECRET); 

        const response = NextResponse.json(
          { message: "Connexion d'administration réussie ! Redirection en cours", role: "admin" },
          { status: 200 }
        );

        response.cookies.set({
          name: "sda_session_token",
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 2,
        });

        return response;
      } else {
        return NextResponse.json(
          { message: "Identifiants incorrects." },
          { status: 401 }
        );
      }
    }

    // --- PROCESSUS DE CONNEXION ÉTUDIANT STANDARD ---
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .get();

    if (!user) {
      return NextResponse.json(
        { message: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    const token = await new SignJWT({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      fullName: user.fullName 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(JWT_SECRET);

    const response = NextResponse.json(
      { message: "Connexion réussie ! Redirection en cours", role: user.role },
      { status: 200 }
    );

    response.cookies.set({
      name: "sda_session_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return response;

  } catch (error) {
    console.error("Erreur login API :", error);
    return NextResponse.json(
      { message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}