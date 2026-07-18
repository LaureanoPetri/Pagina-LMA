import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Users,
  Layers,
  User,
  Award,
  TrendingUp,
  Medal,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Swords,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTorneo, getJugadores } from "@/api/client";
import type { Torneo, JugadorListado } from "@/api/types";
import { cn } from "@/lib/utils";

export function TorneoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [torneo, setTorneo] = useState<Torneo | null | undefined>(undefined);
  const [jugadores, setJugadores] = useState<JugadorListado[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([getTorneo(Number(id)), getJugadores()])
      .then(([t, j]) => {
        setTorneo(t);
        setJugadores(j);
      })
      .catch(() => setTorneo(null));
  }, [id]);

  const jugadorPorId = useMemo(() => {
    const map = new Map<string, JugadorListado>();
    jugadores.forEach((j) => map.set(j.id, j));
    return map;
  }, [jugadores]);

  if (torneo === undefined) {
    return <p className="text-center text-muted-foreground py-20">Cargando...</p>;
  }

  if (!torneo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Torneo no encontrado.</p>
        <Link to="/torneos"><Button variant="outline">Volver a Torneos</Button></Link>
      </div>
    );
  }

  const estadoBadge = (estado: string) => {
    if (estado === "En curso") return <Badge className="bg-amber-600 text-black">{estado}</Badge>;
    if (estado === "Próximo") return <Badge className="bg-violet-600 text-white">{estado}</Badge>;
    return <Badge variant="secondary">{estado}</Badge>;
  };

  const variacionIcon = (v: number) => {
    if (v > 0) return <span className="flex items-center gap-0.5 text-green-500"><ArrowUp size={13} />+{v}</span>;
    if (v < 0) return <span className="flex items-center gap-0.5 text-red-500"><ArrowDown size={13} />{v}</span>;
    return <span className="flex items-center gap-0.5 text-muted-foreground"><Minus size={13} />0</span>;
  };

  const resultadoColor = (r: string) => {
    if (r === "1-0") return "bg-green-600/80 text-white";
    if (r === "0-1") return "bg-red-600/80 text-white";
    return "bg-zinc-600/80 text-white";
  };

  const infoItems = [
    { icon: Calendar, label: "Fecha", value: `${torneo.fecha}${torneo.fechaFin ? ` — ${torneo.fechaFin}` : ""}` },
    { icon: MapPin, label: "Lugar", value: torneo.lugar },
    { icon: User, label: "Organizador", value: torneo.organizador },
    { icon: Award, label: "Árbitro", value: torneo.arbitro },
    { icon: Layers, label: "Sistema", value: torneo.tipo },
    { icon: Users, label: "Jugadores", value: String(torneo.participantes) },
    { icon: Trophy, label: "Rondas", value: String(torneo.rondas) },
    { icon: Clock, label: "Tiempo", value: torneo.ritmo },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/torneos")}
        className="text-muted-foreground hover:text-amber-500"
      >
        <ArrowLeft size={16} className="mr-1.5" />
        Volver a Torneos
      </Button>

      {/* HEADER */}
      <Card className="overflow-hidden border-amber-600/20">
        <div className="h-2 gold-gradient" />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{torneo.nombre}</h1>
                {estadoBadge(torneo.estado)}
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">{torneo.descripcion}</p>
              <button
                onClick={() => navigate(`/ligas/${torneo.ligaId}`)}
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Layers size={14} />
                {torneo.liga}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6 pt-6 border-t border-border">
            {infoItems.map((item) => (
              <div key={item.label} className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <item.icon size={12} />
                  {item.label}
                </div>
                <p className="text-sm font-medium truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PREMIOS Y STATS */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardContent className="py-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} className="text-amber-500" />
              <h2 className="font-semibold">Premios</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{torneo.premios}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-5 gap-1">
            <TrendingUp className="text-violet-400" size={24} />
            <p className="text-3xl font-bold text-violet-400">{torneo.variacionElo > 0 ? `+${torneo.variacionElo}` : torneo.variacionElo}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Variación de ELO</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-5 gap-1">
            <Medal className="text-amber-500" size={24} />
            <p className="text-3xl font-bold gold-text">{torneo.puntosEntregados}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Puntos Entregados</p>
          </CardContent>
        </Card>
      </div>

      {/* GANADOR */}
      {torneo.ganador && (
        <Card className="border-amber-600/30">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-full gold-gradient text-black shrink-0">
              <Trophy size={28} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Ganador</p>
              <button
                onClick={() => navigate(`/jugadores/${torneo.ganador!.jugadorId}`)}
                className="text-xl font-bold gold-text hover:underline text-left"
              >
                {torneo.ganador.nombre}
              </button>
            </div>
            <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30">Campeón</Badge>
          </CardContent>
        </Card>
      )}

      {/* TABLA FINAL */}
      {torneo.tablaFinal.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-amber-500" />
            <h2 className="text-xl font-bold">Tabla Final</h2>
          </div>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Jugador</TableHead>
                    <TableHead className="hidden sm:table-cell">Club</TableHead>
                    <TableHead className="text-center">Puntos</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Variación ELO</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {torneo.tablaFinal.map((tf) => {
                    const jugador = jugadorPorId.get(tf.jugadorId);
                    if (!jugador) return null;
                    return (
                      <TableRow
                        key={tf.jugadorId}
                        onClick={() => navigate(`/jugadores/${jugador.id}`)}
                        className="cursor-pointer hover:bg-amber-600/5 transition-colors"
                      >
                        <TableCell className="text-center font-bold">
                          {(tf.posicion ?? 999) <= 3 ? (
                            <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-full text-xs", tf.posicion === 1 ? "gold-gradient text-black" : "bg-secondary text-amber-500")}>
                              {tf.posicion}
                            </span>
                          ) : <span className="text-muted-foreground">{tf.posicion}</span>}
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
                        <TableCell className="text-center font-bold gold-text text-lg">{tf.puntos}</TableCell>
                        <TableCell className="text-center hidden sm:table-cell">{variacionIcon(tf.variacion)}</TableCell>
                        <TableCell><ChevronRight size={16} className="text-muted-foreground" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground mt-3">Clic sobre cualquier jugador para ver su perfil completo.</p>
        </div>
      )}

      {/* RONDAS JUGADAS */}
      {torneo.rondasJugadas.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Swords size={20} className="text-amber-500" />
            <h2 className="text-xl font-bold">Rondas Jugadas</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {torneo.rondasJugadas.map((ronda) => (
              <AccordionItem key={ronda.numero} value={`ronda-${ronda.numero}`} className="border border-border rounded-lg overflow-hidden bg-card">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-amber-600/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-amber-500 font-bold text-sm">
                      R{ronda.numero}
                    </span>
                    <div className="text-left">
                      <p className="font-medium text-sm">Ronda {ronda.numero}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={11} /> {ronda.fecha}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {ronda.partidas.map((partida, pi) => {
                      const blancas = partida.blancasId ? jugadorPorId.get(partida.blancasId) : undefined;
                      const negras = partida.negrasId ? jugadorPorId.get(partida.negrasId) : undefined;
                      if (!blancas || !negras) return null;
                      return (
                        <div key={pi} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          {/* Blancas */}
                          <button
                            onClick={() => navigate(`/jugadores/${blancas.id}`)}
                            className="flex items-center gap-2 flex-1 min-w-0 hover:text-amber-500 transition-colors text-left"
                          >
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-amber-500 font-semibold text-[10px] shrink-0">
                              {blancas.nombre.charAt(0)}{blancas.apellido.charAt(0)}
                            </div>
                            <span className="text-sm font-medium truncate">{blancas.nombre} {blancas.apellido}</span>
                            <span className="w-3 h-3 rounded-full bg-white border border-zinc-300 shrink-0" title="Blancas" />
                          </button>
                          {/* Resultado */}
                          <Badge className={cn("shrink-0 font-mono text-xs", resultadoColor(partida.resultado))}>
                            {partida.resultado}
                          </Badge>
                          {/* Negras */}
                          <button
                            onClick={() => navigate(`/jugadores/${negras.id}`)}
                            className="flex items-center gap-2 flex-1 min-w-0 justify-end hover:text-amber-500 transition-colors text-right"
                          >
                            <span className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-600 shrink-0" title="Negras" />
                            <span className="text-sm font-medium truncate">{negras.nombre} {negras.apellido}</span>
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-amber-500 font-semibold text-[10px] shrink-0">
                              {negras.nombre.charAt(0)}{negras.apellido.charAt(0)}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* MENSAJE SI NO HAY TABLA NI RONDAS */}
      {torneo.tablaFinal.length === 0 && torneo.rondasJugadas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">El torneo aún no ha comenzado. La tabla y las rondas se mostrarán cuando se dispute.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
