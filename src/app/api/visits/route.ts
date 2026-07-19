import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_production");

// 1. ARRIVÉE : Créer l'enregistrement avec heure ajustée (-1h)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;
    if (!token) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const { motif } = await request.json();
    if (!motif) return NextResponse.json({ message: "Motif manquant" }, { status: 400 });

    // AJUSTEMENT HORAIRE : On retire 1 heure à l'heure du serveur
    const now = new Date();
    now.setHours(now.getHours() - 1);

    const timeString = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const dateString = now.toISOString().split("T")[0]; // Synchronisé avec le décalage

    // On vérifie s'il y a une visite en cours UNIQUEMENT POUR AUJOURD'HUI
    const activeVisit = await db
      .select()
      .from(visits)
      .where(
        and(
          eq(visits.userId, userId), 
          eq(visits.date, dateString), 
          isNull(visits.departureAt)
        )
      )
      .get();

    if (activeVisit) {
      return NextResponse.json({ message: "Vous avez déjà une visite en cours pour aujourd'hui." }, { status: 400 });
    }

    // On compte le nombre de visites enregistrées UNIQUEMENT AUJOURD'HUI
    const todayVisits = await db
      .select()
      .from(visits)
      .where(eq(visits.date, dateString))
      .all();
      
    const nextSequence = todayVisits.length + 1;
    const ticketNumber = `N°${String(nextSequence).padStart(3, "0")}`;

    const newVisit = {
      id: crypto.randomUUID(),
      userId,
      ticketNumber,
      motif,
      arrivalAt: timeString,
      departureAt: null,
      date: dateString,
    };

    await db.insert(visits).values(newVisit);

    return NextResponse.json(newVisit, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// 2. SORTIE : Mettre à jour avec heure ajustée (-1h)
export async function PUT() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;
    if (!token) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    // AJUSTEMENT HORAIRE : On retire 1 heure à l'heure du serveur
    const now = new Date();
    now.setHours(now.getHours() - 1);

    const timeString = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const dateString = now.toISOString().split("T")[0];

    // On cherche la visite active du jour ajusté pour la clôturer
    const activeVisit = await db
      .select()
      .from(visits)
      .where(
        and(
          eq(visits.userId, userId), 
          eq(visits.date, dateString), 
          isNull(visits.departureAt)
        )
      )
      .get();

    if (!activeVisit) {
      return NextResponse.json({ message: "Aucune visite active trouvée pour aujourd'hui." }, { status: 404 });
    }

    await db
      .update(visits)
      .set({ departureAt: timeString })
      .where(eq(visits.id, activeVisit.id));

    return NextResponse.json({ message: "Sortie enregistrée avec succès !" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}