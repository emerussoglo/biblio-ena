import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memoires } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { del } from "@vercel/blob";
import { unlink } from "fs/promises";
import path from "path";

// ==========================================
// 1. GET : Récupérer les mémoires pour l'admin
// ==========================================
export async function GET() {
  try {
    const list = await db
      .select()
      .from(memoires)
      .orderBy(desc(memoires.createdAt));

    return NextResponse.json(list, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des mémoires :", error);
    return NextResponse.json(
      { message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  } 
}

// ==========================================
// 2. DELETE : Supprimer un mémoire + son fichier
// ==========================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "L'identifiant du mémoire est requis." },
        { status: 400 }
      );
    }

    // 1. Chercher le mémoire dans Turso
    const itemArray = await db
      .select()
      .from(memoires)
      .where(eq(memoires.id, id))
      .limit(1);

    const memoireToDelete = itemArray[0];

    if (!memoireToDelete) {
      return NextResponse.json(
        { message: "Mémoire introuvable." },
        { status: 404 }
      );
    }

    // 2. Supprimer le fichier physique (Vercel Blob ou Local)
    if (memoireToDelete.fileUrl) {
      if (memoireToDelete.fileUrl.startsWith("http")) {
        // Supprime le fichier stocké sur Vercel Blob
        await del(memoireToDelete.fileUrl);
      } else {
        // Supprime le fichier stocké en local
        try {
          const localFilePath = path.join(
            process.cwd(),
            "public",
            memoireToDelete.fileUrl
          );
          await unlink(localFilePath);
        } catch (err) {
          console.warn("Fichier local introuvable ou déjà supprimé :", err);
        }
      }
    }

    // 3. Supprimer l'enregistrement dans la base Turso
    await db.delete(memoires).where(eq(memoires.id, id));

    return NextResponse.json(
      { message: "Mémoire et fichier supprimés avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return NextResponse.json(
      { message: "Une erreur interne est survenue lors de la suppression." },
      { status: 500 }
    );
  }
}