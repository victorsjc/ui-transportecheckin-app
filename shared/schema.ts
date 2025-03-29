import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  userType: text("user_type").notNull().default("mensalista"), // "mensalista" or "avulso"
  cpf: text("cpf"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Vacation periods for mensalista users
export const vacationPeriods = pgTable("vacation_periods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVacationPeriodSchema = createInsertSchema(vacationPeriods).omit({
  id: true,
  createdAt: true,
});

// Check-ins for all user types
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  direction: text("direction").notNull(), // "ida" or "retorno"
  returnTime: text("return_time"), // "17h10" or "18h10" or null
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCheckinSchema = createInsertSchema(checkins).omit({
  id: true,
  createdAt: true,
});

// Single-trip reservations
export const singleTrips = pgTable("single_trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  direction: text("direction").notNull(), // "ida" or "retorno"
  returnTime: text("return_time"), // "17h10" or "18h10" or null
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSingleTripSchema = createInsertSchema(singleTrips).omit({
  id: true,
  isUsed: true,
  createdAt: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type VacationPeriod = typeof vacationPeriods.$inferSelect;
export type InsertVacationPeriod = z.infer<typeof insertVacationPeriodSchema>;

export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;

export type SingleTrip = typeof singleTrips.$inferSelect;
export type InsertSingleTrip = z.infer<typeof insertSingleTripSchema>;
