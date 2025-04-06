import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface PageHeaderProps {
  title: string;
  backTo?: string;
}

export function PageHeader({ title, backTo }: PageHeaderProps) {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  return (
      <header className="bg-primary text-white p-4 flex items-center justify-between shadow">
      {backTo && (
        <button onClick={() => navigate(backTo)} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}      
        <h1 className="text-xl font-bold text-white">TripCheck</h1>
        <div className="flex items-center">
          <span className="mr-2 text-sm">{user?.name}</span>
          <button 
            onClick={() => logoutMutation.mutate()} 
            className="rounded-full bg-primary-dark p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>
  );
}
