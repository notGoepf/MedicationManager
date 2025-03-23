import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Patient } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Medication } from "@shared/schema";
import { calculateMedicationStatus } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientCardProps {
  patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const { data: medications, isLoading } = useQuery<Medication[]>({
    queryKey: [`/api/patients/${patient.id}/medications`],
  });

  // Calculate the most urgent medication status
  let worstStatus = "neutral";
  let lowestDays = Infinity;
  
  if (medications && medications.length > 0) {
    worstStatus = "good"; // Initialize with "good" only if there are medications
    
    medications.forEach(med => {
      const { daysLeft, status } = calculateMedicationStatus(med.current, med.frequency);
      if (status === "urgent" && worstStatus !== "urgent") {
        worstStatus = "urgent";
        lowestDays = daysLeft;
      } else if (status === "warning" && worstStatus === "good") {
        worstStatus = "warning";
        lowestDays = daysLeft;
      } else if (daysLeft < lowestDays) {
        lowestDays = daysLeft;
      }
    });
  }
  
  // Text to show based on status
  const statusText = {
    'neutral': 'Keine Medikamente',
    'empty': 'Leer',
    'good': 'Ausreichend',
    'warning': 'Bald nachbestellen',
    'urgent': 'Dringend nachbestellen'
  }[worstStatus];

  return (
    <Card className="mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="p-5 border-b flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{patient.name}</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            <StatusBadge status={worstStatus}>{statusText}</StatusBadge>
          )}
        </div>
        <div className="p-5 bg-gradient-to-b from-white to-gray-50/30">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </>
          ) : (
            <>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-primary/70 mr-2"></div>
                <p className="text-sm text-gray-700 font-medium">
                  {medications ? `${medications.length} Medikamente` : "Keine Medikamente"}
                </p>
              </div>
              <div className="flex items-center mt-2">
                <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                <p className="text-sm text-gray-700">
                  {lowestDays < Infinity 
                    ? `Nächste Nachbestellung in ${Math.floor(lowestDays)} Tagen` 
                    : 'Keine Nachbestellung nötig'}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-5 py-3 bg-white flex justify-end border-t border-gray-100">
        <Link href={`/patients/${patient.id}`}>
          <Button variant="ghost" className="text-primary hover:text-primary/90 hover:bg-primary/5 font-medium text-sm transition-colors">
            Details anzeigen
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
