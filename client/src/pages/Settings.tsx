import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function Settings() {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [backgroundRunningEnabled, setBackgroundRunningEnabled] = useState(false);

  const handleNotificationsChange = async (checked: boolean) => {
    if (checked) {
      try {
        // Request notification permission
        if (Notification && Notification.permission !== "granted") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            setNotificationsEnabled(true);
            toast({
              title: "Benachrichtigungen aktiviert",
              description: "Sie werden über wichtige Ereignisse benachrichtigt.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Berechtigung verweigert",
              description: "Bitte erlauben Sie Benachrichtigungen in Ihren Browsereinstellungen.",
            });
            setNotificationsEnabled(false);
          }
        } else {
          setNotificationsEnabled(true);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Benachrichtigungen werden in dieser Umgebung nicht unterstützt.",
        });
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
      toast({
        title: "Benachrichtigungen deaktiviert",
        description: "Sie werden keine Benachrichtigungen mehr erhalten.",
      });
    }
  };

  const handleBackgroundRunningChange = (checked: boolean) => {
    setBackgroundRunningEnabled(checked);
    toast({
      title: checked ? "Hintergrundbetrieb aktiviert" : "Hintergrundbetrieb deaktiviert",
      description: checked 
        ? "Die App wird im Hintergrund laufen und Sie über anstehende Nachbestellungen informieren." 
        : "Die App wird nicht mehr im Hintergrund laufen.",
    });
  };

  return (
    <div>
      <div className="p-4 border-b bg-gray-50 flex items-center">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-lg font-medium">Einstellungen</h2>
      </div>

      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-base">Benachrichtigungen</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Erhalten Sie Erinnerungen für anstehende Nachbestellungen.
                  </p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationsChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="background" className="text-base">Hintergrundbetrieb</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    App im Hintergrund laufen lassen um Erinnerungen zu ermöglichen.
                  </p>
                </div>
                <Switch 
                  id="background" 
                  checked={backgroundRunningEnabled}
                  onCheckedChange={handleBackgroundRunningChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-gray-500">
          <h3 className="font-medium text-gray-700 mb-2">Über die App</h3>
          <p>Medikamentenverwaltung für Pflegepersonal</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}