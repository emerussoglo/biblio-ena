import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memoires } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

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