import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memoires } from "@/lib/db/schema";
import { eq, sql, like } from "drizzle-orm";
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
    const { id, mention, action, rejectionReason, physicalDepositStatus } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "ID du mémoire manquant." }, { status: 400 });
    }

    const memoire = await db.query.memoires.findFirst({
      where: eq(memoires.id, id),
    });

    if (!memoire) {
      return NextResponse.json({ message: "Mémoire introuvable." }, { status: 404 });
    }

    // --- CAS DE DEMANDE DE CORRECTION / REJET ---
    if (action === "reject") {
      await db
        .update(memoires)
        .set({
          status: "rejected",
          rejectionReason: rejectionReason || "Document non conforme aux normes.",
          quitusNumber: null,
          approvedAt: null,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(memoires.id, id));

      if (memoire.email) {
        await sendQuitusRejectionEmail({
          toEmail: memoire.email,
          studentName: memoire.fullName,
          memoireTitle: memoire.title,
          reason: rejectionReason,
        });
      }

      return NextResponse.json(
        { message: "Notifcation envoyée. L'étudiant doit effectuer les corrections." },
        { status: 200 }
      );
    }

    // --- VALIDATION DE LA PRÉSENCE DES PIÈCES PHYSIQUES AU GUICHET ---
    if (action === "verify_physical") {
      await db
        .update(memoires)
        .set({
          physicalDepositStatus: physicalDepositStatus || "verified",
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(memoires.id, id));

      return NextResponse.json(
        { message: "Dépôt physique validé à la bibliothèque." },
        { status: 200 }
      );
    }

    // --- VALIDATION NUMÉRIQUE & GÉNÉRATION DU QUITUS PROVISOIRE ---
    let quitusNumber = memoire.quitusNumber;

    if (!quitusNumber) {
      const currentYear = new Date().getFullYear();
      const prefix = `QSDA-${currentYear}-`;

      const maxQuitusRes = await db
        .select({
          maxSeq: sql<string>`MAX(CAST(SUBSTR(${memoires.quitusNumber}, 11) AS INTEGER))`,
        })
        .from(memoires)
        .where(like(memoires.quitusNumber, `${prefix}%`));

      const lastSeq = parseInt(maxQuitusRes[0]?.maxSeq || "0", 10);
      const nextSeq = lastSeq + 1;
      quitusNumber = `${prefix}${String(nextSeq).padStart(3, "0")}`;
    }

    const approvedAt = getBeninDate();

    await db
      .update(memoires)
      .set({
        status: "approved",
        quitusNumber,
        defenseDate: approvedAt,
        mention: mention || memoire.mention || "Non spécifiée",
        rejectionReason: null, // Réinitialisation de l'erreur
        approvedAt,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(memoires.id, id));

    if (memoire.email && memoire.status !== "approved") {
      await sendQuitusApprovalEmail({
        toEmail: memoire.email,
        studentName: memoire.fullName,
        memoireTitle: memoire.title,
        quitusNumber,
      });
    }

    return NextResponse.json(
      { message: "Validation numérique effectuée et quitus provisoire généré.", quitusNumber },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur validation quitus:", error);
    return NextResponse.json({ message: "Erreur serveur lors de la validation." }, { status: 500 });
  }
}