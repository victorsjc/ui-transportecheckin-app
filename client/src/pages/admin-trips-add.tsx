import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, insertSingleTripSchema, User, SingleTrip } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Combined schema for creating a user and trip in one go
const singleTripFormSchema = z.object({
  // User info
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  phone: z.string().optional(),
  
  // Trip info
  date: z.date({
    required_error: "Data é obrigatória",
  }),
  direction: z.enum(["ida", "retorno"], {
    required_error: "Direção é obrigatória",
  }),
  returnTime: z.string().optional().nullable(),
});

type SingleTripFormValues = z.infer<typeof singleTripFormSchema>;

export default function AdminTripsAdd() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect if user is not an admin
  useEffect(() => {
    if (user && user.userType !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const form = useForm<SingleTripFormValues>({
    resolver: zodResolver(singleTripFormSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      phone: "",
      direction: "ida",
      returnTime: null,
    },
  });

  // Watch direction field to conditionally show return time
  const watchDirection = form.watch("direction");
  
  // Get departure times
  const { data: departureTimes } = useQuery({
    queryKey: ["/api/departure-times"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/departure-times");
      return await response.json();
    },
  });

  const createSingleTripMutation = useMutation({
    mutationFn: async (formData: SingleTripFormValues) => {
      const res = await apiRequest("POST", "/api/admin/single-trips", {
        user: {
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf,
          phone: formData.phone,
          userType: "avulso",
          password: Math.random().toString(36).slice(-8), // Generate random password
        },
        trip: {
          date: format(formData.date, "yyyy-MM-dd"),
          direction: formData.direction,
          returnTime: formData.returnTime,
        },
      });
      return await res.json();
    },
    onSuccess: (data: { user: User; trip: SingleTrip }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/single-trips"] });
      toast({
        title: "Passagem criada com sucesso",
        description: `Passagem criada para ${data.user.name}`,
      });
      navigate("/admin/trips");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar passagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: SingleTripFormValues) {
    createSingleTripMutation.mutate(values);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Adicionar Passagem Avulsa" backTo="/admin" />

      <main className="flex-grow p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-app">Informações da Passagem</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium text-app">Dados do Passageiro</h3>
                  
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
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-app">Dados da Viagem</h3>
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd 'de' MMMM 'de' yyyy", {
                                    locale: ptBR,
                                  })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direção</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a direção" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ida">Ida</SelectItem>
                            <SelectItem value="retorno">Retorno</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {watchDirection === "retorno" && (
                    <FormField
                      control={form.control}
                      name="returnTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário de Retorno</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o horário" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departureTimes?.map((time: { id: number; time: string }) => (
                                <SelectItem key={time.id} value={time.time}>
                                  {time.time}
                                </SelectItem>
                              )) || (
                                <>
                                  <SelectItem value="17h10">17h10</SelectItem>
                                  <SelectItem value="18h10">18h10</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full btn-primary"
                    disabled={createSingleTripMutation.isPending}
                  >
                    {createSingleTripMutation.isPending ? "Criando..." : "Criar Passagem"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}