import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Search, MapPin, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadError } from "@/components/common/LoadError";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClubes } from "@/api/client";
import type { ClubListado } from "@/api/types";

function ClubLogo({ club, size = 48 }: { club: ClubListado; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl font-bold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: `${club.color}20`,
        border: `1px solid ${club.color}40`,
        color: club.color,
        fontSize: size * 0.35,
      }}
    >
      {club.nombreCorto.slice(0, 3).toUpperCase()}
    </div>
  );
}

export { ClubLogo };

export function ClubesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deptoFiltro, setDeptoFiltro] = useState("all");

  const [clubesData, setClubesData] = useState<ClubListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    setLoading(true);
    setError(null);
    getClubes()
      .then(setClubesData)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar los clubes."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const departamentos = useMemo(
    () => [...new Set(clubesData.map((c) => c.departamento).filter(Boolean))].sort(),
    [clubesData]
  );

  const clubes = useMemo(() => {
    return clubesData
      .filter((c) => {
        const matchesSearch = c.nombre.toLowerCase().includes(search.toLowerCase());
        const matchesDepto = deptoFiltro === "all" || c.departamento === deptoFiltro;
        return matchesSearch && matchesDepto;
      })
      .sort((a, b) => b.puntos - a.puntos);
  }, [clubesData, search, deptoFiltro]);

  if (loading) {
    return <p className="text-center text-muted-foreground py-20">Cargando...</p>;
  }

  if (error) {
    return <LoadError message={error} onRetry={cargar} />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Clubes"
        subtitle="Directorio de clubes afiliados a la Liga Mendocina de Ajedrez. Clic en cualquier club para ver su perfil completo, roster de jugadores y palmarés."
        icon={<Building2 size={24} />}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Buscar club..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={deptoFiltro} onValueChange={setDeptoFiltro}>
          <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Departamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departamentos.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubes.map((c) => (
          <Card
            key={c.id}
            className="card-hover cursor-pointer"
            onClick={() => navigate(`/clubes/${c.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <ClubLogo club={c} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-snug">{c.nombre}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {c.departamento}, {c.provincia}
                  </p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-amber-500">{c.miembros}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Jugadores</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-violet-400">{c.puntos}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Puntos</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-500">{c.campeonatos}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Títulos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clubes.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No se encontraron clubes.</p>
      )}
    </div>
  );
}
