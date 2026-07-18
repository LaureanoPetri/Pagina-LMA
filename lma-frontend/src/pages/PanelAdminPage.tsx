import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Building2,
  Layers,
  Newspaper,
  LogOut,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Logo } from "@/components/common/Logo";
import {
  JugadorFormDialog,
  ClubFormDialog,
  LigaFormDialog,
  TorneoFormDialog,
  NoticiaFormDialog,
  MedallaFormDialog,
} from "@/components/admin/FormDialogs";
import {
  getJugadores,
  getClubes,
  getLigas,
  getTorneos,
  getNoticias,
  getMedallas,
  getEstadisticas,
  eliminarJugador,
  eliminarClub,
  eliminarLiga,
  eliminarTorneo,
  eliminarNoticia,
  eliminarMedalla,
  actualizarJugador,
} from "@/api/client";
import type {
  JugadorListado,
  ClubListado,
  LigaListado,
  TorneoListado,
  Noticia,
  MedallaResponse,
  EstadisticasGlobales,
} from "@/api/types";
import { cn } from "@/lib/utils";

type Section =
  | "dashboard"
  | "jugadores"
  | "clubes"
  | "ligas"
  | "torneos"
  | "noticias"
  | "medallas";

type FormType = "jugador" | "club" | "liga" | "torneo" | "noticia" | "medalla" | null;

const sidebarItems: { key: Section; label: string; icon: typeof Trophy }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "jugadores", label: "Jugadores", icon: Users },
  { key: "clubes", label: "Clubes", icon: Building2 },
  { key: "ligas", label: "Ligas", icon: Layers },
  { key: "torneos", label: "Torneos", icon: Trophy },
  { key: "noticias", label: "Noticias", icon: Newspaper },
  { key: "medallas", label: "Medallas", icon: Award },
];

const PAGE_SIZE = 8;

export function PanelAdminPage() {
  const [section, setSection] = useState<Section>("dashboard");
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; nombre: string; tipo: FormType } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<FormType>(null);
  const [formMode, setFormMode] = useState<"new" | "edit">("new");
  const [editId, setEditId] = useState<string | number | null>(null);

  const [jugadores, setJugadores] = useState<JugadorListado[]>([]);
  const [clubes, setClubes] = useState<ClubListado[]>([]);
  const [ligas, setLigas] = useState<LigaListado[]>([]);
  const [torneos, setTorneos] = useState<TorneoListado[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [medallas, setMedallas] = useState<MedallaResponse[]>([]);
  const [stats, setStats] = useState<EstadisticasGlobales | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarTodo = useCallback(() => {
    return Promise.all([
      getJugadores().then(setJugadores),
      getClubes().then(setClubes),
      getLigas().then(setLigas),
      getTorneos().then(setTorneos),
      getNoticias().then(setNoticias),
      getMedallas().then(setMedallas),
      getEstadisticas().then(setStats),
    ]);
  }, []);

  useEffect(() => {
    cargarTodo()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cargarTodo]);

  const resetFilters = () => {
    setSearch("");
    setFiltro("all");
    setPage(1);
  };

  const handleSectionChange = (s: Section) => {
    setSection(s);
    resetFilters();
  };

  const openForm = (type: FormType, mode: "new" | "edit", id: string | number | null = null) => {
    setFormMode(mode);
    setEditId(id);
    setFormOpen(type);
  };

  const closeForm = () => setFormOpen(null);

  const handleSaved = () => {
    cargarTodo().catch(() => {});
  };

  const openDeleteConfirm = (target: { id: string | number; nombre: string }, tipo: FormType) => {
    setDeleteError(null);
    setDeleteTarget({ ...target, tipo });
  };

  const [asignandoClub, setAsignandoClub] = useState<string | null>(null);
  const handleAsignarClub = async (idJugador: string, idClub: string) => {
    setAsignandoClub(idJugador);
    try {
      await actualizarJugador(idJugador, { id_club: idClub === "sin-club" ? null : Number(idClub) });
      await cargarTodo();
    } catch {
      // si falla, el selector vuelve a mostrar el valor anterior en el próximo render
    } finally {
      setAsignandoClub(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      if (deleteTarget.tipo === "jugador") await eliminarJugador(String(deleteTarget.id));
      else if (deleteTarget.tipo === "club") await eliminarClub(Number(deleteTarget.id));
      else if (deleteTarget.tipo === "liga") await eliminarLiga(Number(deleteTarget.id));
      else if (deleteTarget.tipo === "torneo") await eliminarTorneo(Number(deleteTarget.id));
      else if (deleteTarget.tipo === "noticia") await eliminarNoticia(Number(deleteTarget.id));
      else if (deleteTarget.tipo === "medalla") await eliminarMedalla(Number(deleteTarget.id));
      await cargarTodo();
      setDeleteTarget(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "No se pudo eliminar el registro.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-20">Cargando panel...</p>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] animate-fade-in">
      {/* SIDEBAR */}
      <aside className="w-60 shrink-0 border-r border-border bg-card/50 backdrop-blur-sm sticky top-16 self-start h-[calc(100vh-4rem)] flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="font-bold text-sm">Panel Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleSectionChange(item.key)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                section === item.key
                  ? "bg-amber-600/15 text-amber-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Link to="/admin/login">
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-red-400">
              <LogOut size={16} className="mr-2" />
              Cerrar sesión
            </Button>
          </Link>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6 overflow-x-hidden">
        {section === "dashboard" && (
          <DashboardSection
            onNavigate={handleSectionChange}
            stats={stats}
            torneos={torneos}
            clubes={clubes}
            noticiasCount={noticias.length}
          />
        )}
        {section === "jugadores" && (
          <CrudTable
            title="Jugadores"
            columns={["Jugador", "Club", "Categoría", "ELO Clásica", "Estado"]}
            rows={jugadores.map((j) => ({
              id: j.id,
              cells: [
                `${j.nombre} ${j.apellido}`,
                j.club,
                j.categoria,
                String(j.elo.clasica),
                j.estado,
              ],
              estado: j.estado,
              categoria: j.categoria,
              idClub: j.id_club ?? "",
            }))}
            search={search}
            setSearch={setSearch}
            filtro={filtro}
            setFiltro={setFiltro}
            page={page}
            setPage={setPage}
            onDelete={(t) => openDeleteConfirm(t, "jugador")}
            onNew={() => openForm("jugador", "new")}
            onEdit={(id) => openForm("jugador", "edit", id)}
            filterOptions={[
              { value: "all", label: "Todas las categorías" },
              { value: "Primera", label: "Primera" },
              { value: "Segunda", label: "Segunda" },
              { value: "Tercera", label: "Tercera" },
              { value: "Sub-18", label: "Sub-18" },
            ]}
            filterKey="categoria"
            extraColumn={{
              header: "Asignar club",
              render: (r) => (
                <Select
                  value={r.idClub ? String(r.idClub) : "sin-club"}
                  onValueChange={(v) => handleAsignarClub(String(r.id), v)}
                  disabled={asignandoClub === String(r.id)}
                >
                  <SelectTrigger className="w-44 h-8 text-xs">
                    <SelectValue placeholder="Sin club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-club">Sin club</SelectItem>
                    {clubes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ),
            }}
          />
        )}
        {section === "clubes" && (
          <CrudTable
            title="Clubes"
            columns={["Nombre", "Departamento", "Provincia", "Miembros", "Puntos"]}
            rows={clubes.map((c) => ({
              id: c.id,
              cells: [c.nombre, c.departamento, c.provincia, String(c.miembros), String(c.puntos)],
              departamento: c.departamento,
            }))}
            search={search}
            setSearch={setSearch}
            filtro={filtro}
            setFiltro={setFiltro}
            page={page}
            setPage={setPage}
            onDelete={(t) => openDeleteConfirm(t, "club")}
            onNew={() => openForm("club", "new")}
            onEdit={(id) => openForm("club", "edit", id)}
            filterOptions={[
              { value: "all", label: "Todos los departamentos" },
              ...[...new Set(clubes.map((c) => c.departamento))].map((d) => ({
                value: d,
                label: d,
              })),
            ]}
            filterKey="departamento"
          />
        )}
        {section === "ligas" && (
          <CrudTable
            title="Ligas"
            columns={["Nombre", "Temporada", "División", "Equipos", "Estado"]}
            rows={ligas.map((l) => ({
              id: l.id,
              cells: [l.nombre, l.temporada, l.division, String(l.equipos), l.estado],
              estado: l.estado,
            }))}
            search={search}
            setSearch={setSearch}
            filtro={filtro}
            setFiltro={setFiltro}
            page={page}
            setPage={setPage}
            onDelete={(t) => openDeleteConfirm(t, "liga")}
            onNew={() => openForm("liga", "new")}
            onEdit={(id) => openForm("liga", "edit", id)}
            filterOptions={[
              { value: "all", label: "Todos los estados" },
              { value: "En curso", label: "En curso" },
              { value: "Próxima", label: "Próxima" },
              { value: "Finalizada", label: "Finalizada" },
            ]}
            filterKey="estado"
          />
        )}
        {section === "torneos" && (
          <CrudTable
            title="Torneos"
            columns={["Nombre", "Fecha", "Lugar", "Ritmo", "Estado"]}
            rows={torneos.map((t) => ({
              id: t.id,
              cells: [t.nombre, t.fecha, t.lugar, t.ritmo, t.estado],
              estado: t.estado,
            }))}
            search={search}
            setSearch={setSearch}
            filtro={filtro}
            setFiltro={setFiltro}
            page={page}
            setPage={setPage}
            onDelete={(t) => openDeleteConfirm(t, "torneo")}
            onNew={() => openForm("torneo", "new")}
            onEdit={(id) => openForm("torneo", "edit", id)}
            filterOptions={[
              { value: "all", label: "Todos los estados" },
              { value: "Próximo", label: "Próximo" },
              { value: "En curso", label: "En curso" },
              { value: "Finalizado", label: "Finalizado" },
            ]}
            filterKey="estado"
          />
        )}
        {section === "noticias" && (
          <CrudTable
            title="Noticias"
            columns={["Título", "Fecha", "Categoría"]}
            rows={noticias.map((n) => ({
              id: n.id,
              cells: [n.titulo, n.fecha, n.categoria ?? ""],
              categoria: n.categoria ?? "",
            }))}
            search={search}
            setSearch={setSearch}
            filtro={filtro}
            setFiltro={setFiltro}
            page={page}
            setPage={setPage}
            onDelete={(t) => openDeleteConfirm(t, "noticia")}
            onNew={() => openForm("noticia", "new")}
            onEdit={(id) => openForm("noticia", "edit", id)}
            filterOptions={[
              { value: "all", label: "Todas las categorías" },
              { value: "Torneos", label: "Torneos" },
              { value: "Inscripciones", label: "Inscripciones" },
              { value: "Institucional", label: "Institucional" },
            ]}
            filterKey="categoria"
          />
        )}
        {section === "medallas" && (
          <CrudTable
            title="Medallas"
            columns={["Nombre", "Destinatario", "Tipo", "Torneo", "Fecha"]}
            rows={medallas.map((m) => ({
              id: m.id,
              cells: [
                m.nombre,
                m.jugadorNombre ?? m.clubNombre ?? "—",
                m.metal,
                m.torneoNombre ?? "—",
                m.fecha ?? "—",
              ],
              metal: m.metal,
            }))}
            search={search}
            setSearch={setSearch}
            filtro={filtro}
            setFiltro={setFiltro}
            page={page}
            setPage={setPage}
            onDelete={(t) => openDeleteConfirm(t, "medalla")}
            onNew={() => openForm("medalla", "new")}
            onEdit={(id) => openForm("medalla", "edit", id)}
            filterOptions={[
              { value: "all", label: "Todos los tipos" },
              { value: "Oro", label: "Oro" },
              { value: "Plata", label: "Plata" },
              { value: "Bronce", label: "Bronce" },
              { value: "Distinción", label: "Distinción especial" },
            ]}
            filterKey="metal"
          />
        )}
      </main>

      {/* DELETE DIALOG */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{deleteTarget?.nombre}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-red-400">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FORM DIALOGS */}
      <JugadorFormDialog
        open={formOpen === "jugador"}
        onOpenChange={(o) => !o && closeForm()}
        mode={formMode}
        editId={editId as string | null}
        onSaved={handleSaved}
      />
      <ClubFormDialog
        open={formOpen === "club"}
        onOpenChange={(o) => !o && closeForm()}
        mode={formMode}
        editId={editId as number | null}
        onSaved={handleSaved}
      />
      <LigaFormDialog
        open={formOpen === "liga"}
        onOpenChange={(o) => !o && closeForm()}
        mode={formMode}
        editId={editId as number | null}
        onSaved={handleSaved}
      />
      <TorneoFormDialog
        open={formOpen === "torneo"}
        onOpenChange={(o) => !o && closeForm()}
        mode={formMode}
        editId={editId as number | null}
        onSaved={handleSaved}
      />
      <NoticiaFormDialog
        open={formOpen === "noticia"}
        onOpenChange={(o) => !o && closeForm()}
        mode={formMode}
        editId={editId as number | null}
        onSaved={handleSaved}
      />
      <MedallaFormDialog
        open={formOpen === "medalla"}
        onOpenChange={(o) => !o && closeForm()}
        mode={formMode}
        editId={editId as number | null}
        onSaved={handleSaved}
      />
    </div>
  );
}

/* ─── DASHBOARD ─── */
function DashboardSection({
  onNavigate,
  stats,
  torneos,
  clubes,
  noticiasCount,
}: {
  onNavigate: (s: Section) => void;
  stats: EstadisticasGlobales | null;
  torneos: TorneoListado[];
  clubes: ClubListado[];
  noticiasCount: number;
}) {
  if (!stats) return null;

  const statCards = [
    { icon: Users, label: "Jugadores", value: stats.jugadores, color: "text-amber-500", bg: "bg-amber-600/10", section: "jugadores" as Section },
    { icon: Building2, label: "Clubes", value: stats.clubes, color: "text-violet-400", bg: "bg-violet-600/10", section: "clubes" as Section },
    { icon: Layers, label: "Ligas", value: stats.ligas, color: "text-amber-500", bg: "bg-amber-600/10", section: "ligas" as Section },
    { icon: Trophy, label: "Torneos", value: stats.torneos, color: "text-violet-400", bg: "bg-violet-600/10", section: "torneos" as Section },
    { icon: TrendingUp, label: "Partidas", value: stats.partidasJugadas, color: "text-amber-500", bg: "bg-amber-600/10", section: "dashboard" as Section },
    { icon: Newspaper, label: "Noticias", value: noticiasCount, color: "text-violet-400", bg: "bg-violet-600/10", section: "noticias" as Section },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumen general de la Liga Mendocina de Ajedrez · Temporada {stats.temporadaActual}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="card-hover cursor-pointer" onClick={() => onNavigate(s.section)}>
            <CardContent className="flex flex-col items-center text-center py-5 gap-1">
              <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl mb-1", s.bg)}>
                <s.icon className={s.color} size={20} />
              </div>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={16} className="text-amber-500" />
              Próximos Torneos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {torneos.filter((t) => t.estado !== "Finalizado").slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.nombre}</p>
                  <p className="text-xs text-muted-foreground">{t.fecha}</p>
                </div>
                <Badge className={t.estado === "En curso" ? "bg-amber-600 text-black" : "bg-violet-600 text-white"}>
                  {t.estado}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award size={16} className="text-violet-400" />
              Top 3 Clubes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...clubes].sort((a, b) => b.puntos - a.puntos).slice(0, 3).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <span className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    i === 0 ? "gold-gradient text-black" : "bg-secondary text-amber-500")}>
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium">{c.nombre}</p>
                </div>
                <p className="text-sm font-bold text-violet-400">{c.puntos} pts</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── CRUD TABLE ─── */
interface CrudRow {
  id: string | number;
  cells: string[];
  [key: string]: string | number | string[];
}

interface CrudTableProps {
  title: string;
  columns: string[];
  rows: CrudRow[];
  search: string;
  setSearch: (v: string) => void;
  filtro: string;
  setFiltro: (v: string) => void;
  page: number;
  setPage: (p: number) => void;
  onDelete: (target: { id: string | number; nombre: string }) => void;
  onNew: () => void;
  onEdit: (id: string | number) => void;
  filterOptions: { value: string; label: string }[];
  filterKey: string;
  /** Columna extra opcional (ej: selector rápido de club) que se renderiza antes de "Acciones". */
  extraColumn?: {
    header: string;
    render: (row: CrudRow) => React.ReactNode;
  };
}

function CrudTable({
  title,
  columns,
  rows,
  search,
  setSearch,
  filtro,
  setFiltro,
  page,
  setPage,
  onDelete,
  onNew,
  onEdit,
  filterOptions,
  filterKey,
  extraColumn,
}: CrudTableProps) {
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        r.cells[0].toLowerCase().includes(search.toLowerCase()) ||
        (r.cells[1] ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesFiltro = filtro === "all" || r[filterKey] === filtro;
      return matchesSearch && matchesFiltro;
    });
  }, [rows, search, filtro, filterKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const estadoBadge = (val: string) => {
    if (val === "Activo" || val === "En curso") return <Badge className="bg-green-600/80 text-white">{val}</Badge>;
    if (val === "Próximo" || val === "Próxima") return <Badge className="bg-violet-600 text-white">{val}</Badge>;
    if (val === "Suspendido") return <Badge className="bg-red-600/80 text-white">{val}</Badge>;
    if (val === "Finalizada" || val === "Finalizado") return <Badge variant="secondary">{val}</Badge>;
    if (val === "Inactivo") return <Badge variant="secondary">{val}</Badge>;
    return <Badge variant="outline">{val}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button className="gold-gradient text-black font-semibold hover:opacity-90" onClick={onNew}>
          <Plus size={16} className="mr-1.5" />
          Nuevo
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder={`Buscar ${title.toLowerCase()}...`}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Filtro" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                {columns.map((col, i) => (
                  <TableHead key={col} className={cn(i === 0 && "w-[40%]")}>
                    {col}
                  </TableHead>
                ))}
                {extraColumn && <TableHead>{extraColumn.header}</TableHead>}
                <TableHead className="text-right w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((r) => (
                <TableRow key={r.id} className="hover:bg-amber-600/5 transition-colors">
                  {r.cells.map((cell, i) => (
                    <TableCell key={i} className={i === 0 ? "font-medium" : "text-muted-foreground"}>
                      {i === r.cells.length - 1 && ["Activo", "Inactivo", "Suspendido", "En curso", "Próximo", "Próxima", "Finalizada", "Finalizado"].includes(cell)
                        ? estadoBadge(cell)
                        : cell}
                    </TableCell>
                  ))}
                  {extraColumn && <TableCell>{extraColumn.render(r)}</TableCell>}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-500" onClick={() => onEdit(r.id)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        onClick={() => onDelete({ id: r.id, nombre: r.cells[0] })}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginated.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No se encontraron registros.</p>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Siguiente
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
