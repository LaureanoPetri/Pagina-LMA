import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, ChevronUp, ChevronDown, ArrowUpDown, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getJugadores, getClubes } from "@/api/client";
import type { JugadorListado, ClubListado } from "@/api/types";

type SortKey = "nombre" | "club" | "eloClasica" | "eloRapida" | "eloBlitz";

export function JugadoresPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [clubFiltro, setClubFiltro] = useState("all");
  const [categoriaFiltro, setCategoriaFiltro] = useState("all");
  const [estadoFiltro, setEstadoFiltro] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("nombre");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [jugadoresData, setJugadoresData] = useState<JugadorListado[]>([]);
  const [clubes, setClubes] = useState<ClubListado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJugadores(), getClubes()])
      .then(([j, c]) => {
        setJugadoresData(j);
        setClubes(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const clubIdPorNombre = useMemo(() => {
    const map = new Map<string, number>();
    clubes.forEach((c) => map.set(c.nombre, c.id));
    return map;
  }, [clubes]);

  const clubesNombres = useMemo(() => [...new Set(jugadoresData.map((j) => j.club))].sort(), [jugadoresData]);

  const jugadores = useMemo(() => {
    let result = jugadoresData.filter((j) => {
      const fullName = `${j.nombre} ${j.apellido}`.toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase()) || j.club.toLowerCase().includes(search.toLowerCase());
      const matchesClub = clubFiltro === "all" || j.club === clubFiltro;
      const matchesCat = categoriaFiltro === "all" || j.categoria === categoriaFiltro;
      const matchesEstado = estadoFiltro === "all" || j.estado === estadoFiltro;
      return matchesSearch && matchesClub && matchesCat && matchesEstado;
    });

    const getVal = (j: JugadorListado, key: SortKey) => {
      switch (key) {
        case "nombre": return `${j.nombre} ${j.apellido}`;
        case "club": return j.club;
        case "eloClasica": return j.elo.clasica;
        case "eloRapida": return j.elo.rapida;
        case "eloBlitz": return j.elo.blitz;
      }
    };

    result = [...result].sort((a, b) => {
      const va = getVal(a, sortKey);
      const vb = getVal(b, sortKey);
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });

    return result;
  }, [jugadoresData, search, clubFiltro, categoriaFiltro, estadoFiltro, sortKey, sortDir]);

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

  if (loading) {
    return <p className="text-center text-muted-foreground py-20">Cargando...</p>;
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
            {clubesNombres.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
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

      <p className="text-xs text-muted-foreground mt-4">
        Clic sobre cualquier jugador para ver su perfil completo.
      </p>
    </div>
  );
}
