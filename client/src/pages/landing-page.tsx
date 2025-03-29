import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bus, CheckCircle, Calendar, Clock, Users } from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary-custom text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bus className="h-8 w-8 text-logo" />
          <h1 className="text-2xl font-bold text-logo">TripCheck</h1>
        </div>
        <Button 
          onClick={() => navigate("/auth")}
          variant="outline" 
          className="btn-auth text-white hover:bg-opacity-90"
        >
          Entrar
        </Button>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-custom to-primary-custom/80 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-title">
            Gerenciamento de Check-in para Transporte Privativo
          </h2>
          <p className="text-lg mb-8 text-description">
            Simplifique o processo de check-in, acompanhe seus deslocamentos e organize suas viagens
            com facilidade e segurança.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/auth")}
              size="lg"
              className="btn-primary hover:opacity-90"
            >
              Cadastre-se
            </Button>
            <Button 
              onClick={() => navigate("/qr-scanner")}
              variant="outline" 
              size="lg"
              className="btn-primary border-white hover:opacity-90"
            >
              Check-in Avulso
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-title">
            Recursos do Sistema
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-primary-custom/10 p-3 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-title" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-title">Check-in Simplificado</h3>
              <p className="text-gray-600">
                Realize check-ins rápidos e fáceis para suas viagens, escolhendo direção e horário de retorno quando necessário.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-primary-custom/10 p-3 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-title" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-title">Gerenciamento de Férias</h3>
              <p className="text-gray-600">
                Mensalistas podem programar períodos de férias, garantindo que seu assento fique disponível para outros passageiros.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-primary-custom/10 p-3 rounded-full mb-4">
                <Clock className="h-8 w-8 text-title" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-title">Histórico Completo</h3>
              <p className="text-gray-600">
                Acompanhe seu histórico de viagens e check-ins realizados, facilitando o controle e a prestação de contas.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-primary-custom/10 p-3 rounded-full mb-4">
                <Users className="h-8 w-8 text-title" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-title">Tipos de Usuário</h3>
              <p className="text-gray-600">
                Atendendo mensalistas e passageiros avulsos com funcionalidades específicas para cada tipo de usuário.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-title">
            Como Funciona
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-title">Para Mensalistas</h3>
              <ol className="space-y-4 text-gray-700">
                <li className="flex gap-3">
                  <span className="bg-primary-custom text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">1</span>
                  <span>Realize login com seu e-mail e senha</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary-custom text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">2</span>
                  <span>Faça check-in selecionando direção (ida/retorno)</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary-custom text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">3</span>
                  <span>Para viagens de retorno, escolha o horário desejado</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary-custom text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">4</span>
                  <span>Gerencie períodos de férias para liberar seu assento</span>
                </li>
              </ol>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-title">Para Passageiros Avulsos</h3>
              <ol className="space-y-4 text-gray-700">
                <li className="flex gap-3">
                  <span className="bg-primary-custom text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">1</span>
                  <span>Escaneie o QR code fornecido pela empresa de transporte</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary-custom text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">2</span>
                  <span>Preencha seus dados pessoais (nome completo e CPF)</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary-custom text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">3</span>
                  <span>Realize o check-in para a viagem específica</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary-custom text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">4</span>
                  <span>Receba a confirmação da sua reserva</span>
                </li>
              </ol>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => navigate("/auth")}
              size="lg"
              className="btn-primary hover:opacity-90"
            >
              Comece a Usar Agora
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6 mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bus className="h-6 w-6 text-logo" />
            <h3 className="text-xl font-bold text-logo">TripCheck</h3>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} TripCheck. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}