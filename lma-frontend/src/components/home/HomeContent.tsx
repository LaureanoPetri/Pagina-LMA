import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Building2,
  Crown,
  Calendar,
  ArrowRight,
  Newspaper,
  Clock,
  MapPin,
  TrendingUp,
  Layers,
  ChevronRight,
  Medal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/common/Logo";
import type {
  Noticia,
  JugadorListado,
  ClubListado,
  TorneoListado,
  EstadisticasGlobales,
} from "@/api/types";

interface HomeContentProps {
  noticias: Noticia[];
  jugadores: JugadorListado[];
  clubes: ClubListado[];
  torneos: TorneoListado[];
  stats: EstadisticasGlobales;
}

/**
 * Segunda sección de la landing: es el Home de siempre, con toda su
 * funcionalidad intacta (próximo torneo, estadísticas, noticias, tops y
 * próximos torneos). Recibe los datos ya cargados desde InicioPage.
 */
export function HomeContent({ noticias, jugadores, clubes, torneos, stats }: HomeContentProps) {
  const navigate = useNavigate();

  const hayTorneoProximo = torneos.some((t) => t.estado === "Próximo");
  const proximoTorneo =
    torneos.find((t) => t.estado === "Próximo") ??
    torneos.slice().sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""))[0];

  if (!proximoTorneo) {
    return <p className="text-center text-muted-foreground py-20">Todavía no hay torneos cargados.</p>;
  }

  const top3Jugadores = jugadores
    .slice()
    .sort((a, b) => b.elo.clasica - a.elo.clasica)
    .slice(0, 3);
  const top3Clubes = clubes
    .slice()
    .sort((a, b) => b.torneosGanados - a.torneosGanados)
    .slice(0, 3);
  const proximosTorneos = torneos.filter((t) => t.estado !== "Finalizado");

  const statCards = [
    { icon: Users, label: "Jugadores", value: stats.jugadores, color: "text-amber-500", bg: "bg-amber-600/10" },
    { icon: Building2, label: "Clubes", value: stats.clubes, color: "text-violet-400", bg: "bg-violet-600/10" },
    { icon: Layers, label: "Ligas", value: stats.ligas, color: "text-amber-500", bg: "bg-amber-600/10" },
    { icon: Trophy, label: "Torneos", value: stats.torneos, color: "text-violet-400", bg: "bg-violet-600/10" },
  ];

  return (
    <div className="space-y-14">
      {/* ─── PRÓXIMO TORNEO DESTACADO ─── */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-600/20 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #daa520 0%, transparent 40%), radial-gradient(circle at 20% 80%, #7c3aed 0%, transparent 40%)" }} />
        <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />

        <div className="relative grid lg:grid-cols-2 gap-8 p-6 md:p-10 lg:p-14">
          <div className="flex flex-col justify-center gap-5">
            <div className="flex items-center gap-2">
              <Badge className="violet-gradient text-white border-0">
                {hayTorneoProximo ? "Próximo Torneo" : "Último Torneo"}
              </Badge>
              <span className="text-xs text-muted-foreground">Temporada {stats.temporadaActual}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <span className="gold-text">{proximoTorneo.nombre}</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed">
              {proximoTorneo.descripcion}
            </p>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5">
                <Layers size={16} className="text-amber-500 shrink-0" />
                <span className="text-muted-foreground">Liga:</span>
                <span className="text-foreground font-medium">{proximoTorneo.liga}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar size={16} className="text-amber-500 shrink-0" />
                <span className="text-muted-foreground">Fecha:</span>
                <span className="text-foreground font-medium">
                  {proximoTorneo.fecha} {proximoTorneo.fechaFin && `— ${proximoTorneo.fechaFin}`}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-amber-500 shrink-0" />
                <span className="text-muted-foreground">Ritmo:</span>
                <span className="text-foreground font-medium">{proximoTorneo.ritmo}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-amber-500 shrink-0" />
                <span className="text-muted-foreground">Sede:</span>
                <span className="text-foreground font-medium">{proximoTorneo.lugar}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {hayTorneoProximo && (
                <Button className="gold-gradient text-black font-semibold hover:opacity-90" onClick={() => navigate(`/torneos/${proximoTorneo.id}`)}>
                  Inscribirse
                  <ArrowRight size={16} className="ml-1.5" />
                </Button>
              )}
              <Link to={`/torneos/${proximoTorneo.id}`}>
                <Button
                  variant={hayTorneoProximo ? "outline" : undefined}
                  className={
                    hayTorneoProximo
                      ? "border-violet-600/40 text-violet-300 hover:bg-violet-600/10 hover:text-violet-200"
                      : "gold-gradient text-black font-semibold hover:opacity-90"
                  }
                >
                  {hayTorneoProximo ? "Ver torneo" : "Ver resultados"}
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-20 violet-gradient rounded-full" />
              <div className="relative flex flex-col items-center gap-4">
                <Logo size="lg" showText={false} />
                <div className="text-center">
                  <p className="text-2xl font-bold gold-text">Liga Mendocina</p>
                  <p className="text-sm text-muted-foreground">de Ajedrez</p>
                </div>
                <div className="flex gap-6 mt-2">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-500">{proximoTorneo.rondas}</p>
                    <p className="text-xs text-muted-foreground">Rondas</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-violet-400">{proximoTorneo.participantes}</p>
                    <p className="text-xs text-muted-foreground">Jugadores</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-500">{proximoTorneo.tipo}</p>
                    <p className="text-xs text-muted-foreground mt-1">Sistema</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD DE ESTADÍSTICAS ─── */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="card-hover">
              <CardContent className="flex items-center gap-4 py-5">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${s.bg}`}>
                  <s.icon className={s.color} size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── ÚLTIMAS NOTICIAS ─── */}
      {noticias.length > 0 && (
        <section>
          <SectionHeader icon={<Newspaper size={22} />} title="Últimas Noticias" link="/torneos" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {noticias.map((n) => (
              <Card key={n.id} className="card-hover flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="text-xs">{n.categoria}</Badge>
                    <span className="text-xs text-muted-foreground">{n.fecha}</span>
                  </div>
                  <CardTitle className="text-base leading-snug">{n.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">{n.resumen}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ─── TOP 3 JUGADORES + TOP 3 CLUBES ─── */}
      <section className="grid lg:grid-cols-2 gap-8">
        {/* Top 3 jugadores */}
        <div>
          <SectionHeader icon={<TrendingUp size={22} />} title="Top 3 Jugadores" link="/ranking" />
          <div className="space-y-3">
            {top3Jugadores.map((j, i) => (
              <Card key={j.id} className="card-hover cursor-pointer" onClick={() => navigate(`/jugadores/${j.id}`)}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${i === 0 ? "gold-gradient text-black" : "bg-secondary text-amber-500"}`}>
                    {i === 0 ? <Medal size={22} /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold hover:text-amber-500 transition-colors">{j.nombre} {j.apellido}</p>
                    <p className="text-xs text-muted-foreground">{j.club} · {j.ciudad}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold gold-text">{j.elo.clasica}</p>
                    <p className="text-xs text-muted-foreground">ELO</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Top 3 clubes */}
        <div>
          <SectionHeader icon={<Crown size={22} />} title="Top 3 Clubes" link="/clubes" />
          <div className="space-y-3">
            {top3Clubes.map((c, i) => (
              <Card key={c.id} className="card-hover-violet cursor-pointer" onClick={() => navigate(`/clubes/${c.id}`)}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${i === 0 ? "violet-gradient text-white" : "bg-secondary text-violet-400"}`}>
                    {i === 0 ? <Crown size={22} /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold hover:text-violet-300 transition-colors">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground">{c.departamento} · {c.miembros} miembros</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-violet-400">{c.torneosGanados}</p>
                    <p className="text-xs text-muted-foreground">Torneos</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRÓXIMOS TORNEOS ─── */}
      <section>
        <SectionHeader icon={<Calendar size={22} />} title="Próximos Torneos" link="/torneos" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proximosTorneos.map((t) => (
            <Card key={t.id} className="card-hover cursor-pointer" onClick={() => navigate(`/torneos/${t.id}`)}>
              <CardContent className="py-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-lg leading-snug hover:text-amber-500 transition-colors">{t.nombre}</h3>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/ligas/${t.ligaId}`); }} className="text-xs text-violet-400 hover:text-violet-300 transition-colors mt-0.5">{t.liga}</button>
                  </div>
                  <Badge variant="secondary" className={t.estado === "En curso" ? "bg-amber-600 text-black" : "bg-violet-600 text-white"}>
                    {t.estado}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-amber-500" />
                    {t.fecha}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-500" />
                    {t.ritmo}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy size={14} className="text-violet-400" />
                    {t.tipo} · {t.rondas} rondas
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-violet-400" />
                    {t.participantes} jugadores
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="inline-flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400 transition-colors">
                    Ver detalles <ChevronRight size={14} />
                  </div>
                  {t.estado === "Próximo" && (
                    <Button
                      className="gold-gradient text-black font-semibold hover:opacity-90"
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
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title, link }: { icon: React.ReactNode; title: string; link: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <span className="text-amber-500">{icon}</span>
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      </div>
      <Link to={link} className="text-sm text-muted-foreground hover:text-amber-500 transition-colors flex items-center gap-1">
        Ver todo <ChevronRight size={14} />
      </Link>
    </div>
  );
}
