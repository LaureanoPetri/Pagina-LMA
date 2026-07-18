from datetime import date
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, func, or_
from sqlalchemy.orm import Session

# Importamos nuestra base de datos, modelos y esquemas
from app.core import database
from app.core import security
from app.core import resultados_import
from app.core import elo
from app.models import (
    Base,
    Jugador,
    Club,
    Liga,
    Torneo,
    Noticia,
    Departamento,
    Provincia,
    Administrador,
    ResultadoTorneo,
    HistorialELO,
    Trofeo,
    JugadorGanaPremio,
    ClubGanaTrofeo,
    Medalla,
    Partida,
    LigaCalendario,
)
from app.schemas import schemas

# Crea las tablas en PostgreSQL al iniciar el backend
Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="LMA Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ideal para desarrollo. En producción, restringir al dominio del frontend.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependencia para conectar a la base de datos
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def ruta_principal():
    return {"mensaje": "¡Mi backend de LMA está funcionando!"}


@app.get("/test-db")
def probar_base_datos(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"estado": "¡Éxito! Conectado a PostgreSQL correctamente."}
    except Exception as e:
        return {"estado": "Error de conexión", "detalle": str(e)}


# ==========================================
# HELPERS DE ARMADO DE RESPUESTAS "RICAS"
# (el frontend espera objetos con sub-estructuras anidadas, no un mapeo 1:1
# de las tablas, así que las armamos acá a partir de varias consultas)
# ==========================================

TIPO_RITMO_CAMPO = {"Blitz": "blitz", "Rápida": "rapida", "Clásica": "clasica"}


def _calcular_edad(fecha_nacimiento: Optional[date]) -> Optional[int]:
    if not fecha_nacimiento:
        return None
    hoy = date.today()
    edad = hoy.year - fecha_nacimiento.year
    if (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day):
        edad -= 1
    return edad


def _variacion_y_mejor_elo(historial: List[HistorialELO], jugador: Jugador):
    def _variacion(tipo: str) -> int:
        entradas = [h.nuevo_elo for h in historial if h.tipo_ritmo == tipo]
        if len(entradas) >= 2:
            return entradas[-1] - entradas[-2]
        return 0

    def _mejor(tipo: str, actual: int) -> int:
        entradas = [h.nuevo_elo for h in historial if h.tipo_ritmo == tipo]
        return max(entradas + [actual])

    variacion = schemas.EloBloque(blitz=_variacion("Blitz"), rapida=_variacion("Rápida"), clasica=_variacion("Clásica"))
    mejor_elo = schemas.EloBloque(
        blitz=_mejor("Blitz", jugador.elo_blitz),
        rapida=_mejor("Rápida", jugador.elo_rapida),
        clasica=_mejor("Clásica", jugador.elo_clasica),
    )
    return variacion, mejor_elo


def _jugador_list_item(db: Session, jugador: Jugador) -> schemas.JugadorListItem:
    historial = (
        db.query(HistorialELO)
        .filter(HistorialELO.id_jugador == jugador.id_lma)
        .order_by(HistorialELO.fecha.asc())
        .all()
    )
    variacion, mejor_elo = _variacion_y_mejor_elo(historial, jugador)
    return schemas.JugadorListItem(
        id=jugador.id_lma,
        nombre=jugador.nombre,
        apellido=jugador.apellido,
        club=jugador.club.nombre if jugador.club else "Sin club",
        id_club=jugador.id_club,
        ciudad=jugador.ciudad or "",
        categoria=jugador.categoria or "",
        lmaId=jugador.id_lma,
        fideId=jugador.id_fide or "",
        estado=jugador.estado,
        elo=schemas.EloBloque(blitz=jugador.elo_blitz, rapida=jugador.elo_rapida, clasica=jugador.elo_clasica),
        variacion=variacion,
        mejorElo=mejor_elo,
    )


def _jugador_response(db: Session, jugador: Jugador) -> schemas.JugadorResponse:
    historial = (
        db.query(HistorialELO)
        .filter(HistorialELO.id_jugador == jugador.id_lma)
        .order_by(HistorialELO.fecha.asc())
        .all()
    )
    variacion, mejor_elo = _variacion_y_mejor_elo(historial, jugador)

    por_fecha: dict = {}
    for h in historial:
        clave = h.fecha.isoformat() if h.fecha else "—"
        if clave not in por_fecha:
            por_fecha[clave] = {
                "fecha": clave,
                "blitz": jugador.elo_blitz,
                "rapida": jugador.elo_rapida,
                "clasica": jugador.elo_clasica,
            }
        campo = TIPO_RITMO_CAMPO.get(h.tipo_ritmo)
        if campo:
            por_fecha[clave][campo] = h.nuevo_elo
    historico_elo = [schemas.HistoricoEloPunto(**v) for v in sorted(por_fecha.values(), key=lambda x: x["fecha"])]

    partidas = (
        db.query(Partida)
        .filter(or_(Partida.id_jugador_blancas == jugador.id_lma, Partida.id_jugador_negras == jugador.id_lma))
        .all()
    )
    victorias = derrotas = tablas = 0
    for p in partidas:
        if not p.resultado or p.resultado.startswith("bye"):
            continue
        if p.resultado == "½-½":
            tablas += 1
        elif p.resultado == "1-0":
            if p.id_jugador_blancas == jugador.id_lma:
                victorias += 1
            else:
                derrotas += 1
        elif p.resultado == "0-1":
            if p.id_jugador_negras == jugador.id_lma:
                victorias += 1
            else:
                derrotas += 1
    estadisticas = schemas.EstadisticasJugador(
        victorias=victorias, derrotas=derrotas, tablas=tablas, partidas=len(partidas)
    )

    resultados = (
        db.query(ResultadoTorneo, Torneo)
        .join(Torneo, Torneo.id == ResultadoTorneo.id_torneo)
        .filter(ResultadoTorneo.id_jugador == jugador.id_lma)
        .order_by(Torneo.fecha.desc())
        .all()
    )
    torneos_jugados = [
        schemas.TorneoJugadoItem(
            id=t.id,
            nombre=t.nombre,
            fecha=t.fecha.isoformat(),
            posicion=r.posicion_final,
            categoria=jugador.categoria,
        )
        for r, t in resultados
    ]

    premios = (
        db.query(JugadorGanaPremio, Trofeo, Torneo)
        .join(Trofeo, Trofeo.id == JugadorGanaPremio.id_trofeo)
        .join(Torneo, Torneo.id == JugadorGanaPremio.id_torneo)
        .filter(JugadorGanaPremio.id_jugador == jugador.id_lma)
        .all()
    )
    trofeos = [
        schemas.TrofeoItem(nombre=trofeo.nombre, torneo=torneo.nombre, fecha=str(torneo.fecha.year), tipo=trofeo.tipo)
        for _, trofeo, torneo in premios
    ]

    medallas_db = db.query(Medalla).filter(Medalla.id_jugador == jugador.id_lma).all()
    medallas = []
    for m in medallas_db:
        torneo_rel = db.query(Torneo).filter(Torneo.id == m.id_torneo).first() if m.id_torneo else None
        medallas.append(
            schemas.MedallaItem(
                id=m.id,
                nombre=m.nombre,
                torneo=torneo_rel.nombre if torneo_rel else "—",
                fecha=m.fecha or (str(torneo_rel.fecha.year) if torneo_rel else "—"),
                metal=m.metal,
            )
        )

    return schemas.JugadorResponse(
        id=jugador.id_lma,
        nombre=jugador.nombre,
        apellido=jugador.apellido,
        club=jugador.club.nombre if jugador.club else "Sin club",
        id_club=jugador.id_club,
        ciudad=jugador.ciudad or "",
        categoria=jugador.categoria or "",
        lmaId=jugador.id_lma,
        fideId=jugador.id_fide or "",
        fechaNacimiento=jugador.fecha_nacimiento.isoformat() if jugador.fecha_nacimiento else None,
        edad=_calcular_edad(jugador.fecha_nacimiento),
        estado=jugador.estado,
        elo=schemas.EloBloque(blitz=jugador.elo_blitz, rapida=jugador.elo_rapida, clasica=jugador.elo_clasica),
        variacion=variacion,
        mejorElo=mejor_elo,
        historicoElo=historico_elo,
        estadisticas=estadisticas,
        torneos=torneos_jugados,
        trofeos=trofeos,
        medallas=medallas,
    )


def _club_aggregados(db: Session, club: Club):
    miembros = db.query(func.count(Jugador.id_lma)).filter(Jugador.id_club == club.id).scalar() or 0
    elo_promedio_raw = db.query(func.avg(Jugador.elo_clasica)).filter(Jugador.id_club == club.id).scalar()
    elo_promedio = int(round(float(elo_promedio_raw))) if elo_promedio_raw is not None else 0
    puntos = (
        db.query(func.coalesce(func.sum(ResultadoTorneo.puntos_liga), 0))
        .filter(ResultadoTorneo.id_club == club.id)
        .scalar()
        or 0
    )
    torneos_ganados = (
        db.query(func.count(ResultadoTorneo.id))
        .filter(ResultadoTorneo.id_club == club.id, ResultadoTorneo.posicion_final == 1)
        .scalar()
        or 0
    )
    campeonatos = (
        db.query(func.count(ClubGanaTrofeo.id_trofeo)).filter(ClubGanaTrofeo.id_club == club.id).scalar() or 0
    )
    return miembros, elo_promedio, int(puntos), int(torneos_ganados), int(campeonatos)


def _club_list_item(db: Session, club: Club) -> schemas.ClubListItem:
    miembros, elo_promedio, puntos, torneos_ganados, campeonatos = _club_aggregados(db, club)
    return schemas.ClubListItem(
        id=club.id,
        nombre=club.nombre,
        nombreCorto=club.nombre_corto or club.nombre,
        departamento=club.departamento or "",
        provincia=club.provincia or "",
        fundacion=club.fundacion,
        presidente=club.presidente or "",
        sede=club.sede or "",
        miembros=miembros,
        puntos=puntos,
        eloPromedio=elo_promedio,
        campeonatos=campeonatos,
        torneosGanados=torneos_ganados,
        color=club.color or "#daa520",
    )


def _club_response(db: Session, club: Club) -> schemas.ClubResponse:
    miembros, elo_promedio, puntos, torneos_ganados, campeonatos = _club_aggregados(db, club)

    trofeos_db = db.query(ClubGanaTrofeo).filter(ClubGanaTrofeo.id_club == club.id).all()
    trofeos = []
    for t in trofeos_db:
        trofeo = db.query(Trofeo).filter(Trofeo.id == t.id_trofeo).first()
        liga = db.query(Liga).filter(Liga.id == t.id_liga).first()
        if not trofeo:
            continue
        trofeos.append(
            schemas.ClubTrofeoItem(
                nombre=trofeo.nombre,
                torneo=liga.nombre if liga else "—",
                fecha=str(liga.anio) if liga else "—",
            )
        )

    medallas_db = db.query(Medalla).filter(Medalla.id_club == club.id).all()
    medallas = []
    for m in medallas_db:
        torneo_rel = db.query(Torneo).filter(Torneo.id == m.id_torneo).first() if m.id_torneo else None
        medallas.append(
            schemas.MedallaItem(
                id=m.id,
                nombre=m.nombre,
                torneo=torneo_rel.nombre if torneo_rel else "—",
                fecha=m.fecha or (str(torneo_rel.fecha.year) if torneo_rel else "—"),
                metal=m.metal,
            )
        )

    return schemas.ClubResponse(
        id=club.id,
        nombre=club.nombre,
        nombreCorto=club.nombre_corto or club.nombre,
        departamento=club.departamento or "",
        provincia=club.provincia or "",
        fundacion=club.fundacion,
        presidente=club.presidente or "",
        sede=club.sede or "",
        redes=schemas.RedesClub(
            facebook=club.facebook, instagram=club.instagram, twitter=club.x, web=club.sitio_web
        ),
        miembros=miembros,
        puntos=puntos,
        eloPromedio=elo_promedio,
        campeonatos=campeonatos,
        torneosGanados=torneos_ganados,
        trofeos=trofeos,
        medallas=medallas,
        color=club.color or "#daa520",
    )


def _liga_list_item(liga: Liga) -> schemas.LigaListItem:
    return schemas.LigaListItem(
        id=liga.id,
        nombre=liga.nombre,
        temporada=liga.temporada or str(liga.anio),
        division=liga.division or "",
        estado=liga.estado or "",
        ritmo=liga.ritmo or "",
        equipos=liga.cantidad_equipos or 0,
        rondas=liga.rondas or 0,
        fechaInicio=liga.fecha_inicio.isoformat() if liga.fecha_inicio else "",
        fechaFin=liga.fecha_fin.isoformat() if liga.fecha_fin else "",
    )


def _liga_response(db: Session, liga: Liga) -> schemas.LigaResponse:
    filas_jug = (
        db.query(
            Jugador.id_lma,
            func.coalesce(func.sum(ResultadoTorneo.puntos_liga), 0).label("puntos"),
            func.count(ResultadoTorneo.id).label("partidas"),
        )
        .join(ResultadoTorneo, ResultadoTorneo.id_jugador == Jugador.id_lma)
        .join(Torneo, Torneo.id == ResultadoTorneo.id_torneo)
        .filter(Torneo.id_liga == liga.id)
        .group_by(Jugador.id_lma)
        .order_by(func.coalesce(func.sum(ResultadoTorneo.puntos_liga), 0).desc())
        .all()
    )
    clasificacion_jugadores = [
        schemas.ClasificacionJugadorLigaItem(jugadorId=f.id_lma, puntos=float(f.puntos), partidas=int(f.partidas))
        for f in filas_jug
    ]

    filas_club = (
        db.query(
            Club.id,
            func.coalesce(func.sum(ResultadoTorneo.puntos_liga), 0).label("puntos"),
        )
        .join(ResultadoTorneo, ResultadoTorneo.id_club == Club.id)
        .join(Torneo, Torneo.id == ResultadoTorneo.id_torneo)
        .filter(Torneo.id_liga == liga.id)
        .group_by(Club.id)
        .order_by(func.coalesce(func.sum(ResultadoTorneo.puntos_liga), 0).desc())
        .all()
    )

    # pj/pg/pe/pp por club: se derivan de las partidas individuales de los
    # torneos de esta liga (no hay un concepto de "partido de equipo" en el
    # esquema, así que agregamos a nivel de partidas de jugadores).
    partidas_liga = (
        db.query(Partida)
        .join(Torneo, Torneo.id == Partida.id_torneo)
        .filter(Torneo.id_liga == liga.id)
        .all()
    )
    stats_club = {f.id: {"pj": 0, "pg": 0, "pe": 0, "pp": 0} for f in filas_club}
    jugadores_cache: dict = {}

    def _club_de(id_lma: Optional[str]) -> Optional[int]:
        if not id_lma:
            return None
        if id_lma not in jugadores_cache:
            jugadores_cache[id_lma] = db.query(Jugador).filter(Jugador.id_lma == id_lma).first()
        j = jugadores_cache[id_lma]
        return j.id_club if j else None

    for p in partidas_liga:
        if not p.resultado or p.resultado.startswith("bye"):
            continue
        club_b = _club_de(p.id_jugador_blancas)
        club_n = _club_de(p.id_jugador_negras)
        if club_b is not None and club_b in stats_club:
            stats_club[club_b]["pj"] += 1
        if club_n is not None and club_n in stats_club:
            stats_club[club_n]["pj"] += 1
        if club_b == club_n:
            continue
        if p.resultado == "1-0":
            if club_b in stats_club:
                stats_club[club_b]["pg"] += 1
            if club_n in stats_club:
                stats_club[club_n]["pp"] += 1
        elif p.resultado == "0-1":
            if club_n in stats_club:
                stats_club[club_n]["pg"] += 1
            if club_b in stats_club:
                stats_club[club_b]["pp"] += 1
        else:
            if club_b in stats_club:
                stats_club[club_b]["pe"] += 1
            if club_n in stats_club:
                stats_club[club_n]["pe"] += 1

    clasificacion_clubes = [
        schemas.ClasificacionClubLigaItem(
            clubId=f.id,
            puntos=int(f.puntos),
            pj=stats_club.get(f.id, {}).get("pj", 0),
            pg=stats_club.get(f.id, {}).get("pg", 0),
            pe=stats_club.get(f.id, {}).get("pe", 0),
            pp=stats_club.get(f.id, {}).get("pp", 0),
        )
        for f in filas_club
    ]

    torneos_db = db.query(Torneo).filter(Torneo.id_liga == liga.id).order_by(Torneo.fecha.asc()).all()
    torneos_item = [
        schemas.TorneoLigaItem(
            id=t.id, nombre=t.nombre, fecha=t.fecha.isoformat(), estado=t.estado or "",
            linkInscripcion=t.link_inscripcion,
        )
        for t in torneos_db
    ]

    calendario_db = (
        db.query(LigaCalendario).filter(LigaCalendario.id_liga == liga.id).order_by(LigaCalendario.ronda.asc()).all()
    )
    calendario = [
        schemas.CalendarioItem(
            id=c.id, ronda=c.ronda, fecha=c.fecha.isoformat() if c.fecha else None, descripcion=c.descripcion or ""
        )
        for c in calendario_db
    ]

    return schemas.LigaResponse(
        id=liga.id,
        nombre=liga.nombre,
        temporada=liga.temporada or str(liga.anio),
        division=liga.division or "",
        estado=liga.estado or "",
        ritmo=liga.ritmo or "",
        equipos=liga.cantidad_equipos or 0,
        rondas=liga.rondas or 0,
        fechaInicio=liga.fecha_inicio.isoformat() if liga.fecha_inicio else "",
        fechaFin=liga.fecha_fin.isoformat() if liga.fecha_fin else "",
        descripcion=liga.descripcion or "",
        clasificacionJugadores=clasificacion_jugadores,
        clasificacionClubes=clasificacion_clubes,
        torneos=torneos_item,
        calendario=calendario,
    )


def _torneo_list_item(db: Session, torneo: Torneo) -> schemas.TorneoListItem:
    liga = db.query(Liga).filter(Liga.id == torneo.id_liga).first() if torneo.id_liga else None
    return schemas.TorneoListItem(
        id=torneo.id,
        nombre=torneo.nombre,
        liga=liga.nombre if liga else "—",
        ligaId=torneo.id_liga,
        fecha=torneo.fecha.isoformat(),
        fechaFin=torneo.fecha_fin.isoformat() if torneo.fecha_fin else "",
        tipo=torneo.tipo_torneo or "",
        tipoRitmo=torneo.tipo_ritmo,
        ritmo=torneo.ritmo,
        rondas=torneo.cantidad_rondas or 0,
        estado=torneo.estado or "",
        participantes=torneo.participantes or 0,
        lugar=torneo.lugar or "",
        linkInscripcion=torneo.link_inscripcion,
        descripcion=torneo.descripcion or "",
    )


def _torneo_response(db: Session, torneo: Torneo) -> schemas.TorneoResponse:
    liga = db.query(Liga).filter(Liga.id == torneo.id_liga).first() if torneo.id_liga else None

    resultados = (
        db.query(ResultadoTorneo, Jugador)
        .join(Jugador, Jugador.id_lma == ResultadoTorneo.id_jugador)
        .filter(ResultadoTorneo.id_torneo == torneo.id)
        .order_by(ResultadoTorneo.posicion_final.asc().nulls_last())
        .all()
    )
    tabla_final = [
        schemas.TablaFinalItem(
            jugadorId=r.id_jugador,
            posicion=r.posicion_final,
            puntos=r.puntuacion_obtenida or 0,
            variacion=r.variacion_elo or 0,
        )
        for r, _ in resultados
    ]

    ganador = None
    for r, j in resultados:
        if r.posicion_final == 1:
            ganador = schemas.GanadorTorneo(jugadorId=j.id_lma, nombre=f"{j.nombre} {j.apellido}")
            break

    variacion_elo_total = sum((r.variacion_elo or 0) for r, _ in resultados)
    puntos_entregados = sum((r.puntos_liga or 0) for r, _ in resultados)

    partidas_db = (
        db.query(Partida).filter(Partida.id_torneo == torneo.id).order_by(Partida.ronda.asc()).all()
    )
    rondas_map: dict = {}
    for p in partidas_db:
        rondas_map.setdefault(p.ronda, []).append(
            schemas.PartidaRonda(
                blancasId=p.id_jugador_blancas, negrasId=p.id_jugador_negras, resultado=p.resultado or ""
            )
        )
    rondas_jugadas = [
        schemas.RondaJugada(numero=numero, fecha=None, partidas=partidas)
        for numero, partidas in sorted(rondas_map.items())
    ]

    return schemas.TorneoResponse(
        id=torneo.id,
        nombre=torneo.nombre,
        liga=liga.nombre if liga else "—",
        ligaId=torneo.id_liga,
        fecha=torneo.fecha.isoformat(),
        fechaFin=torneo.fecha_fin.isoformat() if torneo.fecha_fin else "",
        tipo=torneo.tipo_torneo or "",
        tipoRitmo=torneo.tipo_ritmo,
        ritmo=torneo.ritmo,
        rondas=torneo.cantidad_rondas or 0,
        estado=torneo.estado or "",
        participantes=torneo.participantes or 0,
        lugar=torneo.lugar or "",
        linkInscripcion=torneo.link_inscripcion,
        descripcion=torneo.descripcion or "",
        organizador=torneo.organizador or "",
        arbitro=torneo.arbitro or "",
        premios=torneo.premios or "",
        ganador=ganador,
        variacionElo=variacion_elo_total,
        puntosEntregados=puntos_entregados,
        tablaFinal=tabla_final,
        rondasJugadas=rondas_jugadas,
    )


# ==========================================
# AUTENTICACIÓN
# ==========================================

@app.post("/api/login", response_model=schemas.Token)
def login(datos: schemas.LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Administrador).filter(Administrador.usuario == datos.usuario).first()
    if not admin or not security.verify_password(datos.clave, admin.clave):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    token = security.create_access_token(data={"sub": admin.usuario})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/api/admin/setup", response_model=schemas.AdministradorResponse)
def crear_primer_admin(datos: schemas.AdministradorCreate, db: Session = Depends(get_db)):
    existe_alguno = db.query(Administrador).first()
    if existe_alguno:
        raise HTTPException(
            status_code=403,
            detail="Ya existe un administrador. Este endpoint solo funciona para crear el primero.",
        )
    nuevo_admin = Administrador(usuario=datos.usuario, clave=security.hash_password(datos.clave))
    db.add(nuevo_admin)
    db.commit()
    db.refresh(nuevo_admin)
    return nuevo_admin


# ==========================================
# JUGADORES
# ==========================================

@app.get("/api/jugadores", response_model=List[schemas.JugadorListItem])
def obtener_jugadores(db: Session = Depends(get_db)):
    jugadores = db.query(Jugador).all()
    return [_jugador_list_item(db, j) for j in jugadores]


@app.get("/api/jugadores/{id_lma}", response_model=schemas.JugadorResponse)
def obtener_jugador(id_lma: str, db: Session = Depends(get_db)):
    jugador = db.query(Jugador).filter(Jugador.id_lma == id_lma).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    return _jugador_response(db, jugador)


@app.post("/api/jugadores", response_model=schemas.JugadorResponse)
def crear_jugador(
    jugador: schemas.JugadorCreate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    if db.query(Jugador).filter(Jugador.id_lma == jugador.id_lma).first():
        raise HTTPException(status_code=400, detail="El jugador con este ID ya existe")

    nuevo_jugador = Jugador(**jugador.model_dump())
    db.add(nuevo_jugador)
    db.commit()
    db.refresh(nuevo_jugador)
    return _jugador_response(db, nuevo_jugador)


@app.put("/api/jugadores/{id_lma}", response_model=schemas.JugadorResponse)
def actualizar_jugador(
    id_lma: str,
    datos: schemas.JugadorUpdate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    jugador = db.query(Jugador).filter(Jugador.id_lma == id_lma).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(jugador, campo, valor)

    db.commit()
    db.refresh(jugador)
    return _jugador_response(db, jugador)


@app.delete("/api/jugadores/{id_lma}")
def eliminar_jugador(
    id_lma: str,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    jugador = db.query(Jugador).filter(Jugador.id_lma == id_lma).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    db.delete(jugador)
    db.commit()
    return {"ok": True}


# ==========================================
# CLUBES
# ==========================================

@app.get("/api/clubes", response_model=List[schemas.ClubListItem])
def obtener_clubes(db: Session = Depends(get_db)):
    clubes = db.query(Club).all()
    return [_club_list_item(db, c) for c in clubes]


@app.get("/api/clubes/{id}", response_model=schemas.ClubResponse)
def obtener_club(id: int, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    return _club_response(db, club)


def _club_data_dict(datos) -> dict:
    """Traduce los nombres del schema (estilo frontend) a columnas del modelo."""
    crudo = datos.model_dump(exclude_unset=True)
    mapa = {"nombreCorto": "nombre_corto", "twitter": "x", "web": "sitio_web"}
    return {mapa.get(k, k): v for k, v in crudo.items()}


@app.post("/api/clubes", response_model=schemas.ClubResponse)
def crear_club(
    club: schemas.ClubCreate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    nuevo_club = Club(**_club_data_dict(club))
    if not nuevo_club.color:
        nuevo_club.color = "#daa520"
    db.add(nuevo_club)
    db.commit()
    db.refresh(nuevo_club)
    return _club_response(db, nuevo_club)


@app.put("/api/clubes/{id}", response_model=schemas.ClubResponse)
def actualizar_club(
    id: int,
    datos: schemas.ClubUpdate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    club = db.query(Club).filter(Club.id == id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    for campo, valor in _club_data_dict(datos).items():
        setattr(club, campo, valor)
    db.commit()
    db.refresh(club)
    return _club_response(db, club)


@app.delete("/api/clubes/{id}")
def eliminar_club(
    id: int,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    club = db.query(Club).filter(Club.id == id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    db.delete(club)
    db.commit()
    return {"ok": True}


# ==========================================
# LIGAS
# ==========================================

@app.get("/api/ligas", response_model=List[schemas.LigaListItem])
def obtener_ligas(db: Session = Depends(get_db)):
    return [_liga_list_item(l) for l in db.query(Liga).all()]


@app.get("/api/ligas/{id}", response_model=schemas.LigaResponse)
def obtener_liga(id: int, db: Session = Depends(get_db)):
    liga = db.query(Liga).filter(Liga.id == id).first()
    if not liga:
        raise HTTPException(status_code=404, detail="Liga no encontrada")
    return _liga_response(db, liga)


@app.post("/api/ligas", response_model=schemas.LigaResponse)
def crear_liga(
    liga: schemas.LigaCreate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    nueva_liga = Liga(**liga.model_dump())
    db.add(nueva_liga)
    db.commit()
    db.refresh(nueva_liga)
    return _liga_response(db, nueva_liga)


@app.put("/api/ligas/{id}", response_model=schemas.LigaResponse)
def actualizar_liga(
    id: int,
    datos: schemas.LigaUpdate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    liga = db.query(Liga).filter(Liga.id == id).first()
    if not liga:
        raise HTTPException(status_code=404, detail="Liga no encontrada")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(liga, campo, valor)
    db.commit()
    db.refresh(liga)
    return _liga_response(db, liga)


@app.delete("/api/ligas/{id}")
def eliminar_liga(
    id: int,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    liga = db.query(Liga).filter(Liga.id == id).first()
    if not liga:
        raise HTTPException(status_code=404, detail="Liga no encontrada")
    db.delete(liga)
    db.commit()
    return {"ok": True}


@app.get("/api/ligas/{id}/calendario", response_model=List[schemas.CalendarioItem])
def obtener_calendario_liga(id: int, db: Session = Depends(get_db)):
    liga = db.query(Liga).filter(Liga.id == id).first()
    if not liga:
        raise HTTPException(status_code=404, detail="Liga no encontrada")
    items = db.query(LigaCalendario).filter(LigaCalendario.id_liga == id).order_by(LigaCalendario.ronda.asc()).all()
    return [
        schemas.CalendarioItem(id=c.id, ronda=c.ronda, fecha=c.fecha.isoformat() if c.fecha else None, descripcion=c.descripcion or "")
        for c in items
    ]


@app.post("/api/ligas/{id}/calendario", response_model=schemas.CalendarioItem)
def agregar_item_calendario(
    id: int,
    item: schemas.LigaCalendarioCreate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    liga = db.query(Liga).filter(Liga.id == id).first()
    if not liga:
        raise HTTPException(status_code=404, detail="Liga no encontrada")
    nuevo = LigaCalendario(id_liga=id, ronda=item.ronda, fecha=item.fecha, descripcion=item.descripcion)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return schemas.CalendarioItem(
        id=nuevo.id, ronda=nuevo.ronda, fecha=nuevo.fecha.isoformat() if nuevo.fecha else None, descripcion=nuevo.descripcion or ""
    )


@app.put("/api/ligas/{id}/calendario/{item_id}", response_model=schemas.CalendarioItem)
def actualizar_item_calendario(
    id: int,
    item_id: int,
    datos: schemas.LigaCalendarioUpdate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    item = db.query(LigaCalendario).filter(LigaCalendario.id == item_id, LigaCalendario.id_liga == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Ítem de calendario no encontrado")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)
    db.commit()
    db.refresh(item)
    return schemas.CalendarioItem(
        id=item.id, ronda=item.ronda, fecha=item.fecha.isoformat() if item.fecha else None, descripcion=item.descripcion or ""
    )


@app.delete("/api/ligas/{id}/calendario/{item_id}")
def eliminar_item_calendario(
    id: int,
    item_id: int,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    item = db.query(LigaCalendario).filter(LigaCalendario.id == item_id, LigaCalendario.id_liga == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Ítem de calendario no encontrado")
    db.delete(item)
    db.commit()
    return {"ok": True}


# ==========================================
# TORNEOS
# ==========================================

@app.get("/api/torneos", response_model=List[schemas.TorneoListItem])
def obtener_torneos(db: Session = Depends(get_db)):
    return [_torneo_list_item(db, t) for t in db.query(Torneo).all()]


@app.get("/api/torneos/{id}", response_model=schemas.TorneoResponse)
def obtener_torneo(id: int, db: Session = Depends(get_db)):
    torneo = db.query(Torneo).filter(Torneo.id == id).first()
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    return _torneo_response(db, torneo)


@app.post("/api/torneos", response_model=schemas.TorneoResponse)
def crear_torneo(
    torneo: schemas.TorneoCreate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    nuevo_torneo = Torneo(**torneo.model_dump())
    db.add(nuevo_torneo)
    db.commit()
    db.refresh(nuevo_torneo)
    return _torneo_response(db, nuevo_torneo)


@app.put("/api/torneos/{id}", response_model=schemas.TorneoResponse)
def actualizar_torneo(
    id: int,
    datos: schemas.TorneoUpdate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    torneo = db.query(Torneo).filter(Torneo.id == id).first()
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(torneo, campo, valor)
    db.commit()
    db.refresh(torneo)
    return _torneo_response(db, torneo)


@app.delete("/api/torneos/{id}")
def eliminar_torneo(
    id: int,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    torneo = db.query(Torneo).filter(Torneo.id == id).first()
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    db.delete(torneo)
    db.commit()
    return {"ok": True}


@app.post("/api/torneos/{id}/importar-resultados", response_model=schemas.ImportarResultadosResponse)
def importar_resultados_torneo(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    """
    Recibe el Excel exportado por Chess-Results (formato "Cuadro cruzado por
    clasificación final") y carga automáticamente los resultados y las
    partidas ronda por ronda del torneo.
    """
    torneo = db.query(Torneo).filter(Torneo.id == id).first()
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")

    contenido = file.file.read()
    try:
        parseo = resultados_import.parsear_excel_chess_results(contenido)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo leer el archivo: {e}")

    resultado = resultados_import.aplicar_importacion(db, torneo, parseo)

    # Con las partidas ya cargadas, recalculamos el ELO de los jugadores
    # involucrados (solo si el torneo tiene una modalidad asignada).
    elo_resultado = elo.recalcular_elo_torneo(db, torneo)
    resultado["elo_actualizado"] = elo_resultado["aplicado"]
    resultado["jugadores_con_elo_actualizado"] = elo_resultado["jugadores_actualizados"]
    if not elo_resultado["aplicado"]:
        resultado["avisos"] = resultado.get("avisos", []) + [elo_resultado["motivo"]]

    return schemas.ImportarResultadosResponse(**resultado)


# ==========================================
# MEDALLAS (jugador o club)
# ==========================================

def _medalla_response(db: Session, medalla: Medalla) -> schemas.MedallaResponse:
    torneo_rel = db.query(Torneo).filter(Torneo.id == medalla.id_torneo).first() if medalla.id_torneo else None
    jugador_rel = db.query(Jugador).filter(Jugador.id_lma == medalla.id_jugador).first() if medalla.id_jugador else None
    club_rel = db.query(Club).filter(Club.id == medalla.id_club).first() if medalla.id_club else None
    return schemas.MedallaResponse(
        id=medalla.id,
        nombre=medalla.nombre,
        metal=medalla.metal,
        fecha=medalla.fecha,
        id_torneo=medalla.id_torneo,
        torneoNombre=torneo_rel.nombre if torneo_rel else None,
        id_jugador=medalla.id_jugador,
        jugadorNombre=f"{jugador_rel.nombre} {jugador_rel.apellido}" if jugador_rel else None,
        id_club=medalla.id_club,
        clubNombre=club_rel.nombre if club_rel else None,
    )


def _validar_destinatario_medalla(id_jugador: Optional[str], id_club: Optional[int]):
    if bool(id_jugador) == bool(id_club):
        raise HTTPException(
            status_code=400,
            detail="La medalla debe asignarse a un jugador o a un club (uno de los dos, no ambos).",
        )


@app.get("/api/medallas", response_model=List[schemas.MedallaResponse])
def listar_medallas(
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    medallas = db.query(Medalla).order_by(Medalla.id.desc()).all()
    return [_medalla_response(db, m) for m in medallas]


@app.get("/api/medallas/{id}", response_model=schemas.MedallaResponse)
def obtener_medalla(
    id: int,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    medalla = db.query(Medalla).filter(Medalla.id == id).first()
    if not medalla:
        raise HTTPException(status_code=404, detail="Medalla no encontrada")
    return _medalla_response(db, medalla)


@app.post("/api/medallas", response_model=schemas.MedallaResponse)
def crear_medalla(
    data: schemas.MedallaCreate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    _validar_destinatario_medalla(data.id_jugador, data.id_club)
    if data.id_jugador and not db.query(Jugador).filter(Jugador.id_lma == data.id_jugador).first():
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    if data.id_club and not db.query(Club).filter(Club.id == data.id_club).first():
        raise HTTPException(status_code=404, detail="Club no encontrado")
    medalla = Medalla(
        nombre=data.nombre,
        metal=data.metal,
        fecha=data.fecha,
        id_torneo=data.id_torneo,
        id_jugador=data.id_jugador,
        id_club=data.id_club,
    )
    db.add(medalla)
    db.commit()
    db.refresh(medalla)
    return _medalla_response(db, medalla)


@app.put("/api/medallas/{id}", response_model=schemas.MedallaResponse)
def actualizar_medalla(
    id: int,
    data: schemas.MedallaUpdate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    medalla = db.query(Medalla).filter(Medalla.id == id).first()
    if not medalla:
        raise HTTPException(status_code=404, detail="Medalla no encontrada")
    cambios = data.model_dump(exclude_unset=True)
    id_jugador_final = cambios.get("id_jugador", medalla.id_jugador)
    id_club_final = cambios.get("id_club", medalla.id_club)
    if "id_jugador" in cambios or "id_club" in cambios:
        _validar_destinatario_medalla(id_jugador_final, id_club_final)
    for campo, valor in cambios.items():
        setattr(medalla, campo, valor)
    db.commit()
    db.refresh(medalla)
    return _medalla_response(db, medalla)


@app.delete("/api/medallas/{id}")
def eliminar_medalla(
    id: int,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    medalla = db.query(Medalla).filter(Medalla.id == id).first()
    if not medalla:
        raise HTTPException(status_code=404, detail="Medalla no encontrada")
    db.delete(medalla)
    db.commit()
    return {"ok": True}


# ==========================================
# NOTICIAS
# ==========================================

@app.get("/api/noticias", response_model=List[schemas.NoticiaResponse])
def obtener_noticias(db: Session = Depends(get_db)):
    return db.query(Noticia).all()


@app.get("/api/noticias/{id}", response_model=schemas.NoticiaResponse)
def obtener_noticia(id: int, db: Session = Depends(get_db)):
    noticia = db.query(Noticia).filter(Noticia.id == id).first()
    if not noticia:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    return noticia


@app.post("/api/noticias", response_model=schemas.NoticiaResponse)
def crear_noticia(
    noticia: schemas.NoticiaCreate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    nueva_noticia = Noticia(**noticia.model_dump())
    db.add(nueva_noticia)
    db.commit()
    db.refresh(nueva_noticia)
    return nueva_noticia


@app.put("/api/noticias/{id}", response_model=schemas.NoticiaResponse)
def actualizar_noticia(
    id: int,
    datos: schemas.NoticiaUpdate,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    noticia = db.query(Noticia).filter(Noticia.id == id).first()
    if not noticia:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(noticia, campo, valor)
    db.commit()
    db.refresh(noticia)
    return noticia


@app.delete("/api/noticias/{id}")
def eliminar_noticia(
    id: int,
    db: Session = Depends(get_db),
    admin: Administrador = Depends(security.get_current_admin),
):
    noticia = db.query(Noticia).filter(Noticia.id == id).first()
    if not noticia:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    db.delete(noticia)
    db.commit()
    return {"ok": True}


# ==========================================
# ESTADÍSTICAS GLOBALES (dashboard / inicio)
# ==========================================

@app.get("/api/estadisticas", response_model=schemas.EstadisticasGlobales)
def obtener_estadisticas(db: Session = Depends(get_db)):
    jugadores = db.query(func.count(Jugador.id_lma)).scalar() or 0
    clubes = db.query(func.count(Club.id)).scalar() or 0
    ligas = db.query(func.count(Liga.id)).scalar() or 0
    torneos = db.query(func.count(Torneo.id)).scalar() or 0
    partidas = db.query(func.count(Partida.id)).scalar() or 0

    liga_actual = db.query(Liga).filter(Liga.estado == "En curso").order_by(Liga.anio.desc()).first()
    if not liga_actual:
        liga_actual = db.query(Liga).order_by(Liga.anio.desc()).first()
    temporada_actual = (liga_actual.temporada or str(liga_actual.anio)) if liga_actual else str(date.today().year)

    return schemas.EstadisticasGlobales(
        jugadores=jugadores,
        clubes=clubes,
        ligas=ligas,
        torneos=torneos,
        partidasJugadas=partidas,
        temporadaActual=temporada_actual,
    )


# ==========================================
# DEPARTAMENTOS Y PROVINCIAS (legado, ya no lo usa el frontend de clubes,
# se deja disponible por si hace falta en el futuro)
# ==========================================

@app.get("/api/departamentos", response_model=List[schemas.DepartamentoResponse])
def obtener_departamentos(db: Session = Depends(get_db)):
    return db.query(Departamento).all()


@app.get("/api/provincias", response_model=List[schemas.ProvinciaResponse])
def obtener_provincias(db: Session = Depends(get_db)):
    return db.query(Provincia).all()
