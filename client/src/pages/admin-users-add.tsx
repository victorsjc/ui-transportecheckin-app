import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, User, insertContractSchema, Location, DepartureTime } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

// Extend the user schema to add client-side validation
const adminUserFormSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  }
);

type AdminUserFormValues = z.infer<typeof adminUserFormSchema>;

export default function AdminUsersAdd() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect if user is not an admin
  useEffect(() => {
    if (user && user.userType !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Buscar locais e horários para o contrato
  const { data: locations } = useQuery({
    queryKey: ["/api/admin/locations"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: departureTimes } = useQuery({
    queryKey: ["/api/admin/departure-times"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Estado para o formulário de contrato
  const [showContractForm, setShowContractForm] = useState(false);
  const [contractData, setContractData] = useState({
    departureLocation: "",
    arrivalLocation: "",
    returnTime: "",
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false
  });

  // Filter locations by type
  const departureLocations = locations && Array.isArray(locations) 
    ? locations.filter((location: Location) => location.type === "departure") 
    : [];
  const arrivalLocations = locations && Array.isArray(locations) 
    ? locations.filter((location: Location) => location.type === "arrival") 
    : [];

  // Filter active departure times
  const activeReturnTimes = departureTimes && Array.isArray(departureTimes) 
    ? departureTimes.filter((time: DepartureTime) => time.isActive) 
    : [];

  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "mensalista",
      cpf: "",
      phone: "",
    },
  });

  // Atualizar visibilidade do formulário de contrato quando o tipo de usuário mudar
  useEffect(() => {
    const userType = form.watch("userType");
    setShowContractForm(userType === "mensalista");
  }, [form.watch("userType")]);

  // Mutation para criar contrato após criar usuário
  const createContractMutation = useMutation({
    mutationFn: async ({ userId, contractData }: { userId: number, contractData: any }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/contract`, contractData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contrato criado com sucesso",
        description: "O contrato foi associado ao usuário",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...userToCreate } = userData;
      const res = await apiRequest("POST", "/api/admin/users", userToCreate);
      return await res.json();
    },
    onSuccess: (createdUser: User) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário criado com sucesso",
        description: `${createdUser.name} foi adicionado como ${createdUser.userType}`,
      });
      navigate("/admin/users");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: AdminUserFormValues) {
    createUserMutation.mutate(values, {
      onSuccess: (createdUser: User) => {
        // Se for mensalista e tiver dados de contrato preenchidos, criar contrato
        if (values.userType === "mensalista" && 
            contractData.departureLocation && 
            contractData.arrivalLocation && 
            contractData.returnTime) {
          createContractMutation.mutate({
            userId: createdUser.id,
            contractData
          });
        }
      }
    });
  }
  
  // Handlers para o formulário de contrato
  const handleContractChange = (field: string, value: any) => {
    setContractData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Adicionar Novo Usuário" backTo="/admin" />

      <main className="flex-grow p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-app font-roboto">Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
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
                        <Input placeholder="joao.silva@email.com" {...field} />
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
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Mensalistas são usuários regulares. Administradores têm acesso a todas as funções.
                      </FormDescription>
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
                        <Input placeholder="000.000.000-00" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
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
                        <Input placeholder="(00) 00000-0000" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full btn-primary"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Formulário de contrato para mensalistas */}
        {showContractForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-app font-roboto">Contrato de Mensalista</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Local de partida */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Local de Partida</label>
                  {departureLocations.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Cadastre locais de partida em "Gerenciar Locais" para continuar
                    </div>
                  ) : (
                    <Select
                      value={contractData.departureLocation}
                      onValueChange={(value) => handleContractChange("departureLocation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o local de partida" />
                      </SelectTrigger>
                      <SelectContent>
                        {departureLocations.map((location) => (
                          <SelectItem key={location.id} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Local de chegada */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Local de Chegada</label>
                  {arrivalLocations.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Cadastre locais de chegada em "Gerenciar Locais" para continuar
                    </div>
                  ) : (
                    <Select
                      value={contractData.arrivalLocation}
                      onValueChange={(value) => handleContractChange("arrivalLocation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o local de chegada" />
                      </SelectTrigger>
                      <SelectContent>
                        {arrivalLocations.map((location) => (
                          <SelectItem key={location.id} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Horário de retorno */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Horário de Retorno</label>
                  {activeReturnTimes.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Cadastre horários em "Gerenciar Horários" para continuar
                    </div>
                  ) : (
                    <Select
                      value={contractData.returnTime}
                      onValueChange={(value) => handleContractChange("returnTime", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário de retorno" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeReturnTimes.map((time) => (
                          <SelectItem key={time.id} value={time.time}>
                            {time.time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Dias da semana */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Dias da Semana</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="monday" 
                        checked={contractData.monday}
                        onCheckedChange={(checked) => handleContractChange("monday", checked)}
                      />
                      <label htmlFor="monday" className="text-sm">
                        Segunda
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tuesday" 
                        checked={contractData.tuesday}
                        onCheckedChange={(checked) => handleContractChange("tuesday", checked)}
                      />
                      <label htmlFor="tuesday" className="text-sm">
                        Terça
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="wednesday" 
                        checked={contractData.wednesday}
                        onCheckedChange={(checked) => handleContractChange("wednesday", checked)}
                      />
                      <label htmlFor="wednesday" className="text-sm">
                        Quarta
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="thursday" 
                        checked={contractData.thursday}
                        onCheckedChange={(checked) => handleContractChange("thursday", checked)}
                      />
                      <label htmlFor="thursday" className="text-sm">
                        Quinta
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="friday" 
                        checked={contractData.friday}
                        onCheckedChange={(checked) => handleContractChange("friday", checked)}
                      />
                      <label htmlFor="friday" className="text-sm">
                        Sexta
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}