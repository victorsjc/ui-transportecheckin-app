var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore, MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    MemoryStore = createMemoryStore(session);
    MemStorage = class {
      users;
      vacationPeriods;
      checkins;
      singleTrips;
      locations;
      departureTimes;
      contracts;
      userCurrentId;
      vacationCurrentId;
      checkinCurrentId;
      singleTripCurrentId;
      locationCurrentId;
      departureTimeCurrentId;
      contractCurrentId;
      sessionStore;
      // Using any for session store to avoid type issues
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.vacationPeriods = /* @__PURE__ */ new Map();
        this.checkins = /* @__PURE__ */ new Map();
        this.singleTrips = /* @__PURE__ */ new Map();
        this.locations = /* @__PURE__ */ new Map();
        this.departureTimes = /* @__PURE__ */ new Map();
        this.contracts = /* @__PURE__ */ new Map();
        this.userCurrentId = 1;
        this.vacationCurrentId = 1;
        this.checkinCurrentId = 1;
        this.singleTripCurrentId = 1;
        this.locationCurrentId = 1;
        this.departureTimeCurrentId = 1;
        this.contractCurrentId = 1;
        this.sessionStore = new MemoryStore({
          checkPeriod: 864e5
          // 24h
        });
        this.users.set(this.userCurrentId, {
          id: this.userCurrentId++,
          email: "admin@example.com",
          password: "bb7fc56073e04cb33c2a7ae0f7529c9a74d5cd833b9ba79fc47f30e9b8cd4fb39b6abdd326ac07f38c188f40b96cea0f2ef6c76ea24cb6fced3f0362ba25ec0c.d1cbe0c98df5bc4c",
          name: "Administrador",
          userType: "admin",
          cpf: "12345678900",
          phone: "11987654321",
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        });
        this.departureTimes.set(this.departureTimeCurrentId, {
          id: this.departureTimeCurrentId++,
          time: "17h10",
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        });
        this.departureTimes.set(this.departureTimeCurrentId, {
          id: this.departureTimeCurrentId++,
          time: "18h10",
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        });
        const departureLocations = [
          "Ipiranga/Veibr\xE1s",
          "Center Vale",
          "Vale Sul",
          "Gruta",
          "Lourinho/Jacare\xED"
        ];
        departureLocations.forEach((name) => {
          this.locations.set(this.locationCurrentId, {
            id: this.locationCurrentId++,
            name,
            type: "departure",
            createdAt: /* @__PURE__ */ new Date()
          });
        });
        const arrivalLocations = [
          "Atacad\xE3o/Jacare\xED",
          "Posto 7 Estrelas",
          "Carrefour",
          "Vale Sul",
          "Center Vale",
          "Ipiranga/Veibr\xE1s"
        ];
        arrivalLocations.forEach((name) => {
          this.locations.set(this.locationCurrentId, {
            id: this.locationCurrentId++,
            name,
            type: "arrival",
            createdAt: /* @__PURE__ */ new Date()
          });
        });
      }
      // User operations
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByEmail(email) {
        return Array.from(this.users.values()).find(
          (user) => user.email === email
        );
      }
      async getAllUsers() {
        return Array.from(this.users.values());
      }
      async updateUser(id, userData) {
        const user = this.users.get(id);
        if (!user) return void 0;
        const updatedUser = { ...user, ...userData };
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      async deactivateUser(id) {
        const user = this.users.get(id);
        if (user) {
          user.isActive = false;
          this.users.set(id, user);
        }
      }
      async getUsersByName(name) {
        return Array.from(this.users.values()).filter(
          (user) => user.name.toLowerCase().includes(name.toLowerCase())
        );
      }
      async searchUsers(query) {
        query = query.toLowerCase();
        return Array.from(this.users.values()).filter(
          (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
        );
      }
      async createUser(insertUser) {
        const id = this.userCurrentId++;
        const user = {
          id,
          email: insertUser.email,
          password: insertUser.password,
          name: insertUser.name,
          userType: insertUser.userType || "mensalista",
          // Garantir que cpf e phone são null em vez de undefined
          cpf: insertUser.cpf || null,
          phone: insertUser.phone || null,
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.users.set(id, user);
        return user;
      }
      // Vacation period operations
      async getVacationsByUserId(userId) {
        return Array.from(this.vacationPeriods.values()).filter(
          (period) => period.userId === userId
        );
      }
      async getVacationById(id) {
        return this.vacationPeriods.get(id);
      }
      async createVacationPeriod(insertVacationPeriod) {
        const id = this.vacationCurrentId++;
        const vacationPeriod = {
          ...insertVacationPeriod,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.vacationPeriods.set(id, vacationPeriod);
        return vacationPeriod;
      }
      async deleteVacation(id) {
        this.vacationPeriods.delete(id);
      }
      // Check-in operations
      async getCheckinsByUserId(userId) {
        return Array.from(this.checkins.values()).filter(
          (checkin) => checkin.userId === userId
        );
      }
      async getAllCheckins() {
        return Array.from(this.checkins.values());
      }
      async getCheckinByDateAndDirection(userId, date2, direction) {
        return Array.from(this.checkins.values()).find(
          (checkin) => checkin.userId === userId && new Date(checkin.date).toISOString().split("T")[0] === date2 && checkin.direction === direction
        );
      }
      async createCheckin(insertCheckin) {
        const id = this.checkinCurrentId++;
        const checkin = {
          ...insertCheckin,
          id,
          // Garantir que returnTime seja null e não undefined
          returnTime: insertCheckin.returnTime || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.checkins.set(id, checkin);
        return checkin;
      }
      async deleteCheckin(id) {
        this.checkins.delete(id);
      }
      // Single trip operations
      async getSingleTripById(id) {
        return this.singleTrips.get(id);
      }
      async getSingleTripsByUserId(userId) {
        return Array.from(this.singleTrips.values()).filter(
          (trip) => trip.userId === userId
        );
      }
      async getAllSingleTrips() {
        return Array.from(this.singleTrips.values());
      }
      async createSingleTrip(insertSingleTrip) {
        const id = this.singleTripCurrentId++;
        const singleTrip = {
          ...insertSingleTrip,
          id,
          isUsed: false,
          // Garantir que returnTime seja null e não undefined
          returnTime: insertSingleTrip.returnTime || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.singleTrips.set(id, singleTrip);
        return singleTrip;
      }
      async markSingleTripAsUsed(id) {
        const trip = this.singleTrips.get(id);
        if (trip) {
          trip.isUsed = true;
          this.singleTrips.set(id, trip);
        }
      }
      async deleteSingleTrip(id) {
        this.singleTrips.delete(id);
      }
      // Locations operations
      async getAllLocations() {
        return Array.from(this.locations.values());
      }
      async getLocationsByType(type) {
        return Array.from(this.locations.values()).filter(
          (location) => location.type === type
        );
      }
      async createLocation(location) {
        const id = this.locationCurrentId++;
        const newLocation = {
          ...location,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.locations.set(id, newLocation);
        return newLocation;
      }
      async deleteLocation(id) {
        this.locations.delete(id);
      }
      // Departure times operations
      async getAllDepartureTimes() {
        return Array.from(this.departureTimes.values());
      }
      async getActiveDepartureTimes() {
        return Array.from(this.departureTimes.values()).filter(
          (time) => time.isActive
        );
      }
      async createDepartureTime(departureTime) {
        const id = this.departureTimeCurrentId++;
        const newDepartureTime = {
          ...departureTime,
          id,
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.departureTimes.set(id, newDepartureTime);
        return newDepartureTime;
      }
      async updateDepartureTime(id, isActive) {
        const departureTime = this.departureTimes.get(id);
        if (!departureTime) return void 0;
        departureTime.isActive = isActive;
        this.departureTimes.set(id, departureTime);
        return departureTime;
      }
      async deleteDepartureTime(id) {
        this.departureTimes.delete(id);
      }
      // Contracts operations
      async getContractByUserId(userId) {
        return Array.from(this.contracts.values()).find(
          (contract) => contract.userId === userId
        );
      }
      async createContract(contract) {
        const id = this.contractCurrentId++;
        const newContract = {
          id,
          userId: contract.userId,
          departureLocation: contract.departureLocation,
          arrivalLocation: contract.arrivalLocation,
          returnTime: contract.returnTime,
          // Garantir que todos os booleanos tenham valores definidos
          monday: contract.monday || false,
          tuesday: contract.tuesday || false,
          wednesday: contract.wednesday || false,
          thursday: contract.thursday || false,
          friday: contract.friday || false,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.contracts.set(id, newContract);
        return newContract;
      }
      async updateContract(id, contractData) {
        const contract = this.contracts.get(id);
        if (!contract) return void 0;
        const updatedContract = {
          ...contract,
          ...contractData,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.contracts.set(id, updatedContract);
        return updatedContract;
      }
      async deleteContract(id) {
        this.contracts.delete(id);
      }
    };
    storage = new MemStorage();
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  comparePasswords: () => comparePasswords,
  hashPassword: () => hashPassword,
  setupAuth: () => setupAuth
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "transporte-checkin-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1e3
      // 30 days
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy({
      usernameField: "email"
      // Use email for authentication
    }, async (email, password, done) => {
      const user = await storage.getUserByEmail(email);
      if (!user || !await comparePasswords(password, user.password)) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).send("E-mail j\xE1 cadastrado");
    }
    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password)
    });
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
var scryptAsync;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    scryptAsync = promisify(scrypt);
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_auth();
init_storage();
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  userType: text("user_type").notNull().default("mensalista"),
  // "mensalista", "avulso", or "admin"
  cpf: text("cpf"),
  phone: text("phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
  createdAt: true
}).required({
  userType: true
});
var vacationPeriods = pgTable("vacation_periods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertVacationPeriodSchema = createInsertSchema(vacationPeriods).omit({
  id: true,
  createdAt: true
});
var checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  direction: text("direction").notNull(),
  // "ida" or "retorno"
  returnTime: text("return_time"),
  // "17h10" or "18h10" or null
  createdAt: timestamp("created_at").defaultNow()
});
var insertCheckinSchema = createInsertSchema(checkins).omit({
  id: true,
  createdAt: true
}).transform((data) => ({
  ...data,
  // Ensure returnTime is null if undefined or empty
  returnTime: data.returnTime || null
}));
var singleTrips = pgTable("single_trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  direction: text("direction").notNull(),
  // "ida" or "retorno"
  returnTime: text("return_time"),
  // "17h10" or "18h10" or null
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var insertSingleTripSchema = createInsertSchema(singleTrips).omit({
  id: true,
  isUsed: true,
  createdAt: true
}).transform((data) => ({
  ...data,
  // Ensure returnTime is null if undefined or empty
  returnTime: data.returnTime || null
}));
var locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(),
  // "departure" or "arrival"
  createdAt: timestamp("created_at").defaultNow()
});
var insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true
});
var departureTimes = pgTable("departure_times", {
  id: serial("id").primaryKey(),
  time: text("time").notNull().unique(),
  // e.g. "17h10", "18h10"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var insertDepartureTimeSchema = createInsertSchema(departureTimes).omit({
  id: true,
  isActive: true,
  createdAt: true
});
var contracts = pgTable("contracts", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/routes.ts
import { format } from "date-fns";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/vacations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    try {
      const vacations = await storage.getVacationsByUserId(userId);
      res.json(vacations);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar per\xEDodos de f\xE9rias" });
    }
  });
  app2.post("/api/vacations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    try {
      const vacationData = insertVacationPeriodSchema.parse({
        ...req.body,
        userId
      });
      const startDate = new Date(vacationData.startDate);
      const endDate = new Date(vacationData.endDate);
      if (startDate > endDate) {
        return res.status(400).json({ error: "Data final deve ser ap\xF3s a data inicial" });
      }
      const vacation = await storage.createVacationPeriod(vacationData);
      res.status(201).json(vacation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Erro ao criar per\xEDodo de f\xE9rias" });
    }
  });
  app2.delete("/api/vacations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    const vacationId = parseInt(req.params.id);
    try {
      const vacation = await storage.getVacationById(vacationId);
      if (!vacation) {
        return res.status(404).json({ error: "Per\xEDodo de f\xE9rias n\xE3o encontrado" });
      }
      if (vacation.userId !== userId) {
        return res.status(403).json({ error: "N\xE3o autorizado" });
      }
      await storage.deleteVacation(vacationId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir per\xEDodo de f\xE9rias" });
    }
  });
  app2.get("/api/checkins", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    try {
      const checkins2 = await storage.getCheckinsByUserId(userId);
      res.json(checkins2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar check-ins" });
    }
  });
  app2.post("/api/checkins", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    try {
      const checkinData = insertCheckinSchema.parse({
        ...req.body,
        userId
      });
      const checkDate = new Date(checkinData.date);
      const formattedDate = format(checkDate, "yyyy-MM-dd");
      const vacations = await storage.getVacationsByUserId(userId);
      const isOnVacation = vacations.some((vacation) => {
        const startDate = new Date(vacation.startDate);
        const endDate = new Date(vacation.endDate);
        return checkDate >= startDate && checkDate <= endDate;
      });
      if (isOnVacation) {
        return res.status(400).json({ error: "Voc\xEA est\xE1 de f\xE9rias nesta data" });
      }
      const existingCheckin = await storage.getCheckinByDateAndDirection(userId, formattedDate, checkinData.direction);
      if (existingCheckin) {
        return res.status(400).json({ error: "Voc\xEA j\xE1 realizou check-in para esta data e sentido" });
      }
      const checkin = await storage.createCheckin(checkinData);
      res.status(201).json(checkin);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Erro ao criar check-in" });
    }
  });
  app2.get("/api/single-trips/:id", async (req, res) => {
    const tripId = parseInt(req.params.id);
    try {
      const trip = await storage.getSingleTripById(tripId);
      if (!trip) {
        return res.status(404).json({ error: "Viagem n\xE3o encontrada" });
      }
      const user = await storage.getUser(trip.userId);
      if (!user) {
        return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (trip.isUsed) {
        return res.status(400).json({ error: "Viagem j\xE1 utilizada" });
      }
      res.json({
        id: trip.id,
        date: trip.date,
        direction: trip.direction,
        returnTime: trip.returnTime,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          userType: user.userType
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar informa\xE7\xF5es da viagem" });
    }
  });
  app2.post("/api/single-trips/:id/checkin", async (req, res) => {
    const tripId = parseInt(req.params.id);
    try {
      const trip = await storage.getSingleTripById(tripId);
      if (!trip) {
        return res.status(404).json({ error: "Viagem n\xE3o encontrada" });
      }
      if (trip.isUsed) {
        return res.status(400).json({ error: "Viagem j\xE1 utilizada" });
      }
      const checkDate = new Date(req.body.date);
      const tripDate = new Date(trip.date);
      if (format(checkDate, "yyyy-MM-dd") !== format(tripDate, "yyyy-MM-dd")) {
        return res.status(400).json({ error: "Data do check-in n\xE3o corresponde \xE0 data da viagem" });
      }
      if (req.body.direction !== trip.direction) {
        return res.status(400).json({ error: "Sentido do check-in n\xE3o corresponde ao sentido da viagem" });
      }
      if (trip.direction === "retorno" && req.body.returnTime !== trip.returnTime) {
        return res.status(400).json({ error: "Hor\xE1rio de retorno n\xE3o corresponde ao hor\xE1rio da viagem" });
      }
      await storage.markSingleTripAsUsed(tripId);
      const checkin = await storage.createCheckin({
        userId: trip.userId,
        date: trip.date,
        direction: trip.direction,
        returnTime: trip.returnTime
      });
      res.status(201).json(checkin);
    } catch (error) {
      res.status(500).json({ error: "Erro ao realizar check-in" });
    }
  });
  app2.post("/api/admin/single-trips", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Apenas administradores podem criar viagens avulsas" });
    }
    try {
      const trip = await storage.createSingleTrip(req.body);
      res.status(201).json(trip);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Erro ao criar viagem avulsa" });
    }
  });
  app2.get("/api/admin/single-trips", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    try {
      const trips = await storage.getAllSingleTrips();
      const tripsWithUserDetails = await Promise.all(
        trips.map(async (trip) => {
          const user = await storage.getUser(trip.userId);
          return {
            ...trip,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              userType: user.userType,
              cpf: user.cpf
            } : null
          };
        })
      );
      res.json(tripsWithUserDetails);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar viagens avulsas" });
    }
  });
  app2.get("/api/admin/single-trips/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const tripId = parseInt(req.params.id);
    try {
      const trip = await storage.getSingleTripById(tripId);
      if (!trip) {
        return res.status(404).json({ error: "Passagem n\xE3o encontrada" });
      }
      const user = await storage.getUser(trip.userId);
      res.json({
        ...trip,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          cpf: user.cpf,
          phone: user.phone
        } : null
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar detalhes da passagem" });
    }
  });
  app2.patch("/api/admin/single-trips/:id/mark-used", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const tripId = parseInt(req.params.id);
    try {
      const trip = await storage.getSingleTripById(tripId);
      if (!trip) {
        return res.status(404).json({ error: "Passagem n\xE3o encontrada" });
      }
      if (trip.isUsed) {
        return res.status(400).json({ error: "Passagem j\xE1 foi utilizada" });
      }
      await storage.markSingleTripAsUsed(tripId);
      const updatedTrip = await storage.getSingleTripById(tripId);
      res.json(updatedTrip);
    } catch (error) {
      res.status(500).json({ error: "Erro ao marcar passagem como utilizada" });
    }
  });
  app2.delete("/api/admin/single-trips/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const tripId = parseInt(req.params.id);
    try {
      const trip = await storage.getSingleTripById(tripId);
      if (!trip) {
        return res.status(404).json({ error: "Passagem n\xE3o encontrada" });
      }
      if (trip.isUsed) {
        return res.status(400).json({ error: "N\xE3o \xE9 poss\xEDvel cancelar uma passagem j\xE1 utilizada" });
      }
      await storage.deleteSingleTrip(tripId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao cancelar passagem" });
    }
  });
  app2.post("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Apenas administradores podem criar usu\xE1rios" });
    }
    try {
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ error: "E-mail j\xE1 cadastrado" });
      }
      const randomPassword = Math.random().toString(36).slice(-8);
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword2(randomPassword)
      });
      res.status(201).json({
        ...user,
        plainPassword: randomPassword
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Erro ao criar usu\xE1rio" });
    }
  });
  app2.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usu\xE1rios" });
    }
  });
  app2.get("/api/admin/users/search", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Par\xE2metro de busca obrigat\xF3rio" });
    }
    try {
      const users2 = await storage.searchUsers(query);
      res.json(users2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usu\xE1rios" });
    }
  });
  app2.patch("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const userId = parseInt(req.params.id);
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (req.body.userType === "admin" && user.userType !== "admin") {
        return res.status(400).json({ error: "N\xE3o \xE9 poss\xEDvel promover usu\xE1rios a administradores por esta rota" });
      }
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar usu\xE1rio" });
    }
  });
  app2.patch("/api/users/:id/role", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.id);
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Voc\xEA s\xF3 pode modificar seu pr\xF3prio perfil" });
    }
    try {
      if (req.body.userType !== "admin") {
        return res.status(400).json({ error: "Tipo de usu\xE1rio inv\xE1lido" });
      }
      const updatedUser = await storage.updateUser(userId, { userType: "admin" });
      if (!updatedUser) {
        return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar tipo de usu\xE1rio" });
    }
  });
  app2.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const userId = parseInt(req.params.id);
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (user.userType === "admin") {
        return res.status(400).json({ error: "N\xE3o \xE9 poss\xEDvel desativar administradores" });
      }
      await storage.deactivateUser(userId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao desativar usu\xE1rio" });
    }
  });
  app2.get("/api/admin/locations", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    try {
      const locations2 = await storage.getAllLocations();
      res.json(locations2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar locais" });
    }
  });
  app2.post("/api/admin/locations", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Erro ao criar local" });
    }
  });
  app2.delete("/api/admin/locations/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const locationId = parseInt(req.params.id);
    try {
      await storage.deleteLocation(locationId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir local" });
    }
  });
  app2.get("/api/admin/departure-times", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    try {
      const departureTimes2 = await storage.getAllDepartureTimes();
      res.json(departureTimes2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar hor\xE1rios de partida" });
    }
  });
  app2.post("/api/admin/departure-times", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    try {
      const departureTimeData = insertDepartureTimeSchema.parse(req.body);
      const departureTime = await storage.createDepartureTime(departureTimeData);
      res.status(201).json(departureTime);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Erro ao criar hor\xE1rio de partida" });
    }
  });
  app2.patch("/api/admin/departure-times/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const departureTimeId = parseInt(req.params.id);
    try {
      const updatedDepartureTime = await storage.updateDepartureTime(
        departureTimeId,
        req.body.isActive
      );
      if (!updatedDepartureTime) {
        return res.status(404).json({ error: "Hor\xE1rio de partida n\xE3o encontrado" });
      }
      res.json(updatedDepartureTime);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar hor\xE1rio de partida" });
    }
  });
  app2.delete("/api/admin/departure-times/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const departureTimeId = parseInt(req.params.id);
    try {
      await storage.deleteDepartureTime(departureTimeId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir hor\xE1rio de partida" });
    }
  });
  app2.post("/api/admin/users/:id/reset-password", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const userId = parseInt(req.params.id);
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      const newPassword = Math.random().toString(36).slice(-8);
      await storage.updateUser(userId, {
        password: await hashPassword(newPassword)
      });
      res.json({ newPassword });
    } catch (error) {
      res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  });
  app2.get("/api/admin/users/:id/contract", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const userId = parseInt(req.params.id);
    try {
      const contract = await storage.getContractByUserId(userId);
      if (!contract) {
        return res.status(404).json({ error: "Contrato n\xE3o encontrado" });
      }
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar contrato" });
    }
  });
  app2.post("/api/admin/users/:id/contract", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const userId = parseInt(req.params.id);
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (user.userType !== "mensalista") {
        return res.status(400).json({ error: "Apenas usu\xE1rios mensalistas podem ter contrato" });
      }
      const existingContract = await storage.getContractByUserId(userId);
      if (existingContract) {
        return res.status(400).json({ error: "Usu\xE1rio j\xE1 possui contrato" });
      }
      const contractData = insertContractSchema.parse({
        ...req.body,
        userId
      });
      const contract = await storage.createContract(contractData);
      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Erro ao criar contrato" });
    }
  });
  app2.patch("/api/admin/contracts/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const contractId = parseInt(req.params.id);
    try {
      const updatedContract = await storage.updateContract(contractId, req.body);
      if (!updatedContract) {
        return res.status(404).json({ error: "Contrato n\xE3o encontrado" });
      }
      res.json(updatedContract);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar contrato" });
    }
  });
  app2.delete("/api/admin/contracts/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const contractId = parseInt(req.params.id);
    try {
      await storage.deleteContract(contractId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir contrato" });
    }
  });
  app2.get("/api/admin/checkins", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    try {
      const checkins2 = await storage.getAllCheckins();
      const checkinsWithUserDetails = await Promise.all(
        checkins2.map(async (checkin) => {
          const user = await storage.getUser(checkin.userId);
          return {
            ...checkin,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              userType: user.userType
            } : null
          };
        })
      );
      res.json(checkinsWithUserDetails);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar check-ins" });
    }
  });
  app2.delete("/api/admin/checkins/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    const checkinId = parseInt(req.params.id);
    try {
      await storage.deleteCheckin(checkinId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir check-in" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
