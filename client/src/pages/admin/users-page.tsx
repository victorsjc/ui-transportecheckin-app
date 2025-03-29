import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogDescription  
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { ArrowLeft, Search, UserPlus, FileText, Edit, Trash2, Ban, Key, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const userFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  userType: z.enum(["mensalista", "avulso", "admin"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AdminUsersPage() {
  const [_, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState<{id: number, password: string} | null>(null);
  
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery<User[]>({
    queryKey: [searchQuery ? "/api/admin/users/search" : "/api/admin/users", searchQuery ? { q: searchQuery } : undefined],
    queryFn: getQueryFn({}),
    enabled: !!user && user.userType === "admin",
  });

  useEffect(() => {
    if (!authLoading && user && user.userType !== "admin") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      phone: "",
      userType: "mensalista",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      email: "",
      cpf: "",
      phone: "",
      userType: "mensalista",
    });
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      const response = await apiRequest("POST", "/api/admin/users", values);
      const data = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário criado com sucesso",
        description: "Senha temporária: " + data.plainPassword,
      });
      
      setShowNewPassword({
        id: data.id,
        password: data.plainPassword
      });
      
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    try {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário desativado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao desativar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userId: number) => {
    try {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/reset-password`);
      const data = await response.json();
      
      setShowNewPassword({
        id: userId,
        password: data.newPassword
      });
      
      setResetPasswordUserId(null);
      
      toast({
        title: "Senha redefinida com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao redefinir senha",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleSearch = () => {
    // The search is handled by the useQuery hook
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // ProtectedRoute will handle the redirection
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => setLocation("/admin")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Gerencie todos os usuários da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
            <div className="flex w-full sm:w-auto">
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sm:w-80"
              />
              <Button variant="outline" onClick={handleSearch} className="ml-2">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Preencha os dados abaixo para criar um novo usuário
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome Completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Usuário</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de usuário" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mensalista">Mensalista</SelectItem>
                              <SelectItem value="avulso">Avulso</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setShowCreateDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Criar Usuário</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {showNewPassword && (
              <Dialog open={!!showNewPassword} onOpenChange={() => setShowNewPassword(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Senha Temporária Gerada</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="mb-2">Uma senha temporária foi gerada para o usuário:</p>
                    <div className="bg-gray-100 p-3 rounded font-mono text-center text-lg">{showNewPassword.password}</div>
                    <p className="mt-4 text-sm text-muted-foreground">Anote esta senha e compartilhe-a com o usuário. Ela não será mostrada novamente.</p>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setShowNewPassword(null)}>Entendi</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            <AlertDialog 
              open={userToDelete !== null} 
              onOpenChange={(open) => !open && setUserToDelete(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Desativação</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você está prestes a desativar um usuário. O usuário não poderá mais acessar o sistema.
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      if (userToDelete !== null) {
                        handleDeactivateUser(userToDelete);
                        setUserToDelete(null);
                      }
                    }}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Dialog 
              open={resetPasswordUserId !== null} 
              onOpenChange={(open) => !open && setResetPasswordUserId(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Redefinir Senha</DialogTitle>
                  <DialogDescription>
                    Você está prestes a redefinir a senha do usuário. Uma nova senha será gerada automaticamente.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setResetPasswordUserId(null)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      if (resetPasswordUserId !== null) {
                        handleResetPassword(resetPasswordUserId);
                      }
                    }}
                  >
                    Redefinir Senha
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Erro ao carregar usuários. Tente novamente.
            </div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
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
                      <TableCell>
                        <Badge variant={
                          user.userType === "admin" 
                            ? "destructive" 
                            : user.userType === "mensalista" 
                              ? "default" 
                              : "secondary"
                        }>
                          {user.userType === "admin" 
                            ? "Administrador" 
                            : user.userType === "mensalista" 
                              ? "Mensalista" 
                              : "Avulso"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                            <Ban className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.userType === "mensalista" && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setLocation(`/admin/users/${user.id}/contract`)}
                              title="Ver Contrato"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setLocation(`/admin/users/${user.id}/edit`)}
                            title="Editar Usuário"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setResetPasswordUserId(user.id)}
                            title="Redefinir Senha"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          {user.userType !== "admin" && (
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setUserToDelete(user.id)}
                              title="Desativar Usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado.
              {searchQuery && " Tente refinar sua busca."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}