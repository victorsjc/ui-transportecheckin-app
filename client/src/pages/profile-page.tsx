import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  
  const updateUserRoleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}/role`, { 
        userType: "admin" 
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Você agora tem privilégios de administrador. Faça login novamente para aplicar as alterações.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return "";
    
    const names = user.name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Perfil do Usuário" />

      <main className="flex-grow p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-app">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-green-500 capitalize">{user?.userType}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-app mb-3">Informações da Conta</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nome Completo</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">E-mail</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium">{user?.phone || "Não informado"}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">CPF</p>
                <p className="font-medium">{user?.cpf || "Não informado"}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="font-medium text-app mb-3">Configurações</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações por E-mail</p>
                <p className="text-sm text-gray-600">Receber lembretes de viagem</p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema Escuro</p>
                <p className="text-sm text-gray-600">Mudar para o tema escuro</p>
              </div>
              <Switch 
                checked={darkTheme} 
                onCheckedChange={setDarkTheme} 
              />
            </div>
          </div>
        </div>
        
        {user?.userType !== "admin" && (
          <Button 
            className="w-full mb-4 bg-purple-600 hover:bg-purple-700 text-white" 
            onClick={() => updateUserRoleMutation.mutate()}
            disabled={updateUserRoleMutation.isPending}
          >
            {updateUserRoleMutation.isPending ? "Atualizando..." : "Tornar-se Administrador"}
          </Button>
        )}
        
        <Button 
          className="w-full bg-red-500 hover:bg-red-600" 
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Saindo..." : "Sair da Conta"}
        </Button>
      </main>

      <BottomNavigation active="profile" />
    </div>
  );
}
