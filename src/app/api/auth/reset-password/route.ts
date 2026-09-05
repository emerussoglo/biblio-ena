import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ message: "Tous les champs sont requis." }, { status: 400 });
    }

    const nowIso = new Date().toISOString();

    const userList = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.resetCode, code),
          gte(users.resetCodeExpiry, nowIso)
        )
      )
      .limit(1);

    const user = userList[0];

    if (!user) {
      return NextResponse.json(
        { message: "Code incorrect ou expiré." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      { message: "Mot de passe réinitialisé avec succès !" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur reset-password:", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}