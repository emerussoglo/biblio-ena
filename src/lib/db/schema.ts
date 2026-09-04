import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  sex: text("sex", { enum: ["M", "F"] }).notNull(),
  userType: text("user_type", { enum: ["etudiant", "professionnel"] }).default("etudiant").notNull(),
  phone: text("phone"),
  school: text("school"),
  filiere: text("filiere"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "student", "visitor"] }).default("student").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const visits = sqliteTable("visits", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  ticketNumber: text("ticket_number").notNull(),
  motif: text("motif").notNull(),
  arrivalAt: text("arrival_at").notNull(),
  departureAt: text("departure_at"),
  date: text("date").notNull(),
});

export const memoires = sqliteTable("memoires", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  abstract: text("abstract"),
  year: text("year"),
  keywords: text("keywords"),
  fullName: text("full_name").notNull(),
  matricule: text("matricule"),
  filiere: text("filiere"),
  academicYear: text("academic_year"),
  supervisor: text("supervisor"),
  internshipLocation: text("internship_location"),
  email: text("email"),
  phone: text("phone"),
  submissionDate: text("submission_date").default(sql`CURRENT_TIMESTAMP`).notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(), 
  fileSize: integer("file_size").notNull(),

  // Quitus Provisoire & Soutenance
  quitusNumber: text("quitus_number").unique(),
  defenseDate: text("defense_date"),
  mention: text("mention"),
  approvedAt: text("approved_at"),
  rejectionReason: text("rejection_reason"), // Précision des corrections à apporter

  // Statut du contrôle physique à la bibliothèque
  physicalDepositStatus: text("physical_deposit_status", { 
    enum: ["pending", "verified"] 
  }).default("pending").notNull(),

  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});