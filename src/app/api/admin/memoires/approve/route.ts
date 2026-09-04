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

    // --- REJET / DEMANDE DE CORRECTION ---
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
        { message: "Notification envoyée pour correction." },
        { status: 200 }
      );
    }

    // --- VERIFICATION PHYSIQUE AU GUICHET ---
    if (action === "verify_physical") {
      await db
        .update(memoires)
        .set({
          physicalDepositStatus: physicalDepositStatus || "verified",
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(memoires.id, id));

      return NextResponse.json(
        { message: "Dépôt physique validé." },
        { status: 200 }
      );
    }

    // --- APPROBATION NUMÉRIQUE & EXPÉDITION DU PDF VIA E-MAIL ---
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
    const finalMention = mention || memoire.mention || "Non spécifiée";

    await db
      .update(memoires)
      .set({
        status: "approved",
        quitusNumber,
        defenseDate: approvedAt,
        mention: finalMention,
        rejectionReason: null,
        approvedAt,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(memoires.id, id));

    if (memoire.email) {
      await sendQuitusApprovalEmail({
        toEmail: memoire.email,
        quitusData: {
          quitusNumber,
          fullName: memoire.fullName,
          matricule: memoire.matricule,
          title: memoire.title,
          filiere: memoire.filiere,
          academicYear: memoire.academicYear,
          supervisor: memoire.supervisor,
          internshipLocation: memoire.internshipLocation,
          mention: finalMention,
          approvedAt,
        },
      });
    }

    return NextResponse.json(
      { message: "Mémoire approuvé et PDF envoyé par e-mail.", quitusNumber },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la validation du mémoire :", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la validation." },
      { status: 500 }
    );
  }
}