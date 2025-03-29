import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { 
  insertVacationPeriodSchema, 
  insertCheckinSchema,
  insertContractSchema,
  insertLocationSchema,
  insertDepartureTimeSchema
} from "@shared/schema";
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

  // Admin routes for managing single trips
  app.get("/api/admin/single-trips", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    try {
      const trips = await storage.getAllSingleTrips();
      
      // Add user information to each trip
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
  
  app.get("/api/admin/single-trips/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const tripId = parseInt(req.params.id);
    
    try {
      const trip = await storage.getSingleTripById(tripId);
      
      if (!trip) {
        return res.status(404).json({ error: "Passagem não encontrada" });
      }
      
      // Add user information
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
  
  app.patch("/api/admin/single-trips/:id/mark-used", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const tripId = parseInt(req.params.id);
    
    try {
      const trip = await storage.getSingleTripById(tripId);
      
      if (!trip) {
        return res.status(404).json({ error: "Passagem não encontrada" });
      }
      
      if (trip.isUsed) {
        return res.status(400).json({ error: "Passagem já foi utilizada" });
      }
      
      await storage.markSingleTripAsUsed(tripId);
      
      // Get updated trip
      const updatedTrip = await storage.getSingleTripById(tripId);
      res.json(updatedTrip);
    } catch (error) {
      res.status(500).json({ error: "Erro ao marcar passagem como utilizada" });
    }
  });
  
  app.delete("/api/admin/single-trips/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const tripId = parseInt(req.params.id);
    
    try {
      const trip = await storage.getSingleTripById(tripId);
      
      if (!trip) {
        return res.status(404).json({ error: "Passagem não encontrada" });
      }
      
      if (trip.isUsed) {
        return res.status(400).json({ error: "Não é possível cancelar uma passagem já utilizada" });
      }
      
      await storage.deleteSingleTrip(tripId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao cancelar passagem" });
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
      const { hashPassword } = await import("./auth");
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(randomPassword),
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
  
  // Admin - User Management Routes
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });
  
  app.get("/api/admin/users/search", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: "Parâmetro de busca obrigatório" });
    }
    
    try {
      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });
  
  app.patch("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const userId = parseInt(req.params.id);
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Don't allow updating admin status through this route
      if (req.body.userType === "admin" && user.userType !== "admin") {
        return res.status(400).json({ error: "Não é possível promover usuários a administradores por esta rota" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  });
  
  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const userId = parseInt(req.params.id);
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Don't allow deactivating admin users
      if (user.userType === "admin") {
        return res.status(400).json({ error: "Não é possível desativar administradores" });
      }
      
      await storage.deactivateUser(userId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao desativar usuário" });
    }
  });
  
  // Admin - Location Management Routes
  app.get("/api/admin/locations", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar locais" });
    }
  });
  
  app.post("/api/admin/locations", async (req, res) => {
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
  
  app.delete("/api/admin/locations/:id", async (req, res) => {
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
  
  // Admin - Departure Time Management Routes
  app.get("/api/admin/departure-times", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    try {
      const departureTimes = await storage.getAllDepartureTimes();
      res.json(departureTimes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar horários de partida" });
    }
  });
  
  app.post("/api/admin/departure-times", async (req, res) => {
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
      res.status(500).json({ error: "Erro ao criar horário de partida" });
    }
  });
  
  app.patch("/api/admin/departure-times/:id", async (req, res) => {
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
        return res.status(404).json({ error: "Horário de partida não encontrado" });
      }
      
      res.json(updatedDepartureTime);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar horário de partida" });
    }
  });
  
  app.delete("/api/admin/departure-times/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const departureTimeId = parseInt(req.params.id);
    
    try {
      await storage.deleteDepartureTime(departureTimeId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir horário de partida" });
    }
  });
  
  // Admin - Password Reset Routes
  app.post("/api/admin/users/:id/reset-password", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const userId = parseInt(req.params.id);
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Generate a random password
      const newPassword = Math.random().toString(36).slice(-8);
      
      // Update user with new password
      await storage.updateUser(userId, {
        password: await hashPassword(newPassword)
      });
      
      res.json({ newPassword });
    } catch (error) {
      res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  });
  
  // Admin - User Contracts Management Routes
  app.get("/api/admin/users/:id/contract", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const userId = parseInt(req.params.id);
    
    try {
      const contract = await storage.getContractByUserId(userId);
      
      if (!contract) {
        return res.status(404).json({ error: "Contrato não encontrado" });
      }
      
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar contrato" });
    }
  });
  
  app.post("/api/admin/users/:id/contract", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const userId = parseInt(req.params.id);
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Check if user is mensalista
      if (user.userType !== "mensalista") {
        return res.status(400).json({ error: "Apenas usuários mensalistas podem ter contrato" });
      }
      
      // Check if user already has a contract
      const existingContract = await storage.getContractByUserId(userId);
      
      if (existingContract) {
        return res.status(400).json({ error: "Usuário já possui contrato" });
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
  
  app.patch("/api/admin/contracts/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    const contractId = parseInt(req.params.id);
    
    try {
      const updatedContract = await storage.updateContract(contractId, req.body);
      
      if (!updatedContract) {
        return res.status(404).json({ error: "Contrato não encontrado" });
      }
      
      res.json(updatedContract);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar contrato" });
    }
  });
  
  app.delete("/api/admin/contracts/:id", async (req, res) => {
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
  
  // Admin - Check-ins Management Routes
  app.get("/api/admin/checkins", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.sendStatus(403);
    }
    
    try {
      const checkins = await storage.getAllCheckins();
      
      // Fetch user details for each check-in
      const checkinsWithUserDetails = await Promise.all(
        checkins.map(async (checkin) => {
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
  
  app.delete("/api/admin/checkins/:id", async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
