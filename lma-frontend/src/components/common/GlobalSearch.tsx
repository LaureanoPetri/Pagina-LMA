import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getJugadores, getClubes, getTorneos, getLigas } from "@/api/client";
import type { JugadorListado, ClubListado, TorneoListado, LigaListado } from "@/api/types";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "jugador" | "club" | "torneo" | "liga";
  id: string | number;
  label: string;
  subtitle: string;
}

export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [jugadores, setJugadores] = useState<JugadorListado[]>([]);
  const [clubes, setClubes] = useState<ClubListado[]>([]);
  const [torneos, setTorneos] = useState<TorneoListado[]>([]);
  const [ligas, setLigas] = useState<LigaListado[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cargamos los datos una sola vez, la primera vez que el usuario interactúa
  // con el buscador (no hace falta antes de eso).
  const cargarDatos = () => {
    if (loaded || cargando) return;
    setCargando(true);
    setError(null);
    Promise.all([getJugadores(), getClubes(), getTorneos(), getLigas()])
      .then(([j, c, t, l]) => {
        setJugadores(j);
        setClubes(c);
        setTorneos(t);
        setLigas(l);
        setLoaded(true);
      })
      // No marcamos `loaded` acá: si falla (ej. el backend recién está
      // "despertando"), queremos poder reintentar la próxima vez que el
      // usuario haga foco en el buscador, en vez de dejarlo roto toda la sesión.
      .catch(() => setError("No se pudo cargar el buscador. Probá de nuevo en un momento."))
      .finally(() => setCargando(false));
  };

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const jugadoresRes = jugadores
      .filter((j) => `${j.nombre} ${j.apellido}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map((j) => ({
        type: "jugador" as const,
        id: j.id,
        label: `${j.nombre} ${j.apellido}`,
        subtitle: `Jugador · ${j.club}`,
      }));
    const clubesRes = clubes
      .filter((c) => c.nombre.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({
        type: "club" as const,
        id: c.id,
        label: c.nombre,
        subtitle: `Club · ${c.departamento}`,
      }));
    const torneosRes = torneos
      .filter((t) => t.nombre.toLowerCase().includes(q))
      .slice(0, 3)
      .map((t) => ({
        type: "torneo" as const,
        id: t.id,
        label: t.nombre,
        subtitle: `Torneo · ${t.fecha}`,
      }));
    const ligasRes = ligas
      .filter((l) => l.nombre.toLowerCase().includes(q))
      .slice(0, 2)
      .map((l) => ({
        type: "liga" as const,
        id: l.id,
        label: l.nombre,
        subtitle: `Liga · ${l.temporada}`,
      }));
    return [...jugadoresRes, ...clubesRes, ...torneosRes, ...ligasRes];
  }, [query, jugadores, clubes, torneos, ligas]);

  const handleNavigate = (r: SearchResult) => {
    const path = r.type === "jugador" ? `/jugadores/${r.id}` :
                 r.type === "club" ? `/clubes/${r.id}` :
                 r.type === "torneo" ? `/torneos/${r.id}` :
                 `/ligas/${r.id}`;
    navigate(path);
    setQuery("");
    setOpen(false);
  };

  const typeColor = (type: string) => {
    if (type === "jugador") return "text-amber-500";
    if (type === "club") return "text-violet-400";
    if (type === "torneo") return "text-amber-500";
    return "text-violet-400";
  };

  return (
    <div className="relative w-full max-w-xs" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
      <Input
        type="text"
        placeholder="Buscar jugadores, clubes, torneos..."
        className="pl-9 bg-secondary/50 border-border text-sm placeholder:text-muted-foreground/60 focus-visible:border-amber-600/50"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          cargarDatos();
        }}
      />
      {open && error && (
        <div className="absolute top-full mt-1.5 w-full rounded-lg border border-red-600/30 bg-popover shadow-lg shadow-black/20 z-50 animate-fade-in px-3 py-2.5">
          <button
            onClick={() => {
              setError(null);
              cargarDatos();
            }}
            className="text-xs text-red-400 hover:text-red-300 underline text-left"
          >
            {error} Reintentar.
          </button>
        </div>
      )}
      {open && !error && results.length > 0 && (
        <div className="absolute top-full mt-1.5 w-full rounded-lg border border-border bg-popover shadow-lg shadow-black/20 overflow-hidden z-50 animate-fade-in">
          {results.map((r, i) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => handleNavigate(r)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-amber-600/5 transition-colors",
                i !== results.length - 1 && "border-b border-border/50"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.label}</p>
                <p className={cn("text-xs truncate", typeColor(r.type))}>{r.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
