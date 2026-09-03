import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memoires } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendQuitusApprovalEmail, sendQuitusRejectionEmail } from "@/lib/email";

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
    const { id, mention, action, rejectionReason } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "ID du mémoire manquant." }, { status: 400 });
    }

    // 1. Récupération des informations du mémoire et de l'usager
    const memoire = await db.query.memoires.findFirst({
      where: eq(memoires.id, id),
    });

    if (!memoire) {
      return NextResponse.json({ message: "Mémoire introuvable." }, { status: 404 });
    }

    // --- CAS DE REJET ---
    if (action === "reject") {
      await db
        .update(memoires)
        .set({
          status: "rejected",
          quitusNumber: null,
          approvedAt: null,
        })
        .where(eq(memoires.id, id));

      // Notification par e-mail en cas de rejet
      if (memoire.email) {
        await sendQuitusRejectionEmail({
          toEmail: memoire.email,
          studentName: memoire.fullName,
          memoireTitle: memoire.title,
          reason: rejectionReason,
        });
      }

      return NextResponse.json(
        { message: "Le mémoire a été rejeté et un e-mail d'information a été envoyé." },
        { status: 200 }
      );
    }

    // --- CAS D'APPROBATION ---
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
        defenseDate: approvedAt,
        mention: mention || "Non spécifiée",
        approvedAt,
      })
      .where(eq(memoires.id, id));

    // Envoi de l'e-mail de confirmation avec le numéro de quitus
    if (memoire.email) {
      await sendQuitusApprovalEmail({
        toEmail: memoire.email,
        studentName: memoire.fullName,
        memoireTitle: memoire.title,
        quitusNumber,
      });
    }

    return NextResponse.json(
      { message: "Quitus validé avec succès et e-mail envoyé !", quitusNumber },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur validation quitus:", error);
    return NextResponse.json({ message: "Erreur serveur lors de la validation." }, { status: 500 });
  }
}