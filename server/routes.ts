import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPatientSchema, 
  insertMedicationSchema,
  updateMedicationSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Middleware to handle validation errors
  const validateRequest = (schema: any) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ message: validationError.message });
        } else {
          res.status(400).json({ message: "Invalid request body" });
        }
      }
    };
  };

  // Patient routes
  apiRouter.get("/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  apiRouter.get("/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  apiRouter.post("/patients", validateRequest(insertPatientSchema), async (req, res) => {
    try {
      const newPatient = await storage.createPatient(req.body);
      res.status(201).json(newPatient);
    } catch (error) {
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  apiRouter.put("/patients/:id", validateRequest(insertPatientSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const updatedPatient = await storage.updatePatient(id, req.body);
      if (!updatedPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(updatedPatient);
    } catch (error) {
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  apiRouter.delete("/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const deleted = await storage.deletePatient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Medication routes
  apiRouter.get("/patients/:patientId/medications", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const medications = await storage.getMedicationsByPatient(patientId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  apiRouter.get("/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid medication ID" });
      }

      const medication = await storage.getMedication(id);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }

      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });

  apiRouter.post("/medications", validateRequest(insertMedicationSchema), async (req, res) => {
    try {
      // Verify patient exists
      const patient = await storage.getPatient(req.body.patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const newMedication = await storage.createMedication(req.body);
      res.status(201).json(newMedication);
    } catch (error) {
      res.status(500).json({ message: "Failed to create medication" });
    }
  });

  apiRouter.put("/medications/:id", validateRequest(updateMedicationSchema), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid medication ID" });
      }

      const updatedMedication = await storage.updateMedication(id, req.body);
      if (!updatedMedication) {
        return res.status(404).json({ message: "Medication not found" });
      }

      res.json(updatedMedication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update medication" });
    }
  });

  apiRouter.delete("/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid medication ID" });
      }

      const deleted = await storage.deleteMedication(id);
      if (!deleted) {
        return res.status(404).json({ message: "Medication not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
