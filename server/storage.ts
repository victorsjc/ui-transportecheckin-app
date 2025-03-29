import { 
  User, InsertUser, 
  VacationPeriod, InsertVacationPeriod,
  Checkin, InsertCheckin,
  SingleTrip, InsertSingleTrip,
  Location, InsertLocation,
  DepartureTime, InsertDepartureTime,
  Contract, InsertContract
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
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deactivateUser(id: number): Promise<void>;
  getUsersByName(name: string): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>;
  
  // Vacation period operations
  getVacationsByUserId(userId: number): Promise<VacationPeriod[]>;
  getVacationById(id: number): Promise<VacationPeriod | undefined>;
  createVacationPeriod(vacationPeriod: InsertVacationPeriod): Promise<VacationPeriod>;
  deleteVacation(id: number): Promise<void>;
  
  // Check-in operations
  getCheckinsByUserId(userId: number): Promise<Checkin[]>;
  getAllCheckins(): Promise<Checkin[]>;
  getCheckinByDateAndDirection(userId: number, date: string, direction: string): Promise<Checkin | undefined>;
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  deleteCheckin(id: number): Promise<void>;
  
  // Single trip operations for avulso users
  getSingleTripById(id: number): Promise<SingleTrip | undefined>;
  getSingleTripsByUserId(userId: number): Promise<SingleTrip[]>;
  getAllSingleTrips(): Promise<SingleTrip[]>;
  createSingleTrip(singleTrip: InsertSingleTrip): Promise<SingleTrip>;
  markSingleTripAsUsed(id: number): Promise<void>;
  deleteSingleTrip(id: number): Promise<void>;
  
  // Locations operations
  getAllLocations(): Promise<Location[]>;
  getLocationsByType(type: string): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  deleteLocation(id: number): Promise<void>;
  
  // Departure times operations
  getAllDepartureTimes(): Promise<DepartureTime[]>;
  getActiveDepartureTimes(): Promise<DepartureTime[]>;
  createDepartureTime(departureTime: InsertDepartureTime): Promise<DepartureTime>;
  updateDepartureTime(id: number, isActive: boolean): Promise<DepartureTime | undefined>;
  deleteDepartureTime(id: number): Promise<void>;
  
  // Contracts operations
  getContractByUserId(userId: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contractData: Partial<Contract>): Promise<Contract | undefined>;
  deleteContract(id: number): Promise<void>;
  
  // Session store
  sessionStore: any; // Using any for session store to avoid type issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vacationPeriods: Map<number, VacationPeriod>;
  private checkins: Map<number, Checkin>;
  private singleTrips: Map<number, SingleTrip>;
  private locations: Map<number, Location>;
  private departureTimes: Map<number, DepartureTime>;
  private contracts: Map<number, Contract>;
  
  userCurrentId: number;
  vacationCurrentId: number;
  checkinCurrentId: number;
  singleTripCurrentId: number;
  locationCurrentId: number;
  departureTimeCurrentId: number;
  contractCurrentId: number;
  sessionStore: any; // Using any for session store to avoid type issues

  constructor() {
    this.users = new Map();
    this.vacationPeriods = new Map();
    this.checkins = new Map();
    this.singleTrips = new Map();
    this.locations = new Map();
    this.departureTimes = new Map();
    this.contracts = new Map();
    
    this.userCurrentId = 1;
    this.vacationCurrentId = 1;
    this.checkinCurrentId = 1;
    this.singleTripCurrentId = 1;
    this.locationCurrentId = 1;
    this.departureTimeCurrentId = 1;
    this.contractCurrentId = 1;
    
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
      isActive: true,
      createdAt: new Date()
    });
    
    // Add default departure times
    this.departureTimes.set(this.departureTimeCurrentId, {
      id: this.departureTimeCurrentId++,
      time: "17h10",
      isActive: true,
      createdAt: new Date()
    });
    
    this.departureTimes.set(this.departureTimeCurrentId, {
      id: this.departureTimeCurrentId++,
      time: "18h10",
      isActive: true,
      createdAt: new Date()
    });
    
    // Add default departure locations
    const departureLocations = [
      "Ipiranga/Veibrás", 
      "Center Vale", 
      "Vale Sul", 
      "Gruta", 
      "Lourinho/Jacareí"
    ];
    
    departureLocations.forEach(name => {
      this.locations.set(this.locationCurrentId, {
        id: this.locationCurrentId++,
        name,
        type: "departure",
        createdAt: new Date()
      });
    });
    
    // Add default arrival locations
    const arrivalLocations = [
      "Atacadão/Jacareí", 
      "Posto 7 Estrelas", 
      "Carrefour", 
      "Vale Sul", 
      "Center Vale", 
      "Ipiranga/Veibrás"
    ];
    
    arrivalLocations.forEach(name => {
      this.locations.set(this.locationCurrentId, {
        id: this.locationCurrentId++,
        name,
        type: "arrival",
        createdAt: new Date()
      });
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

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deactivateUser(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isActive = false;
      this.users.set(id, user);
    }
  }
  
  async getUsersByName(name: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  
  async searchUsers(query: string): Promise<User[]> {
    query = query.toLowerCase();
    return Array.from(this.users.values()).filter(
      (user) => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      isActive: true,
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
  
  async getAllCheckins(): Promise<Checkin[]> {
    return Array.from(this.checkins.values());
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
  
  async deleteCheckin(id: number): Promise<void> {
    this.checkins.delete(id);
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
  
  async getAllSingleTrips(): Promise<SingleTrip[]> {
    return Array.from(this.singleTrips.values());
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
  
  async deleteSingleTrip(id: number): Promise<void> {
    this.singleTrips.delete(id);
  }
  
  // Locations operations
  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }
  
  async getLocationsByType(type: string): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.type === type
    );
  }
  
  async createLocation(location: InsertLocation): Promise<Location> {
    const id = this.locationCurrentId++;
    const newLocation: Location = {
      ...location,
      id,
      createdAt: new Date()
    };
    this.locations.set(id, newLocation);
    return newLocation;
  }
  
  async deleteLocation(id: number): Promise<void> {
    this.locations.delete(id);
  }
  
  // Departure times operations
  async getAllDepartureTimes(): Promise<DepartureTime[]> {
    return Array.from(this.departureTimes.values());
  }
  
  async getActiveDepartureTimes(): Promise<DepartureTime[]> {
    return Array.from(this.departureTimes.values()).filter(
      (time) => time.isActive
    );
  }
  
  async createDepartureTime(departureTime: InsertDepartureTime): Promise<DepartureTime> {
    const id = this.departureTimeCurrentId++;
    const newDepartureTime: DepartureTime = {
      ...departureTime,
      id,
      isActive: true,
      createdAt: new Date()
    };
    this.departureTimes.set(id, newDepartureTime);
    return newDepartureTime;
  }
  
  async updateDepartureTime(id: number, isActive: boolean): Promise<DepartureTime | undefined> {
    const departureTime = this.departureTimes.get(id);
    if (!departureTime) return undefined;
    
    departureTime.isActive = isActive;
    this.departureTimes.set(id, departureTime);
    return departureTime;
  }
  
  async deleteDepartureTime(id: number): Promise<void> {
    this.departureTimes.delete(id);
  }
  
  // Contracts operations
  async getContractByUserId(userId: number): Promise<Contract | undefined> {
    return Array.from(this.contracts.values()).find(
      (contract) => contract.userId === userId
    );
  }
  
  async createContract(contract: InsertContract): Promise<Contract> {
    const id = this.contractCurrentId++;
    const newContract: Contract = {
      ...contract,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contracts.set(id, newContract);
    return newContract;
  }
  
  async updateContract(id: number, contractData: Partial<Contract>): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;
    
    const updatedContract = { 
      ...contract, 
      ...contractData,
      updatedAt: new Date()
    };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }
  
  async deleteContract(id: number): Promise<void> {
    this.contracts.delete(id);
  }
}

export const storage = new MemStorage();
