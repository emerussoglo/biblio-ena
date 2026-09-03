import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, visits, memoires } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
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

    // 1. Totaux globaux
    const totalUsersRes = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalVisitsRes = await db.select({ count: sql<number>`count(*)` }).from(visits);
    const totalMemoiresRes = await db.select({ count: sql<number>`count(*)` }).from(memoires);
    const totalQuitusRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(memoires)
      .where(eq(memoires.status, "approved"));

    // 2. Répartition des utilisateurs par genre (M / F)
    const usersBySex = await db
      .select({
        sex: users.sex,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .groupBy(users.sex);

    // 3. Répartition par type d'usager (étudiant / professionnel)
    const usersByType = await db
      .select({
        userType: users.userType,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .groupBy(users.userType);

    // 4. Statistiques des mémoires par statut (pending / approved / rejected)
    const memoiresByStatus = await db
      .select({
        status: memoires.status,
        count: sql<number>`count(*)`,
      })
      .from(memoires)
      .groupBy(memoires.status);

    // 5. Répartition des mémoires approuvés par mention
    const memoiresByMention = await db
      .select({
        mention: memoires.mention,
        count: sql<number>`count(*)`,
      })
      .from(memoires)
      .where(eq(memoires.status, "approved"))
      .groupBy(memoires.mention);

    // 6. Top 5 des filières représentées dans les visites
    const visitsByFiliere = await db
      .select({
        filiere: users.filiere,
        count: sql<number>`count(*)`,
      })
      .from(visits)
      .innerJoin(users, eq(visits.userId, users.id))
      .groupBy(users.filiere)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    return NextResponse.json(
      {
        kpis: {
          totalUsers: totalUsersRes[0]?.count || 0,
          totalVisits: totalVisitsRes[0]?.count || 0,
          totalMemoires: totalMemoiresRes[0]?.count || 0,
          totalQuitus: totalQuitusRes[0]?.count || 0,
        },
        usersBySex,
        usersByType,
        memoiresByStatus,
        memoiresByMention,
        visitsByFiliere,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur API Admin Stats :", error);
    return NextResponse.json(
      { message: "Erreur lors du chargement des statistiques." },
      { status: 500 }
    );
  }
}