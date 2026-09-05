import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memoires } from "@/lib/db/schema";
import { eq, like, desc } from "drizzle-orm";
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
    const body = await request.json();
    const { id, mention, action, rejectionReason, physicalDepositStatus } = body;

    if (!id) {
      return NextResponse.json({ message: "ID du mémoire manquant." }, { status: 400 });
    }

    // Récupération du mémoire
    const memoireList = await db
      .select()
      .from(memoires)
      .where(eq(memoires.id, id))
      .limit(1);

    const memoire = memoireList[0];

    if (!memoire) {
      return NextResponse.json({ message: "Mémoire introuvable." }, { status: 404 });
    }

    const nowIso = new Date().toISOString();

    // --- 1. ACTION : REJET / DEMANDE DE CORRECTION ---
    if (action === "reject") {
      const reasonToSave = rejectionReason || "Document non conforme aux normes.";

      await db
        .update(memoires)
        .set({
          status: "rejected",
          rejectionReason: reasonToSave,
          quitusNumber: null,
          approvedAt: null,
          updatedAt: nowIso,
        })
        .where(eq(memoires.id, id));

      if (memoire.email) {
        try {
          await sendQuitusRejectionEmail({
            toEmail: memoire.email,
            studentName: memoire.fullName,
            memoireTitle: memoire.title,
            reason: reasonToSave,
          });
        } catch (emailErr) {
          console.error("Erreur lors de l'envoi de l'email de rejet :", emailErr);
        }
      }

      return NextResponse.json(
        { message: "Notification envoyée pour correction." },
        { status: 200 }
      );
    }

    // --- 2. ACTION : VERIFICATION PHYSIQUE AU GUICHET ---
    if (action === "verify_physical") {
      await db
        .update(memoires)
        .set({
          physicalDepositStatus: physicalDepositStatus || "verified",
          updatedAt: nowIso,
        })
        .where(eq(memoires.id, id));

      return NextResponse.json(
        { message: "Dépôt physique validé." },
        { status: 200 }
      );
    }

    // --- 3. ACTION : APPROBATION NUMÉRIQUE & GÉNÉRATION QUITUS ---
    let quitusNumber = memoire.quitusNumber;

    if (!quitusNumber) {
      const currentYear = new Date().getFullYear();
      const prefix = `QSDA-${currentYear}-`;

      // Recherche sécurisée du dernier numéro de quitus généré pour l'année en cours
      const existingQuitus = await db
        .select({ quitusNumber: memoires.quitusNumber })
        .from(memoires)
        .where(like(memoires.quitusNumber, `${prefix}%`))
        .orderBy(desc(memoires.quitusNumber))
        .limit(1);

      let nextSeq = 1;

      if (existingQuitus.length > 0 && existingQuitus[0].quitusNumber) {
        const lastQuitus = existingQuitus[0].quitusNumber;
        const parts = lastQuitus.split("-");
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) {
          nextSeq = lastNum + 1;
        }
      }

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
        updatedAt: nowIso,
      })
      .where(eq(memoires.id, id));

    // Tentative d'envoi d'e-mail d'approbation
    if (memoire.email) {
      try {
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
      } catch (emailErr) {
        console.error("Erreur lors de l'envoi du mail de validation :", emailErr);
      }
    }

    return NextResponse.json(
      { message: "Mémoire approuvé et PDF envoyé par e-mail.", quitusNumber },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la validation du mémoire :", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la validation du mémoire." },
      { status: 500 }
    );
  }
}