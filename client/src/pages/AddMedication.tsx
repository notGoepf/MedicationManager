import { Link, useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMedicationSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient } from "@shared/schema";

// Extend schema with additional validation
const validationSchema = insertMedicationSchema.extend({
  name: z.string().min(2, {
    message: "Name muss mindestens 2 Zeichen lang sein.",
  }),
  current: z.number().positive({
    message: "Anzahl muss positiv sein.",
  }),
  frequency: z.number().min(0, {
    message: "Frequenz muss größer oder gleich 0 sein.",
  }),
});

type FormData = z.infer<typeof validationSchema>;

export default function AddMedication() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/patients/:id/add-medication");
  const patientId = match ? parseInt(params.id) : -1;
  const { toast } = useToast();

  const { data: patient, isLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: patientId > 0,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      patientId,
      name: "",
      current: 0,
      frequency: 1,
    },
  });

  const createMedication = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/medications", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/medications`] });
      toast({
        title: "Medikament hinzugefügt",
        description: "Das Medikament wurde erfolgreich hinzugefügt.",
      });
      setLocation(`/patients/${patientId}`);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Das Medikament konnte nicht hinzugefügt werden. Bitte versuchen Sie es erneut.",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMedication.mutate(data);
  };

  if (!match) {
    setLocation('/');
    return null;
  }

  const frequencyOptions = [
    { value: 0.5, label: "0,5 Tabletten" },
    { value: 1, label: "1 Tablette" },
    { value: 1.5, label: "1,5 Tabletten" },
    { value: 2, label: "2 Tabletten" },
    { value: 2.5, label: "2,5 Tabletten" },
    { value: 3, label: "3 Tabletten" },
    { value: 3.5, label: "3,5 Tabletten" },
    { value: 4, label: "4 Tabletten" },
    { value: 4.5, label: "4,5 Tabletten" },
    { value: 5, label: "5 Tabletten" },
  ];

  return (
    <div>
      <div className="p-4 border-b bg-gray-50 flex items-center">
        <Link href={`/patients/${patientId}`}>
          <Button variant="ghost" size="icon" className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-medium">Neues Medikament hinzufügen</h2>
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <p className="text-sm text-gray-500">Patient: {patient?.name}</p>
          )}
        </div>
      </div>

      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name des Medikaments</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Aspirin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anzahl der Tabletten</FormLabel>
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

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Einnahmehäufigkeit pro Tag</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseFloat(value))} 
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createMedication.isPending}
            >
              Medikament hinzufügen
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
