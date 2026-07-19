import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Déconnexion réussie" },
    { status: 200 }
  );

  // Suppression du cookie de session
  response.cookies.set({
    name: "sda_session_token",
    value: "",
    path: "/",
    expires: new Date(0), // Expire immédiatement
  });

  return response;
}