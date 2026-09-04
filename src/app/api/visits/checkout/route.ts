import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { visitId, rating, reason } = await request.json();

    if (!visitId) {
      return NextResponse.json({ message: "ID de visite requis." }, { status: 400 });
    }

    const now = new Date();
    const departureTime = now.toLocaleTimeString("fr-FR", {
      timeZone: "Africa/Porto-Novo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    await db
      .update(visits)
      .set({
        departureAt: departureTime,
        satisfactionRating: rating || null,
        satisfactionReason: reason || null,
      })
      .where(eq(visits.id, visitId));

    return NextResponse.json({ message: "Sortie et avis enregistrés avec succès." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur lors de la clôture." }, { status: 500 });
  }
}