import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import { eq, and, isNull, lt, or } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production"
);

// Helper pour récupérer l'heure, la date et la plage horaire au Bénin (WAT / UTC+1)
function getBeninDateTime() {
  const now = new Date();

  // Heure locale au Bénin (HH:mm)
  const timeString = now.toLocaleTimeString("fr-FR", {
    timeZone: "Africa/Porto-Novo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Date locale au Bénin (YYYY-MM-DD)
  const formatter = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Porto-Novo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateString = formatter.format(now);

  // Conversion en minutes depuis minuit pour la restriction horaire (09h00 à 18h30)
  const parts = timeString.split(":");
  const currentMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);

  const startMinutes = 9 * 60; // 09:00 -> 540 min
  const endMinutes = 18 * 60 + 30; // 18:30 -> 1110 min

  const isWithinWorkingHours =
    currentMinutes >= startMinutes && currentMinutes <= endMinutes;

  const isPastClosingTime = currentMinutes > endMinutes;

  return { timeString, dateString, isWithinWorkingHours, isPastClosingTime };
}

// Fonction de clôture automatique des visites dépassées (après 18h30 ou dates antérieures)
async function autoCloseExpiredVisits(currentDateString: string, isPastClosingTime: boolean) {
  try {
    // 1. Clôture des visites restées ouvertes des jours précédents
    await db
      .update(visits)
      .set({
        departureAt: "18:30",
        satisfactionReason: "Clôture automatique (Fin de journée)",
      })
      .where(
        and(
          isNull(visits.departureAt),
          lt(visits.date, currentDateString)
        )
      );

    // 2. Si l'heure actuelle dépasse 18h30, clôture de toutes les visites encore ouvertes aujourd'hui
    if (isPastClosingTime) {
      await db
        .update(visits)
        .set({
          departureAt: "18:30",
          satisfactionReason: "Clôture automatique (Fermeture de la bibliothèque à 18h30)",
        })
        .where(
          and(
            eq(visits.date, currentDateString),
            isNull(visits.departureAt)
          )
        );
    }
  } catch (error) {
    console.error("Erreur lors de la clôture automatique :", error);
  }
}

// 0. RÉCUPÉRATION DE LA VISITE ACTIVE (GET)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;
    if (!token) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = (payload.id || payload.sub) as string;

    const { dateString, isPastClosingTime } = getBeninDateTime();

    // Auto-clôture à 18h30
    await autoCloseExpiredVisits(dateString, isPastClosingTime);

    // Recherche de la visite active pour l'utilisateur connecté
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

    return NextResponse.json(activeVisit || null, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// 1. ARRIVÉE (POST : RESTRICTION 09h00 - 18h30)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;
    if (!token) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = (payload.id || payload.sub) as string;

    const { timeString, dateString, isWithinWorkingHours, isPastClosingTime } = getBeninDateTime();

    // Auto-clôture des visites expirées au préalable
    await autoCloseExpiredVisits(dateString, isPastClosingTime);

    // Contrôle de la plage horaire d'ouverture
    if (!isWithinWorkingHours) {
      return NextResponse.json(
        { message: "Les enregistrements sont autorisés uniquement entre 09h00 et 18h30." },
        { status: 403 }
      );
    }

    const { motif } = await request.json();
    if (!motif) return NextResponse.json({ message: "Motif manquant" }, { status: 400 });

    // Vérification s'il y a déjà une visite active
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

    // Calcul du numéro de ticket du jour
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

// 2. SORTIE ET SATISFACTION (PUT)
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;
    if (!token) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = (payload.id || payload.sub) as string;

    const body = await request.json().catch(() => ({}));
    const { rating, reason } = body;

    const { timeString, dateString, isPastClosingTime } = getBeninDateTime();

    // Auto-clôture au cas où il est passé 18h30
    await autoCloseExpiredVisits(dateString, isPastClosingTime);

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
        { message: "Aucune visite active trouvée pour aujourd'hui (ou la visite a été automatiquement clôturée à 18h30)." },
        { status: 404 }
      );
    }

    await db
      .update(visits)
      .set({
        departureAt: timeString,
        satisfactionRating: rating || null,
        satisfactionReason: reason || null,
      })
      .where(eq(visits.id, activeVisit.id));

    return NextResponse.json(
      { message: "Sortie et avis enregistrés avec succès !" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}