import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Search, ChevronRight, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadError } from "@/components/common/LoadError";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLigas } from "@/api/client";
import type { LigaListado } from "@/api/types";

export function LigasPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("all");

  const [ligasData, setLigasData] = useState<LigaListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    setLoading(true);
    setError(null);
    getLigas()
      .then(setLigasData)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar las ligas."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const ligas = useMemo(() => {
    return ligasData.filter((l) => {
      const matchesSearch = l.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesEstado = estadoFiltro === "all" || l.estado === estadoFiltro;
      return matchesSearch && matchesEstado;
    });
  }, [ligasData, search, estadoFiltro]);

  const estadoBadge = (estado: string) => {
    if (estado === "En curso") return <Badge className="bg-amber-600 text-black">{estado}</Badge>;
    if (estado === "Próxima") return <Badge className="bg-violet-600 text-white">{estado}</Badge>;
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
        title="Ligas"
        subtitle="Ligas oficiales de la Liga Mendocina de Ajedrez organizadas por división y temporada. Clic en cualquier liga para ver clasificaciones, torneos, calendario y gráficos."
        icon={<Layers size={24} />}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Buscar liga..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="En curso">En curso</SelectItem>
            <SelectItem value="Próxima">Próxima</SelectItem>
            <SelectItem value="Finalizada">Finalizada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ligas.map((l) => (
          <Card
            key={l.id}
            className="card-hover cursor-pointer"
            onClick={() => navigate(`/ligas/${l.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg leading-snug">{l.nombre}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{l.division}</Badge>
                    <span className="text-xs text-muted-foreground">Temporada {l.temporada}</span>
                  </div>
                </div>
                {estadoBadge(l.estado)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <p className="font-bold text-amber-500">{l.equipos}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Equipos</p>
                </div>
                <div>
                  <p className="font-bold text-violet-400">{l.rondas}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rondas</p>
                </div>
                <div className="flex flex-col items-center">
                  <Clock size={16} className="text-amber-500 mb-0.5" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Ritmo</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 truncate">{l.ritmo}</p>
              <div className="flex items-center justify-end mt-2">
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ligas.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No se encontraron ligas.</p>
      )}
    </div>
  );
}
