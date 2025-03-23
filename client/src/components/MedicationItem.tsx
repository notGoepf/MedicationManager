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
    <Card className="mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <CardContent className="p-0">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">{medication.name}</h3>
            <p className="text-sm text-gray-500">
              {medication.frequency} Tabletten pro Tag
            </p>
          </div>
          <StatusBadge status={status}>
            {status === 'empty' ? 'Leer' : `${Math.floor(daysLeft)} Tage übrig`}
          </StatusBadge>
        </div>
        <div className="p-5 grid grid-cols-2 gap-6 text-sm bg-gray-50/30">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-gray-500 mb-1">Aktueller Bestand</p>
            <p className="font-semibold text-gray-800 text-lg">{medication.current} Tabletten</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-gray-500 mb-1">Nachbestellung am</p>
            <p className="font-semibold text-gray-800 text-lg">{reorderDate}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-5 py-3 flex justify-between border-t border-gray-100">
        <Button 
          variant="ghost" 
          className="text-red-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium transition-colors" 
          onClick={onDelete}
        >
          Löschen
        </Button>
        <Link href={`/medications/${medication.id}/refill`}>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80 hover:bg-primary/5 text-sm font-medium transition-colors" 
          >
            Nachfüllen
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
