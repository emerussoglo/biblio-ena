import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { memoires, users } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production"
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    // Récupérer l'email de l'utilisateur connecté
    const currentUser = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    const userEmail = currentUser?.email ? currentUser.email.toLowerCase() : "";

    // Récupérer la liste des mémoires liés au compte (par ID ou Email)
    const userQuitusList = await db
      .select({
        id: memoires.id,
        title: memoires.title,
        fullName: memoires.fullName,
        matricule: memoires.matricule,
        filiere: memoires.filiere,
        academicYear: memoires.academicYear,
        supervisor: memoires.supervisor,
        internshipLocation: memoires.internshipLocation,
        quitusNumber: memoires.quitusNumber,
        defenseDate: memoires.defenseDate,
        mention: memoires.mention,
        approvedAt: memoires.approvedAt,
        year: memoires.year,
        status: memoires.status, // "pending", "approved", "rejected"
        rejectionReason: memoires.rejectionReason, // Points à corriger si rejeté
        physicalDepositStatus: memoires.physicalDepositStatus, // "pending", "verified"
      })
      .from(memoires)
      .where(
        and(
          eq(memoires.status, "approved"),
          or(
            eq(memoires.userId, userId),
            userEmail ? eq(memoires.email, userEmail) : undefined
          )
        )
      );

    return NextResponse.json(userQuitusList, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des quitus :", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération des quitus." },
      { status: 500 }
    );
  }
}