import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadErrorProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Mensaje de error para cuando falla la carga de datos desde el backend.
 * Antes muchas pantallas hacían `.catch(() => {})` y el usuario se quedaba
 * mirando una lista vacía sin saber si no había datos o si el servidor
 * falló (típicamente porque Render estaba "despertando"). Esto lo deja
 * visible y da la opción de reintentar sin recargar toda la página.
 */
export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="text-red-400" size={28} />
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RotateCw size={14} />
          Reintentar
        </Button>
      )}
    </div>
  );
}
