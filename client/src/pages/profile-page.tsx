import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);

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
              <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-green-500 capitalize">{user?.userType}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Informações da Conta</h3>
            
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
          <h3 className="font-medium text-gray-900 mb-3">Configurações</h3>
          
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
