import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Zap,
  Gauge,
  Hourglass,
  Trophy,
  Medal,
  Award,
  Calendar,
  MapPin,
  Hash,
  Fingerprint,
  CakeSlice,
  User,
  CircleCheck,
  CircleX,
  Minus,
  TrendingUp,
  Percent,
  History,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getJugador } from "@/api/client";
import type { Jugador } from "@/api/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

export function JugadorDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jugador, setJugador] = useState<Jugador | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getJugador(id)
      .then(setJugador)
      .catch(() => setJugador(null));
  }, [id]);

  if (jugador === undefined) {
    return <p className="text-center text-muted-foreground py-20">Cargando...</p>;
  }

  if (!jugador) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Jugador no encontrado.</p>
        <Link to="/jugadores"><Button variant="outline">Volver a Jugadores</Button></Link>
      </div>
    );
  }

  const porcentajeVictorias = jugador.estadisticas.partidas > 0
    ? Math.round((jugador.estadisticas.victorias / jugador.estadisticas.partidas) * 100)
    : 0;

  const eloCards = [
    { icon: Zap, label: "ELO Blitz", value: jugador.elo.blitz, mejor: jugador.mejorElo.blitz, color: "text-amber-500", bg: "bg-amber-600/10" },
    { icon: Gauge, label: "ELO Rápida", value: jugador.elo.rapida, mejor: jugador.mejorElo.rapida, color: "text-violet-400", bg: "bg-violet-600/10" },
    { icon: Hourglass, label: "ELO Clásica", value: jugador.elo.clasica, mejor: jugador.mejorElo.clasica, color: "text-amber-500", bg: "bg-amber-600/10" },
  ];

  const statsCards = [
    { icon: CircleCheck, label: "Victorias", value: jugador.estadisticas.victorias, color: "text-green-500" },
    { icon: CircleX, label: "Derrotas", value: jugador.estadisticas.derrotas, color: "text-red-500" },
    { icon: Minus, label: "Tablas", value: jugador.estadisticas.tablas, color: "text-muted-foreground" },
    { icon: User, label: "Partidas", value: jugador.estadisticas.partidas, color: "text-foreground" },
    { icon: Percent, label: "% Victorias", value: `${porcentajeVictorias}%`, color: "text-amber-500" },
    { icon: TrendingUp, label: "Mejor ELO", value: Math.max(jugador.mejorElo.blitz, jugador.mejorElo.rapida, jugador.mejorElo.clasica), color: "text-violet-400" },
  ];

  const metalColor = (metal: string) => {
    if (metal === "oro") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (metal === "plata") return "bg-zinc-400/20 text-zinc-300 border-zinc-400/30";
    return "bg-orange-700/20 text-orange-400 border-orange-700/30";
  };

  const infoItems = [
    { icon: User, label: "Nombre", value: `${jugador.nombre} ${jugador.apellido}` },
    { icon: MapPin, label: "Club", value: jugador.club, clickable: "club" },
    { icon: Hash, label: "LMA ID", value: jugador.lmaId },
    { icon: Fingerprint, label: "FIDE ID", value: jugador.fideId },
    { icon: CakeSlice, label: "Nacimiento", value: jugador.fechaNacimiento },
    { icon: User, label: "Edad", value: jugador.edad != null ? `${jugador.edad} años` : "—" },
    { icon: CircleCheck, label: "Estado", value: jugador.estado },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/jugadores")}
        className="text-muted-foreground hover:text-amber-500"
      >
        <ArrowLeft size={16} className="mr-1.5" />
        Volver a Jugadores
      </Button>

      {/* ─── HEADER PERFIL ─── */}
      <Card className="overflow-hidden border-amber-600/20">
        <div className="h-2 gold-gradient" />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary text-amber-500 font-bold text-3xl shrink-0">
              {jugador.nombre.charAt(0)}{jugador.apellido.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{jugador.nombre} {jugador.apellido}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <button
                  onClick={() => {
                    if (jugador.id_club) navigate(`/clubes/${jugador.id_club}`);
                  }}
                  className="text-muted-foreground text-sm hover:text-amber-500 transition-colors"
                >
                  {jugador.club}
                </button>
                <Badge variant="outline">{jugador.categoria}</Badge>
                {jugador.estado === "Activo" && <Badge className="bg-green-600/80 text-white">Activo</Badge>}
                {jugador.estado === "Inactivo" && <Badge variant="secondary">Inactivo</Badge>}
                {jugador.estado === "Suspendido" && <Badge className="bg-red-600/80 text-white">Suspendido</Badge>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold gold-text">{jugador.elo.clasica}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">ELO Clásica</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-6 border-t border-border">
            {infoItems.map((item) => (
              <div key={item.label} className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <item.icon size={12} />
                  {item.label}
                </div>
                {item.clickable === "club" ? (
                  <button
                    onClick={() => {
                      if (jugador.id_club) navigate(`/clubes/${jugador.id_club}`);
                    }}
                    className="text-sm font-medium text-amber-500 hover:underline text-left"
                  >
                    {item.value}
                  </button>
                ) : (
                  <p className="text-sm font-medium">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── ELO CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {eloCards.map((c) => (
          <Card key={c.label} className="card-hover">
            <CardContent className="flex items-center gap-4 py-5">
              <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl", c.bg)}>
                <c.icon className={c.color} size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</p>
                <p className={cn("text-3xl font-bold", c.color)}>{c.value}</p>
                <p className="text-xs text-muted-foreground">Mejor: {c.mejor}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── STATS ─── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-amber-500" />
          <h2 className="text-xl font-bold">Estadísticas</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsCards.map((s) => (
            <Card key={s.label} className="card-hover">
              <CardContent className="flex flex-col items-center text-center py-5 gap-1">
                <s.icon className={s.color} size={22} />
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── GRÁFICO EVOLUCIÓN ELO ─── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History size={20} className="text-amber-500" />
          <h2 className="text-xl font-bold">Evolución del ELO</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={jugador.historicoElo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="fecha" stroke="#666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} domain={["dataMin - 50", "dataMax + 50"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#daa520" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="blitz" stroke="#daa520" strokeWidth={2} dot={{ r: 3 }} name="Blitz" />
                <Line type="monotone" dataKey="rapida" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} name="Rápida" />
                <Line type="monotone" dataKey="clasica" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Clásica" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ─── ÚLTIMOS TORNEOS ─── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-amber-500" />
          <h2 className="text-xl font-bold">Últimos Torneos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jugador.torneos.map((t, i) => (
            <Card key={i} className="card-hover">
              <CardContent className="flex items-center gap-3 py-4">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shrink-0",
                  t.posicion === 1 ? "gold-gradient text-black" :
                  (t.posicion ?? 999) <= 3 ? "bg-violet-600/20 text-violet-400" :
                  "bg-secondary text-muted-foreground"
                )}>
                  {t.posicion ?? "—"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{t.nombre}</p>
                  <p className="text-xs text-muted-foreground">{t.fecha} · {t.categoria}</p>
                </div>
                <Badge variant="outline" className="text-xs">Puesto {t.posicion ?? "—"}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── TROFEOS Y MEDALLAS ─── */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-amber-500" />
            <h2 className="text-xl font-bold">Trofeos</h2>
          </div>
          {jugador.trofeos.length > 0 ? (
            <div className="space-y-3">
              {jugador.trofeos.map((t, i) => (
                <Card key={i} className="card-hover">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-600/15 text-amber-500 shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t.nombre}</p>
                      <p className="text-xs text-muted-foreground">{t.torneo} · {t.fecha}</p>
                    </div>
                    <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30">{t.tipo}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin trofeos registrados.</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Medal size={20} className="text-violet-400" />
            <h2 className="text-xl font-bold">Medallas</h2>
          </div>
          {jugador.medallas.length > 0 ? (
            <div className="space-y-3">
              {jugador.medallas.map((m, i) => (
                <Card key={i} className="card-hover-violet">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                      m.metal === "oro" ? "bg-amber-500/15 text-amber-400" :
                      m.metal === "plata" ? "bg-zinc-400/15 text-zinc-300" :
                      "bg-orange-700/15 text-orange-400"
                    )}>
                      <Medal size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{m.nombre}</p>
                      <p className="text-xs text-muted-foreground">{m.torneo} · {m.fecha}</p>
                    </div>
                    <Badge variant="outline" className={cn("capitalize", metalColor(m.metal))}>{m.metal}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin medallas registradas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
