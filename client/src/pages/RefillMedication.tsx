import { Link, useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Medication, Patient } from "@shared/schema";

const refillSchema = z.object({
  refillCount: z.number().positive({
    message: "Anzahl muss positiv sein.",
  }),
});

type FormData = z.infer<typeof refillSchema>;

export default function RefillMedication() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/medications/:id/refill");
  const medicationId = match ? parseInt(params.id) : -1;
  const { toast } = useToast();

  const { data: medication, isLoading: medLoading } = useQuery<Medication>({
    queryKey: [`/api/medications/${medicationId}`],
    enabled: medicationId > 0,
  });

  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${medication?.patientId}`],
    enabled: !!medication?.patientId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(refillSchema),
    defaultValues: {
      refillCount: 0,
    },
  });

  const refillMedication = useMutation({
    mutationFn: async (data: FormData) => {
      if (!medication) return;
      
      const updatedMedication = {
        id: medicationId,
        current: medication.current + data.refillCount,
      };
      
      const response = await apiRequest("PUT", `/api/medications/${medicationId}`, updatedMedication);
      return response.json();
    },
    onSuccess: () => {
      if (!medication?.patientId) return;
      
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${medication.patientId}/medications`] });
      queryClient.invalidateQueries({ queryKey: [`/api/medications/${medicationId}`] });
      
      toast({
        title: "Medikament aufgefüllt",
        description: "Der Medikamentenbestand wurde erfolgreich aktualisiert.",
      });
      
      setLocation(`/patients/${medication.patientId}`);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Medikamentenbestand konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    refillMedication.mutate(data);
  };

  if (!match) {
    setLocation('/');
    return null;
  }

  const isLoading = medLoading || patientLoading;

  return (
    <div>
      <div className="p-4 border-b bg-gray-50 flex items-center">
        <Link href={medication ? `/patients/${medication.patientId}` : "/"}>
          <Button variant="ghost" size="icon" className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-medium">Medikament nachfüllen</h2>
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <p className="text-sm text-gray-500">Patient: {patient?.name}</p>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-6">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-48 mb-2" />
              <div className="bg-gray-50 p-3 rounded-md">
                <Skeleton className="h-4 w-full" />
              </div>
            </>
          ) : (
            <>
              <h3 className="font-medium mb-2">{medication?.name}</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  Aktueller Bestand: <span className="font-medium">{medication?.current}</span> Tabletten
                </p>
              </div>
            </>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="refillCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anzahl der hinzugefügten Tabletten</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="z.B. 30" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={refillMedication.isPending}
            >
              Bestand aktualisieren
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
