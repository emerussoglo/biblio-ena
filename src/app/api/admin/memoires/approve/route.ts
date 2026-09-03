import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memoires } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

function getBeninDate() {
  const formatter = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Porto-Novo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = formatter.format(new Date()).split("-");
  return `${day}/${month}/${year}`;
}

export async function PUT(request: Request) {
  try {
    const { id, mention, action } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "ID du mémoire manquant." }, { status: 400 });
    }

    // Cas de rejet / annulation
    if (action === "reject") {
      await db
        .update(memoires)
        .set({
          status: "rejected",
          quitusNumber: null,
          approvedAt: null,
        })
        .where(eq(memoires.id, id));

      return NextResponse.json(
        { message: "Le mémoire a été rejeté." },
        { status: 200 }
      );
    }

    // Génération du numéro séquentiel
    const approvedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(memoires)
      .where(eq(memoires.status, "approved"));

    const seq = (approvedCount[0]?.count || 0) + 1;
    const currentYear = new Date().getFullYear();
    const quitusNumber = `QSDA-${currentYear}-${String(seq).padStart(3, "0")}`;
    const approvedAt = getBeninDate();

    await db
      .update(memoires)
      .set({
        status: "approved",
        quitusNumber,
        defenseDate: approvedAt, // Attribution automatique de la date d'approbation
        mention: mention || "Non spécifiée",
        approvedAt,
      })
      .where(eq(memoires.id, id));

    return NextResponse.json(
      { message: "Quitus validé avec succès !", quitusNumber },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur validation quitus:", error);
    return NextResponse.json({ message: "Erreur serveur lors de la validation." }, { status: 500 });
  }
}