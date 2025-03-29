import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavigation from "@/components/bottom-navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { VacationPeriod, Checkin } from "@shared/schema";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const today = new Date();
  const formattedDate = format(today, "d 'de' MMMM, yyyy", { locale: ptBR });

  // Load vacation periods
  const { data: vacationPeriods } = useQuery<VacationPeriod[]>({
    queryKey: ["/api/vacations"],
    enabled: !!user,
  });

  // Load upcoming checkins
  const { data: checkins } = useQuery<Checkin[]>({
    queryKey: ["/api/checkins"],
    enabled: !!user,
  });

  // Delete vacation period
  const deleteVacationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vacations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vacations"] });
    },
  });

  // Check if user is on vacation today
  const isOnVacation = vacationPeriods?.some(vacation => {
    const startDate = new Date(vacation.startDate);
    const endDate = new Date(vacation.endDate);
    return today >= startDate && today <= endDate;
  });

  // Filter for upcoming trips (future checkins)
  const upcomingTrips = checkins?.filter(checkin => {
    const checkinDate = new Date(checkin.date);
    // Format to YYYY-MM-DD for comparison
    const checkinDateStr = checkinDate.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    return checkinDateStr > todayStr;
  }).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }).slice(0, 3);

  // Check if user already has a checkin for today
  const hasTodayCheckin = checkins?.some(checkin => {
    const checkinDate = new Date(checkin.date);
    return checkinDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white p-4 flex items-center justify-between shadow">
        <h1 className="text-xl font-bold text-white">TripCheck</h1>
        <div className="flex items-center">
          <span className="mr-2 text-sm">{user?.name}</span>
          <button 
            onClick={() => logoutMutation.mutate()} 
            className="rounded-full bg-primary-dark p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-grow p-4">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-app">Check-in Hoje</h2>
              <span className="text-sm text-gray-600">{formattedDate}</span>
            </div>
            
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Status do dia:</p>
                  {isOnVacation ? (
                    <p className="text-orange-500 font-medium">Você está de férias</p>
                  ) : hasTodayCheckin ? (
                    <p className="text-blue-500 font-medium">Check-in já realizado</p>
                  ) : (
                    <p className="text-green-500 font-medium">Check-in disponível</p>
                  )}
                </div>
                <Button 
                  variant="default"
                  className="btn-primary"
                  onClick={() => navigate("/checkin/mensalista")}
                  disabled={isOnVacation || hasTodayCheckin}
                >
                  Fazer Check-in
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-app mb-3">Próximas Viagens</h2>
            
            {upcomingTrips && upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip) => (
                <div key={trip.id} className="mt-3 border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {format(new Date(trip.date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {trip.direction === "ida" ? "Ida - Manhã" : `Retorno - ${trip.returnTime}`}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-blue-500 text-sm rounded-full">Agendado</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Nenhuma viagem agendada.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-app mb-3">Gerenciar Férias</h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Configure seu período de férias para liberar sua vaga automaticamente.</p>
              
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h3 className="font-medium text-sm mb-2">Férias Programadas:</h3>
                
                {vacationPeriods && vacationPeriods.length > 0 ? (
                  vacationPeriods.map((period) => (
                    <div key={period.id} className="flex justify-between items-center mb-2">
                      <div className="text-sm">
                        <p>
                          {format(new Date(period.startDate), "dd/MM/yyyy")} - {format(new Date(period.endDate), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 h-8 w-8"
                        onClick={() => deleteVacationMutation.mutate(period.id)}
                        disabled={deleteVacationMutation.isPending}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 mb-3">Nenhum período de férias programado.</p>
                )}
                
                <Button 
                  onClick={() => navigate("/vacation/add")} 
                  className="mt-3 w-full btn-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Adicionar Período de Férias
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation active="home" />
    </div>
  );
}
