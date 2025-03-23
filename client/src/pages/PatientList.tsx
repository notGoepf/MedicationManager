import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import PatientCard from "@/components/PatientCard";
import { Patient } from "@shared/schema";

export default function PatientList() {
  const { toast } = useToast();
  
  const { data: patients, isLoading, error } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });
  
  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load patients. Please try again.",
    });
  }

  return (
    <div>
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-medium">Patienten Übersicht</h2>
        <Link href="/add-patient">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Patient hinzufügen
          </Button>
        </Link>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))
        ) : patients && patients.length > 0 ? (
          patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))
        ) : (
          <div className="text-center p-8 text-gray-500">
            <p>Keine Patienten vorhanden. Fügen Sie einen neuen Patienten hinzu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
