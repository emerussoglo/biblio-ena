import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memoires } from "@/lib/db/schema";
import { put } from "@vercel/blob";

// ==========================================
// 1. GET : Récupérer tous les mémoires pour l'Admin
// ==========================================
export async function GET() {
  try {
    const data = await db
      .select()
      .from(memoires);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des mémoires :", error);
    return NextResponse.json(
      { message: "Impossible de charger les mémoires." },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. POST : Ajouter un nouveau mémoire
// ==========================================
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // 1. Récupération des données du formulaire
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

    // 2. Validation des champs obligatoires
    if (!title || !fullName || !file) {
      return NextResponse.json(
        { message: "Le titre, le nom/prénom et le fichier PDF sont obligatoires." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Seuls les fichiers au format PDF sont acceptés." },
        { status: 400 }
      );
    }

    // 3. Sauvegarde du fichier PDF sur Vercel Blob (au lieu du disque local)
    const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    
    const blob = await put(`memoires/${safeFileName}`, file, {
      access: "public",
    });

    // L'URL publique renvoyée par Vercel Blob (ex: https://...public.blob.vercel-storage.com/...)
    const fileUrl = blob.url;
    const memoireId = crypto.randomUUID();

    // 4. Insertion de l'URL dans Turso via Drizzle
    await db.insert(memoires).values({
      id: memoireId,
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
      fileName: file.name,
      fileSize: file.size,
    });

    return NextResponse.json(
      { message: "Votre mémoire a été déposé avec succès !" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors du dépôt du mémoire :", error);
    return NextResponse.json(
      { message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}