import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import QR scanner dynamically as it uses browser-specific APIs
let QrScanner: any = null;

// This will be resolved when the component mounts in the browser
if (typeof window !== 'undefined') {
  import('qr-scanner').then(module => {
    QrScanner = module.default;
  });
}

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className = "" }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const qrScannerRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!videoRef.current || !QrScanner) return;

    // Create a new QR scanner
    try {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result: any) => {
          if (result && result.data) {
            onScan(result.data);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      // Start the scanner
      qrScannerRef.current.start().then(() => {
        setIsLoading(false);
      }).catch((error: Error) => {
        setHasError(true);
        setErrorMessage('Não foi possível iniciar o scanner de QR code. Verifique se a câmera está disponível.');
        toast({
          title: 'Erro',
          description: 'Não foi possível iniciar o scanner de QR code.',
          variant: 'destructive',
        });
        if (onError) onError(error);
      });
    } catch (error) {
      setHasError(true);
      setErrorMessage('Erro ao inicializar o scanner de QR code.');
      if (onError && error instanceof Error) onError(error);
    }

    // Cleanup function
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, [onScan, onError, toast]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 bg-opacity-50 z-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 p-4 text-center z-10">
          <p className="text-red-500 mb-2">{errorMessage}</p>
          <p className="text-sm text-neutral-600">Certifique-se de que a câmera está ativada e que você deu permissão para o site acessá-la.</p>
        </div>
      )}
      
      <video ref={videoRef} className="w-full h-full"></video>
      
      {!hasError && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-8 h-1 bg-primary"></div>
            <div className="absolute top-0 left-0 w-1 h-8 bg-primary"></div>
            <div className="absolute top-0 right-0 w-8 h-1 bg-primary"></div>
            <div className="absolute top-0 right-0 w-1 h-8 bg-primary"></div>
            <div className="absolute bottom-0 left-0 w-8 h-1 bg-primary"></div>
            <div className="absolute bottom-0 left-0 w-1 h-8 bg-primary"></div>
            <div className="absolute bottom-0 right-0 w-8 h-1 bg-primary"></div>
            <div className="absolute bottom-0 right-0 w-1 h-8 bg-primary"></div>
          </div>
        </div>
      )}
    </div>
  );
}
