import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";


export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  sex: text("sex", { enum: ["M", "F"] }).notNull(),
  userType: text("user_type", { enum: ["etudiant", "professionnel"] }).default("etudiant").notNull(),
  phone: text("phone"),
  school: text("school"), // Devient optionnel pour les professionnels
  filiere: text("filiere"), // Devient optionnel pour les professionnels
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "student", "visitor"] }).default("student").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const visits = sqliteTable("visits", {
  id: text("id").primaryKey(), // ID unique (UUID ou nanoid)
  userId: text("user_id").notNull().references(() => users.id),
  ticketNumber: text("ticket_number").notNull(), // Stockera "#N°001", "#N°002", etc.
  motif: text("motif").notNull(),
  arrivalAt: text("arrival_at").notNull(), // ISO String ou HH:MM
  departureAt: text("departure_at"), // Nullable jusqu'à ce qu'il clique sur Sortie
  date: text("date").notNull(), // Format YYYY-MM-DD pour faciliter les stats globales
});



/* --- NOUVELLE TABLE : MEMOIRES --- */
export const memoires = sqliteTable("memoires", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  abstract: text("abstract"),
  year: text("year"),
  keywords: text("keywords"),
  fullName: text("full_name").notNull(), // Champ unifié "Nom et Prénom"
  matricule: text("matricule"),
  filiere: text("filiere"),
  academicYear: text("academic_year"),
  supervisor: text("supervisor"),
  internshipLocation: text("internship_location"),
  email: text("email"),
  phone: text("phone"),
  submissionDate: text("submission_date").default(sql`CURRENT_TIMESTAMP`).notNull(), // Générée automatiquement
  fileUrl: text("file_url").notNull(), // URL ou chemin du fichier PDF
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

