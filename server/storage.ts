import { 
  patients, 
  medications,
  users,
  type Patient, 
  type InsertPatient,
  type Medication,
  type InsertMedication,
  type UpdateMedication,
  type User,
  type InsertUser
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patient operations
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: InsertPatient): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  
  // Medication operations
  getMedicationsByPatient(patientId: number): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: UpdateMedication): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private medications: Map<number, Medication>;
  private userId: number;
  private patientId: number;
  private medicationId: number;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.medications = new Map();
    this.userId = 1;
    this.patientId = 1;
    this.medicationId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Patient operations
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.patientId++;
    const patient: Patient = { ...insertPatient, id };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, updatePatient: InsertPatient): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;

    const updatedPatient: Patient = { ...patient, ...updatePatient };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async deletePatient(id: number): Promise<boolean> {
    // First delete all medications for this patient
    const patientMedications = await this.getMedicationsByPatient(id);
    for (const medication of patientMedications) {
      await this.deleteMedication(medication.id);
    }
    
    // Then delete the patient
    return this.patients.delete(id);
  }

  // Medication operations
  async getMedicationsByPatient(patientId: number): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(
      (medication) => medication.patientId === patientId
    );
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = this.medicationId++;
    const now = new Date();
    const medication: Medication = { 
      ...insertMedication, 
      id, 
      added: now
    };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: number, updateData: UpdateMedication): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;

    const updatedMedication: Medication = { 
      ...medication, 
      current: updateData.current
    };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }
}

export const storage = new MemStorage();
