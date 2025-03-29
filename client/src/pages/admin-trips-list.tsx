import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, Download, Printer, Info } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";

interface Trip {
  id: number;
  date: string;
  direction: string;
  returnTime: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    userType: string;
  };
  isUsed?: boolean; // For single trips
}

export default function AdminTripsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("checkins");
  
  // Redirect if user is not an admin
  useEffect(() => {
    if (user && user.userType !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch check-ins
  const { data: checkins, isLoading: isLoadingCheckins } = useQuery<Trip[]>({
    queryKey: ["/api/admin/checkins"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/checkins");
      return await response.json();
    },
  });

  // Fetch single trips
  const { data: singleTrips, isLoading: isLoadingSingleTrips } = useQuery<Trip[]>({
    queryKey: ["/api/admin/single-trips"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/single-trips");
      return await response.json();
    },
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  // Get direction badge
  const getDirectionBadge = (direction: string) => {
    return direction === "ida" ? (
      <Badge className="bg-blue-500">Ida</Badge>
    ) : (
      <Badge className="bg-green-500">Retorno</Badge>
    );
  };

  // Cancel single trip
  const cancelSingleTripMutation = useMutation({
    mutationFn: async (tripId: number) => {
      await apiRequest("DELETE", `/api/admin/single-trips/${tripId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/single-trips"] });
      toast({
        title: "Passagem cancelada",
        description: "A passagem foi cancelada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cancelar passagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle trip cancellation with confirmation
  const handleCancelTrip = (tripId: number) => {
    if (window.confirm("Tem certeza que deseja cancelar esta passagem? Esta ação não pode ser desfeita.")) {
      cancelSingleTripMutation.mutate(tripId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Gerenciar Viagens" backTo="/admin" />

      <main className="flex-grow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-app">Viagens e Passagens</h2>
          <Button 
            onClick={() => navigate("/admin/trips/add")}
            className="btn-primary flex items-center gap-2"
          >
            <Ticket className="h-4 w-4" />
            Nova Passagem
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
            <TabsTrigger value="single-trips">Passagens Avulsas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="checkins">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                {isLoadingCheckins ? (
                  <div className="p-8 text-center">Carregando check-ins...</div>
                ) : !checkins || checkins.length === 0 ? (
                  <div className="p-8 text-center">
                    <p>Nenhum check-in encontrado.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Passageiro</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Direção</TableHead>
                        <TableHead>Horário de Retorno</TableHead>
                        <TableHead>Tipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checkins.map((checkin) => (
                        <TableRow key={checkin.id}>
                          <TableCell className="font-medium">{checkin.user.name}</TableCell>
                          <TableCell>{formatDate(checkin.date)}</TableCell>
                          <TableCell>{getDirectionBadge(checkin.direction)}</TableCell>
                          <TableCell>{checkin.returnTime || "—"}</TableCell>
                          <TableCell>
                            <Badge className={checkin.user.userType === "mensalista" ? "bg-blue-500" : "bg-green-500"}>
                              {checkin.user.userType === "mensalista" ? "Mensalista" : "Avulso"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            {checkins && checkins.length > 0 && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="single-trips">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                {isLoadingSingleTrips ? (
                  <div className="p-8 text-center">Carregando passagens...</div>
                ) : !singleTrips || singleTrips.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="mb-4">Nenhuma passagem avulsa encontrada.</p>
                    <Button 
                      onClick={() => navigate("/admin/trips/add")}
                      className="btn-primary"
                    >
                      Adicionar Passagem
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Passageiro</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Direção</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {singleTrips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell className="font-medium">{trip.user.name}</TableCell>
                          <TableCell>{trip.user.email}</TableCell>
                          <TableCell>{formatDate(trip.date)}</TableCell>
                          <TableCell>{getDirectionBadge(trip.direction)}</TableCell>
                          <TableCell>
                            <Badge className={trip.isUsed ? "bg-green-500" : "bg-yellow-500"}>
                              {trip.isUsed ? "Utilizada" : "Pendente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/admin/trips/details/${trip.id}`)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                              {!trip.isUsed && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleCancelTrip(trip.id)}
                                  disabled={cancelSingleTripMutation.isPending}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            {singleTrips && singleTrips.length > 0 && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}