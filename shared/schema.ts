import { pgTable, text, serial, integer, timestamp, real, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  room: text("room").notNull(),
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  name: true,
  room: true,
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  current: integer("current").notNull(), // current number of tablets
  frequency: real("frequency").notNull(), // tablets per day (can be 0.5, 1, 1.5, etc.)
  added: timestamp("added").notNull().defaultNow(),
});

export const insertMedicationSchema = createInsertSchema(medications).pick({
  patientId: true,
  name: true,
  current: true,
  frequency: true,
});

export const updateMedicationSchema = z.object({
  id: z.number(),
  current: z.number().int().positive(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type UpdateMedication = z.infer<typeof updateMedicationSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
