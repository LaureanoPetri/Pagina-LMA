import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Building,
  Users,
  TrendingUp,
  Trophy,
  Medal,
  Award,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClub, getJugadores } from "@/api/client";
import type { Club, JugadorListado } from "@/api/types";
import { ClubLogo } from "@/pages/ClubesPage";
import { cn } from "@/lib/utils";

export function ClubDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club | null | undefined>(undefined);
  const [jugadores, setJugadores] = useState<JugadorListado[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([getClub(Number(id)), getJugadores()])
      .then(([c, j]) => {
        setClub(c);
        setJugadores(j);
      })
      .catch(() => setClub(null));
  }, [id]);

  const roster = useMemo(() => {
    if (!club) return [];
    return jugadores
      .filter((j) => j.club === club.nombre)
      .sort((a, b) => b.elo.clasica - a.elo.clasica);
  }, [jugadores, club]);

  if (club === undefined) {
    return <p className="text-center text-muted-foreground py-20">Cargando...</p>;
  }

  if (!club) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Club no encontrado.</p>
        <Link to="/clubes"><Button variant="outline">Volver a Clubes</Button></Link>
      </div>
    );
  }

  const metalColor = (metal: string) =>
    metal === "oro" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
    metal === "plata" ? "bg-zinc-400/20 text-zinc-300 border-zinc-400/30" :
    "bg-orange-700/20 text-orange-400 border-orange-700/30";

  const infoItems = [
    { icon: MapPin, label: "Departamento", value: club.departamento },
    { icon: MapPin, label: "Provincia", value: club.provincia },
    { icon: Calendar, label: "Fundación", value: String(club.fundacion) },
    { icon: User, label: "Presidente", value: club.presidente },
    { icon: Building, label: "Sede", value: club.sede },
    { icon: Users, label: "Jugadores", value: String(club.miembros) },
    { icon: TrendingUp, label: "ELO Promedio", value: String(club.eloPromedio) },
    { icon: Trophy, label: "Campeonatos", value: String(club.campeonatos) },
  ];

  const redes = [
    { icon: Facebook, label: "Facebook", value: club.redes.facebook },
    { icon: Instagram, label: "Instagram", value: club.redes.instagram },
    { icon: Twitter, label: "Twitter", value: club.redes.twitter },
    { icon: Globe, label: "Web", value: club.redes.web },
  ].filter((r) => r.value);

  return (
    <div className="animate-fade-in space-y-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/clubes")}
        className="text-muted-foreground hover:text-amber-500"
      >
        <ArrowLeft size={16} className="mr-1.5" />
        Volver a Clubes
      </Button>

      {/* HEADER */}
      <Card className="overflow-hidden border-amber-600/20">
        <div className="h-2" style={{ background: `linear-gradient(90deg, ${club.color}, transparent)` }} />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <ClubLogo club={club} size={80} />
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{club.nombre}</h1>
              <p className="text-muted-foreground text-sm mt-1">{club.departamento}, {club.provincia}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">Fundado en {club.fundacion}</Badge>
                <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30">{club.campeonatos} campeonatos</Badge>
                <Badge className="bg-violet-600/20 text-violet-400 border-violet-500/30">{club.miembros} jugadores</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold gold-text">{club.puntos}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Puntos</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6 pt-6 border-t border-border">
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

      {/* REDES SOCIALES */}
      {redes.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {redes.map((r) => (
            <a
              key={r.label}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground hover:text-amber-500 hover:border-amber-600/30 transition-colors"
            >
              <r.icon size={16} />
              <span>{r.value}</span>
            </a>
          ))}
        </div>
      )}

      {/* TROFEOS Y MEDALLAS */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-amber-500" />
            <h2 className="text-xl font-bold">Trofeos</h2>
          </div>
          {club.trofeos.length > 0 ? (
            <div className="space-y-3">
              {club.trofeos.map((t, i) => (
                <Card key={i} className="card-hover">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-600/15 text-amber-500 shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t.nombre}</p>
                      <p className="text-xs text-muted-foreground">{t.torneo} · {t.fecha}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">Sin trofeos registrados.</p>}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Medal size={20} className="text-violet-400" />
            <h2 className="text-xl font-bold">Medallas</h2>
          </div>
          {club.medallas.length > 0 ? (
            <div className="space-y-3">
              {club.medallas.map((m, i) => (
                <Card key={i} className="card-hover-violet">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className={cn("flex items-center justify-center w-10 h-10 rounded-full shrink-0", metalColor(m.metal))}>
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
          ) : <p className="text-sm text-muted-foreground">Sin medallas registradas.</p>}
        </div>
      </div>

      {/* ROSTER */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-amber-500" />
          <h2 className="text-xl font-bold">Roster de Jugadores</h2>
          <Badge variant="secondary" className="ml-1">{roster.length}</Badge>
        </div>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                  <TableHead className="text-center">Blitz</TableHead>
                  <TableHead className="text-center">Rápida</TableHead>
                  <TableHead className="text-center">Clásica</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.map((j, i) => (
                  <TableRow
                    key={j.id}
                    onClick={() => navigate(`/jugadores/${j.id}`)}
                    className="cursor-pointer hover:bg-amber-600/5 transition-colors"
                  >
                    <TableCell className="text-center text-muted-foreground font-medium">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-amber-500 font-semibold text-xs shrink-0">
                          {j.nombre.charAt(0)}{j.apellido.charAt(0)}
                        </div>
                        <span className="font-medium">{j.nombre} {j.apellido}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">{j.categoria}</Badge>
                    </TableCell>
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
        {roster.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sin jugadores registrados.</p>}
      </div>
    </div>
  );
}
