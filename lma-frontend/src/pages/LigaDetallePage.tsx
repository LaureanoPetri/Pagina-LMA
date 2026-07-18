import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Trophy,
  TrendingUp,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLiga, getJugadores, getClubes } from "@/api/client";
import type { Liga, JugadorListado, ClubListado } from "@/api/types";
import { cn } from "@/lib/utils";

export function LigaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [liga, setLiga] = useState<Liga | null | undefined>(undefined);
  const [jugadores, setJugadores] = useState<JugadorListado[]>([]);
  const [clubes, setClubes] = useState<ClubListado[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([getLiga(Number(id)), getJugadores(), getClubes()])
      .then(([l, j, c]) => {
        setLiga(l);
        setJugadores(j);
        setClubes(c);
      })
      .catch(() => setLiga(null));
  }, [id]);

  const jugadorPorId = useMemo(() => {
    const map = new Map<string, JugadorListado>();
    jugadores.forEach((j) => map.set(j.id, j));
    return map;
  }, [jugadores]);

  const clubPorId = useMemo(() => {
    const map = new Map<number, ClubListado>();
    clubes.forEach((c) => map.set(c.id, c));
    return map;
  }, [clubes]);

  if (liga === undefined) {
    return <p className="text-center text-muted-foreground py-20">Cargando...</p>;
  }

  if (!liga) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Liga no encontrada.</p>
        <Link to="/ligas"><Button variant="outline">Volver a Ligas</Button></Link>
      </div>
    );
  }

  const estadoBadge = (estado: string) => {
    if (estado === "En curso") return <Badge className="bg-amber-600 text-black">{estado}</Badge>;
    if (estado === "Próxima") return <Badge className="bg-violet-600 text-white">{estado}</Badge>;
    return <Badge variant="secondary">{estado}</Badge>;
  };

  const infoItems = [
    { icon: Trophy, label: "División", value: liga.division },
    { icon: Calendar, label: "Temporada", value: liga.temporada },
    { icon: Clock, label: "Ritmo", value: liga.ritmo },
    { icon: Users, label: "Equipos", value: String(liga.equipos) },
    { icon: Calendar, label: "Inicio", value: liga.fechaInicio },
    { icon: Calendar, label: "Fin", value: liga.fechaFin },
    { icon: TrendingUp, label: "Rondas", value: String(liga.rondas) },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/ligas")}
        className="text-muted-foreground hover:text-amber-500"
      >
        <ArrowLeft size={16} className="mr-1.5" />
        Volver a Ligas
      </Button>

      {/* HEADER */}
      <Card className="overflow-hidden border-amber-600/20">
        <div className="h-2 gold-gradient" />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{liga.nombre}</h1>
                {estadoBadge(liga.estado)}
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">{liga.descripcion}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-6 border-t border-border">
            {infoItems.map((item) => (
              <div key={item.label} className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <item.icon size={12} />
                  {item.label}
                </div>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs defaultValue="jugadores">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="jugadores" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-500">
            Clasificación Jugadores
          </TabsTrigger>
          <TabsTrigger value="clubes" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-500">
            Clasificación Clubes
          </TabsTrigger>
          <TabsTrigger value="torneos" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-500">
            Torneos
          </TabsTrigger>
          <TabsTrigger value="calendario" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-500">
            Calendario
          </TabsTrigger>
        </TabsList>

        {/* CLASIFICACIÓN JUGADORES */}
        <TabsContent value="jugadores">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Jugador</TableHead>
                    <TableHead className="hidden sm:table-cell">Club</TableHead>
                    <TableHead className="text-center">Puntos</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Partidas</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liga.clasificacionJugadores.map((cj, i) => {
                    const jugador = jugadorPorId.get(cj.jugadorId);
                    if (!jugador) return null;
                    return (
                      <TableRow
                        key={cj.jugadorId}
                        onClick={() => navigate(`/jugadores/${jugador.id}`)}
                        className="cursor-pointer hover:bg-amber-600/5 transition-colors"
                      >
                        <TableCell className="text-center font-bold">
                          {i < 3 ? (
                            <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-full text-xs", i === 0 ? "gold-gradient text-black" : "bg-secondary text-amber-500")}>
                              {i + 1}
                            </span>
                          ) : <span className="text-muted-foreground">{i + 1}</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-amber-500 font-semibold text-xs shrink-0">
                              {jugador.nombre.charAt(0)}{jugador.apellido.charAt(0)}
                            </div>
                            <span className="font-medium">{jugador.nombre} {jugador.apellido}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (jugador.id_club) navigate(`/clubes/${jugador.id_club}`);
                            }}
                            className="hover:text-amber-500 transition-colors text-left"
                          >
                            {jugador.club}
                          </button>
                        </TableCell>
                        <TableCell className="text-center font-bold gold-text text-lg">{cj.puntos}</TableCell>
                        <TableCell className="text-center hidden sm:table-cell text-muted-foreground">{cj.partidas}</TableCell>
                        <TableCell><ChevronRight size={16} className="text-muted-foreground" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLASIFICACIÓN CLUBES */}
        <TabsContent value="clubes">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead className="text-center">PJ</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">PG</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">PE</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">PP</TableHead>
                    <TableHead className="text-center">Puntos</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liga.clasificacionClubes.map((cc, i) => {
                    const club = clubPorId.get(cc.clubId);
                    if (!club) return null;
                    return (
                      <TableRow
                        key={cc.clubId}
                        onClick={() => navigate(`/clubes/${club.id}`)}
                        className="cursor-pointer hover:bg-violet-600/5 transition-colors"
                      >
                        <TableCell className="text-center font-bold">
                          {i < 3 ? (
                            <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-full text-xs", i === 0 ? "violet-gradient text-white" : "bg-secondary text-violet-400")}>
                              {i + 1}
                            </span>
                          ) : <span className="text-muted-foreground">{i + 1}</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0"
                              style={{ backgroundColor: `${club.color}20`, color: club.color }}
                            >
                              {club.nombreCorto.slice(0, 3).toUpperCase()}
                            </div>
                            <span className="font-medium">{club.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{cc.pj}</TableCell>
                        <TableCell className="text-center hidden sm:table-cell text-green-500">{cc.pg}</TableCell>
                        <TableCell className="text-center hidden sm:table-cell text-muted-foreground">{cc.pe}</TableCell>
                        <TableCell className="text-center hidden sm:table-cell text-red-500">{cc.pp}</TableCell>
                        <TableCell className="text-center font-bold text-violet-400 text-lg">{cc.puntos}</TableCell>
                        <TableCell><ChevronRight size={16} className="text-muted-foreground" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TORNEOS */}
        <TabsContent value="torneos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liga.torneos.map((t, i) => (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => navigate(`/torneos/${t.id}`)}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium hover:text-amber-500 transition-colors">{t.nombre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.fecha}</p>
                    {t.estado === "Próximo" && (
                      <Button
                        className="gold-gradient text-black font-semibold hover:opacity-90 mt-2"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (t.linkInscripcion) window.open(t.linkInscripcion, "_blank", "noopener,noreferrer");
                        }}
                      >
                        Inscribirse
                      </Button>
                    )}
                  </div>
                  <Badge variant={t.estado === "En curso" ? "default" : "secondary"}
                    className={t.estado === "En curso" ? "bg-amber-600 text-black" : t.estado === "Próximo" ? "bg-violet-600 text-white" : ""}>
                    {t.estado}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* CALENDARIO */}
        <TabsContent value="calendario">
          <div className="space-y-3">
            {liga.calendario.map((c, i) => (
              <Card key={i} className="card-hover">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-secondary shrink-0">
                    <span className="text-xs text-muted-foreground">R</span>
                    <span className="text-lg font-bold text-amber-500">{c.ronda}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.descripcion}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar size={12} /> {c.fecha}
                    </p>
                  </div>
                  <Building2 size={18} className="text-muted-foreground hidden sm:block" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
