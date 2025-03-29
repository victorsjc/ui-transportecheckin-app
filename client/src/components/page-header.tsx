import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backTo?: string;
}

export function PageHeader({ title, backTo }: PageHeaderProps) {
  const [, navigate] = useLocation();
  
  return (
    <header className="bg-primary text-white p-4 flex items-center shadow">
      {backTo && (
        <button onClick={() => navigate(backTo)} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}
