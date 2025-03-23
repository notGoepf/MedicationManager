import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import PatientList from "@/pages/PatientList";
import PatientDetail from "@/pages/PatientDetail";
import AddPatient from "@/pages/AddPatient";
import AddMedication from "@/pages/AddMedication";
import RefillMedication from "@/pages/RefillMedication";
import Settings from "@/pages/Settings";
import Layout from "@/components/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={PatientList} />
        <Route path="/patients/:id" component={PatientDetail} />
        <Route path="/add-patient" component={AddPatient} />
        <Route path="/patients/:id/add-medication" component={AddMedication} />
        <Route path="/medications/:id/refill" component={RefillMedication} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
