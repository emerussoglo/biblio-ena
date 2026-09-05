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

    // 2. Supprimer le fichier (Vercel Blob ou Local) dans un bloc try/catch isolé
    if (memoireToDelete.fileUrl) {
      try {
        if (
          memoireToDelete.fileUrl.startsWith("http://") ||
          memoireToDelete.fileUrl.startsWith("https://")
        ) {
          // Si le fichier est hébergé sur Vercel Blob
          await del(memoireToDelete.fileUrl);
        } else {
          // Si le fichier est en local dans public/
          const localFilePath = path.join(
            process.cwd(),
            "public",
            memoireToDelete.fileUrl
          );
          await unlink(localFilePath);
        }
      } catch (fileErr) {
        console.warn(
          "Avertissement : Le fichier n'a pas pu être supprimé du stockage :",
          fileErr
        );
      }
    }

    // 3. Supprimer l'enregistrement de la base Turso
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