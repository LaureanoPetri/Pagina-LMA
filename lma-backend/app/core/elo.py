"""
Cálculo de ELO estilo FIDE.

Reglas:
  - Un jugador nuevo arranca en 1400 en las tres modalidades (blitz, rápida,
    clásica) — ver el default de las columnas elo_* en app/models/jugador.py
    y ELO_INICIAL más abajo (se usa también al crear jugadores nuevos desde
    la importación de Excel, cuando el archivo no trae un Elo previo).

  - El factor K (cuánto se mueve el rating por partida) es variable, como en
    FIDE:
        * K = 40 si el jugador todavía no tiene 30 partidas rateadas
          jugadas en esa modalidad (jugador "nuevo", el rating se ajusta
          rápido hasta asentarse).
        * K = 10 si el rating actual del jugador es >= 2400 (jugadores de
          elite, se mueven poco).
        * K = 20 en cualquier otro caso.

  - El recálculo se dispara automáticamente al importar el Excel de
    Chess-Results de un torneo (ver el endpoint de importación en
    app/main.py), y solo si el torneo tiene definida una "modalidad"
    (tipo_ritmo: Blitz/Rápida/Clásica) — si no la tiene, no sabemos qué
    ELO de los tres hay que tocar, así que no se toca ninguno.

  - Las partidas de un mismo torneo se procesan en orden de ronda, y el
    rating de cada jugador se va actualizando partida a partida dentro del
    propio torneo (no todas las rondas se calculan contra el rating "de
    entrada" al torneo, sino contra el rating más reciente).

  - Los "bye" (rondas libres) no mueven el ELO.

  - Al terminar, se guarda además la variación neta de ELO de cada jugador
    en esa competencia en ResultadoTorneo.variacion_elo, para que la tabla
    final del torneo la pueda mostrar.
"""
from typing import Optional

from sqlalchemy.orm import Session

ELO_INICIAL = 1400

# Debe coincidir exactamente con los valores que usa HistorialELO.tipo_ritmo
# en el resto del backend (ver TIPO_RITMO_CAMPO en app/main.py).
TIPO_RITMO_A_CAMPO = {
    "Blitz": "elo_blitz",
    "Rápida": "elo_rapida",
    "Clásica": "elo_clasica",
}


def _campo_elo(tipo_ritmo: Optional[str]) -> Optional[str]:
    return TIPO_RITMO_A_CAMPO.get(tipo_ritmo) if tipo_ritmo else None


def _factor_k(rating_actual: int, partidas_rateadas_previas: int) -> int:
    if partidas_rateadas_previas < 30:
        return 40
    if rating_actual >= 2400:
        return 10
    return 20


def _esperado(rating_propio: int, rating_rival: int) -> float:
    return 1 / (1 + 10 ** ((rating_rival - rating_propio) / 400))


def recalcular_elo_torneo(db: Session, torneo) -> dict:
    """
    Recorre las partidas ya cargadas de un torneo (ronda por ronda, en
    orden) y actualiza el ELO de los jugadores involucrados en la modalidad
    del torneo. Devuelve un resumen de lo aplicado.
    """
    from app.models import Jugador, Partida, HistorialELO, ResultadoTorneo

    campo = _campo_elo(torneo.tipo_ritmo)
    if not campo:
        return {
            "aplicado": False,
            "jugadores_actualizados": 0,
            "motivo": (
                "El torneo no tiene una modalidad (Blitz/Rápida/Clásica) definida, "
                "así que no se recalculó el ELO. Editá el torneo para asignarle una "
                "modalidad y volvé a subir el Excel si querés que se actualice."
            ),
        }

    partidas = (
        db.query(Partida)
        .filter(Partida.id_torneo == torneo.id)
        .order_by(Partida.ronda.asc(), Partida.id.asc())
        .all()
    )

    partidas_previas_cache: dict = {}

    def _contar_previas(id_jugador: str) -> int:
        if id_jugador not in partidas_previas_cache:
            partidas_previas_cache[id_jugador] = (
                db.query(HistorialELO)
                .filter(HistorialELO.id_jugador == id_jugador, HistorialELO.tipo_ritmo == torneo.tipo_ritmo)
                .count()
            )
        return partidas_previas_cache[id_jugador]

    variacion_acumulada: dict = {}
    jugadores_actualizados: set = set()

    for p in partidas:
        if not p.resultado or p.resultado.startswith("bye"):
            continue
        if p.resultado == "1-0":
            score_blancas = 1.0
        elif p.resultado == "0-1":
            score_blancas = 0.0
        elif p.resultado == "½-½":
            score_blancas = 0.5
        else:
            continue

        blancas = db.query(Jugador).filter(Jugador.id_lma == p.id_jugador_blancas).first()
        negras = db.query(Jugador).filter(Jugador.id_lma == p.id_jugador_negras).first()
        if not blancas or not negras:
            continue

        rb = getattr(blancas, campo) or ELO_INICIAL
        rn = getattr(negras, campo) or ELO_INICIAL

        eb = _esperado(rb, rn)
        en = _esperado(rn, rb)

        kb = _factor_k(rb, _contar_previas(blancas.id_lma))
        kn = _factor_k(rn, _contar_previas(negras.id_lma))

        nuevo_rb = round(rb + kb * (score_blancas - eb))
        nuevo_rn = round(rn + kn * ((1 - score_blancas) - en))

        setattr(blancas, campo, nuevo_rb)
        setattr(negras, campo, nuevo_rn)

        db.add(HistorialELO(
            id_jugador=blancas.id_lma, id_torneo=torneo.id, fecha=torneo.fecha,
            tipo_ritmo=torneo.tipo_ritmo, nuevo_elo=nuevo_rb,
        ))
        db.add(HistorialELO(
            id_jugador=negras.id_lma, id_torneo=torneo.id, fecha=torneo.fecha,
            tipo_ritmo=torneo.tipo_ritmo, nuevo_elo=nuevo_rn,
        ))

        variacion_acumulada[blancas.id_lma] = variacion_acumulada.get(blancas.id_lma, 0) + (nuevo_rb - rb)
        variacion_acumulada[negras.id_lma] = variacion_acumulada.get(negras.id_lma, 0) + (nuevo_rn - rn)

        # Estas dos partidas ya cuentan como "previas" para la próxima que
        # se procese dentro de este mismo torneo (afecta el factor K).
        partidas_previas_cache[blancas.id_lma] = _contar_previas(blancas.id_lma) + 1
        partidas_previas_cache[negras.id_lma] = _contar_previas(negras.id_lma) + 1

        jugadores_actualizados.add(blancas.id_lma)
        jugadores_actualizados.add(negras.id_lma)

    for id_jugador, delta in variacion_acumulada.items():
        resultado = (
            db.query(ResultadoTorneo)
            .filter(ResultadoTorneo.id_torneo == torneo.id, ResultadoTorneo.id_jugador == id_jugador)
            .first()
        )
        if resultado:
            resultado.variacion_elo = delta

    db.commit()

    return {"aplicado": True, "jugadores_actualizados": len(jugadores_actualizados), "motivo": None}
