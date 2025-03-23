import { Link, useRoute } from "wouter";
import { Users, Bell, Settings } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isHome] = useRoute("/");
  const [isPatientList] = useRoute("/patients/:id");
  const [isAddPatient] = useRoute("/add-patient");

  return (
    <div className="max-w-xl mx-auto bg-white min-h-screen shadow-md">
      <header className="bg-primary text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">MediTrack</h1>
          <span className="text-sm">Medikamentenverwaltung</span>
        </div>
      </header>

      <main className="pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg max-w-xl mx-auto">
        <div className="flex justify-around items-center h-16">
          <Link href="/">
            <button className={`flex flex-col items-center justify-center w-full py-2 ${isHome || isPatientList || isAddPatient ? 'text-primary' : 'text-gray-500'}`}>
              <Users className="h-6 w-6" />
              <span className="text-xs mt-1">Patienten</span>
            </button>
          </Link>
          <button className="flex flex-col items-center justify-center w-full py-2 text-gray-500">
            <Bell className="h-6 w-6" />
            <span className="text-xs mt-1">Erinnerungen</span>
          </button>
          <button className="flex flex-col items-center justify-center w-full py-2 text-gray-500">
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Einstellungen</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
