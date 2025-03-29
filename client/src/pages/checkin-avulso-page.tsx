import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Type for single trip data from API
interface SingleTripData {
  id: number;
  date: string;
  direction: "ida" | "retorno";
  returnTime: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    cpf: string;
    userType: string;
  };
}

export default function CheckinAvulsoPage() {
  const params = useParams<{ tripId: string }>();
  const tripId = parseInt(params.tripId);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get trip data
  const { data: tripData, isLoading, error } = useQuery<SingleTripData>({
    queryKey: [`/api/single-trips/${tripId}`],
    enabled: !isNaN(tripId),
  });
  
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [date, setDate] = useState("");
  const [direction, setDirection] = useState<"ida" | "retorno">("ida");
  const [returnTime, setReturnTime] = useState<"17h10" | "18h10">("17h10");
  
  // Pre-populate form with data from trip
  useEffect(() => {
    if (tripData) {
      setName(tripData.user.name || "");
      setCpf(tripData.user.cpf || "");
      setDate(format(new Date(tripData.date), "yyyy-MM-dd"));
      setDirection(tripData.direction);
      if (tripData.returnTime) {
        setReturnTime(tripData.returnTime as "17h10" | "18h10");
      }
    }
  }, [tripData]);
  
  const checkinMutation = useMutation({
    mutationFn: async () => {
      const checkinData = {
        name,
        cpf,
        date,
        direction,
        returnTime: direction === "retorno" ? returnTime : null
      };
      
      await apiRequest("POST", `/api/single-trips/${tripId}/checkin`, checkinData);
    },
    onSuccess: () => {
      navigate("/checkin/confirmation");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao realizar check-in",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleCheckin = () => {
    if (!name || !cpf || !date) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }
    
    checkinMutation.mutate();
  };
  
  // Show error if trip not found
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader title="Check-in Avulso" backTo="/qr-scanner" />
        
        <div className="flex-grow flex items-center justify-center p-6">
          <Card className="w-full">
            <CardContent className="pt-6 text-center">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Código QR inválido</h2>
              <p className="text-gray-600 mb-6">O código QR escaneado é inválido ou já foi utilizado.</p>
              
              <Button onClick={() => navigate("/qr-scanner")} className="w-full">
                Escanear novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader title="Check-in Avulso" backTo="/qr-scanner" />
        
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Check-in Avulso" backTo="/qr-scanner" />

      <main className="flex-grow p-4">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Passageiro</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="full-name">Nome Completo</Label>
                <Input
                  id="full-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  disabled={tripData?.user.name ? true : false}
                />
              </div>
              
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  disabled={tripData?.user.cpf ? true : false}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Viagem</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Data</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:ring-primary"
                  disabled={tripData ? true : false}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Sentido da Viagem</label>
                <div className="flex rounded-md shadow-sm">
                  <button 
                    onClick={() => setDirection("ida")} 
                    disabled={tripData ? true : false}
                    className={`w-1/2 py-2 px-4 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                      direction === "ida" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
                    } ${tripData ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    Ida
                  </button>
                  <button 
                    onClick={() => setDirection("retorno")} 
                    disabled={tripData ? true : false}
                    className={`w-1/2 py-2 px-4 rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                      direction === "retorno" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
                    } ${tripData ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    Retorno
                  </button>
                </div>
              </div>

              {direction === "retorno" && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Horário de Retorno</label>
                  <div className="flex rounded-md shadow-sm">
                    <button 
                      onClick={() => setReturnTime("17h10")} 
                      disabled={tripData?.returnTime ? true : false}
                      className={`w-1/2 py-2 px-4 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                        returnTime === "17h10" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
                      } ${tripData?.returnTime ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      17h10
                    </button>
                    <button 
                      onClick={() => setReturnTime("18h10")} 
                      disabled={tripData?.returnTime ? true : false}
                      className={`w-1/2 py-2 px-4 rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                        returnTime === "18h10" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
                      } ${tripData?.returnTime ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      18h10
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  onClick={handleCheckin} 
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  disabled={checkinMutation.isPending}
                >
                  {checkinMutation.isPending ? "Processando..." : "Realizar Check-in"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
