import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Settings, Clock, MapPin, Clipboard } from "lucide-react";

export default function AdminDashboardPage() {
  const [_, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && user && user.userType !== "admin") {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // ProtectedRoute will handle the redirection
  }

  const menuItems = [
    {
      title: "Gerenciar Usuários",
      description: "Cadastre, edite ou remova passageiros mensalistas e avulsos",
      icon: <Users className="h-8 w-8 text-primary" />,
      onClick: () => setLocation("/admin/users")
    },
    {
      title: "Histórico de Check-ins",
      description: "Visualize e gerencie todos os check-ins realizados",
      icon: <Clipboard className="h-8 w-8 text-primary" />,
      onClick: () => setLocation("/admin/checkins")
    },
    {
      title: "Contratos de Passageiros",
      description: "Gerenciar detalhes de contratos para cada mensalista",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      onClick: () => setLocation("/admin/contracts")
    },
    {
      title: "Locais de Partida/Chegada",
      description: "Configure os pontos de embarque e desembarque",
      icon: <MapPin className="h-8 w-8 text-primary" />,
      onClick: () => setLocation("/admin/locations")
    },
    {
      title: "Horários de Partida",
      description: "Configure os horários disponíveis para retorno",
      icon: <Clock className="h-8 w-8 text-primary" />,
      onClick: () => setLocation("/admin/departure-times")
    },
    {
      title: "Configurações do Sistema",
      description: "Ajuste as configurações gerais do sistema",
      icon: <Settings className="h-8 w-8 text-primary" />,
      onClick: () => setLocation("/admin/settings")
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">Painel Administrativo</h1>
        <Button variant="outline" onClick={() => setLocation("/")}>
          Voltar para o App
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                {item.icon}
              </div>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{item.description}</p>
              <Button onClick={item.onClick} className="w-full">Acessar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}