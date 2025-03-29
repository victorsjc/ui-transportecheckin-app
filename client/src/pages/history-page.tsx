import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkin } from "@shared/schema";

export default function HistoryPage() {
  const [directionFilter, setDirectionFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(format(new Date(), "MMMM yyyy", { locale: ptBR }));
  
  // Load checkins history
  const { data: checkins, isLoading } = useQuery<Checkin[]>({
    queryKey: ["/api/checkins"],
  });

  // Get available months from checkins
  const availableMonths = checkins
    ? Array.from(new Set(checkins.map(checkin => 
        format(new Date(checkin.date), "MMMM yyyy", { locale: ptBR })
      ))).sort((a, b) => {
        // Sort by date descending (newest first)
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB.getTime() - dateA.getTime();
      })
    : [];

  // Filter checkins by direction and month
  const filteredCheckins = checkins
    ? checkins
        .filter(checkin => {
          // Filter by direction
          if (directionFilter !== "all") {
            return checkin.direction === directionFilter;
          }
          return true;
        })
        .filter(checkin => {
          // Filter by month
          const checkinMonth = format(new Date(checkin.date), "MMMM yyyy", { locale: ptBR });
          return monthFilter === "all" || checkinMonth === monthFilter;
        })
        .sort((a, b) => {
          // Sort by date descending (newest first)
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Histórico de Viagens" />

      <main className="flex-grow p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-app">Histórico de Check-ins</h2>
            <div className="flex space-x-2">
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ida">Ida</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                </SelectContent>
              </Select>

              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Carregando histórico...</p>
            </div>
          ) : filteredCheckins.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Nenhum check-in encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            filteredCheckins.map((checkin) => (
              <div key={checkin.id} className="border-b border-gray-200 pb-3 pt-3 first:pt-0 last:border-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {format(new Date(checkin.date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {checkin.direction === "ida" 
                        ? "Ida - Manhã" 
                        : `Retorno - ${checkin.returnTime}`}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-600 text-sm rounded-full">
                    Realizado
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNavigation active="history" />
    </div>
  );
}
