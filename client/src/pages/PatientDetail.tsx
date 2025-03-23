import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link, useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import MedicationItem from "@/components/MedicationItem";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Patient, Medication } from "@shared/schema";
import { useState } from "react";

export default function PatientDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/patients/:id");
  const patientId = match ? parseInt(params.id) : -1;
  const { toast } = useToast();
  const [medicationToDelete, setMedicationToDelete] = useState<number | null>(null);
  const [isDeleteMedicationDialogOpen, setIsDeleteMedicationDialogOpen] = useState(false);
  const [isDeletePatientDialogOpen, setIsDeletePatientDialogOpen] = useState(false);

  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: patientId > 0,
  });

  const { data: medications, isLoading: medicationsLoading } = useQuery<Medication[]>({
    queryKey: [`/api/patients/${patientId}/medications`],
    enabled: patientId > 0,
  });

  const deleteMutationMedication = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/medications/${id}`);
    },
    onSuccess: () => {
      setIsDeleteMedicationDialogOpen(false);
      setMedicationToDelete(null);
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/medications`] });
      toast({
        title: "Erfolgreich",
        description: "Medikament wurde erfolgreich gelöscht",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Medikament konnte nicht gelöscht werden",
      });
    }
  });
  
  const deleteMutationPatient = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/patients/${id}`);
    },
    onSuccess: () => {
      setIsDeletePatientDialogOpen(false);
      toast({
        title: "Erfolgreich",
        description: "Patient wurde erfolgreich gelöscht",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Patient konnte nicht gelöscht werden",
      });
    }
  });

  const handleDeleteMedication = (id: number) => {
    setMedicationToDelete(id);
    setIsDeleteMedicationDialogOpen(true);
  };

  const confirmDeleteMedication = () => {
    if (medicationToDelete !== null) {
      deleteMutationMedication.mutate(medicationToDelete);
    }
  };
  
  const handleDeletePatient = () => {
    setIsDeletePatientDialogOpen(true);
  };
  
  const confirmDeletePatient = () => {
    deleteMutationPatient.mutate(patientId);
  };

  if (!match) {
    setLocation('/');
    return null;
  }

  const isLoading = patientLoading || medicationsLoading;

  return (
    <div>
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          {isLoading ? (
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-medium">{patient?.name}</h2>
            </div>
          )}
        </div>
        {!isLoading && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDeletePatient}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Patient löschen
          </Button>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Medikamente</h3>
          <Link href={`/patients/${patientId}/add-medication`}>
            <Button variant="link" className="text-primary">
              <Plus className="h-4 w-4 mr-1" />
              Neues Medikament
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          // Loading skeleton for medications
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden border p-4">
              <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))
        ) : medications && medications.length > 0 ? (
          medications.map((medication) => (
            <MedicationItem 
              key={medication.id} 
              medication={medication} 
              onDelete={() => handleDeleteMedication(medication.id)}
            />
          ))
        ) : (
          <div className="text-center p-8 text-gray-500">
            <p>Keine Medikamente vorhanden. Fügen Sie ein neues Medikament hinzu.</p>
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteMedicationDialogOpen}
        onClose={() => setIsDeleteMedicationDialogOpen(false)}
        onConfirm={confirmDeleteMedication}
        title="Medikament löschen"
        description="Möchten Sie dieses Medikament wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        isPending={deleteMutationMedication.isPending}
      />
      
      <DeleteConfirmationDialog
        isOpen={isDeletePatientDialogOpen}
        onClose={() => setIsDeletePatientDialogOpen(false)}
        onConfirm={confirmDeletePatient}
        title="Patient löschen"
        description="Möchten Sie diesen Patienten wirklich löschen? Alle zugehörigen Medikamente werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
        isPending={deleteMutationPatient.isPending}
      />
    </div>
  );
}
