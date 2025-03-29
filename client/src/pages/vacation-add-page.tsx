import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format, addDays, isBefore } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function VacationAddPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");
  const oneWeekLater = format(addDays(today, 7), "yyyy-MM-dd");
  
  const [startDate, setStartDate] = useState(oneWeekLater);
  const [endDate, setEndDate] = useState(oneWeekLater);
  
  const vacationMutation = useMutation({
    mutationFn: async () => {
      const vacationData = {
        startDate,
        endDate
      };
      
      await apiRequest("POST", "/api/vacations", vacationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vacations"] });
      toast({
        title: "Férias registradas",
        description: "Seu período de férias foi registrado com sucesso."
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar férias",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = () => {
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const min = addDays(today, 7);
    
    if (isBefore(start, min)) {
      toast({
        title: "Data inválida",
        description: "O período de férias deve ser informado com pelo menos 7 dias de antecedência.",
        variant: "destructive"
      });
      return;
    }
    
    if (isBefore(end, start)) {
      toast({
        title: "Data inválida",
        description: "A data final deve ser posterior à data inicial.",
        variant: "destructive"
      });
      return;
    }
    
    vacationMutation.mutate();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Adicionar Período de Férias" backTo="/" />

      <main className="flex-grow p-4">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Período de Férias</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-600 mb-1">Data Inicial</label>
                <input 
                  type="date" 
                  id="start-date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  min={oneWeekLater}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-600 mb-1">Data Final</label>
                <input 
                  type="date" 
                  id="end-date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:ring-primary"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={vacationMutation.isPending}
                >
                  {vacationMutation.isPending ? "Salvando..." : "Salvar Período de Férias"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-900">Informações Importantes</h3>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>O período de férias deve ser informado com pelo menos 7 dias de antecedência.</li>
              <li>Durante o período de férias, sua vaga ficará automaticamente indisponível.</li>
              <li>Você pode alterar ou cancelar seu período de férias a qualquer momento.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
