import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { useEffect } from "react";

export default function AdminUsersList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Redirect if user is not an admin
  useEffect(() => {
    if (user && user.userType !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch all users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return await response.json();
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle user active status
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Status atualizado",
        description: "O status do usuário foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle user deletion with confirmation
  const handleDeleteUser = (userId: number, userName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Get user type badge color
  const getUserTypeBadge = (userType: string) => {
    switch(userType) {
      case "admin":
        return <Badge className="bg-purple-500">Administrador</Badge>;
      case "mensalista":
        return <Badge className="bg-blue-500">Mensalista</Badge>;
      case "avulso":
        return <Badge className="bg-green-500">Avulso</Badge>;
      default:
        return <Badge>{userType}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Gerenciar Usuários" backTo="/admin" />

      <main className="flex-grow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-app">Lista de Usuários</h2>
          <Button 
            onClick={() => navigate("/admin/users/add")}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">Carregando usuários...</div>
            ) : !users || users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="mb-4">Nenhum usuário encontrado.</p>
                <Button 
                  onClick={() => navigate("/admin/users/add")}
                  className="btn-primary"
                >
                  Adicionar Usuário
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getUserTypeBadge(user.userType)}</TableCell>
                      <TableCell>
                        <Badge className={user.isActive ? "bg-green-500" : "bg-red-500"}>
                          {user.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}