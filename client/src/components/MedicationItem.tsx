import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Medication } from "@shared/schema";
import { calculateMedicationStatus, getReorderDate } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

interface MedicationItemProps {
  medication: Medication;
  onDelete: () => void;
}

export default function MedicationItem({ medication, onDelete }: MedicationItemProps) {
  const { daysLeft, status } = calculateMedicationStatus(medication.current, medication.frequency);
  const reorderDate = getReorderDate(daysLeft);

  return (
    <Card className="mb-4 shadow-sm">
      <CardContent className="p-0">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-medium">{medication.name}</h3>
            <p className="text-sm text-gray-500">
              {medication.frequency} Tabletten pro Tag
            </p>
          </div>
          <StatusBadge status={status}>
            {status === 'empty' ? 'Leer' : `${Math.floor(daysLeft)} Tage übrig`}
          </StatusBadge>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Aktueller Bestand</p>
            <p className="font-medium">{medication.current} Tabletten</p>
          </div>
          <div>
            <p className="text-gray-500">Nachbestellung am</p>
            <p className="font-medium">{reorderDate}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
        <Button 
          variant="link" 
          className="text-destructive hover:text-destructive/80 text-sm p-0 h-auto" 
          onClick={onDelete}
        >
          Löschen
        </Button>
        <Link href={`/medications/${medication.id}/refill`}>
          <Button 
            variant="link" 
            className="text-primary hover:text-primary/80 text-sm p-0 h-auto" 
          >
            Nachfüllen
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
