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
  let worstStatus = "good";
  let lowestDays = Infinity;
  
  if (medications && medications.length > 0) {
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
    'empty': 'Leer',
    'good': 'Ausreichend',
    'warning': 'Bald nachbestellen',
    'urgent': 'Dringend nachbestellen'
  }[worstStatus];

  return (
    <Card className="mb-4">
      <CardContent className="p-0">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-medium text-lg">{patient.name}</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            <StatusBadge status={worstStatus}>{statusText}</StatusBadge>
          )}
        </div>
        <div className="p-4">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                {medications ? `${medications.length} Medikamente` : "Keine Medikamente"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {lowestDays < Infinity 
                  ? `Nächste Nachbestellung in ${Math.floor(lowestDays)} Tagen` 
                  : 'Keine Nachbestellung nötig'}
              </p>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-gray-50 flex justify-end">
        <Link href={`/patients/${patient.id}`}>
          <Button variant="link" className="text-primary-light hover:text-primary font-medium text-sm">
            Details anzeigen
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
