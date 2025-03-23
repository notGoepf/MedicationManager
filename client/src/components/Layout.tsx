import { Link, useRoute } from "wouter";
import { Users } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isHome] = useRoute("/");
  const [isPatientList] = useRoute("/patients/:id");
  const [isAddPatient] = useRoute("/add-patient");

  return (
    <div className="max-w-xl mx-auto bg-white min-h-screen shadow-md">
      <header className="bg-primary bg-gradient-to-r from-primary to-primary/80 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">MediTrack</h1>
          <span className="text-sm">Medikamentenverwaltung</span>
        </div>
      </header>

      <main className="pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg max-w-xl mx-auto backdrop-blur-md bg-white/90">
        <div className="flex justify-around items-center h-16">
          <Link href="/">
            <button className={`flex flex-col items-center justify-center py-2 px-4 ${isHome || isPatientList || isAddPatient ? 'text-primary' : 'text-gray-500'} transition-colors duration-200`}>
              <Users className="h-6 w-6" />
            </button>
          </Link>
          <Link href="/settings">
            <button className="flex flex-col items-center justify-center py-2 px-4 text-gray-500 transition-colors duration-200">
              <Settings className="h-6 w-6" />
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
