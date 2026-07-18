import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileSpreadsheet, X, Trophy, Info, CheckCircle2, AlertTriangle, CalendarDays, Pencil, Trash2 } from "lucide-react";
import {
  getClubes,
  getJugadores,
  getLigas,
  getTorneos,
  getJugador,
  crearJugador,
  actualizarJugador,
  getClub,
  crearClub,
  actualizarClub,
  getLiga,
  crearLiga,
  actualizarLiga,
  getCalendarioLiga,
  crearItemCalendario,
  actualizarItemCalendario,
  eliminarItemCalendario,
  getTorneo,
  crearTorneo,
  actualizarTorneo,
  importarResultadosTorneo,
  getNoticia,
  crearNoticia,
  actualizarNoticia,
  getMedalla,
  crearMedalla,
  actualizarMedalla,
} from "@/api/client";
import type {
  ClubListado,
  JugadorListado,
  LigaListado,
  LigaCalendarioItem,
  TorneoListado,
  ImportarResultadosResponse,
} from "@/api/types";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-xs text-red-400">{message}</p>;
}

/* ═══════════════ JUGADOR ═══════════════ */
interface JugadorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "new" | "edit";
  editId?: string | null;
  onSaved?: () => void;
}

const jugadorVacio = {
  id_lma: "",
  id_fide: "",
  nombre: "",
  apellido: "",
  id_club: "",
  ciudad: "",
  categoria: "",
  estado: "Activo",
  fecha_nacimiento: "",
  // Un jugador nuevo arranca en 1400 en las tres modalidades; el admin puede
  // ajustarlo antes de guardar si ya conoce su rating real.
  elo_blitz: "1400",
  elo_rapida: "1400",
  elo_clasica: "1400",
};

export function JugadorFormDialog({ open, onOpenChange, mode, editId, onSaved }: JugadorFormDialogProps) {
  const [clubes, setClubes] = useState<ClubListado[]>([]);
  const [form, setForm] = useState(jugadorVacio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    getClubes().then(setClubes).catch(() => {});
    setError(null);
    if (mode === "edit" && editId) {
      getJugador(editId)
        .then((j) => {
          setForm({
            id_lma: j.lmaId,
            id_fide: j.fideId,
            nombre: j.nombre,
            apellido: j.apellido,
            id_club: j.id_club ? String(j.id_club) : "",
            ciudad: j.ciudad,
            categoria: j.categoria,
            estado: j.estado,
            fecha_nacimiento: j.fechaNacimiento ?? "",
            elo_blitz: String(j.elo.blitz),
            elo_rapida: String(j.elo.rapida),
            elo_clasica: String(j.elo.clasica),
          });
        })
        .catch(() => setError("No se pudo cargar el jugador."));
    } else {
      setForm(jugadorVacio);
    }
  }, [open, mode, editId]);

  const set = (campo: keyof typeof jugadorVacio) => (valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.nombre || !form.apellido || (mode === "new" && !form.id_lma)) {
      setError("Nombre, apellido e ID LMA son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id_lma: form.id_lma,
        id_fide: form.id_fide || null,
        nombre: form.nombre,
        apellido: form.apellido,
        ciudad: form.ciudad || null,
        categoria: form.categoria || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        elo_blitz: Number(form.elo_blitz) || 0,
        elo_rapida: Number(form.elo_rapida) || 0,
        elo_clasica: Number(form.elo_clasica) || 0,
        id_club: form.id_club ? Number(form.id_club) : null,
        estado: form.estado as "Activo" | "Inactivo" | "Suspendido",
      };
      if (mode === "new") {
        await crearJugador(payload);
      } else if (editId) {
        await actualizarJugador(editId, payload);
      }
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar el jugador.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Nuevo Jugador" : "Editar Jugador"}</DialogTitle>
          <DialogDescription>
            Complete los datos del jugador. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormGrid>
            <FormField label="Nombre *">
              <Input placeholder="Ej: Martín" value={form.nombre} onChange={(e) => set("nombre")(e.target.value)} />
            </FormField>
            <FormField label="Apellido *">
              <Input placeholder="Ej: Ríos" value={form.apellido} onChange={(e) => set("apellido")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Club *">
              <Select value={form.id_club} onValueChange={set("id_club")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar club" /></SelectTrigger>
                <SelectContent>
                  {clubes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Ciudad *">
              <Input placeholder="Ej: Mendoza" value={form.ciudad} onChange={(e) => set("ciudad")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Categoría *">
              <Select value={form.categoria} onValueChange={set("categoria")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primera">Primera</SelectItem>
                  <SelectItem value="Segunda">Segunda</SelectItem>
                  <SelectItem value="Tercera">Tercera</SelectItem>
                  <SelectItem value="Sub-18">Sub-18</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Estado *">
              <Select value={form.estado} onValueChange={set("estado")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="LMA ID">
              <Input
                placeholder="Ej: LMA-00123"
                value={form.id_lma}
                onChange={(e) => set("id_lma")(e.target.value)}
                disabled={mode === "edit"}
              />
            </FormField>
            <FormField label="FIDE ID">
              <Input placeholder="Ej: 1234567" value={form.id_fide} onChange={(e) => set("id_fide")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Fecha de Nacimiento *">
              <Input type="date" value={form.fecha_nacimiento} onChange={(e) => set("fecha_nacimiento")(e.target.value)} />
            </FormField>
            <FormField label="Edad">
              <Input type="number" placeholder="Se calcula automáticamente" disabled />
            </FormField>
          </FormGrid>
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-semibold mb-3">Elo Actual</p>
            <FormGrid>
              <FormField label="Elo Blitz">
                <Input type="number" placeholder="Ej: 1850" value={form.elo_blitz} onChange={(e) => set("elo_blitz")(e.target.value)} />
              </FormField>
              <FormField label="Elo Rápida">
                <Input type="number" placeholder="Ej: 1900" value={form.elo_rapida} onChange={(e) => set("elo_rapida")(e.target.value)} />
              </FormField>
              <FormField label="Elo Clásica *">
                <Input type="number" placeholder="Ej: 2000" value={form.elo_clasica} onChange={(e) => set("elo_clasica")(e.target.value)} />
              </FormField>
            </FormGrid>
          </div>
          <FormError message={error} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="gold-gradient text-black font-semibold hover:opacity-90" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : mode === "new" ? "Crear Jugador" : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════ CLUB ═══════════════ */
interface ClubFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "new" | "edit";
  editId?: number | null;
  onSaved?: () => void;
}

const clubVacio = {
  nombre: "",
  nombreCorto: "",
  departamento: "",
  provincia: "",
  fundacion: "",
  presidente: "",
  sede: "",
  facebook: "",
  instagram: "",
  twitter: "",
  web: "",
};

export function ClubFormDialog({ open, onOpenChange, mode, editId, onSaved }: ClubFormDialogProps) {
  const [form, setForm] = useState(clubVacio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && editId) {
      getClub(editId)
        .then((c) => {
          setForm({
            nombre: c.nombre,
            nombreCorto: c.nombreCorto,
            departamento: c.departamento,
            provincia: c.provincia,
            fundacion: c.fundacion ? String(c.fundacion) : "",
            presidente: c.presidente,
            sede: c.sede,
            facebook: c.redes.facebook ?? "",
            instagram: c.redes.instagram ?? "",
            twitter: c.redes.twitter ?? "",
            web: c.redes.web ?? "",
          });
        })
        .catch(() => setError("No se pudo cargar el club."));
    } else {
      setForm(clubVacio);
    }
  }, [open, mode, editId]);

  const set = (campo: keyof typeof clubVacio) => (valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.nombre) {
      setError("El nombre del club es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        nombreCorto: form.nombreCorto || null,
        departamento: form.departamento || null,
        provincia: form.provincia || null,
        fundacion: form.fundacion ? Number(form.fundacion) : null,
        presidente: form.presidente || null,
        sede: form.sede || null,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        twitter: form.twitter || null,
        web: form.web || null,
      };
      if (mode === "new") {
        await crearClub(payload);
      } else if (editId) {
        await actualizarClub(editId, payload);
      }
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar el club.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Nuevo Club" : "Editar Club"}</DialogTitle>
          <DialogDescription>
            Complete los datos del club. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormGrid>
            <FormField label="Nombre *">
              <Input placeholder="Ej: Club Andino de Ajedrez" value={form.nombre} onChange={(e) => set("nombre")(e.target.value)} />
            </FormField>
            <FormField label="Nombre Corto *">
              <Input placeholder="Ej: Andino" value={form.nombreCorto} onChange={(e) => set("nombreCorto")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Departamento *">
              <Input placeholder="Ej: Capital" value={form.departamento} onChange={(e) => set("departamento")(e.target.value)} />
            </FormField>
            <FormField label="Provincia *">
              <Input placeholder="Ej: Mendoza" value={form.provincia} onChange={(e) => set("provincia")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Año de Fundación *">
              <Input type="number" placeholder="Ej: 1978" value={form.fundacion} onChange={(e) => set("fundacion")(e.target.value)} />
            </FormField>
            <FormField label="Presidente *">
              <Input placeholder="Ej: Roberto Sánchez" value={form.presidente} onChange={(e) => set("presidente")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormField label="Sede / Dirección *">
            <Input placeholder="Ej: Av. San Martín 1024, Mendoza" value={form.sede} onChange={(e) => set("sede")(e.target.value)} />
          </FormField>
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-semibold mb-3">Redes Sociales</p>
            <FormGrid>
              <FormField label="Facebook">
                <Input placeholder="/clubandino.ajedrez" value={form.facebook} onChange={(e) => set("facebook")(e.target.value)} />
              </FormField>
              <FormField label="Instagram">
                <Input placeholder="@andino.ajedrez" value={form.instagram} onChange={(e) => set("instagram")(e.target.value)} />
              </FormField>
              <FormField label="Twitter">
                <Input placeholder="@clubandino" value={form.twitter} onChange={(e) => set("twitter")(e.target.value)} />
              </FormField>
              <FormField label="Sitio Web">
                <Input placeholder="www.clubandinoajedrez.org" value={form.web} onChange={(e) => set("web")(e.target.value)} />
              </FormField>
            </FormGrid>
          </div>
          <FormError message={error} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="gold-gradient text-black font-semibold hover:opacity-90" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : mode === "new" ? "Crear Club" : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════ LIGA ═══════════════ */
interface LigaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "new" | "edit";
  editId?: number | null;
  onSaved?: () => void;
}

const ligaVacia = {
  nombre: "",
  temporada: "",
  division: "",
  estado: "",
  ritmo: "",
  cantidad_equipos: "",
  rondas: "",
  fecha_inicio: "",
  fecha_fin: "",
  descripcion: "",
};

export function LigaFormDialog({ open, onOpenChange, mode, editId, onSaved }: LigaFormDialogProps) {
  const [form, setForm] = useState(ligaVacia);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ligaId, setLigaId] = useState<number | null>(editId ?? null);
  const [calendario, setCalendario] = useState<LigaCalendarioItem[]>([]);
  const [calForm, setCalForm] = useState({ ronda: "", fecha: "", descripcion: "" });
  const [calEditId, setCalEditId] = useState<number | null>(null);
  const [calSaving, setCalSaving] = useState(false);
  const [calError, setCalError] = useState<string | null>(null);

  const cargarCalendario = (id: number) => {
    getCalendarioLiga(id)
      .then(setCalendario)
      .catch(() => setCalError("No se pudo cargar el calendario."));
  };

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCalError(null);
    setCalForm({ ronda: "", fecha: "", descripcion: "" });
    setCalEditId(null);
    if (mode === "edit" && editId) {
      setLigaId(editId);
      getLiga(editId)
        .then((l) => {
          setForm({
            nombre: l.nombre,
            temporada: l.temporada,
            division: l.division,
            estado: l.estado,
            ritmo: l.ritmo,
            cantidad_equipos: String(l.equipos),
            rondas: String(l.rondas),
            fecha_inicio: l.fechaInicio,
            fecha_fin: l.fechaFin,
            descripcion: l.descripcion,
          });
        })
        .catch(() => setError("No se pudo cargar la liga."));
      cargarCalendario(editId);
    } else {
      setForm(ligaVacia);
      setLigaId(null);
      setCalendario([]);
    }
  }, [open, mode, editId]);

  const set = (campo: keyof typeof ligaVacia) => (valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.nombre || !form.temporada) {
      setError("Nombre y temporada son obligatorios.");
      return;
    }
    const anio = Number.parseInt(form.temporada, 10) || new Date().getFullYear();
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        anio,
        division: form.division || null,
        temporada: form.temporada || null,
        ritmo: form.ritmo || null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        cantidad_equipos: form.cantidad_equipos ? Number(form.cantidad_equipos) : null,
        rondas: form.rondas ? Number(form.rondas) : null,
        descripcion: form.descripcion || null,
        estado: form.estado || null,
      };
      if (ligaId) {
        await actualizarLiga(ligaId, payload);
      } else {
        const nueva = await crearLiga(payload);
        setLigaId(nueva.id);
      }
      onSaved?.();
      // En modo edición cerramos como antes. En modo creación dejamos el
      // diálogo abierto para poder cargar el calendario de rondas a continuación.
      if (mode === "edit") {
        onOpenChange(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar la liga.");
    } finally {
      setSaving(false);
    }
  };

  const setCal = (campo: keyof typeof calForm) => (valor: string) =>
    setCalForm((prev) => ({ ...prev, [campo]: valor }));

  const resetCalForm = () => {
    setCalForm({ ronda: "", fecha: "", descripcion: "" });
    setCalEditId(null);
  };

  const handleCalSubmit = async () => {
    if (!ligaId) return;
    setCalError(null);
    if (!calForm.ronda) {
      setCalError("La ronda es obligatoria.");
      return;
    }
    setCalSaving(true);
    try {
      const payload = {
        ronda: Number(calForm.ronda),
        fecha: calForm.fecha || null,
        descripcion: calForm.descripcion || "",
      };
      if (calEditId) {
        await actualizarItemCalendario(ligaId, calEditId, payload);
      } else {
        await crearItemCalendario(ligaId, payload);
      }
      cargarCalendario(ligaId);
      resetCalForm();
    } catch (e) {
      setCalError(e instanceof Error ? e.message : "No se pudo guardar la ronda.");
    } finally {
      setCalSaving(false);
    }
  };

  const handleCalEdit = (item: LigaCalendarioItem) => {
    setCalEditId(item.id);
    setCalForm({ ronda: String(item.ronda), fecha: item.fecha ?? "", descripcion: item.descripcion });
  };

  const handleCalDelete = async (itemId: number) => {
    if (!ligaId) return;
    setCalError(null);
    try {
      await eliminarItemCalendario(ligaId, itemId);
      cargarCalendario(ligaId);
      if (calEditId === itemId) resetCalForm();
    } catch (e) {
      setCalError(e instanceof Error ? e.message : "No se pudo borrar la ronda.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Nueva Liga" : "Editar Liga"}</DialogTitle>
          <DialogDescription>
            Complete los datos de la liga. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Nombre *">
            <Input placeholder="Ej: Liga Oficial 2025 – Primera División" value={form.nombre} onChange={(e) => set("nombre")(e.target.value)} />
          </FormField>
          <FormGrid>
            <FormField label="Temporada *">
              <Input placeholder="Ej: 2025" value={form.temporada} onChange={(e) => set("temporada")(e.target.value)} />
            </FormField>
            <FormField label="División *">
              <Select value={form.division} onValueChange={set("division")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar división" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primera">Primera</SelectItem>
                  <SelectItem value="Segunda">Segunda</SelectItem>
                  <SelectItem value="Tercera">Tercera</SelectItem>
                  <SelectItem value="Juvenil">Juvenil</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Estado *">
              <Select value={form.estado} onValueChange={set("estado")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="En curso">En curso</SelectItem>
                  <SelectItem value="Próxima">Próxima</SelectItem>
                  <SelectItem value="Finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Ritmo *">
              <Input placeholder={'Ej: 90\'+30" por jugador'} value={form.ritmo} onChange={(e) => set("ritmo")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Cantidad de Equipos *">
              <Input type="number" placeholder="Ej: 8" value={form.cantidad_equipos} onChange={(e) => set("cantidad_equipos")(e.target.value)} />
            </FormField>
            <FormField label="Rondas *">
              <Input type="number" placeholder="Ej: 14" value={form.rondas} onChange={(e) => set("rondas")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Fecha de Inicio *">
              <Input type="date" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio")(e.target.value)} />
            </FormField>
            <FormField label="Fecha de Fin *">
              <Input type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormField label="Descripción">
            <Textarea placeholder="Descripción de la liga..." rows={3} value={form.descripcion} onChange={(e) => set("descripcion")(e.target.value)} />
          </FormField>
          <FormError message={error} />

          {/* GUARDAR DATOS BÁSICOS ANTES DE CARGAR EL CALENDARIO */}
          {mode === "new" && !ligaId && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleSubmit} disabled={saving}>
                {saving ? "Guardando..." : "Guardar datos y continuar"}
              </Button>
            </div>
          )}

          {/* CALENDARIO DE RONDAS */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays size={18} className="text-amber-500" />
              <h3 className="font-semibold text-sm">Calendario de rondas</h3>
            </div>
            {!ligaId ? (
              <p className="text-xs text-muted-foreground">
                Guardá los datos de la liga primero para poder cargar el calendario.
              </p>
            ) : (
              <div className="space-y-3">
                {calendario.length > 0 && (
                  <div className="space-y-1.5">
                    {[...calendario]
                      .sort((a, b) => a.ronda - b.ronda)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                        >
                          <div>
                            <span className="font-medium">Ronda {item.ronda}</span>
                            {item.fecha && <span className="text-muted-foreground"> · {item.fecha}</span>}
                            {item.descripcion && <span className="text-muted-foreground"> · {item.descripcion}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCalEdit(item)}>
                              <Pencil size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCalDelete(item.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                <FormGrid>
                  <FormField label="Ronda *">
                    <Input type="number" placeholder="Ej: 1" value={calForm.ronda} onChange={(e) => setCal("ronda")(e.target.value)} />
                  </FormField>
                  <FormField label="Fecha">
                    <Input type="date" value={calForm.fecha} onChange={(e) => setCal("fecha")(e.target.value)} />
                  </FormField>
                </FormGrid>
                <FormField label="Descripción">
                  <Input placeholder="Ej: Ronda 1 - Club Andino" value={calForm.descripcion} onChange={(e) => setCal("descripcion")(e.target.value)} />
                </FormField>
                <FormError message={calError} />
                <div className="flex justify-end gap-2">
                  {calEditId && (
                    <Button variant="outline" size="sm" onClick={resetCalForm}>Cancelar edición</Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleCalSubmit} disabled={calSaving}>
                    {calSaving ? "Guardando..." : calEditId ? "Guardar ronda" : "Agregar ronda"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="gold-gradient text-black font-semibold hover:opacity-90" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : mode === "new" ? (ligaId ? "Cerrar" : "Crear Liga") : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════ TORNEO ═══════════════ */
interface TorneoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "new" | "edit";
  editId?: number | null;
  onSaved?: () => void;
}

const chessResultFiles = [
  { id: "clasificacion", label: "Clasificación Final", desc: "Clasificación final después de todas las rondas" },
  { id: "cuadro", label: "Cuadro Cruzado", desc: "Cuadro cruzado por clasificación final (el que procesa el sistema)" },
  { id: "ranking", label: "Ranking Inicial", desc: "Ranking inicial de jugadores" },
  { id: "alfabetico", label: "Listado Alfabético", desc: "Listado alfabético de jugadores" },
];

const torneoVacio = {
  nombre: "",
  id_liga: "",
  estado: "",
  fecha: "",
  fecha_fin: "",
  tipo_torneo: "",
  tipo_ritmo: "",
  ritmo: "",
  cantidad_rondas: "",
  participantes: "",
  lugar: "",
  link_inscripcion: "",
  organizador: "",
  arbitro: "",
  premios: "",
  descripcion: "",
};

export function TorneoFormDialog({ open, onOpenChange, mode, editId, onSaved }: TorneoFormDialogProps) {
  const [ligas, setLigas] = useState<LigaListado[]>([]);
  const [form, setForm] = useState(torneoVacio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [torneoId, setTorneoId] = useState<number | null>(editId ?? null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [importando, setImportando] = useState(false);
  const [importResult, setImportResult] = useState<ImportarResultadosResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    getLigas().then(setLigas).catch(() => {});
    setError(null);
    setImportResult(null);
    setImportError(null);
    setUploadedFiles({});
    if (mode === "edit" && editId) {
      setTorneoId(editId);
      getTorneo(editId)
        .then((t) => {
          setForm({
            nombre: t.nombre,
            id_liga: t.ligaId ? String(t.ligaId) : "",
            estado: t.estado,
            fecha: t.fecha,
            fecha_fin: t.fechaFin,
            tipo_torneo: t.tipo,
            tipo_ritmo: t.tipoRitmo ?? "",
            ritmo: t.ritmo,
            cantidad_rondas: String(t.rondas),
            participantes: String(t.participantes),
            lugar: t.lugar,
            link_inscripcion: t.linkInscripcion ?? "",
            organizador: t.organizador,
            arbitro: t.arbitro,
            premios: t.premios,
            descripcion: t.descripcion,
          });
        })
        .catch(() => setError("No se pudo cargar el torneo."));
    } else {
      setForm(torneoVacio);
      setTorneoId(null);
    }
  }, [open, mode, editId]);

  const set = (campo: keyof typeof torneoVacio) => (valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.nombre || !form.fecha || !form.ritmo) {
      setError("Nombre, fecha de inicio y ritmo son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        fecha: form.fecha,
        ritmo: form.ritmo,
        estado: form.estado || null,
        id_liga: form.id_liga ? Number(form.id_liga) : null,
        organizador: form.organizador || null,
        arbitro: form.arbitro || null,
        tipo_torneo: form.tipo_torneo || null,
        tipo_ritmo: form.tipo_ritmo || null,
        cantidad_rondas: form.cantidad_rondas ? Number(form.cantidad_rondas) : null,
        fecha_fin: form.fecha_fin || null,
        participantes: form.participantes ? Number(form.participantes) : null,
        lugar: form.lugar || null,
        link_inscripcion: form.link_inscripcion || null,
        premios: form.premios || null,
        descripcion: form.descripcion || null,
      };
      if (torneoId) {
        // Ya existe (se creó en un submit anterior, o estamos editando uno existente).
        await actualizarTorneo(torneoId, payload);
      } else {
        const nuevo = await crearTorneo(payload);
        setTorneoId(nuevo.id);
      }
      onSaved?.();
      // Dejamos el diálogo abierto tras crear, para permitir subir el Excel
      // de resultados a continuación sin tener que reabrirlo.
      if (mode === "edit") {
        onOpenChange(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar el torneo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCuadroCruzadoFile = async (file: File) => {
    if (!torneoId) return;
    setUploadedFiles((prev) => ({ ...prev, cuadro: file.name }));
    setImportando(true);
    setImportError(null);
    setImportResult(null);
    try {
      const resultado = await importarResultadosTorneo(torneoId, file);
      setImportResult(resultado);
      onSaved?.();
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "No se pudo procesar el archivo.");
    } finally {
      setImportando(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (id === "cuadro") {
      setImportResult(null);
      setImportError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Nuevo Torneo" : "Editar Torneo"}</DialogTitle>
          <DialogDescription>
            Complete los datos del torneo. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {/* DATOS BÁSICOS */}
          <FormField label="Nombre *">
            <Input placeholder="Ej: Copa Vendimia 2025" value={form.nombre} onChange={(e) => set("nombre")(e.target.value)} />
          </FormField>
          <FormGrid>
            <FormField label="Liga *">
              <Select value={form.id_liga} onValueChange={set("id_liga")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar liga" /></SelectTrigger>
                <SelectContent>
                  {ligas.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>{l.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Estado *">
              <Select value={form.estado} onValueChange={set("estado")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Próximo">Próximo</SelectItem>
                  <SelectItem value="En curso">En curso</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Fecha de Inicio *">
              <Input type="date" value={form.fecha} onChange={(e) => set("fecha")(e.target.value)} />
            </FormField>
            <FormField label="Fecha de Fin *">
              <Input type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormGrid>
            <FormField label="Sistema *">
              <Select value={form.tipo_torneo} onValueChange={set("tipo_torneo")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar sistema" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Suizo">Suizo</SelectItem>
                  <SelectItem value="Round Robin">Round Robin</SelectItem>
                  <SelectItem value="Eliminación">Eliminación</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Ritmo *">
              <Input placeholder={'Ej: 90\'+30" por jugador'} value={form.ritmo} onChange={(e) => set("ritmo")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormField label="Modalidad (define qué ELO actualiza al importar resultados)">
            <Select value={form.tipo_ritmo} onValueChange={set("tipo_ritmo")}>
              <SelectTrigger className="sm:w-1/2"><SelectValue placeholder="Blitz / Rápida / Clásica" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Blitz">Blitz</SelectItem>
                <SelectItem value="Rápida">Rápida</SelectItem>
                <SelectItem value="Clásica">Clásica</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormGrid>
            <FormField label="Rondas *">
              <Input type="number" placeholder="Ej: 7" value={form.cantidad_rondas} onChange={(e) => set("cantidad_rondas")(e.target.value)} />
            </FormField>
            <FormField label="Participantes *">
              <Input type="number" placeholder="Ej: 32" value={form.participantes} onChange={(e) => set("participantes")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormField label="Lugar *">
            <Input placeholder="Ej: Club Andino de Ajedrez, Mendoza" value={form.lugar} onChange={(e) => set("lugar")(e.target.value)} />
          </FormField>
          <FormField label="Formulario de inscripción (link)">
            <Input placeholder="https://..." value={form.link_inscripcion} onChange={(e) => set("link_inscripcion")(e.target.value)} />
          </FormField>
          <FormGrid>
            <FormField label="Organizador *">
              <Input placeholder="Ej: Liga Mendocina de Ajedrez" value={form.organizador} onChange={(e) => set("organizador")(e.target.value)} />
            </FormField>
            <FormField label="Árbitro *">
              <Input placeholder="Ej: AI Carlos Sosa" value={form.arbitro} onChange={(e) => set("arbitro")(e.target.value)} />
            </FormField>
          </FormGrid>
          <FormField label="Premios">
            <Textarea placeholder="Ej: 1° $200.000 · 2° $100.000 · 3° $50.000" rows={2} value={form.premios} onChange={(e) => set("premios")(e.target.value)} />
          </FormField>
          <FormField label="Descripción">
            <Textarea placeholder="Descripción del torneo..." rows={3} value={form.descripcion} onChange={(e) => set("descripcion")(e.target.value)} />
          </FormField>
          <FormError message={error} />

          {/* GUARDAR DATOS BÁSICOS ANTES DE IMPORTAR */}
          {mode === "new" && !torneoId && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleSubmit} disabled={saving}>
                {saving ? "Guardando..." : "Guardar datos y continuar"}
              </Button>
            </div>
          )}

          {/* CHESS RESULT UPLOAD */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={18} className="text-amber-500" />
              <h3 className="font-semibold text-sm">Resultados de Chess Result</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 flex items-start gap-1.5">
              <Info size={13} className="mt-0.5 shrink-0" />
              {torneoId
                ? "Suba el Excel \"Cuadro cruzado por clasificación final\" que exporta Chess Result. El sistema carga automáticamente los resultados y las partidas de cada ronda."
                : "Guarde primero los datos básicos del torneo para poder importar el Excel de resultados."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chessResultFiles.map((file) => {
                const habilitado = file.id === "cuadro" && !!torneoId;
                return (
                  <div
                    key={file.id}
                    className={cn(
                      "rounded-lg border border-dashed border-border p-4 transition-colors",
                      habilitado ? "hover:border-amber-600/40" : "opacity-50"
                    )}
                  >
                    <p className="text-sm font-medium">{file.label}</p>
                    <p className="text-xs text-muted-foreground mb-3">{file.desc}</p>
                    {uploadedFiles[file.id] ? (
                      <div className="flex items-center gap-2 bg-amber-600/10 rounded-md px-3 py-2">
                        <FileSpreadsheet size={16} className="text-amber-500 shrink-0" />
                        <span className="text-sm text-amber-500 truncate flex-1">{uploadedFiles[file.id]}</span>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className={cn(
                        "flex items-center justify-center gap-2 rounded-md bg-secondary/50 px-3 py-2 transition-colors",
                        habilitado ? "cursor-pointer hover:bg-amber-600/10" : "cursor-not-allowed"
                      )}>
                        <Upload size={15} className="text-amber-500" />
                        <span className="text-sm text-muted-foreground">
                          {file.id === "cuadro" && importando ? "Procesando..." : "Subir Excel"}
                        </span>
                        <input
                          type="file"
                          accept=".xls,.xlsx,.csv"
                          className="hidden"
                          disabled={!habilitado || importando}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f && file.id === "cuadro") handleCuadroCruzadoFile(f);
                            else if (f) setUploadedFiles((prev) => ({ ...prev, [file.id]: f.name }));
                          }}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

            {importError && (
              <p className="text-xs text-red-400 mt-3 flex items-center gap-1.5">
                <AlertTriangle size={13} /> {importError}
              </p>
            )}

            {importResult && (
              <div className="mt-3 rounded-lg border border-amber-600/20 bg-amber-600/5 p-3 space-y-1.5">
                <p className="text-sm font-medium flex items-center gap-1.5 text-amber-500">
                  <CheckCircle2 size={15} /> Importación completada
                </p>
                <p className="text-xs text-muted-foreground">
                  {importResult.rondas_detectadas} rondas · {importResult.resultados_creados} resultados ·{" "}
                  {importResult.partidas_creadas} partidas cargadas · {importResult.jugadores_encontrados} jugadores existentes ·{" "}
                  {importResult.jugadores_creados} jugadores nuevos.
                </p>
                <p className="text-xs text-muted-foreground">
                  {importResult.elo_actualizado
                    ? `ELO recalculado para ${importResult.jugadores_con_elo_actualizado} jugadores.`
                    : "El ELO no se actualizó (asigná una Modalidad al torneo para que se calcule)."}
                </p>
                {importResult.avisos.length > 0 && (
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 pt-1">
                    {importResult.avisos.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          <Button className="gold-gradient text-black font-semibold hover:opacity-90" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : mode === "new" ? "Guardar Torneo" : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════ NOTICIA ═══════════════ */
interface NoticiaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "new" | "edit";
  editId?: number | null;
  onSaved?: () => void;
}

const noticiaVacia = {
  titulo: "",
  fecha: "",
  categoria: "",
  resumen: "",
  texto: "",
  imagen: "",
};

export function NoticiaFormDialog({ open, onOpenChange, mode, editId, onSaved }: NoticiaFormDialogProps) {
  const [form, setForm] = useState(noticiaVacia);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && editId) {
      getNoticia(editId)
        .then((n) => {
          setForm({
            titulo: n.titulo,
            fecha: n.fecha,
            categoria: n.categoria ?? "",
            resumen: n.resumen ?? "",
            texto: n.texto ?? "",
            imagen: n.imagen ?? "",
          });
        })
        .catch(() => setError("No se pudo cargar la noticia."));
    } else {
      setForm(noticiaVacia);
    }
  }, [open, mode, editId]);

  const set = (campo: keyof typeof noticiaVacia) => (valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.titulo || !form.fecha) {
      setError("Título y fecha son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo,
        fecha: form.fecha,
        categoria: form.categoria || null,
        resumen: form.resumen || null,
        texto: form.texto || null,
        imagen: form.imagen || null,
      };
      if (mode === "new") {
        await crearNoticia(payload);
      } else if (editId) {
        await actualizarNoticia(editId, payload);
      }
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar la noticia.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Nueva Noticia" : "Editar Noticia"}</DialogTitle>
          <DialogDescription>
            Complete los datos de la noticia. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Título *">
            <Input placeholder="Ej: Martín Ríos gana el Torneo Apertura 2025" value={form.titulo} onChange={(e) => set("titulo")(e.target.value)} />
          </FormField>
          <FormGrid>
            <FormField label="Fecha *">
              <Input type="date" value={form.fecha} onChange={(e) => set("fecha")(e.target.value)} />
            </FormField>
            <FormField label="Categoría *">
              <Select value={form.categoria} onValueChange={set("categoria")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Torneos">Torneos</SelectItem>
                  <SelectItem value="Inscripciones">Inscripciones</SelectItem>
                  <SelectItem value="Institucional">Institucional</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormGrid>
          <FormField label="Resumen *">
            <Textarea placeholder="Resumen breve de la noticia..." rows={2} value={form.resumen} onChange={(e) => set("resumen")(e.target.value)} />
          </FormField>
          <FormField label="Contenido Completo *">
            <Textarea placeholder="Escriba el contenido completo de la noticia..." rows={6} value={form.texto} onChange={(e) => set("texto")(e.target.value)} />
          </FormField>
          <FormField label="URL de Imagen">
            <Input placeholder="https://..." value={form.imagen} onChange={(e) => set("imagen")(e.target.value)} />
          </FormField>
          <FormError message={error} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="gold-gradient text-black font-semibold hover:opacity-90" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : mode === "new" ? "Publicar Noticia" : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════ MEDALLA ═══════════════ */
interface MedallaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "new" | "edit";
  editId?: number | null;
  onSaved?: () => void;
}

const medallaVacia = {
  destinatarioTipo: "jugador" as "jugador" | "club",
  id_jugador: "",
  id_club: "",
  nombre: "",
  metal: "",
  id_torneo: "",
  fecha: "",
};

export function MedallaFormDialog({ open, onOpenChange, mode, editId, onSaved }: MedallaFormDialogProps) {
  const [jugadores, setJugadores] = useState<JugadorListado[]>([]);
  const [clubes, setClubes] = useState<ClubListado[]>([]);
  const [torneos, setTorneos] = useState<TorneoListado[]>([]);
  const [form, setForm] = useState(medallaVacia);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    getJugadores().then(setJugadores).catch(() => {});
    getClubes().then(setClubes).catch(() => {});
    getTorneos().then(setTorneos).catch(() => {});
    setError(null);
    if (mode === "edit" && editId) {
      getMedalla(editId)
        .then((m) => {
          setForm({
            destinatarioTipo: m.id_club ? "club" : "jugador",
            id_jugador: m.id_jugador ?? "",
            id_club: m.id_club ? String(m.id_club) : "",
            nombre: m.nombre,
            metal: m.metal,
            id_torneo: m.id_torneo ? String(m.id_torneo) : "",
            fecha: m.fecha ?? "",
          });
        })
        .catch(() => setError("No se pudo cargar la medalla."));
    } else {
      setForm(medallaVacia);
    }
  }, [open, mode, editId]);

  const set = (campo: keyof typeof medallaVacia) => (valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.nombre || !form.metal) {
      setError("Nombre y distinción son obligatorios.");
      return;
    }
    if (form.destinatarioTipo === "jugador" && !form.id_jugador) {
      setError("Seleccioná un jugador.");
      return;
    }
    if (form.destinatarioTipo === "club" && !form.id_club) {
      setError("Seleccioná un club.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        metal: form.metal,
        fecha: form.fecha || null,
        id_torneo: form.id_torneo ? Number(form.id_torneo) : null,
        id_jugador: form.destinatarioTipo === "jugador" ? form.id_jugador : null,
        id_club: form.destinatarioTipo === "club" ? Number(form.id_club) : null,
      };
      if (mode === "new") {
        await crearMedalla(payload);
      } else if (editId) {
        await actualizarMedalla(editId, payload);
      }
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar la medalla.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Nueva Medalla" : "Editar Medalla"}</DialogTitle>
          <DialogDescription>
            Asigná una medalla o distinción a un jugador o a un club. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Se otorga a *">
            <Select
              value={form.destinatarioTipo}
              onValueChange={(v) => setForm((prev) => ({ ...prev, destinatarioTipo: v as "jugador" | "club" }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jugador">Un jugador</SelectItem>
                <SelectItem value="club">Un club</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {form.destinatarioTipo === "jugador" ? (
            <FormField label="Jugador *">
              <Select value={form.id_jugador} onValueChange={set("id_jugador")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar jugador" /></SelectTrigger>
                <SelectContent>
                  {jugadores.map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.nombre} {j.apellido}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          ) : (
            <FormField label="Club *">
              <Select value={form.id_club} onValueChange={set("id_club")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar club" /></SelectTrigger>
                <SelectContent>
                  {clubes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          <FormField label="Nombre de la distinción *">
            <Input
              placeholder='Ej: "Campeón Absoluto", "Mejor Sub-20", "Mejor Senior +50"'
              value={form.nombre}
              onChange={(e) => set("nombre")(e.target.value)}
            />
          </FormField>

          <FormGrid>
            <FormField label="Tipo *">
              <Select value={form.metal} onValueChange={set("metal")}>
                <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oro">Oro</SelectItem>
                  <SelectItem value="Plata">Plata</SelectItem>
                  <SelectItem value="Bronce">Bronce</SelectItem>
                  <SelectItem value="Distinción">Distinción especial</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Fecha">
              <Input placeholder="Ej: 2025 o 2025-04-12" value={form.fecha} onChange={(e) => set("fecha")(e.target.value)} />
            </FormField>
          </FormGrid>

          <FormField label="Torneo (opcional)">
            <Select value={form.id_torneo} onValueChange={set("id_torneo")}>
              <SelectTrigger><SelectValue placeholder="Sin torneo asociado" /></SelectTrigger>
              <SelectContent>
                {torneos.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormError message={error} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="gold-gradient text-black font-semibold hover:opacity-90" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : mode === "new" ? "Crear Medalla" : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
