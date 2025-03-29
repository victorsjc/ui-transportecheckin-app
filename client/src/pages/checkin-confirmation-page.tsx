import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function CheckinConfirmationPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // We would normally get the checkin details from location state or from an API
  // For this example, we'll use static data
  const checkinDetails = {
    date: new Date().toLocaleDateString('pt-BR'),
    direction: "Ida",
    time: "Manhã",
    passenger: user?.name || "Passageiro"
  };
  
  const handleReturn = () => {
    if (user) {
      // If user is authenticated, return to dashboard
      navigate("/");
    } else {
      // If guest (avulso), return to login page
      navigate("/auth");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white p-4 text-center shadow">
        <h1 className="text-2xl font-bold">Check-in Confirmado</h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm text-center">
          <div className="rounded-full bg-green-500 w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check-in Realizado com Sucesso!</h2>
          <p className="text-gray-600 mb-6">Sua viagem foi confirmada com sucesso.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
            <h3 className="font-medium mb-2">Detalhes da Viagem</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">{checkinDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sentido:</span>
                <span className="font-medium">{checkinDetails.direction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium">{checkinDetails.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Passageiro:</span>
                <span className="font-medium">{checkinDetails.passenger}</span>
              </div>
            </div>
          </div>
          
          <Button onClick={handleReturn} className="w-full">
            {user ? "Voltar ao Início" : "Finalizar"}
          </Button>
        </div>
      </main>
    </div>
  );
}
