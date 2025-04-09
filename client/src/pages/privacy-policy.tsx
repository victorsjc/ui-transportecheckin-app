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
        <h2><span style="color: rgb(68, 68, 68);">Política Privacidade</span></h2><p><span style="color: rgb(68, 68, 68);">A sua privacidade é importante para nós. É política do TripCheck respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site <a href="https://ui-transportecheckin-app.vercel.app/">TripCheck</a>, e outros sites que possuímos e operamos.</span></p><p><span style="color: rgb(68, 68, 68);">Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.</span></p><p><span style="color: rgb(68, 68, 68);">Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</span></p><p><span style="color: rgb(68, 68, 68);">Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</span></p><p><span style="color: rgb(68, 68, 68);">O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas&nbsp;</span><a href="https://politicaprivacidade.com/" rel="noopener noreferrer" target="_blank" style="background-color: transparent; color: rgb(68, 68, 68);">políticas de privacidade</a><span style="color: rgb(68, 68, 68);">.</span></p><p><span style="color: rgb(68, 68, 68);">Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.</span></p><p><span style="color: rgb(68, 68, 68);">O uso continuado de nosso site será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais. Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contacto connosco.</span></p><p><span style="color: rgb(68, 68, 68);"><ul><li><span style="color: rgb(68, 68, 68);">O serviço Google AdSense que usamos para veicular publicidade usa um cookie DoubleClick para veicular anúncios mais relevantes em toda a Web e limitar o número de vezes que um determinado anúncio é exibido para você.</span></li><li><span style="color: rgb(68, 68, 68);">Para mais informações sobre o Google AdSense, consulte as FAQs oficiais sobre privacidade do Google AdSense.</span></li><li><span style="color: rgb(68, 68, 68);">Utilizamos anúncios para compensar os custos de funcionamento deste site e fornecer financiamento para futuros desenvolvimentos. Os cookies de publicidade comportamental usados ​​por este site foram projetados para garantir que você forneça os anúncios mais relevantes sempre que possível, rastreando anonimamente seus interesses e apresentando coisas semelhantes que possam ser do seu interesse.</span></li><li><span style="color: rgb(68, 68, 68);">Vários parceiros anunciam em nosso nome e os cookies de rastreamento de afiliados simplesmente nos permitem ver se nossos clientes acessaram o site através de um dos sites de nossos parceiros, para que possamos creditá-los adequadamente e, quando aplicável, permitir que nossos parceiros afiliados ofereçam qualquer promoção que pode fornecê-lo para fazer uma compra.</span></li></ul><p><br></p></span></p><h3><span style="color: rgb(68, 68, 68);">Compromisso do Usuário</span></h3><p><span style="color: rgb(68, 68, 68);">O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o TripCheck oferece no site e com caráter enunciativo, mas não limitativo:</span></p><ul><li><span style="color: rgb(68, 68, 68);">A) Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;</span></li><li><span style="color: rgb(68, 68, 68);">B) Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, </span><span style="color: rgb(33, 37, 41);"><a href='https://pixbetoficial.br.com' style='color:inherit !important; text-decoration: none !important; font-size: inherit !important;'>pixbet</a></span><span style="color: rgb(68, 68, 68);"> ou azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</span></li><li><span style="color: rgb(68, 68, 68);">C) Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do TripCheck, de seus fornecedores ou terceiros, para introduzir ou disseminar vírus informáticos ou quaisquer outros sistemas de hardware ou software que sejam capazes de causar danos anteriormente mencionados.</span></li></ul><h3><span style="color: rgb(68, 68, 68);">Mais informações</span></h3><p><span style="color: rgb(68, 68, 68);">Esperemos que esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.</span></p><p><span style="color: rgb(68, 68, 68);">Esta política é efetiva a partir de&nbsp;9 April 2025 01:27</span></p>      
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