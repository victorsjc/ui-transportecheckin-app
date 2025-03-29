import { useLocation } from "wouter";
import { Home, Clock, User } from "lucide-react";

interface BottomNavigationProps {
  active: "home" | "history" | "profile";
}

export default function BottomNavigation({ active }: BottomNavigationProps) {
  const [, navigate] = useLocation();
  
  return (
    <nav className="bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex justify-around">
        <button 
          onClick={() => navigate("/dashboard")} 
          className={`flex flex-col items-center ${active === "home" ? "text-primary" : "text-gray-600"}`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Início</span>
        </button>
        
        <button 
          onClick={() => navigate("/history")} 
          className={`flex flex-col items-center ${active === "history" ? "text-primary" : "text-gray-600"}`}
        >
          <Clock className="h-6 w-6" />
          <span className="text-xs mt-1">Histórico</span>
        </button>
        
        <button 
          onClick={() => navigate("/profile")} 
          className={`flex flex-col items-center ${active === "profile" ? "text-primary" : "text-gray-600"}`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </nav>
  );
}
