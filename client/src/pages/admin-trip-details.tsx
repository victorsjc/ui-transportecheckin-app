import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, ArrowLeft, User, Calendar, MapPin, Clock, CheckCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";

interface TripDetails {
  id: number;
  date: string;
  direction: string;
  returnTime: string | null;
  createdAt: string;
  isUsed: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    userType: string;
    cpf: string | null;
    phone: string | null;
  };
}

export default function AdminTripDetails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams();
  const tripId = params.id ? parseInt(params.id) : null;
  
  // Redirect if user is not an admin
  useEffect(() => {
    if (user && user.userType !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch trip details
  const { data: trip, isLoading } = useQuery<TripDetails>({
    queryKey: ["/api/admin/single-trips", tripId],
    queryFn: async () => {
      if (!tripId) throw new Error("ID de viagem inválido");
      const response = await apiRequest("GET", `/api/admin/single-trips/${tripId}`);
      return await response.json();
    },
    enabled: !!tripId,
  });

  // Mark as used mutation
  const markAsUsedMutation = useMutation({
    mutationFn: async (tripId: number) => {
      await apiRequest("PATCH", `/api/admin/single-trips/${tripId}/mark-used`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/single-trips", tripId] });
      toast({
        title: "Passagem marcada como utilizada",
        description: "A passagem foi marcada como utilizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel trip mutation
  const cancelTripMutation = useMutation({
    mutationFn: async (tripId: number) => {
      await apiRequest("DELETE", `/api/admin/single-trips/${tripId}`);
    },
    onSuccess: () => {
      toast({
        title: "Passagem cancelada",
        description: "A passagem foi cancelada com sucesso.",
      });
      navigate("/admin/trips");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cancelar passagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  // Handle marking trip as used
  const handleMarkAsUsed = () => {
    if (!tripId) return;
    if (window.confirm("Tem certeza que deseja marcar esta passagem como utilizada? Esta ação não pode ser desfeita.")) {
      markAsUsedMutation.mutate(tripId);
    }
  };

  // Handle trip cancellation with confirmation
  const handleCancelTrip = () => {
    if (!tripId) return;
    if (window.confirm("Tem certeza que deseja cancelar esta passagem? Esta ação não pode ser desfeita.")) {
      cancelTripMutation.mutate(tripId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader title="Detalhes da Passagem" backTo="/admin/trips" />
        <main className="flex-grow p-4">
          <div className="flex justify-center items-center h-full">
            <p>Carregando detalhes da passagem...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader title="Detalhes da Passagem" backTo="/admin/trips" />
        <main className="flex-grow p-4">
          <div className="flex flex-col justify-center items-center h-full">
            <p className="text-xl mb-4">Passagem não encontrada</p>
            <Button onClick={() => navigate("/admin/trips")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Viagens
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Detalhes da Passagem" backTo="/admin/trips" />

      <main className="flex-grow p-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-app">Passagem #{trip.id}</h2>
          <p className="text-muted-foreground">
            Criada em {formatDate(trip.createdAt)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ticket className="h-5 w-5 mr-2" /> 
                Detalhes da Passagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Data:</span>
                </div>
                <span className="font-medium">{formatDate(trip.date)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Direção:</span>
                </div>
                <Badge className={trip.direction === "ida" ? "bg-blue-500" : "bg-green-500"}>
                  {trip.direction === "ida" ? "Ida" : "Retorno"}
                </Badge>
              </div>
              
              {trip.returnTime && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>Horário de Retorno:</span>
                  </div>
                  <span className="font-medium">{trip.returnTime}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Status:</span>
                </div>
                <Badge className={trip.isUsed ? "bg-green-500" : "bg-yellow-500"}>
                  {trip.isUsed ? "Utilizada" : "Pendente"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Dados do Passageiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium">{trip.user.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">E-mail:</span>
                <span className="font-medium">{trip.user.email}</span>
              </div>
              
              {trip.user.cpf && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">CPF:</span>
                  <span className="font-medium">{trip.user.cpf}</span>
                </div>
              )}
              
              {trip.user.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="font-medium">{trip.user.phone}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tipo de usuário:</span>
                <Badge variant="outline">
                  {trip.user.userType === "mensalista" ? "Mensalista" : "Avulso"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
              <CardDescription>
                Opções disponíveis para esta passagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {!trip.isUsed && (
                  <>
                    <Button 
                      variant="default"
                      onClick={handleMarkAsUsed}
                      disabled={markAsUsedMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marcar como Utilizada
                    </Button>
                    
                    <Button 
                      variant="destructive"
                      onClick={handleCancelTrip}
                      disabled={cancelTripMutation.isPending}
                    >
                      Cancelar Passagem
                    </Button>
                  </>
                )}
                
                <Button variant="outline" onClick={() => navigate("/admin/trips")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Lista de Viagens
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}