import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, visits } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { autoCloseExpiredVisits, getBeninDateTime } from "@/lib/visits";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production",
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = (await cookies()).get("sda_session_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") {
      return NextResponse.json({ message: "Accès interdit." }, { status: 403 });
    }

    const { id } = await params;
    const { dateString, isPastClosingTime } = getBeninDateTime();
    await autoCloseExpiredVisits(dateString, isPastClosingTime);

    const user = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        sex: users.sex,
        userType: users.userType,
        role: users.role,
        phone: users.phone,
        school: users.school,
        filiere: users.filiere,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .get();

    if (!user || user.role === "admin") {
      return NextResponse.json(
        { message: "Usager introuvable." },
        { status: 404 },
      );
    }

    const history = await db
      .select({
        id: visits.id,
        ticketNumber: visits.ticketNumber,
        motif: visits.motif,
        arrivalAt: visits.arrivalAt,
        departureAt: visits.departureAt,
        date: visits.date,
        satisfactionRating: visits.satisfactionRating,
        satisfactionReason: visits.satisfactionReason,
      })
      .from(visits)
      .where(eq(visits.userId, id))
      .orderBy(desc(visits.date), desc(visits.arrivalAt));

    return NextResponse.json(
      {
        user: {
          ...user,
          phone: user.phone || "Non renseigné",
          school: user.school || "Non renseignée",
          filiere: user.filiere || "Non renseignée",
          visitCount: history.length,
          lastVisit: history[0]
            ? `${history[0].date}T${history[0].arrivalAt}:00`
            : null,
        },
        history,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur API détail usager admin:", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
