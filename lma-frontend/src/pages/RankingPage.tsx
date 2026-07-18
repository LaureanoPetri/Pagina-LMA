import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Search, ArrowUp, ArrowDown, Minus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getJugadores, getClubes } from "@/api/client";
import type { JugadorListado, ClubListado, CategoriaElo } from "@/api/types";
import { cn } from "@/lib/utils";

const tabsConfig: { key: CategoriaElo; label: string }[] = [
  { key: "blitz", label: "Blitz" },
  { key: "rapida", label: "Rápida" },
  { key: "clasica", label: "Clásica" },
];

export function RankingPage() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<CategoriaElo>("blitz");
  const [search, setSearch] = useState("");
  const [clubFiltro, setClubFiltro] = useState("all");

  const [jugadores, setJugadores] = useState<JugadorListado[]>([]);
  const [clubes, setClubes] = useState<ClubListado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJugadores(), getClubes()])
      .then(([j, c]) => {
        setJugadores(j);
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

  const clubesNombres = useMemo(() => [...new Set(jugadores.map((j) => j.club))].sort(), [jugadores]);

  const ranking = useMemo(() => {
    return jugadores
      .filter((j) => {
        const fullName = `${j.nombre} ${j.apellido}`.toLowerCase();
        const matchesSearch = fullName.includes(search.toLowerCase()) || j.club.toLowerCase().includes(search.toLowerCase());
        const matchesClub = clubFiltro === "all" || j.club === clubFiltro;
        return matchesSearch && matchesClub;
      })
      .sort((a, b) => b.elo[categoria] - a.elo[categoria])
      .map((j, i) => ({ ...j, posicion: i + 1 }));
  }, [jugadores, categoria, search, clubFiltro]);

  const variacionIcon = (v: number) => {
    if (v > 0) return <span className="flex items-center gap-0.5 text-green-500"><ArrowUp size={14} />+{v}</span>;
    if (v < 0) return <span className="flex items-center gap-0.5 text-red-500"><ArrowDown size={14} />{v}</span>;
    return <span className="flex items-center gap-0.5 text-muted-foreground"><Minus size={14} />0</span>;
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-20">Cargando...</p>;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ranking"
        subtitle="Clasificación oficial de jugadores de la Liga Mendocina de Ajedrez por modalidad. Filtra por club o busca un jugador para ver su posición."
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
            {clubesNombres.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      <p className="text-xs text-muted-foreground mt-4">
        Clic sobre cualquier jugador para ver su perfil completo.
      </p>
    </div>
  );
}
