import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bus } from "lucide-react";

export default function PrivacyPolicy() {
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

      <section className="py-16 px-6 bg-gray-50">
        <p>A sua privacidade é importante para nós. É política do <b>TripCheck</b> respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site 
          <a href="https://ui-transportecheckin-app.vercel.app/" target="_blank">TripCheck</a>, e outros sites que possuímos e operamos.</p>
        <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemos isso por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.</p>
        <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>
        <p>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</p>
        <p>O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade.
        </p>
        <p>Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.</p>
        <p>O uso continuado de nosso site será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais. Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contato conosco.</p>      
        <h2><b>Compromisso do Usuário</b></h2>
        <p>O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o TripCheck oferece no site e com caráter enunciativo, mas não limitativo:</p>
        <ul>
          <li>A) Não se envolver em atividades que sejam ilegais ou contrárias à boa fé e à ordem pública;</li>
          <li>B) Não difundir propaganda ou conteúdo de natureza racista, xenofóbica ou qualquer tipo de pornografia ilegal, apologia ao terrorismo ou contra os direitos humanos;</li>
          <li>C) Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do TripCheck, de seus fornecedores ou terceiros, para introduzir ou disseminar vírus informáticos ou quaisquer outros sistemas que possam causar danos.</li>
        </ul>
        <h2><b>Mais Informações</b></h2>
        <p>Esperamos que estas informações estejam claras. Se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.</p>
        <p>Esta política é efetiva a partir de 9 de abril de 2025.</p>
      </section>      

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6 mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bus className="h-6 w-6 text-logo" />
            <h3 className="text-xl font-bold text-logo">TripCheck</h3>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} TripCheck. Todo o conteúdo deste site, incluindo textos, imagens, design e funcionalidades, está protegido por direitos autorais. É proibida a reprodução, distribuição ou uso sem autorização prévia do autor.
          </p>
        </div>
      </footer>
    </div>
  );
}