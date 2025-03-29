import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, Calendar, Ticket } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { AdminHeader } from "@/components/admin-header";

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
      <AdminHeader />
      
      <main className="flex-grow p-4 pt-6">
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
                  <CardTitle className="flex items-center justify-center text-app">
                    <UserPlus className="h-6 w-6" />
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
                    Criar Usuário
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-center text-app">
                    <Users className="h-6 w-6" />
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
                    Visualizar Usuários
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trips">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-center text-app">
                    <Ticket className="h-6 w-6" />
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
                    Criar Passagem Avulsa
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-center text-app">
                    <Calendar className="h-6 w-6" />
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
                    Visualizar Passagens Avulsas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="grid grid-cols-1 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>
                    Gerenciar horários, locais e outras configurações do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => navigate("/admin/locations")}
                    className="w-full btn-primary"
                  >
                    Gerenciar Locais de Partida e Chegada
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