import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { visits, users } from "@/lib/db/schema";
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
    if (payload.role !== "admin") {
      return NextResponse.json({ message: "Accès interdit." }, { status: 403 });
    }

    // Récupérer toutes les visites triées par la date la plus récente, puis par heure d'arrivée
    const list = await db
      .select({
        id: visits.id,
        ticketNumber: visits.ticketNumber,
        motif: visits.motif,
        arrivalAt: visits.arrivalAt,
        departureAt: visits.departureAt,
        date: visits.date,
        user: {
          fullName: users.fullName,
          sex: users.sex,
          school: users.school,
          phone: users.phone,
          filiere: users.filiere,
        },
      })
      .from(visits)
      .innerJoin(users, eq(visits.userId, users.id))
      .orderBy(desc(visits.date), desc(visits.arrivalAt)); 

    return NextResponse.json(list, { status: 200 });
  } catch (error) {
    console.error("Erreur API Admin Visits :", error);
    return NextResponse.json(
      { message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}