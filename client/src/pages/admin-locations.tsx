import { useAuth } from "@/hooks/use-auth";
import { AdminHeader } from "@/components/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLocationSchema, Location } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { MapPin, Trash2 } from "lucide-react";

// Extend the location schema for client-side validation
const locationFormSchema = insertLocationSchema.extend({});

type LocationFormValues = z.infer<typeof locationFormSchema>;

export default function AdminLocations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect if user is not an admin
  useEffect(() => {
    if (user && user.userType !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      type: "departure",
    },
  });

  // Fetch locations
  const { data: locations, isLoading } = useQuery({
    queryKey: ["/api/admin/locations"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Create a new location
  const createLocationMutation = useMutation({
    mutationFn: async (locationData: LocationFormValues) => {
      const res = await apiRequest("POST", "/api/admin/locations", locationData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
      toast({
        title: "Local criado com sucesso",
        description: "O novo local foi adicionado ao sistema",
      });
      form.reset({
        name: "",
        type: "departure",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar local",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete location
  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      await apiRequest("DELETE", `/api/admin/locations/${locationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
      toast({
        title: "Local excluído com sucesso",
        description: "O local foi removido do sistema",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir local",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: LocationFormValues) {
    createLocationMutation.mutate(values);
  }

  // Filter locations by type
  const departureLocations = locations && Array.isArray(locations) 
    ? locations.filter((location: Location) => location.type === "departure") 
    : [];
  const arrivalLocations = locations && Array.isArray(locations) 
    ? locations.filter((location: Location) => location.type === "arrival") 
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <main className="flex-grow p-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de cadastro */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="sr-only">Formulário de Cadastro</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Local</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Av. Paulista, 1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo do Local</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo do local" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="departure">Local de Partida</SelectItem>
                            <SelectItem value="arrival">Local de Chegada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full btn-primary"
                      disabled={createLocationMutation.isPending}
                    >
                      {createLocationMutation.isPending ? "Adicionando..." : "Adicionar Local"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Lista de locais de partida */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-app text-lg">
                <MapPin className="h-5 w-5" />
                Locais de Partida
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : departureLocations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Nenhum local de partida cadastrado</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departureLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteLocationMutation.mutate(location.id)}
                            disabled={deleteLocationMutation.isPending}
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

          {/* Lista de locais de chegada */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-app text-lg">
                <MapPin className="h-5 w-5" />
                Locais de Chegada
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : arrivalLocations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Nenhum local de chegada cadastrado</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arrivalLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteLocationMutation.mutate(location.id)}
                            disabled={deleteLocationMutation.isPending}
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