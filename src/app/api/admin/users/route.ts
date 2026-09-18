import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, visits } from "@/lib/db/schema";
import { and, gte, lte, ne } from "drizzle-orm";
import { jwtVerify } from "jose";
import { autoCloseExpiredVisits, getBeninDateTime } from "@/lib/visits";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production",
);

type Period = "week" | "month" | "year";

function getPeriodStart(dateString: string, period: Period) {
  const date = new Date(`${dateString}T00:00:00Z`);

  if (period === "year") {
    date.setUTCMonth(0, 1);
  } else if (period === "month") {
    date.setUTCDate(1);
  } else {
    const day = date.getUTCDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  }

  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get("sda_session_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") {
      return NextResponse.json({ message: "Accès interdit." }, { status: 403 });
    }

    const requestedPeriod = new URL(request.url).searchParams.get("period");
    const period: Period =
      requestedPeriod === "month" || requestedPeriod === "year"
        ? requestedPeriod
        : "week";
    const { dateString, isPastClosingTime } = getBeninDateTime();
    await autoCloseExpiredVisits(dateString, isPastClosingTime);

    const startDate = getPeriodStart(dateString, period);
    const userRows = await db
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
      .where(ne(users.role, "admin"));

    const visitRows = await db
      .select({
        userId: visits.userId,
        date: visits.date,
        arrivalAt: visits.arrivalAt,
      })
      .from(visits)
      .where(and(gte(visits.date, startDate), lte(visits.date, dateString)));

    const visitsByUser = new Map<
      string,
      { count: number; lastVisit: string | null }
    >();
    for (const visit of visitRows) {
      const current = visitsByUser.get(visit.userId) || {
        count: 0,
        lastVisit: null,
      };
      current.count += 1;
      const visitDate = `${visit.date}T${visit.arrivalAt}:00`;
      if (!current.lastVisit || visitDate > current.lastVisit)
        current.lastVisit = visitDate;
      visitsByUser.set(visit.userId, current);
    }

    const result = userRows.map((user) => ({
      ...user,
      phone: user.phone || "Non renseigné",
      school: user.school || "Non renseignée",
      filiere: user.filiere || "Non renseignée",
      visitCount: visitsByUser.get(user.id)?.count || 0,
      lastVisit: visitsByUser.get(user.id)?.lastVisit || null,
    }));

    return NextResponse.json({
      period,
      startDate,
      endDate: dateString,
      users: result,
    });
  } catch (error) {
    console.error("Erreur API admin users:", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
