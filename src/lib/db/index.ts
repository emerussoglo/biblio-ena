import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Sécurité pour s'assurer que les variables d'environnement sont présentes
const url = process.env.TURSO_CONNECTION_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("Missing TURSO_CONNECTION_URL env variable");
}

if (!url.startsWith("file:") && !authToken) {
  throw new Error("Missing TURSO_AUTH_TOKEN env variable for remote database");
}

// Création du client de base de données LibSQL (Turso)
const client = createClient({
  url: url,
  authToken: authToken,
});

// Initialisation de Drizzle avec le schéma
export const db = drizzle(client, { schema });