import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production"
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    // Récupérer l'historique trié par date récente, puis par numéro de ticket décroissant
    const userHistory = await db
      .select({
        id: visits.id,
        ticketNumber: visits.ticketNumber,
        motif: visits.motif,
        arrivalAt: visits.arrivalAt,
        departureAt: visits.departureAt,
        date: visits.date,
      })
      .from(visits)
      .where(eq(visits.userId, userId))
      .orderBy(desc(visits.date), desc(visits.ticketNumber)); // Tri corrigé pour la gestion par jour

    return NextResponse.json(userHistory, { status: 200 });
  } catch (error) {
    console.error("Erreur historique usager :", error);
    return NextResponse.json(
      { message: "Impossible de charger l'historique." },
      { status: 500 }
    );
  }
}