import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production"
);

// Helper pour récupérer l'heure et la date exactes au Bénin (WAT / UTC+1)
function getBeninDateTime() {
  const now = new Date();

  // Heure au format HH:mm au Bénin
  const timeString = now.toLocaleTimeString("fr-FR", {
    timeZone: "Africa/Porto-Novo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Date au format YYYY-MM-DD au Bénin
  const formatter = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Porto-Novo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateString = formatter.format(now);

  return { timeString, dateString };
}

// 1. ARRIVÉE
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;
    if (!token) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const { motif } = await request.json();
    if (!motif) return NextResponse.json({ message: "Motif manquant" }, { status: 400 });

    const { timeString, dateString } = getBeninDateTime();

    // Vérification de visite en cours pour aujourd’hui
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
      return NextResponse.json(
        { message: "Vous avez déjà une visite en cours pour aujourd'hui." },
        { status: 400 }
      );
    }

    // Nombre de visites du jour
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

// 2. SORTIE
export async function PUT() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;
    if (!token) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const { timeString, dateString } = getBeninDateTime();

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
      return NextResponse.json(
        { message: "Aucune visite active trouvée pour aujourd'hui." },
        { status: 404 }
      );
    }

    await db
      .update(visits)
      .set({ departureAt: timeString })
      .where(eq(visits.id, activeVisit.id));

    return NextResponse.json(
      { message: "Sortie enregistrée avec succès !" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}