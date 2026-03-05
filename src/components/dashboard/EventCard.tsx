import { Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  title: string;
  subtitle?: string;
  image: string;
  variant?: "primary" | "secondary" | "tertiary";
  onDelete?: () => void;
  onEdit?: () => void;
}

export function EventCard({ title, subtitle, image, variant = "primary", onDelete, onEdit }: EventCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl group cursor-pointer shadow-soft hover:shadow-havel transition-all duration-300">
      <div className="absolute top-2 right-2 z-30 flex gap-2">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 bg-blue-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 active:scale-95"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 active:scale-95"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <img
        src={image}
        alt={title}
        className="w-full h-28 object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Dynamic Overlay based on variant */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-300",
        variant === 'primary' ? "bg-gradient-to-r from-navy/90 via-navy/40 to-transparent" :
          variant === 'secondary' ? "bg-gradient-to-r from-black/80 via-black/30 to-transparent" :
            "bg-gradient-to-t from-navy/90 via-navy/50 to-transparent"
      )} />

      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-center px-4 py-1.5",
          variant === "secondary" && "items-start",
        )}
      >
        <div className={cn(
          "relative",
          (variant === 'primary' || variant === 'tertiary') && "pl-5 border-l-[3px]",
          variant === 'primary' && "border-blue-400",
          variant === 'tertiary' && "border-cyan-400",
          variant === 'secondary' && "border-[3px] border-[#00C49F] p-4 rounded-xl bg-black/20 backdrop-blur-[1px]",
        )}>
          {subtitle && (
            <p className="text-xs text-white/90 uppercase tracking-[0.2em] font-bold mb-1">
              {subtitle}
            </p>
          )}
          <h3 className={cn(
            "font-extrabold text-white leading-[1.1] uppercase whitespace-pre-line",
            title.length > 50 ? "text-xs" : "text-lg"
          )}>
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}