import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "L'email est requis." }, { status: 400 });
    }

    const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userList[0];

    if (!user) {
      // Message générique pour des raisons de sécurité
      return NextResponse.json(
        { message: "Si cet email existe, un code de réinitialisation a été envoyé." },
        { status: 200 }
      );
    }

    // Génération du code à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // Valide 15 minutes

    await db
      .update(users)
      .set({ resetCode, resetCodeExpiry })
      .where(eq(users.email, email));

    await transporter.sendMail({
      from: `"Bibliothèque ENA" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Code de réinitialisation de votre mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1a5d2b; text-align: center;">Réinitialisation de mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification à 6 chiffres :</p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a5d2b; background: #f0f9ff; padding: 10px 20px; border-radius: 6px; border: 1px dashed #1a5d2b;">
              ${resetCode}
            </span>
          </div>
          <p style="font-size: 13px; color: #64748b;">Ce code est valide pendant 15 minutes. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Code de réinitialisation envoyé par email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur forgot-password:", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}