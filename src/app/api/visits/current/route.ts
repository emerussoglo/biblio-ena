import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production"
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sda_session_token")?.value;
    if (!token) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Date actuelle au Bénin (UTC+1)
    const formatter = new Intl.DateTimeFormat("fr-CA", {
      timeZone: "Africa/Porto-Novo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const dateString = formatter.format(new Date());

    const activeVisit = await db
      .select()
      .from(visits)
      .where(
        and(
          eq(visits.userId, payload.id as string),
          eq(visits.date, dateString),
          isNull(visits.departureAt)
        )
      )
      .get();

    return NextResponse.json(activeVisit || null, { status: 200 });
  } catch (error) {
    return NextResponse.json(null, { status: 500 });
  }
}