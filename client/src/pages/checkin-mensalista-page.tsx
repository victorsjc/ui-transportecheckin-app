import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function CheckinMensalistaPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");
  
  const [direction, setDirection] = useState<"ida" | "retorno">("ida");
  const [returnTime, setReturnTime] = useState<"17h10" | "18h10">("17h10");
  const [date, setDate] = useState(todayFormatted);
  
  const checkinMutation = useMutation({
    mutationFn: async () => {
      const checkinData = {
        date,
        direction,
        returnTime: direction === "retorno" ? returnTime : null
      };
      
      await apiRequest("POST", "/api/checkins", checkinData);
    },
    onSuccess: (res) => {
      if(res?.data){
        //
      }
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
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
    if (!date) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, selecione uma data para o check-in",
        variant: "destructive"
      });
      return;
    }
    
    checkinMutation.mutate();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Check-in de Viagem" backTo="/" />

      <main className="flex-grow p-4">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Check-in</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Data</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  min={todayFormatted}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Sentido da Viagem</label>
                <div className="flex rounded-md shadow-sm">
                  <button 
                    onClick={() => setDirection("ida")} 
                    className={`w-1/2 py-2 px-4 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                      direction === "ida" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    Ida
                  </button>
                  <button 
                    onClick={() => setDirection("retorno")} 
                    className={`w-1/2 py-2 px-4 rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                      direction === "retorno" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
                    }`}
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
                      className={`w-1/2 py-2 px-4 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                        returnTime === "17h10" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      17h10
                    </button>
                    <button 
                      onClick={() => setReturnTime("18h10")} 
                      className={`w-1/2 py-2 px-4 rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                        returnTime === "18h10" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
                      }`}
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

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-900">Informações Importantes</h3>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Realize o check-in com pelo menos 30 minutos de antecedência.</li>
              <li>Você pode cancelar seu check-in até 1 hora antes da viagem.</li>
              <li>Em caso de desistência, informe o mais breve possível para liberar sua vaga.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
