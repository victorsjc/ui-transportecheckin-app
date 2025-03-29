import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { QRScanner } from "@/lib/qr-scanner";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function QrScannerPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(true);

  const handleScan = (result: string) => {
    setScanning(false);
    
    try {
      // Check if the QR code is a valid URL with a trip ID
      const url = new URL(result);
      const tripIdMatch = url.pathname.match(/\/trip\/(\d+)/);
      
      if (tripIdMatch && tripIdMatch[1]) {
        const tripId = tripIdMatch[1];
        navigate(`/checkin/avulso/${tripId}`);
      } else {
        toast({
          title: "QR Code inválido",
          description: "O QR code não contém uma viagem válida.",
          variant: "destructive"
        });
        setScanning(true);
      }
    } catch (error) {
      toast({
        title: "QR Code inválido",
        description: "O QR code escaneado não é um link válido.",
        variant: "destructive"
      });
      setScanning(true);
    }
  };

  const handleError = (error: Error) => {
    console.error("QR Scanner error:", error);
    toast({
      title: "Erro ao escanear",
      description: "Não foi possível acessar a câmera. Verifique as permissões.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Escanear QR Code" backTo="/auth" />

      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 aspect-square">
                {scanning ? (
                  <QRScanner
                    onScan={handleScan}
                    onError={handleError}
                    className="w-full h-full rounded-lg overflow-hidden"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Processando QR Code...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Posicione o QR Code dentro da área de leitura</p>
              </div>
            </CardContent>
          </Card>

          {/* For testing purposes only - this should be removed in production */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/checkin/avulso/1")}
          >
            Simular Leitura de QR Code
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate("/auth")}
              className="text-primary"
            >
              Voltar para o login
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
