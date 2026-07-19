import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Crown,
  Calendar,
  ArrowRight,
  Newspaper,
  Clock,
  MapPin,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/common/Logo";
import { Reveal } from "@/components/common/Reveal";
import { SectionBand } from "@/components/home/SectionBand";
import { PhotoBreak } from "@/components/home/PhotoBreak";
import { QuienesSomos } from "@/components/home/QuienesSomos";
import { RankingDestacado } from "@/components/home/RankingDestacado";
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
 * Segunda parte de la landing (debajo del hero). El ritmo visual lo dan bandas
 * full-width con tonos alternados (<SectionBand>) y un único quiebre fotográfico
 * (<PhotoBreak>). El orden y la lógica de datos no cambian; sólo la presentación.
 *
 *   Hero ─ #0a0a0a (torneo) ─ #141414 (quiénes) ─ FOTO ─ #0d0d0d (ranking, xl)
 *        ─ #141414 (clubes) ─ #101010 (noticias) ─ #0d0d0d (próximos)
 */
export function HomeContent({ noticias, jugadores, clubes, torneos, stats }: HomeContentProps) {
  const navigate = useNavigate();

  const proximoTorneo = torneos.find((t) => t.estado === "Próximo") ?? torneos[0];

  if (!proximoTorneo) {
    return <p className="text-center text-muted-foreground py-20">Todavía no hay torneos cargados.</p>;
  }

  const top3Clubes = clubes
    .slice()
    .sort((a, b) => b.torneosGanados - a.torneosGanados)
    .slice(0, 3);
  const proximosTorneos = torneos.filter((t) => t.estado !== "Finalizado");

  return (
    <>
      {/* ─── PRÓXIMO TORNEO DESTACADO · banda más oscura, ancla ─── */}
      <SectionBand className="bg-[#0a0a0a]" spacing="md">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-amber-600/20 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #daa520 0%, transparent 40%), radial-gradient(circle at 20% 80%, #7c3aed 0%, transparent 40%)" }} />
            <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />

            <div className="relative grid lg:grid-cols-2 gap-8 p-6 md:p-10 lg:p-14">
              <div className="flex flex-col justify-center gap-5">
                <div className="flex items-center gap-2">
                  <Badge className="violet-gradient text-white border-0">Próximo Torneo</Badge>
                  <span className="text-xs text-muted-foreground">Temporada {stats.temporadaActual}</span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  <span className="gold-text">{proximoTorneo.nombre}</span>
                </h2>

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
                  <Button className="gold-gradient text-black font-semibold hover:opacity-90" onClick={() => navigate(`/torneos/${proximoTorneo.id}`)}>
                    Inscribirse
                    <ArrowRight size={16} className="ml-1.5" />
                  </Button>
                  <Link to={`/torneos/${proximoTorneo.id}`}>
                    <Button variant="outline" className="border-violet-600/40 text-violet-300 hover:bg-violet-600/10 hover:text-violet-200">
                      Ver torneo
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
          </div>
        </Reveal>
      </SectionBand>

      {/* ─── ¿QUIÉNES SOMOS? · banda clara, mucho aire ─── */}
      <SectionBand className="bg-[#141414]" spacing="lg">
        <QuienesSomos stats={stats} />
      </SectionBand>

      {/* ─── QUIEBRE FOTOGRÁFICO (única foto separadora) ─── */}
      <PhotoBreak />

      {/* ─── RANKING DESTACADO · banda oscura y foco, la que más respira ─── */}
      <SectionBand className="bg-[#0d0d0d]" spacing="xl">
        <RankingDestacado jugadores={jugadores} />
      </SectionBand>

      {/* ─── CLUBES · banda clara ─── */}
      <SectionBand className="bg-[#141414]" spacing="md">
        <Reveal>
          <SectionHeader icon={<Crown size={22} />} title="Clubes destacados" link="/clubes" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3Clubes.map((c, i) => (
              <Card key={c.id} className="card-hover-violet cursor-pointer" onClick={() => navigate(`/clubes/${c.id}`)}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${i === 0 ? "violet-gradient text-white" : "bg-secondary text-violet-400"}`}>
                    {i === 0 ? <Crown size={22} /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold hover:text-violet-300 transition-colors truncate">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.departamento} · {c.miembros} miembros</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-violet-400">{c.torneosGanados}</p>
                    <p className="text-xs text-muted-foreground">Torneos</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Reveal>
      </SectionBand>

      {/* ─── ÚLTIMAS NOTICIAS · banda media, espaciado menor (secundaria) ─── */}
      {noticias.length > 0 && (
        <SectionBand className="bg-[#101010]" spacing="sm">
          <Reveal>
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
          </Reveal>
        </SectionBand>
      )}

      {/* ─── PRÓXIMOS TORNEOS · banda oscura, cierre ─── */}
      <SectionBand className="bg-[#0d0d0d]" spacing="md">
        <Reveal>
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
        </Reveal>
      </SectionBand>
    </>
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
