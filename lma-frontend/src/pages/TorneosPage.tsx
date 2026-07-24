import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Search, MapPin, Clock, Calendar, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadError } from "@/components/common/LoadError";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTorneos } from "@/api/client";
import type { TorneoListado } from "@/api/types";

export function TorneosPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("all");

  const [torneosData, setTorneosData] = useState<TorneoListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    setLoading(true);
    setError(null);
    getTorneos()
      .then(setTorneosData)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar los torneos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const torneos = useMemo(() => {
    return torneosData.filter((t) => {
      const matchesSearch = t.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesEstado = estadoFiltro === "all" || t.estado === estadoFiltro;
      return matchesSearch && matchesEstado;
    });
  }, [torneosData, search, estadoFiltro]);

  const estadoBadge = (estado: string) => {
    if (estado === "En curso") return <Badge className="bg-amber-600 text-black">{estado}</Badge>;
    if (estado === "Próximo") return <Badge className="bg-violet-600 text-white">{estado}</Badge>;
    return <Badge variant="secondary">{estado}</Badge>;
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-20">Cargando...</p>;
  }

  if (error) {
    return <LoadError message={error} onRetry={cargar} />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Torneos"
        subtitle="Calendario de torneos de la Liga Mendocina de Ajedrez. Clic en cualquier torneo para ver resultados, tabla final, ganador y estadísticas."
        icon={<Trophy size={24} />}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Buscar torneo..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Próximo">Próximo</SelectItem>
            <SelectItem value="En curso">En curso</SelectItem>
            <SelectItem value="Finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {torneos.map((t) => (
          <Card
            key={t.id}
            className="card-hover cursor-pointer"
            onClick={() => navigate(`/torneos/${t.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-lg leading-snug">{t.nombre}</h3>
                {estadoBadge(t.estado)}
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-amber-500 shrink-0" />
                  {t.fecha}{t.fechaFin && ` — ${t.fechaFin}`}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-amber-500 shrink-0" />
                  {t.lugar}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-500 shrink-0" />
                  {t.ritmo}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <div className="flex gap-3 text-xs">
                  <span className="text-muted-foreground">{t.participantes} jugadores</span>
                  <span className="text-muted-foreground">{t.rondas} rondas</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
              {t.estado === "Próximo" && (
                <Button
                  className="w-full gold-gradient text-black font-semibold hover:opacity-90 mt-3"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (t.linkInscripcion) window.open(t.linkInscripcion, "_blank", "noopener,noreferrer");
                  }}
                >
                  Inscribirse
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {torneos.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No se encontraron torneos.</p>
      )}
    </div>
  );
}
