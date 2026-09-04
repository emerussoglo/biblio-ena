import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memoires } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_production"
);

export async function GET() {
  try {
    const data = await db.select().from(memoires);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erreur récupération mémoires :", error);
    return NextResponse.json({ message: "Impossible de charger les mémoires." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let userId: string | null = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("sda_session_token")?.value;
      if (token) {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.id as string;
      }
    } catch {
      // Ignoré si anonyme
    }

    const formData = await request.formData();

    const memoireIdParam = formData.get("id") as string | null; // Pour les ré-soumissions
    const title = formData.get("title") as string;
    const abstract = formData.get("abstract") as string;
    const year = formData.get("year") as string;
    const keywords = formData.get("keywords") as string;
    const fullName = formData.get("fullName") as string;
    const matricule = formData.get("matricule") as string;
    const filiere = formData.get("filiere") as string;
    const academicYear = formData.get("academicYear") as string;
    const supervisor = formData.get("supervisor") as string;
    const internshipLocation = formData.get("internshipLocation") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const file = formData.get("file") as File | null;

    if (!title || !fullName) {
      return NextResponse.json(
        { message: "Le titre et le nom/prénom sont obligatoires." },
        { status: 400 }
      );
    }

    let fileUrl = "";
    let fileName = "";
    let fileSize = 0;

    // Si un nouveau fichier est transmis
    if (file && file.size > 0) {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { message: "Seuls les fichiers au format PDF sont acceptés." },
          { status: 400 }
        );
      }

      fileName = file.name;
      fileSize = file.size;

      if (process.env.NODE_ENV === "production") {
        const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const blob = await put(`memoires/${safeFileName}`, file, { access: "public" });
        fileUrl = blob.url;
      } else {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), "public/uploads/memoires");
        await mkdir(uploadDir, { recursive: true });
        const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join(uploadDir, safeFileName);
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/memoires/${safeFileName}`;
      }
    }

    // CAS RÉ-SOUMISSION APRÈS CORRECTION
    if (memoireIdParam) {
      const existingMemoire = await db.query.memoires.findFirst({
        where: eq(memoires.id, memoireIdParam),
      });

      if (existingMemoire) {
        await db
          .update(memoires)
          .set({
            title,
            abstract: abstract || null,
            year: year || null,
            keywords: keywords || null,
            fullName,
            matricule: matricule || null,
            filiere: filiere || null,
            academicYear: academicYear || null,
            supervisor: supervisor || null,
            internshipLocation: internshipLocation || null,
            email: email ? email.toLowerCase() : null,
            phone: phone || null,
            ...(fileUrl ? { fileUrl, fileName, fileSize } : {}),
            status: "pending", // Repasse en attente de validation
            rejectionReason: null,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(memoires.id, memoireIdParam));

        return NextResponse.json(
          { message: "Memoire corrigé et ressoumis avec succès !" },
          { status: 200 }
        );
      }
    }

    // NOUVEAU DÉPÔT
    if (!file) {
      return NextResponse.json(
        { message: "Le fichier PDF du mémoire est obligatoire." },
        { status: 400 }
      );
    }

    const memoireId = crypto.randomUUID();

    await db.insert(memoires).values({
      id: memoireId,
      userId,
      title,
      abstract: abstract || null,
      year: year || null,
      keywords: keywords || null,
      fullName,
      matricule: matricule || null,
      filiere: filiere || null,
      academicYear: academicYear || null,
      supervisor: supervisor || null,
      internshipLocation: internshipLocation || null,
      email: email ? email.toLowerCase() : null,
      phone: phone || null,
      fileUrl,
      fileName,
      fileSize,
      status: "pending",
      physicalDepositStatus: "pending",
    });

    return NextResponse.json(
      { message: "Votre mémoire a été déposé avec succès !" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors du dépôt du mémoire :", error);
    return NextResponse.json(
      { message: "Une erreur interne est survenue lors de la soumission." },
      { status: 500 }
    );
  }
}