import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  userType: text("user_type").notNull().default("mensalista"), // "mensalista", "avulso", or "admin"
  cpf: text("cpf"),
  phone: text("phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
  createdAt: true,
}).required({
  userType: true
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
}).transform((data) => ({
  ...data,
  // Ensure returnTime is null if undefined or empty
  returnTime: data.returnTime || null
}));

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
}).transform((data) => ({
  ...data,
  // Ensure returnTime is null if undefined or empty
  returnTime: data.returnTime || null
}));

// Departure/Arrival locations configuration
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // "departure" or "arrival"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

// Departure times configuration
export const departureTimes = pgTable("departure_times", {
  id: serial("id").primaryKey(),
  time: text("time").notNull().unique(), // e.g. "17h10", "18h10"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDepartureTimeSchema = createInsertSchema(departureTimes).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

// User contract schema (for mensalista users)
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  monday: boolean("monday").default(false),
  tuesday: boolean("tuesday").default(false),
  wednesday: boolean("wednesday").default(false),
  thursday: boolean("thursday").default(false),
  friday: boolean("friday").default(false),
  departureLocation: text("departure_location").notNull(),
  arrivalLocation: text("arrival_location").notNull(),
  returnTime: text("return_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type DepartureTime = typeof departureTimes.$inferSelect;
export type InsertDepartureTime = z.infer<typeof insertDepartureTimeSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
