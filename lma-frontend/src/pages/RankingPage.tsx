import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Search, ArrowUp, ArrowDown, Minus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadError } from "@/components/common/LoadError";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buscarJugadores, getClubes } from "@/api/client";
import type { JugadorListado, ClubListado, CategoriaElo } from "@/api/types";
import { cn } from "@/lib/utils";

const tabsConfig: { key: CategoriaElo; label: string }[] = [
  { key: "blitz", label: "Blitz" },
  { key: "rapida", label: "Rápida" },
  { key: "clasica", label: "Clásica" },
];

const PAGE_SIZE = 10;

export function RankingPage() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<CategoriaElo>("blitz");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [clubFiltro, setClubFiltro] = useState("all");

  const [clubes, setClubes] = useState<ClubListado[]>([]);
  const [errorClubes, setErrorClubes] = useState<string | null>(null);
  const [jugadores, setJugadores] = useState<JugadorListado[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [errorVerMas, setErrorVerMas] = useState<string | null>(null);

  const cargarClubes = () => {
    setErrorClubes(null);
    getClubes()
      .then(setClubes)
      .catch(() => setErrorClubes("No se pudieron cargar los clubes para el filtro."));
  };

  useEffect(() => {
    cargarClubes();
  }, []);

  // Debounce del buscador para no disparar un pedido al servidor por cada tecla.
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const cargarPrimeraPagina = () => {
    setLoading(true);
    setError(null);
    buscarJugadores({
      search: searchDebounced,
      idClub: clubFiltro === "all" ? undefined : Number(clubFiltro),
      sortBy: `elo_${categoria}`,
      sortDir: "desc",
      limit: PAGE_SIZE,
      offset: 0,
    })
      .then((r) => {
        setJugadores(r.items);
        setTotal(r.total);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar el ranking."))
      .finally(() => setLoading(false));
  };

  // Cada vez que cambia categoría, búsqueda o club, arrancamos de nuevo desde la página 1.
  useEffect(() => {
    cargarPrimeraPagina();
  }, [categoria, searchDebounced, clubFiltro]);

  const verMas = () => {
    setCargandoMas(true);
    setErrorVerMas(null);
    buscarJugadores({
      search: searchDebounced,
      idClub: clubFiltro === "all" ? undefined : Number(clubFiltro),
      sortBy: `elo_${categoria}`,
      sortDir: "desc",
      limit: PAGE_SIZE,
      offset: jugadores.length,
    })
      .then((r) => {
        setJugadores((prev) => [...prev, ...r.items]);
        setTotal(r.total);
      })
      .catch((e) => setErrorVerMas(e instanceof Error ? e.message : "No se pudieron cargar más jugadores."))
      .finally(() => setCargandoMas(false));
  };

  const clubIdPorNombre = useMemo(() => {
    const map = new Map<string, number>();
    clubes.forEach((c) => map.set(c.nombre, c.id));
    return map;
  }, [clubes]);

  const ranking = useMemo(
    () => jugadores.map((j, i) => ({ ...j, posicion: i + 1 })),
    [jugadores]
  );

  const variacionIcon = (v: number) => {
    if (v > 0) return <span className="flex items-center gap-0.5 text-green-500"><ArrowUp size={14} />+{v}</span>;
    if (v < 0) return <span className="flex items-center gap-0.5 text-red-500"><ArrowDown size={14} />{v}</span>;
    return <span className="flex items-center gap-0.5 text-muted-foreground"><Minus size={14} />0</span>;
  };

  if (loading && jugadores.length === 0) {
    return <p className="text-center text-muted-foreground py-20">Cargando...</p>;
  }

  if (error && jugadores.length === 0) {
    return <LoadError message={error} onRetry={cargarPrimeraPagina} />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ranking"
        subtitle="Clasificación de jugadores de la Liga Mendocina de Ajedrez por modalidad. Filtra por club o busca un jugador para ver su posición."
        icon={<Trophy size={24} />}
      />

      <Tabs value={categoria} onValueChange={(v) => setCategoria(v as CategoriaElo)} className="mb-6">
        <TabsList className="bg-secondary/50">
          {tabsConfig.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-500">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Buscar jugador o club..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={clubFiltro} onValueChange={setClubFiltro}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Filtrar por club" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clubes</SelectItem>
            {clubes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {errorClubes && (
        <button onClick={cargarClubes} className="text-xs text-red-400 hover:text-red-300 underline mb-4 block">
          {errorClubes} Reintentar.
        </button>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-16 text-center">#</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead className="hidden md:table-cell">Club</TableHead>
                <TableHead className="text-center">ELO</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Variación</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Mejor ELO</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((j) => (
                <TableRow
                  key={j.id}
                  onClick={() => navigate(`/jugadores/${j.id}`)}
                  className="cursor-pointer hover:bg-amber-600/5 transition-colors"
                >
                  <TableCell className="text-center font-bold">
                    {j.posicion <= 3 ? (
                      <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-full text-xs", j.posicion === 1 ? "gold-gradient text-black" : "bg-secondary text-amber-500")}>
                        {j.posicion}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{j.posicion}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-amber-500 font-semibold text-sm shrink-0">
                        {j.nombre.charAt(0)}{j.apellido.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{j.nombre} {j.apellido}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const clubId = clubIdPorNombre.get(j.club);
                            if (clubId) navigate(`/clubes/${clubId}`);
                          }}
                          className="text-xs text-muted-foreground md:hidden hover:text-amber-500 transition-colors text-left"
                        >
                          {j.club}
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const clubId = clubIdPorNombre.get(j.club);
                        if (clubId) navigate(`/clubes/${clubId}`);
                      }}
                      className="hover:text-amber-500 transition-colors text-left"
                    >
                      {j.club}
                    </button>
                  </TableCell>
                  <TableCell className="text-center font-bold gold-text text-lg">{j.elo[categoria]}</TableCell>
                  <TableCell className="text-center hidden sm:table-cell">{variacionIcon(j.variacion[categoria])}</TableCell>
                  <TableCell className="text-center hidden sm:table-cell text-muted-foreground">{j.mejorElo[categoria]}</TableCell>
                  <TableCell>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {ranking.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No se encontraron jugadores con los filtros seleccionados.</p>
      )}

      {ranking.length > 0 && ranking.length < total && (
        <div className="flex flex-col items-center gap-2 mt-6">
          <Button variant="outline" onClick={verMas} disabled={cargandoMas}>
            {cargandoMas ? "Cargando..." : `Ver más (${ranking.length} de ${total})`}
          </Button>
          {errorVerMas && <p className="text-sm text-red-400">{errorVerMas}</p>}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Clic sobre cualquier jugador para ver su perfil completo.
      </p>
    </div>
  );
}
