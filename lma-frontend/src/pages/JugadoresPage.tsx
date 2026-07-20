import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, ChevronUp, ChevronDown, ArrowUpDown, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadError } from "@/components/common/LoadError";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buscarJugadores, getClubes } from "@/api/client";
import type { JugadorListado, ClubListado } from "@/api/types";

type SortKey = "nombre" | "club" | "eloClasica" | "eloRapida" | "eloBlitz";

const SORT_BY_BACKEND: Record<SortKey, string> = {
  nombre: "nombre",
  club: "club",
  eloClasica: "elo_clasica",
  eloRapida: "elo_rapida",
  eloBlitz: "elo_blitz",
};

const PAGE_SIZE = 10;

export function JugadoresPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [clubFiltro, setClubFiltro] = useState("all");
  const [categoriaFiltro, setCategoriaFiltro] = useState("all");
  const [estadoFiltro, setEstadoFiltro] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("nombre");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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

  const parametrosBusqueda = useMemo(
    () => ({
      search: searchDebounced,
      idClub: clubFiltro === "all" ? undefined : Number(clubFiltro),
      categoria: categoriaFiltro === "all" ? undefined : categoriaFiltro,
      estado: estadoFiltro === "all" ? undefined : estadoFiltro,
      sortBy: SORT_BY_BACKEND[sortKey],
      sortDir,
    }),
    [searchDebounced, clubFiltro, categoriaFiltro, estadoFiltro, sortKey, sortDir]
  );

  const cargarPrimeraPagina = () => {
    setLoading(true);
    setError(null);
    buscarJugadores({ ...parametrosBusqueda, limit: PAGE_SIZE, offset: 0 })
      .then((r) => {
        setJugadores(r.items);
        setTotal(r.total);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar los jugadores."))
      .finally(() => setLoading(false));
  };

  // Cada vez que cambia algún filtro/orden, arrancamos de nuevo desde la página 1.
  useEffect(() => {
    cargarPrimeraPagina();
  }, [parametrosBusqueda]);

  const verMas = () => {
    setCargandoMas(true);
    setErrorVerMas(null);
    buscarJugadores({ ...parametrosBusqueda, limit: PAGE_SIZE, offset: jugadores.length })
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

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ active }: { active: boolean }) => {
    if (!active) return <ArrowUpDown size={13} className="text-muted-foreground/40" />;
    return sortDir === "asc" ? <ChevronUp size={13} className="text-amber-500" /> : <ChevronDown size={13} className="text-amber-500" />;
  };

  const estadoBadge = (estado: string) => {
    if (estado === "Activo") return <Badge className="bg-green-600/80 text-white">Activo</Badge>;
    if (estado === "Inactivo") return <Badge variant="secondary">Inactivo</Badge>;
    return <Badge className="bg-red-600/80 text-white">Suspendido</Badge>;
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
        title="Jugadores"
        subtitle="Registro completo de jugadores de la Liga Mendocina de Ajedrez. Usa los filtros y el ordenamiento para encontrar jugadores por club, categoría o ELO."
        icon={<Users size={24} />}
      />

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
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
          <SelectTrigger className="w-full lg:w-48"><SelectValue placeholder="Club" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clubes</SelectItem>
            {clubes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
        {errorClubes && (
          <button
            onClick={cargarClubes}
            className="text-xs text-red-400 hover:text-red-300 underline text-left lg:self-center"
          >
            {errorClubes} Reintentar.
          </button>
        )}
        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Primera">Primera</SelectItem>
            <SelectItem value="Segunda">Segunda</SelectItem>
            <SelectItem value="Tercera">Tercera</SelectItem>
            <SelectItem value="Sub-18">Sub-18</SelectItem>
          </SelectContent>
        </Select>
        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Inactivo">Inactivo</SelectItem>
            <SelectItem value="Suspendido">Suspendido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>
                  <button onClick={() => toggleSort("nombre")} className="flex items-center gap-1.5 hover:text-amber-500 transition-colors">
                    Jugador <SortIcon active={sortKey === "nombre"} />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <button onClick={() => toggleSort("club")} className="flex items-center gap-1.5 hover:text-amber-500 transition-colors">
                    Club <SortIcon active={sortKey === "club"} />
                  </button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Categoría</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="text-center">
                  <button onClick={() => toggleSort("eloBlitz")} className="flex items-center gap-1.5 hover:text-amber-500 transition-colors mx-auto">
                    Blitz <SortIcon active={sortKey === "eloBlitz"} />
                  </button>
                </TableHead>
                <TableHead className="text-center">
                  <button onClick={() => toggleSort("eloRapida")} className="flex items-center gap-1.5 hover:text-amber-500 transition-colors mx-auto">
                    Rápida <SortIcon active={sortKey === "eloRapida"} />
                  </button>
                </TableHead>
                <TableHead className="text-center">
                  <button onClick={() => toggleSort("eloClasica")} className="flex items-center gap-1.5 hover:text-amber-500 transition-colors mx-auto">
                    Clásica <SortIcon active={sortKey === "eloClasica"} />
                  </button>
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jugadores.map((j) => (
                <TableRow
                  key={j.id}
                  onClick={() => navigate(`/jugadores/${j.id}`)}
                  className="cursor-pointer hover:bg-amber-600/5 transition-colors"
                >
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
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="text-xs">{j.categoria}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{estadoBadge(j.estado)}</TableCell>
                  <TableCell className="text-center font-semibold text-amber-500">{j.elo.blitz}</TableCell>
                  <TableCell className="text-center font-semibold text-amber-500">{j.elo.rapida}</TableCell>
                  <TableCell className="text-center font-semibold text-amber-500">{j.elo.clasica}</TableCell>
                  <TableCell><ChevronRight size={16} className="text-muted-foreground" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {jugadores.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No se encontraron jugadores con los filtros seleccionados.</p>
      )}

      {jugadores.length > 0 && jugadores.length < total && (
        <div className="flex flex-col items-center gap-2 mt-6">
          <Button variant="outline" onClick={verMas} disabled={cargandoMas}>
            {cargandoMas ? "Cargando..." : `Ver más (${jugadores.length} de ${total})`}
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
