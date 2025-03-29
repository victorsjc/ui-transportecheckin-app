import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertVacationPeriodSchema, insertCheckinSchema } from "@shared/schema";
import { format } from 'date-fns';
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Vacation periods routes
  app.get("/api/vacations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    
    try {
      const vacations = await storage.getVacationsByUserId(userId);
      res.json(vacations);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar períodos de férias" });
    }
  });

  app.post("/api/vacations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    
    try {
      const vacationData = insertVacationPeriodSchema.parse({
        ...req.body,
        userId
      });
      
      // Validate dates
      const startDate = new Date(vacationData.startDate);
      const endDate = new Date(vacationData.endDate);
      
      if (startDate > endDate) {
        return res.status(400).json({ error: "Data final deve ser após a data inicial" });
      }
      
      const vacation = await storage.createVacationPeriod(vacationData);
      res.status(201).json(vacation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Erro ao criar período de férias" });
    }
  });

  app.delete("/api/vacations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    const vacationId = parseInt(req.params.id);
    
    try {
      const vacation = await storage.getVacationById(vacationId);
      
      if (!vacation) {
        return res.status(404).json({ error: "Período de férias não encontrado" });
      }
      
      if (vacation.userId !== userId) {
        return res.status(403).json({ error: "Não autorizado" });
      }
      
      await storage.deleteVacation(vacationId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir período de férias" });
    }
  });

  // Check-in routes
  app.get("/api/checkins", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    
    try {
      const checkins = await storage.getCheckinsByUserId(userId);
      res.json(checkins);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar check-ins" });
    }
  });

  app.post("/api/checkins", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    
    try {
      const checkinData = insertCheckinSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if user has a vacation period that overlaps with check-in date
      const checkDate = new Date(checkinData.date);
      const formattedDate = format(checkDate, 'yyyy-MM-dd');
      const vacations = await storage.getVacationsByUserId(userId);
      
      const isOnVacation = vacations.some(vacation => {
        const startDate = new Date(vacation.startDate);
        const endDate = new Date(vacation.endDate);
        return checkDate >= startDate && checkDate <= endDate;
      });
      
      if (isOnVacation) {
        return res.status(400).json({ error: "Você está de férias nesta data" });
      }
      
      // Check if user already has a check-in for this date and direction
      const existingCheckin = await storage.getCheckinByDateAndDirection(userId, formattedDate, checkinData.direction);
      
      if (existingCheckin) {
        return res.status(400).json({ error: "Você já realizou check-in para esta data e sentido" });
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

  // QR Code check-in for avulso users
  app.get("/api/single-trips/:id", async (req, res) => {
    const tripId = parseInt(req.params.id);
    
    try {
      const trip = await storage.getSingleTripById(tripId);
      
      if (!trip) {
        return res.status(404).json({ error: "Viagem não encontrada" });
      }
      
      const user = await storage.getUser(trip.userId);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // If trip is already used, return error
      if (trip.isUsed) {
        return res.status(400).json({ error: "Viagem já utilizada" });
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
      res.status(500).json({ error: "Erro ao buscar informações da viagem" });
    }
  });

  app.post("/api/single-trips/:id/checkin", async (req, res) => {
    const tripId = parseInt(req.params.id);
    
    try {
      const trip = await storage.getSingleTripById(tripId);
      
      if (!trip) {
        return res.status(404).json({ error: "Viagem não encontrada" });
      }
      
      // If trip is already used, return error
      if (trip.isUsed) {
        return res.status(400).json({ error: "Viagem já utilizada" });
      }
      
      // Check if date matches
      const checkDate = new Date(req.body.date);
      const tripDate = new Date(trip.date);
      
      if (format(checkDate, 'yyyy-MM-dd') !== format(tripDate, 'yyyy-MM-dd')) {
        return res.status(400).json({ error: "Data do check-in não corresponde à data da viagem" });
      }
      
      // Check if direction matches
      if (req.body.direction !== trip.direction) {
        return res.status(400).json({ error: "Sentido do check-in não corresponde ao sentido da viagem" });
      }
      
      // If return trip, check if return time matches
      if (trip.direction === "retorno" && req.body.returnTime !== trip.returnTime) {
        return res.status(400).json({ error: "Horário de retorno não corresponde ao horário da viagem" });
      }
      
      // Mark trip as used
      await storage.markSingleTripAsUsed(tripId);
      
      // Create check-in for avulso user
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

  // Admin routes for creating avulso trips
  app.post("/api/admin/single-trips", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Check if user is admin (only admin can create trips for avulso users)
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

  // Admin routes for creating mensalista users
  app.post("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Check if user is admin
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Apenas administradores podem criar usuários" });
    }
    
    try {
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ error: "E-mail já cadastrado" });
      }
      
      // Generate a random password
      const randomPassword = Math.random().toString(36).slice(-8);
      const user = await storage.createUser({
        ...req.body,
        password: await (await import("./auth")).hashPassword(randomPassword),
      });
      
      // Return user with plain text password (so admin can share with user)
      res.status(201).json({
        ...user,
        plainPassword: randomPassword
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
