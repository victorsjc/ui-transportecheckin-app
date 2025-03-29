import { 
  User, InsertUser, 
  VacationPeriod, InsertVacationPeriod,
  Checkin, InsertCheckin,
  SingleTrip, InsertSingleTrip
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vacation period operations
  getVacationsByUserId(userId: number): Promise<VacationPeriod[]>;
  getVacationById(id: number): Promise<VacationPeriod | undefined>;
  createVacationPeriod(vacationPeriod: InsertVacationPeriod): Promise<VacationPeriod>;
  deleteVacation(id: number): Promise<void>;
  
  // Check-in operations
  getCheckinsByUserId(userId: number): Promise<Checkin[]>;
  getCheckinByDateAndDirection(userId: number, date: string, direction: string): Promise<Checkin | undefined>;
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  
  // Single trip operations for avulso users
  getSingleTripById(id: number): Promise<SingleTrip | undefined>;
  getSingleTripsByUserId(userId: number): Promise<SingleTrip[]>;
  createSingleTrip(singleTrip: InsertSingleTrip): Promise<SingleTrip>;
  markSingleTripAsUsed(id: number): Promise<void>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vacationPeriods: Map<number, VacationPeriod>;
  private checkins: Map<number, Checkin>;
  private singleTrips: Map<number, SingleTrip>;
  
  userCurrentId: number;
  vacationCurrentId: number;
  checkinCurrentId: number;
  singleTripCurrentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.vacationPeriods = new Map();
    this.checkins = new Map();
    this.singleTrips = new Map();
    
    this.userCurrentId = 1;
    this.vacationCurrentId = 1;
    this.checkinCurrentId = 1;
    this.singleTripCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });

    // Add admin user for testing
    this.users.set(this.userCurrentId, {
      id: this.userCurrentId++,
      email: "admin@example.com",
      password: "bb7fc56073e04cb33c2a7ae0f7529c9a74d5cd833b9ba79fc47f30e9b8cd4fb39b6abdd326ac07f38c188f40b96cea0f2ef6c76ea24cb6fced3f0362ba25ec0c.d1cbe0c98df5bc4c",
      name: "Administrador",
      userType: "admin",
      cpf: "12345678900",
      phone: "11987654321",
      createdAt: new Date()
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Vacation period operations
  async getVacationsByUserId(userId: number): Promise<VacationPeriod[]> {
    return Array.from(this.vacationPeriods.values()).filter(
      (period) => period.userId === userId,
    );
  }

  async getVacationById(id: number): Promise<VacationPeriod | undefined> {
    return this.vacationPeriods.get(id);
  }

  async createVacationPeriod(insertVacationPeriod: InsertVacationPeriod): Promise<VacationPeriod> {
    const id = this.vacationCurrentId++;
    const vacationPeriod: VacationPeriod = {
      ...insertVacationPeriod,
      id,
      createdAt: new Date()
    };
    this.vacationPeriods.set(id, vacationPeriod);
    return vacationPeriod;
  }

  async deleteVacation(id: number): Promise<void> {
    this.vacationPeriods.delete(id);
  }

  // Check-in operations
  async getCheckinsByUserId(userId: number): Promise<Checkin[]> {
    return Array.from(this.checkins.values()).filter(
      (checkin) => checkin.userId === userId,
    );
  }

  async getCheckinByDateAndDirection(userId: number, date: string, direction: string): Promise<Checkin | undefined> {
    return Array.from(this.checkins.values()).find(
      (checkin) => 
        checkin.userId === userId && 
        new Date(checkin.date).toISOString().split('T')[0] === date && 
        checkin.direction === direction
    );
  }

  async createCheckin(insertCheckin: InsertCheckin): Promise<Checkin> {
    const id = this.checkinCurrentId++;
    const checkin: Checkin = {
      ...insertCheckin,
      id,
      createdAt: new Date()
    };
    this.checkins.set(id, checkin);
    return checkin;
  }

  // Single trip operations
  async getSingleTripById(id: number): Promise<SingleTrip | undefined> {
    return this.singleTrips.get(id);
  }

  async getSingleTripsByUserId(userId: number): Promise<SingleTrip[]> {
    return Array.from(this.singleTrips.values()).filter(
      (trip) => trip.userId === userId,
    );
  }

  async createSingleTrip(insertSingleTrip: InsertSingleTrip): Promise<SingleTrip> {
    const id = this.singleTripCurrentId++;
    const singleTrip: SingleTrip = {
      ...insertSingleTrip,
      id,
      isUsed: false,
      createdAt: new Date()
    };
    this.singleTrips.set(id, singleTrip);
    return singleTrip;
  }

  async markSingleTripAsUsed(id: number): Promise<void> {
    const trip = this.singleTrips.get(id);
    if (trip) {
      trip.isUsed = true;
      this.singleTrips.set(id, trip);
    }
  }
}

export const storage = new MemStorage();
