export type CategoriaElo = "blitz" | "rapida" | "clasica";

export interface Jugador {
  id: number;
  nombre: string;
  apellido: string;
  club: string;
  ciudad: string;
  categoria: string;
  lmaId: string;
  fideId: string;
  fechaNacimiento: string;
  edad: number;
  estado: "Activo" | "Inactivo" | "Suspendido";
  elo: {
    blitz: number;
    rapida: number;
    clasica: number;
  };
  variacion: {
    blitz: number;
    rapida: number;
    clasica: number;
  };
  mejorElo: {
    blitz: number;
    rapida: number;
    clasica: number;
  };
  historicoElo: { fecha: string; blitz: number; rapida: number; clasica: number }[];
  estadisticas: {
    victorias: number;
    derrotas: number;
    tablas: number;
    partidas: number;
  };
  torneos: { nombre: string; fecha: string; posicion: number; categoria: string }[];
  trofeos: { nombre: string; torneo: string; fecha: string; tipo: string }[];
  medallas: { nombre: string; torneo: string; fecha: string; metal: "oro" | "plata" | "bronce" }[];
}

const nombres = [
  "Martín", "Carolina", "Lucas", "Valentina", "Rodrigo", "Sofía",
  "Federico", "María", "Joaquín", "Lucía", "Tomás", "Florencia",
];
const apellidos = [
  "Ríos", "Vega", "Fernández", "Cruz", "Mendez", "Blanco",
  "Paz", "Soto", "Acosta", "Lara", "Ortega", "Díaz",
];
const clubes = [
  "Club Andino de Ajedrez", "Ajedrez San Martín", "Club Luján de Cuyo", "Club Godoy Cruz", "Maipú Ajedrez",
];
const ciudades = ["Mendoza", "San Martín", "Luján de Cuyo", "Godoy Cruz", "Maipú"];
const categorias = ["Primera", "Segunda", "Tercera", "Sub-18"];

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function genHistoricoElo(rng: () => number, base: { blitz: number; rapida: number; clasica: number }) {
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const result: { fecha: string; blitz: number; rapida: number; clasica: number }[] = [];
  let b = base.blitz - 150;
  let r = base.rapida - 150;
  let c = base.clasica - 150;
  for (let i = 0; i < 12; i++) {
    b += Math.round((rng() - 0.35) * 40);
    r += Math.round((rng() - 0.35) * 35);
    c += Math.round((rng() - 0.35) * 30);
    result.push({ fecha: `${meses[i]} 2024`, blitz: b, rapida: r, clasica: c });
  }
  result.push({ fecha: "Ene 2025", blitz: base.blitz, rapida: base.rapida, clasica: base.clasica });
  return result;
}

function genTorneos(rng: () => number, cantidad: number) {
  const nombresTorneo = [
    "Torneo Apertura", "Copa Vendimia", "Open Provincial", "Torneo Clausura",
    "Open de Invierno", "Torneo Aniversario", "Copa de la Montaña",
  ];
  const result: { nombre: string; fecha: string; posicion: number; categoria: string }[] = [];
  for (let i = 0; i < cantidad; i++) {
    result.push({
      nombre: `${nombresTorneo[Math.floor(rng() * nombresTorneo.length)]} 202${4 + (i % 2)}`,
      fecha: `202${4 + (i % 2)}-${String(Math.floor(rng() * 12) + 1).padStart(2, "0")}-${String(Math.floor(rng() * 28) + 1).padStart(2, "0")}`,
      posicion: Math.floor(rng() * 20) + 1,
      categoria: categorias[Math.floor(rng() * categorias.length)],
    });
  }
  return result.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

function genTrofeos(rng: () => number, cantidad: number) {
  const tipos = ["Campeón", "Subcampeón", "Mejor Jugador", "Revelación"];
  const torneosN = ["Copa Vendimia 2024", "Torneo Apertura 2024", "Open Provincial 2023", "Torneo Clausura 2023"];
  const result: { nombre: string; torneo: string; fecha: string; tipo: string }[] = [];
  for (let i = 0; i < cantidad; i++) {
    result.push({
      nombre: tipos[Math.floor(rng() * tipos.length)],
      torneo: torneosN[Math.floor(rng() * torneosN.length)],
      fecha: `202${3 + Math.floor(rng() * 2)}`,
      tipo: tipos[Math.floor(rng() * tipos.length)],
    });
  }
  return result;
}

function genMedallas(rng: () => number, cantidad: number) {
  const metales: ("oro" | "plata" | "bronce")[] = ["oro", "plata", "bronce"];
  const torneosN = ["Copa Vendimia", "Torneo Apertura", "Open Provincial", "Torneo Clausura"];
  const result: { nombre: string; torneo: string; fecha: string; metal: "oro" | "plata" | "bronce" }[] = [];
  for (let i = 0; i < cantidad; i++) {
    result.push({
      nombre: `Podio ${metales[Math.floor(rng() * 3)]}`,
      torneo: `${torneosN[Math.floor(rng() * torneosN.length)]} 202${3 + Math.floor(rng() * 2)}`,
      fecha: `202${3 + Math.floor(rng() * 2)}`,
      metal: metales[Math.floor(rng() * 3)],
    });
  }
  return result;
}

function buildJugadores(): Jugador[] {
  const result: Jugador[] = [];
  for (let i = 0; i < 12; i++) {
    const rng = seedRandom((i + 1) * 1000);
    const baseBlitz = 1500 + Math.floor(rng() * 700);
    const baseRapida = 1550 + Math.floor(rng() * 650);
    const baseClasica = 1600 + Math.floor(rng() * 600);
    const partidas = 50 + Math.floor(rng() * 150);
    const victorias = Math.floor(partidas * (0.35 + rng() * 0.3));
    const tablas = Math.floor(partidas * (0.15 + rng() * 0.2));
    const derrotas = partidas - victorias - tablas;

    result.push({
      id: i + 1,
      nombre: nombres[i],
      apellido: apellidos[i],
      club: clubes[i % clubes.length],
      ciudad: ciudades[i % ciudades.length],
      categoria: categorias[Math.floor(rng() * categorias.length)],
      lmaId: `LMA-${String(i + 1).padStart(5, "0")}`,
      fideId: `AR-${String(100000 + i * 137).padStart(6, "0")}`,
      fechaNacimiento: `${1985 + Math.floor(rng() * 20)}-${String(Math.floor(rng() * 12) + 1).padStart(2, "0")}-${String(Math.floor(rng() * 28) + 1).padStart(2, "0")}`,
      edad: 2025 - (1985 + Math.floor(rng() * 20)),
      estado: rng() > 0.15 ? "Activo" : rng() > 0.5 ? "Inactivo" : "Suspendido",
      elo: { blitz: baseBlitz, rapida: baseRapida, clasica: baseClasica },
      variacion: {
        blitz: Math.round((rng() - 0.4) * 40),
        rapida: Math.round((rng() - 0.4) * 35),
        clasica: Math.round((rng() - 0.4) * 30),
      },
      mejorElo: {
        blitz: baseBlitz + Math.floor(rng() * 100),
        rapida: baseRapida + Math.floor(rng() * 80),
        clasica: baseClasica + Math.floor(rng() * 60),
      },
      historicoElo: genHistoricoElo(rng, { blitz: baseBlitz, rapida: baseRapida, clasica: baseClasica }),
      estadisticas: { victorias, derrotas, tablas, partidas },
      torneos: genTorneos(rng, 4 + Math.floor(rng() * 4)),
      trofeos: genTrofeos(rng, 1 + Math.floor(rng() * 4)),
      medallas: genMedallas(rng, 1 + Math.floor(rng() * 5)),
    });
  }
  return result;
}

export const mockJugadores: Jugador[] = buildJugadores();

export function getJugadorById(id: number): Jugador | undefined {
  return mockJugadores.find((j) => j.id === id);
}

export interface Club {
  id: number;
  nombre: string;
  nombreCorto: string;
  departamento: string;
  provincia: string;
  fundacion: number;
  presidente: string;
  sede: string;
  redes: { facebook?: string; instagram?: string; twitter?: string; web?: string };
  miembros: number;
  puntos: number;
  eloPromedio: number;
  campeonatos: number;
  torneosGanados: number;
  trofeos: { nombre: string; torneo: string; fecha: string }[];
  medallas: { nombre: string; torneo: string; fecha: string; metal: "oro" | "plata" | "bronce" }[];
  color: string;
}

export const mockClubes: Club[] = [
  {
    id: 1,
    nombre: "Club Andino de Ajedrez",
    nombreCorto: "Andino",
    departamento: "Capital",
    provincia: "Mendoza",
    fundacion: 1978,
    presidente: "Roberto Sánchez",
    sede: "Av. San Martín 1024, Mendoza",
    redes: { facebook: "/clubandino.ajedrez", instagram: "@andino.ajedrez", web: "www.clubandinoajedrez.org" },
    miembros: 45,
    puntos: 482,
    eloPromedio: 1980,
    campeonatos: 12,
    torneosGanados: 28,
    trofeos: [
      { nombre: "Campeón Liga Oficial", torneo: "Liga Oficial 2024", fecha: "2024" },
      { nombre: "Campeón Copa Vendimia", torneo: "Copa Vendimia 2024", fecha: "2024" },
      { nombre: "Campeón Torneo Apertura", torneo: "Torneo Apertura 2024", fecha: "2024" },
      { nombre: "Subcampeón Open Provincial", torneo: "Open Provincial 2023", fecha: "2023" },
    ],
    medallas: [
      { nombre: "Oro por equipos", torneo: "Liga Oficial 2024", fecha: "2024", metal: "oro" },
      { nombre: "Oro por equipos", torneo: "Copa Vendimia 2024", fecha: "2024", metal: "oro" },
      { nombre: "Plata por equipos", torneo: "Open Provincial 2023", fecha: "2023", metal: "plata" },
      { nombre: "Bronce por equipos", torneo: "Torneo Clausura 2023", fecha: "2023", metal: "bronce" },
    ],
    color: "#daa520",
  },
  {
    id: 2,
    nombre: "Ajedrez San Martín",
    nombreCorto: "San Martín",
    departamento: "San Martín",
    provincia: "Mendoza",
    fundacion: 1985,
    presidente: "Laura Giménez",
    sede: "Calle Mendoza 850, San Martín",
    redes: { facebook: "/ajedrezsantamartin", instagram: "@ajedrez.sanmartin" },
    miembros: 30,
    puntos: 368,
    eloPromedio: 1850,
    campeonatos: 8,
    torneosGanados: 18,
    trofeos: [
      { nombre: "Campeón Liga Segunda", torneo: "Liga Segunda 2024", fecha: "2024" },
      { nombre: "Subcampeón Copa Vendimia", torneo: "Copa Vendimia 2023", fecha: "2023" },
    ],
    medallas: [
      { nombre: "Oro por equipos", torneo: "Liga Segunda 2024", fecha: "2024", metal: "oro" },
      { nombre: "Plata por equipos", torneo: "Copa Vendimia 2023", fecha: "2023", metal: "plata" },
      { nombre: "Bronce por equipos", torneo: "Open Provincial 2023", fecha: "2023", metal: "bronce" },
    ],
    color: "#7c3aed",
  },
  {
    id: 3,
    nombre: "Club Luján de Cuyo",
    nombreCorto: "Luján",
    departamento: "Luján de Cuyo",
    provincia: "Mendoza",
    fundacion: 1992,
    presidente: "Carlos Pereyra",
    sede: "Av. San Martín 2100, Luján de Cuyo",
    redes: { facebook: "/clublujan.ajedrez", web: "www.clublujanajedrez.com" },
    miembros: 22,
    puntos: 295,
    eloPromedio: 1760,
    campeonatos: 5,
    torneosGanados: 12,
    trofeos: [
      { nombre: "Campeón Torneo Clausura", torneo: "Torneo Clausura 2023", fecha: "2023" },
    ],
    medallas: [
      { nombre: "Plata por equipos", torneo: "Liga Oficial 2024", fecha: "2024", metal: "plata" },
      { nombre: "Bronce por equipos", torneo: "Copa Vendimia 2024", fecha: "2024", metal: "bronce" },
    ],
    color: "#0ea5e9",
  },
  {
    id: 4,
    nombre: "Club Godoy Cruz",
    nombreCorto: "Godoy Cruz",
    departamento: "Godoy Cruz",
    provincia: "Mendoza",
    fundacion: 1980,
    presidente: "Ana Ruiz",
    sede: "Calle Las Heras 540, Godoy Cruz",
    redes: { facebook: "/clubgodoy.ajedrez", instagram: "@godoy.ajedrez", twitter: "@godoycruz_ajedrez" },
    miembros: 38,
    puntos: 410,
    eloPromedio: 1900,
    campeonatos: 10,
    torneosGanados: 22,
    trofeos: [
      { nombre: "Campeón Open Provincial", torneo: "Open Provincial 2024", fecha: "2024" },
      { nombre: "Subcampeón Liga Oficial", torneo: "Liga Oficial 2023", fecha: "2023" },
      { nombre: "Campeón Torneo Aniversario", torneo: "Torneo Aniversario 2023", fecha: "2023" },
    ],
    medallas: [
      { nombre: "Oro por equipos", torneo: "Open Provincial 2024", fecha: "2024", metal: "oro" },
      { nombre: "Plata por equipos", torneo: "Liga Oficial 2023", fecha: "2023", metal: "plata" },
    ],
    color: "#10b981",
  },
  {
    id: 5,
    nombre: "Maipú Ajedrez",
    nombreCorto: "Maipú",
    departamento: "Maipú",
    provincia: "Mendoza",
    fundacion: 2001,
    presidente: "Diego Romero",
    sede: "Calle Ozamis 230, Maipú",
    redes: { facebook: "/maipu.ajedrez", instagram: "@maipu.ajedrez" },
    miembros: 18,
    puntos: 215,
    eloPromedio: 1640,
    campeonatos: 3,
    torneosGanados: 7,
    trofeos: [
      { nombre: "Campeón Liga Tercera", torneo: "Liga Tercera 2024", fecha: "2024" },
    ],
    medallas: [
      { nombre: "Oro por equipos", torneo: "Liga Tercera 2024", fecha: "2024", metal: "oro" },
      { nombre: "Bronce por equipos", torneo: "Open Provincial 2024", fecha: "2024", metal: "bronce" },
    ],
    color: "#f97316",
  },
];

export function getClubById(id: number): Club | undefined {
  return mockClubes.find((c) => c.id === id);
}

export function getJugadoresByClub(clubNombre: string): Jugador[] {
  return mockJugadores.filter((j) => j.club === clubNombre);
}

export function getClubByNombre(nombre: string): Club | undefined {
  return mockClubes.find((c) => c.nombre === nombre);
}

export interface ResultadoRonda {
  jugadorId: number;
  oponenteId: number;
  color: "blancas" | "negras";
  resultado: "victoria" | "derrota" | "tablas";
}

export interface Ronda {
  numero: number;
  fecha: string;
  partidas: { blancasId: number; negrasId: number; resultado: "1-0" | "0-1" | "½-½" }[];
}

export interface Torneo {
  id: number;
  nombre: string;
  liga: string;
  ligaId: number;
  fecha: string;
  fechaFin: string;
  tipo: string;
  ritmo: string;
  rondas: number;
  estado: "Próximo" | "En curso" | "Finalizado";
  participantes: number;
  lugar: string;
  descripcion: string;
  organizador: string;
  arbitro: string;
  premios: string;
  ganador?: { jugadorId: number; nombre: string };
  variacionElo: number;
  puntosEntregados: number;
  tablaFinal: { jugadorId: number; posicion: number; puntos: number; variacion: number }[];
  rondasJugadas: Ronda[];
}

export const mockTorneos: Torneo[] = [
  {
    id: 1,
    nombre: "Copa Vendimia 2025",
    liga: "Liga Oficial 2025 – Primera División",
    ligaId: 1,
    fecha: "2025-08-10",
    fechaFin: "2025-08-17",
    tipo: "Round Robin",
    ritmo: "90'+30\" por jugador",
    rondas: 9,
    estado: "Próximo",
    participantes: 10,
    lugar: "Club Andino de Ajedrez, Mendoza",
    descripcion: "El torneo más prestigioso de la temporada, disputado en el marco de la Fiesta Nacional de la Vendimia.",
    organizador: "Liga Mendocina de Ajedrez",
    arbitro: "AI Carlos Sosa",
    premios: "1° $200.000 · 2° $100.000 · 3° $50.000 · Trofeos a los 3 primeros",
    variacionElo: 0,
    puntosEntregados: 0,
    tablaFinal: [],
    rondasJugadas: [],
  },
  {
    id: 2,
    nombre: "Torneo Apertura 2025",
    liga: "Liga Oficial 2025 – Segunda División",
    ligaId: 2,
    fecha: "2025-03-15",
    fechaFin: "2025-03-29",
    tipo: "Suizo",
    ritmo: "60'+30\" por jugador",
    rondas: 7,
    estado: "En curso",
    participantes: 32,
    lugar: "Club Godoy Cruz",
    descripcion: "Torneo de apertura de la temporada 2025. Sistema suizo con control de tiempo FIDE.",
    organizador: "Club Godoy Cruz",
    arbitro: "AI Laura Pérez",
    premios: "1° $80.000 · 2° $40.000 · 3° $20.000",
    variacionElo: 0,
    puntosEntregados: 0,
    tablaFinal: [],
    rondasJugadas: [],
  },
  {
    id: 3,
    nombre: "Open Juvenil Mendocino",
    liga: "Liga Juvenil 2025",
    ligaId: 3,
    fecha: "2025-09-05",
    fechaFin: "2025-09-07",
    tipo: "Suizo",
    ritmo: "15'+10\" por jugador",
    rondas: 7,
    estado: "Próximo",
    participantes: 48,
    lugar: "Maipú Ajedrez",
    descripcion: "Categorías Sub-8, Sub-10, Sub-12, Sub-14, Sub-18. Clasificatorio al torneo provincial.",
    organizador: "Maipú Ajedrez",
    arbitro: "AI Pablo Romero",
    premios: "1° Trofeo + Medalla · 2° Medalla de Plata · 3° Medalla de Bronce · Beca de entrenamiento al campeón",
    variacionElo: 0,
    puntosEntregados: 0,
    tablaFinal: [],
    rondasJugadas: [],
  },
  {
    id: 4,
    nombre: "Torneo Clausura 2024",
    liga: "Liga Oficial 2024 – Primera División",
    ligaId: 4,
    fecha: "2024-10-10",
    fechaFin: "2024-10-24",
    tipo: "Suizo",
    ritmo: "90'+30\" por jugador",
    rondas: 7,
    estado: "Finalizado",
    participantes: 28,
    lugar: "Ajedrez San Martín",
    descripcion: "Torneo de cierre de temporada 2024. Campeón: Martín Ríos.",
    organizador: "Ajedrez San Martín",
    arbitro: "AI Carlos Sosa",
    premios: "1° $150.000 · 2° $75.000 · 3° $40.000 · Trofeos a los 3 primeros",
    ganador: { jugadorId: 1, nombre: "Martín Ríos" },
    variacionElo: 185,
    puntosEntregados: 56,
    tablaFinal: [
      { jugadorId: 1, posicion: 1, puntos: 6.5, variacion: 35 },
      { jugadorId: 2, posicion: 2, puntos: 5.5, variacion: 22 },
      { jugadorId: 7, posicion: 3, puntos: 5, variacion: 18 },
      { jugadorId: 3, posicion: 4, puntos: 4.5, variacion: -5 },
      { jugadorId: 4, posicion: 5, puntos: 4, variacion: -12 },
      { jugadorId: 8, posicion: 6, puntos: 3.5, variacion: 8 },
      { jugadorId: 5, posicion: 7, puntos: 3, variacion: -8 },
      { jugadorId: 11, posicion: 8, puntos: 2.5, variacion: 5 },
    ],
    rondasJugadas: [
      {
        numero: 1, fecha: "2024-10-10",
        partidas: [
          { blancasId: 1, negrasId: 5, resultado: "1-0" },
          { blancasId: 2, negrasId: 8, resultado: "1-0" },
          { blancasId: 7, negrasId: 3, resultado: "½-½" },
          { blancasId: 4, negrasId: 11, resultado: "1-0" },
        ],
      },
      {
        numero: 2, fecha: "2024-10-12",
        partidas: [
          { blancasId: 5, negrasId: 2, resultado: "0-1" },
          { blancasId: 1, negrasId: 7, resultado: "1-0" },
          { blancasId: 3, negrasId: 4, resultado: "½-½" },
          { blancasId: 8, negrasId: 11, resultado: "1-0" },
        ],
      },
      {
        numero: 3, fecha: "2024-10-15",
        partidas: [
          { blancasId: 2, negrasId: 1, resultado: "0-1" },
          { blancasId: 7, negrasId: 5, resultado: "1-0" },
          { blancasId: 4, negrasId: 8, resultado: "1-0" },
          { blancasId: 11, negrasId: 3, resultado: "0-1" },
        ],
      },
      {
        numero: 4, fecha: "2024-10-17",
        partidas: [
          { blancasId: 1, negrasId: 3, resultado: "1-0" },
          { blancasId: 8, negrasId: 7, resultado: "0-1" },
          { blancasId: 5, negrasId: 11, resultado: "1-0" },
          { blancasId: 4, negrasId: 2, resultado: "½-½" },
        ],
      },
      {
        numero: 5, fecha: "2024-10-20",
        partidas: [
          { blancasId: 7, negrasId: 1, resultado: "0-1" },
          { blancasId: 3, negrasId: 5, resultado: "1-0" },
          { blancasId: 2, negrasId: 11, resultado: "1-0" },
          { blancasId: 8, negrasId: 4, resultado: "0-1" },
        ],
      },
      {
        numero: 6, fecha: "2024-10-22",
        partidas: [
          { blancasId: 1, negrasId: 8, resultado: "1-0" },
          { blancasId: 11, negrasId: 7, resultado: "0-1" },
          { blancasId: 5, negrasId: 4, resultado: "0-1" },
          { blancasId: 3, negrasId: 2, resultado: "½-½" },
        ],
      },
      {
        numero: 7, fecha: "2024-10-24",
        partidas: [
          { blancasId: 4, negrasId: 1, resultado: "0-1" },
          { blancasId: 2, negrasId: 5, resultado: "1-0" },
          { blancasId: 7, negrasId: 3, resultado: "1-0" },
          { blancasId: 11, negrasId: 8, resultado: "0-1" },
        ],
      },
    ],
  },
  {
    id: 5,
    nombre: "Copa Vendimia 2024",
    liga: "Liga Oficial 2024 – Primera División",
    ligaId: 4,
    fecha: "2024-08-10",
    fechaFin: "2024-08-17",
    tipo: "Round Robin",
    ritmo: "90'+30\" por jugador",
    rondas: 9,
    estado: "Finalizado",
    participantes: 10,
    lugar: "Club Andino de Ajedrez, Mendoza",
    descripcion: "Edición 2024 de la Copa Vendimia. Campeón: Martín Ríos.",
    organizador: "Liga Mendocina de Ajedrez",
    arbitro: "AI Carlos Sosa",
    premios: "1° $200.000 · 2° $100.000 · 3° $50.000 · Trofeos a los 3 primeros",
    ganador: { jugadorId: 1, nombre: "Martín Ríos" },
    variacionElo: 210,
    puntosEntregados: 72,
    tablaFinal: [
      { jugadorId: 1, posicion: 1, puntos: 8, variacion: 42 },
      { jugadorId: 4, posicion: 2, puntos: 6.5, variacion: 28 },
      { jugadorId: 2, posicion: 3, puntos: 6, variacion: 15 },
      { jugadorId: 7, posicion: 4, puntos: 5, variacion: 10 },
      { jugadorId: 3, posicion: 5, puntos: 4.5, variacion: -8 },
      { jugadorId: 8, posicion: 6, puntos: 4, variacion: -3 },
      { jugadorId: 5, posicion: 7, puntos: 3, variacion: -15 },
      { jugadorId: 12, posicion: 8, puntos: 2, variacion: -20 },
    ],
    rondasJugadas: [
      {
        numero: 1, fecha: "2024-08-10",
        partidas: [
          { blancasId: 1, negrasId: 12, resultado: "1-0" },
          { blancasId: 4, negrasId: 5, resultado: "1-0" },
          { blancasId: 2, negrasId: 7, resultado: "1-0" },
          { blancasId: 3, negrasId: 8, resultado: "½-½" },
        ],
      },
      {
        numero: 2, fecha: "2024-08-11",
        partidas: [
          { blancasId: 12, negrasId: 4, resultado: "0-1" },
          { blancasId: 5, negrasId: 2, resultado: "0-1" },
          { blancasId: 7, negrasId: 3, resultado: "½-½" },
          { blancasId: 8, negrasId: 1, resultado: "0-1" },
        ],
      },
      {
        numero: 3, fecha: "2024-08-12",
        partidas: [
          { blancasId: 4, negrasId: 1, resultado: "0-1" },
          { blancasId: 2, negrasId: 7, resultado: "1-0" },
          { blancasId: 3, negrasId: 5, resultado: "1-0" },
          { blancasId: 12, negrasId: 8, resultado: "0-1" },
        ],
      },
      {
        numero: 4, fecha: "2024-08-14",
        partidas: [
          { blancasId: 1, negrasId: 3, resultado: "1-0" },
          { blancasId: 7, negrasId: 12, resultado: "1-0" },
          { blancasId: 8, negrasId: 2, resultado: "0-1" },
          { blancasId: 5, negrasId: 4, resultado: "0-1" },
        ],
      },
      {
        numero: 5, fecha: "2024-08-15",
        partidas: [
          { blancasId: 3, negrasId: 1, resultado: "0-1" },
          { blancasId: 2, negrasId: 5, resultado: "1-0" },
          { blancasId: 4, negrasId: 8, resultado: "1-0" },
          { blancasId: 12, negrasId: 7, resultado: "0-1" },
        ],
      },
    ],
  },
  {
    id: 6,
    nombre: "Open Provincial 2024",
    liga: "Liga Oficial 2024 – Primera División",
    ligaId: 4,
    fecha: "2024-06-15",
    fechaFin: "2024-06-16",
    tipo: "Suizo",
    ritmo: "15'+10\" por jugador",
    rondas: 9,
    estado: "Finalizado",
    participantes: 48,
    lugar: "Club Godoy Cruz",
    descripcion: "Open blitz con participación récord. Campeón: Federico Paz.",
    organizador: "Club Godoy Cruz",
    arbitro: "AI Laura Pérez",
    premios: "1° $50.000 · 2° $25.000 · 3° $15.000",
    ganador: { jugadorId: 7, nombre: "Federico Paz" },
    variacionElo: 165,
    puntosEntregados: 96,
    tablaFinal: [
      { jugadorId: 7, posicion: 1, puntos: 8, variacion: 38 },
      { jugadorId: 1, posicion: 2, puntos: 7, variacion: 25 },
      { jugadorId: 4, posicion: 3, puntos: 6.5, variacion: 20 },
      { jugadorId: 2, posicion: 4, puntos: 6, variacion: 12 },
      { jugadorId: 3, posicion: 5, puntos: 5, variacion: 5 },
      { jugadorId: 8, posicion: 6, puntos: 4.5, variacion: -5 },
      { jugadorId: 5, posicion: 7, puntos: 4, variacion: -10 },
      { jugadorId: 9, posicion: 8, puntos: 3.5, variacion: 8 },
    ],
    rondasJugadas: [
      {
        numero: 1, fecha: "2024-06-15",
        partidas: [
          { blancasId: 7, negrasId: 9, resultado: "1-0" },
          { blancasId: 1, negrasId: 5, resultado: "1-0" },
          { blancasId: 4, negrasId: 8, resultado: "1-0" },
          { blancasId: 2, negrasId: 3, resultado: "1-0" },
        ],
      },
      {
        numero: 2, fecha: "2024-06-15",
        partidas: [
          { blancasId: 9, negrasId: 1, resultado: "0-1" },
          { blancasId: 5, negrasId: 4, resultado: "0-1" },
          { blancasId: 8, negrasId: 2, resultado: "0-1" },
          { blancasId: 3, negrasId: 7, resultado: "0-1" },
        ],
      },
      {
        numero: 3, fecha: "2024-06-16",
        partidas: [
          { blancasId: 1, negrasId: 4, resultado: "1-0" },
          { blancasId: 7, negrasId: 2, resultado: "1-0" },
          { blancasId: 3, negrasId: 5, resultado: "1-0" },
          { blancasId: 9, negrasId: 8, resultado: "1-0" },
        ],
      },
      {
        numero: 4, fecha: "2024-06-16",
        partidas: [
          { blancasId: 4, negrasId: 7, resultado: "0-1" },
          { blancasId: 2, negrasId: 1, resultado: "0-1" },
          { blancasId: 5, negrasId: 3, resultado: "0-1" },
          { blancasId: 8, negrasId: 9, resultado: "½-½" },
        ],
      },
      {
        numero: 5, fecha: "2024-06-16",
        partidas: [
          { blancasId: 7, negrasId: 1, resultado: "1-0" },
          { blancasId: 3, negrasId: 4, resultado: "0-1" },
          { blancasId: 9, negrasId: 2, resultado: "0-1" },
          { blancasId: 5, negrasId: 8, resultado: "1-0" },
        ],
      },
    ],
  },
];

export function getTorneoById(id: number): Torneo | undefined {
  return mockTorneos.find((t) => t.id === id);
}

export interface Liga {
  id: number;
  nombre: string;
  temporada: string;
  division: string;
  estado: "En curso" | "Próxima" | "Finalizada";
  ritmo: string;
  equipos: number;
  rondas: number;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  clasificacionJugadores: { jugadorId: number; puntos: number; partidas: number }[];
  clasificacionClubes: { clubId: number; puntos: number; pj: number; pg: number; pe: number; pp: number }[];
  torneos: { id: number; nombre: string; fecha: string; estado: string }[];
  calendario: { ronda: number; fecha: string; descripcion: string }[];
  historicoPuntos: { fecha: string; puntos: number }[];
}

export const mockLigas: Liga[] = [
  {
    id: 1,
    nombre: "Liga Oficial 2025 – Primera División",
    temporada: "2025",
    division: "Primera",
    estado: "En curso",
    ritmo: "90'+30\" por jugador",
    equipos: 8,
    rondas: 14,
    fechaInicio: "2025-03-01",
    fechaFin: "2025-11-30",
    descripcion: "La máxima categoría del ajedrez mendocino. Los 8 mejores clubes de la provincia compiten por el título oficial.",
    clasificacionJugadores: [
      { jugadorId: 1, puntos: 11, partidas: 12 },
      { jugadorId: 2, puntos: 9.5, partidas: 12 },
      { jugadorId: 3, puntos: 8, partidas: 12 },
      { jugadorId: 7, puntos: 7.5, partidas: 11 },
      { jugadorId: 4, puntos: 7, partidas: 12 },
    ],
    clasificacionClubes: [
      { clubId: 1, puntos: 42, pj: 14, pg: 10, pe: 3, pp: 1 },
      { clubId: 4, puntos: 38, pj: 14, pg: 9, pe: 2, pp: 3 },
      { clubId: 3, puntos: 31, pj: 14, pg: 7, pe: 3, pp: 4 },
      { clubId: 2, puntos: 28, pj: 14, pg: 6, pe: 4, pp: 4 },
      { clubId: 5, puntos: 21, pj: 14, pg: 4, pe: 3, pp: 7 },
    ],
    torneos: [
      { id: 2, nombre: "Torneo Apertura 2025", fecha: "2025-03-15", estado: "En curso" },
      { id: 1, nombre: "Copa Vendimia 2025", fecha: "2025-08-10", estado: "Próximo" },
      { id: 7, nombre: "Torneo Clausura 2025", fecha: "2025-10-05", estado: "Próximo" },
    ],
    calendario: [
      { ronda: 1, fecha: "2025-03-01", descripcion: "Andino vs San Martín · Godoy Cruz vs Luján" },
      { ronda: 2, fecha: "2025-03-15", descripcion: "Andino vs Godoy Cruz · Luján vs Maipú" },
      { ronda: 3, fecha: "2025-04-05", descripcion: "San Martín vs Luján · Andino vs Maipú" },
      { ronda: 4, fecha: "2025-04-19", descripcion: "Godoy Cruz vs San Martín · Luján vs Andino" },
      { ronda: 5, fecha: "2025-05-03", descripcion: "Maipú vs Godoy Cruz · San Martín vs Andino" },
      { ronda: 6, fecha: "2025-05-17", descripcion: "Andino vs Luján · Maipú vs San Martín" },
    ],
    historicoPuntos: [
      { fecha: "R1", puntos: 10 }, { fecha: "R2", puntos: 18 }, { fecha: "R3", puntos: 25 },
      { fecha: "R4", puntos: 33 }, { fecha: "R5", puntos: 38 }, { fecha: "R6", puntos: 42 },
    ],
  },
  {
    id: 2,
    nombre: "Liga Oficial 2025 – Segunda División",
    temporada: "2025",
    division: "Segunda",
    estado: "En curso",
    ritmo: "60'+30\" por jugador",
    equipos: 10,
    rondas: 18,
    fechaInicio: "2025-03-01",
    fechaFin: "2025-12-15",
    descripcion: "Segunda categoría del ajedrez mendocino. Diez equipos buscan el ascenso a Primera División.",
    clasificacionJugadores: [
      { jugadorId: 5, puntos: 12, partidas: 14 },
      { jugadorId: 6, puntos: 10, partidas: 14 },
      { jugadorId: 8, puntos: 9, partidas: 14 },
      { jugadorId: 11, puntos: 8.5, partidas: 13 },
      { jugadorId: 12, puntos: 7, partidas: 14 },
    ],
    clasificacionClubes: [
      { clubId: 2, puntos: 45, pj: 18, pg: 12, pe: 4, pp: 2 },
      { clubId: 5, puntos: 38, pj: 18, pg: 10, pe: 3, pp: 5 },
      { clubId: 1, puntos: 35, pj: 18, pg: 9, pe: 4, pp: 5 },
      { clubId: 4, puntos: 30, pj: 18, pg: 7, pe: 5, pp: 6 },
      { clubId: 3, puntos: 26, pj: 18, pg: 6, pe: 5, pp: 7 },
    ],
    torneos: [
      { id: 2, nombre: "Torneo Apertura 2025", fecha: "2025-03-15", estado: "En curso" },
      { id: 7, nombre: "Open de Invierno 2025", fecha: "2025-07-12", estado: "Próximo" },
      { id: 8, nombre: "Torneo Clausura 2025", fecha: "2025-10-10", estado: "Próximo" },
    ],
    calendario: [
      { ronda: 1, fecha: "2025-03-01", descripcion: "San Martín vs Maipú · Godoy Cruz vs Luján" },
      { ronda: 2, fecha: "2025-03-15", descripcion: "Andino vs San Martín · Maipú vs Godoy Cruz" },
      { ronda: 3, fecha: "2025-04-05", descripcion: "Luján vs Andino · San Martín vs Godoy Cruz" },
      { ronda: 4, fecha: "2025-04-19", descripcion: "Maipú vs Luján · Andino vs Godoy Cruz" },
    ],
    historicoPuntos: [
      { fecha: "R1", puntos: 8 }, { fecha: "R2", puntos: 15 }, { fecha: "R3", puntos: 22 },
      { fecha: "R4", puntos: 30 }, { fecha: "R5", puntos: 35 }, { fecha: "R6", puntos: 38 },
    ],
  },
  {
    id: 3,
    nombre: "Liga Juvenil 2025",
    temporada: "2025",
    division: "Juvenil",
    estado: "Próxima",
    ritmo: "15'+10\" por jugador",
    equipos: 6,
    rondas: 10,
    fechaInicio: "2025-09-01",
    fechaFin: "2025-12-20",
    descripcion: "Liga para jugadores Sub-18. Categorías Sub-8, Sub-10, Sub-12, Sub-14 y Sub-18.",
    clasificacionJugadores: [
      { jugadorId: 9, puntos: 0, partidas: 0 },
      { jugadorId: 10, puntos: 0, partidas: 0 },
    ],
    clasificacionClubes: [
      { clubId: 1, puntos: 0, pj: 0, pg: 0, pe: 0, pp: 0 },
      { clubId: 2, puntos: 0, pj: 0, pg: 0, pe: 0, pp: 0 },
      { clubId: 4, puntos: 0, pj: 0, pg: 0, pe: 0, pp: 0 },
    ],
    torneos: [
      { id: 3, nombre: "Open Juvenil Mendocino", fecha: "2025-09-05", estado: "Próximo" },
      { id: 9, nombre: "Torneo Juvenil de Verano", fecha: "2025-12-15", estado: "Próximo" },
    ],
    calendario: [
      { ronda: 1, fecha: "2025-09-01", descripcion: "Andino vs San Martín · Godoy Cruz vs Maipú" },
      { ronda: 2, fecha: "2025-09-15", descripcion: "Luján vs Andino · San Martín vs Godoy Cruz" },
    ],
    historicoPuntos: [
      { fecha: "R1", puntos: 0 }, { fecha: "R2", puntos: 0 },
    ],
  },
  {
    id: 4,
    nombre: "Liga Oficial 2024 – Primera División",
    temporada: "2024",
    division: "Primera",
    estado: "Finalizada",
    ritmo: "90'+30\" por jugador",
    equipos: 8,
    rondas: 14,
    fechaInicio: "2024-03-01",
    fechaFin: "2024-11-30",
    descripcion: "Temporada 2024 de la máxima categoría. Campeón: Club Andino de Ajedrez.",
    clasificacionJugadores: [
      { jugadorId: 1, puntos: 12, partidas: 14 },
      { jugadorId: 2, puntos: 10, partidas: 14 },
      { jugadorId: 4, puntos: 9.5, partidas: 14 },
      { jugadorId: 7, puntos: 8, partidas: 14 },
      { jugadorId: 3, puntos: 7.5, partidas: 14 },
    ],
    clasificacionClubes: [
      { clubId: 1, puntos: 48, pj: 14, pg: 12, pe: 2, pp: 0 },
      { clubId: 4, puntos: 40, pj: 14, pg: 10, pe: 1, pp: 3 },
      { clubId: 3, puntos: 33, pj: 14, pg: 7, pe: 4, pp: 3 },
      { clubId: 2, puntos: 30, pj: 14, pg: 6, pe: 5, pp: 3 },
      { clubId: 5, puntos: 19, pj: 14, pg: 3, pe: 4, pp: 7 },
    ],
    torneos: [
      { id: 10, nombre: "Torneo Apertura 2024", fecha: "2024-03-10", estado: "Finalizado" },
      { id: 5, nombre: "Copa Vendimia 2024", fecha: "2024-08-10", estado: "Finalizado" },
      { id: 4, nombre: "Torneo Clausura 2024", fecha: "2024-10-10", estado: "Finalizado" },
    ],
    calendario: [
      { ronda: 1, fecha: "2024-03-01", descripcion: "Andino vs San Martín · Godoy Cruz vs Luján" },
      { ronda: 14, fecha: "2024-11-30", descripcion: "Final: Andino vs Godoy Cruz" },
    ],
    historicoPuntos: [
      { fecha: "R1", puntos: 10 }, { fecha: "R2", puntos: 20 }, { fecha: "R3", puntos: 28 },
      { fecha: "R4", puntos: 35 }, { fecha: "R5", puntos: 42 }, { fecha: "R6", puntos: 48 },
    ],
  },
];

export function getLigaById(id: number): Liga | undefined {
  return mockLigas.find((l) => l.id === id);
}

export const mockNoticias = [
  {
    id: 1,
    titulo: "Martín Ríos gana el Torneo Apertura 2025",
    fecha: "2025-03-28",
    categoria: "Torneos",
    resumen:
      "El jugador del Club Andino se impuso en el torneo con puntaje perfecto en las últimas tres rondas, consolidando su liderato en el ranking provincial.",
  },
  {
    id: 2,
    titulo: "Inscripciones abiertas para la Copa Vendimia",
    fecha: "2025-04-01",
    categoria: "Inscripciones",
    resumen:
      "La Liga Mendocina de Ajedrez abre las inscripciones para uno de los torneos más tradicionales de la temporada. Cupos limitados a 10 participantes.",
  },
  {
    id: 3,
    titulo: "Nuevo club afiliado: Maipú Ajedrez",
    fecha: "2025-02-15",
    categoria: "Institucional",
    resumen:
      "La Liga da la bienvenida al Club Maipú Ajedrez, que se suma a la familia del ajedrez mendocino con 18 jugadores activos.",
  },
];

export const mockStats = {
  jugadores: 320,
  clubes: 15,
  ligas: 4,
  torneos: 28,
  partidasJugadas: 4820,
  temporadaActual: "2025",
};
