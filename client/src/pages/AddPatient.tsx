import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPatientSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Extend schema with additional validation rules
const validationSchema = insertPatientSchema.extend({
  name: z.string().min(2, {
    message: "Name muss mindestens 2 Zeichen lang sein.",
  }),
  room: z.string().min(1, {
    message: "Zimmernummer ist erforderlich.",
  }),
});

type FormData = z.infer<typeof validationSchema>;

export default function AddPatient() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: "",
      room: "",
    },
  });

  const createPatient = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/patients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      toast({
        title: "Patient hinzugefügt",
        description: "Der Patient wurde erfolgreich hinzugefügt.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Patient konnte nicht hinzugefügt werden. Bitte versuchen Sie es erneut.",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createPatient.mutate(data);
  };

  return (
    <div>
      <div className="p-4 border-b bg-gray-50 flex items-center">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-lg font-medium">Neuen Patienten hinzufügen</h2>
      </div>

      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name des Patienten</FormLabel>
                  <FormControl>
                    <Input placeholder="Name eingeben" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zimmernummer</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createPatient.isPending}
            >
              Patient hinzufügen
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
