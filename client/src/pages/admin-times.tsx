import { useAuth } from "@/hooks/use-auth";
import { AdminHeader } from "@/components/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDepartureTimeSchema, DepartureTime } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Clock, Trash2 } from "lucide-react";

// Extend the departure time schema for client-side validation
const departureTimeFormSchema = insertDepartureTimeSchema.extend({});

type DepartureTimeFormValues = z.infer<typeof departureTimeFormSchema>;

export default function AdminTimes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect if user is not an admin
  useEffect(() => {
    if (user && user.userType !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const form = useForm<DepartureTimeFormValues>({
    resolver: zodResolver(departureTimeFormSchema),
    defaultValues: {
      time: "",
    },
  });

  // Fetch departure times
  const { data: departureTimes, isLoading } = useQuery({
    queryKey: ["/api/admin/departure-times"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Create a new departure time
  const createDepartureTimeMutation = useMutation({
    mutationFn: async (timeData: DepartureTimeFormValues) => {
      const res = await apiRequest("POST", "/api/admin/departure-times", timeData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/departure-times"] });
      toast({
        title: "Horário criado com sucesso",
        description: "O novo horário foi adicionado ao sistema",
      });
      form.reset({
        time: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar horário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle departure time active status
  const toggleDepartureTimeMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/departure-times/${id}`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/departure-times"] });
      toast({
        title: "Horário atualizado",
        description: "O status do horário foi atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar horário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete departure time
  const deleteDepartureTimeMutation = useMutation({
    mutationFn: async (timeId: number) => {
      await apiRequest("DELETE", `/api/admin/departure-times/${timeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/departure-times"] });
      toast({
        title: "Horário excluído com sucesso",
        description: "O horário foi removido do sistema",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir horário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: DepartureTimeFormValues) {
    createDepartureTimeMutation.mutate(values);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <main className="flex-grow p-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulário de cadastro */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-app text-lg">Adicionar Novo Horário de Retorno</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário (formato: HHhMM)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 17h10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full btn-primary"
                      disabled={createDepartureTimeMutation.isPending}
                    >
                      {createDepartureTimeMutation.isPending ? "Adicionando..." : "Adicionar Horário"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Lista de horários */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-app text-lg">
                <Clock className="h-5 w-5" />
                Horários de Retorno
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : !departureTimes || !Array.isArray(departureTimes) || departureTimes.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Nenhum horário cadastrado</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horário</TableHead>
                      <TableHead className="text-center">Ativo</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departureTimes.map((time: DepartureTime) => (
                      <TableRow key={time.id}>
                        <TableCell>{time.time}</TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            checked={time.isActive} 
                            onCheckedChange={(isActive) => toggleDepartureTimeMutation.mutate({ id: time.id, isActive })}
                            disabled={toggleDepartureTimeMutation.isPending}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDepartureTimeMutation.mutate(time.id)}
                            disabled={deleteDepartureTimeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}