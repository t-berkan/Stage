import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WelcomePanelProps {
  onClose?: () => void;
}

export function WelcomePanel({ onClose }: WelcomePanelProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 relative shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] transition-all duration-300 border-none">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="w-4 h-4 text-gray-400 hover:text-navy" />
      </button>

      <h3 className="font-bold text-navy text-lg pr-8 leading-snug">
        Bienvenue à Rennes School of Business !
      </h3>
      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        Nous sommes ravis de vous accueillir dans cet espace dédié à votre réussite académique et personnelle...
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          className="text-[10px] font-bold text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-navy h-8 rounded-lg px-3"
          onClick={() => window.open('https://www.rennes-sb.fr/decouvrir-rennes-sb/le-campus/', '_blank')}
        >
          Plan du campus
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-[10px] font-bold text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-navy h-8 rounded-lg px-3"
          onClick={() => navigate('/help')}
        >
          Services de l'école
        </Button>
      </div>
    </div>
  );
}