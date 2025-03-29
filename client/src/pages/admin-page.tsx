import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, Calendar, Ticket } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if user is not an admin
  useEffect(() => {
    if (user && user.userType !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Painel Administrativo" backTo="/dashboard" />

      <main className="flex-grow p-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="trips">Viagens</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-app">
                    <UserPlus className="h-5 w-5" />
                    Adicionar Usuário
                  </CardTitle>
                  <CardDescription>
                    Cadastrar novos usuários mensalistas ou administradores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate("/admin/users/add")}
                    className="w-full btn-primary"
                  >
                    Criar Novo Usuário
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-app">
                    <Users className="h-5 w-5" />
                    Gerenciar Usuários
                  </CardTitle>
                  <CardDescription>
                    Visualizar e editar os usuários existentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate("/admin/users")}
                    className="w-full btn-primary"
                  >
                    Ver Todos os Usuários
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trips">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-app">
                    <Ticket className="h-5 w-5" />
                    Passagens Avulsas
                  </CardTitle>
                  <CardDescription>
                    Adicionar e gerenciar passagens para usuários avulsos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate("/admin/trips/add")}
                    className="w-full btn-primary"
                  >
                    Criar Nova Passagem
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-app">
                    <Calendar className="h-5 w-5" />
                    Viagens Agendadas
                  </CardTitle>
                  <CardDescription>
                    Visualizar todas as viagens programadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate("/admin/trips")}
                    className="w-full btn-primary"
                  >
                    Ver Todas as Viagens
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="grid grid-cols-1 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-app">Configurações do Sistema</CardTitle>
                  <CardDescription>
                    Gerenciar horários, locais e outras configurações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => navigate("/admin/locations")}
                    className="w-full btn-primary"
                  >
                    Gerenciar Locais
                  </Button>
                  
                  <Button 
                    onClick={() => navigate("/admin/times")}
                    className="w-full btn-primary"
                  >
                    Gerenciar Horários
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}