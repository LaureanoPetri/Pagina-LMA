from io import BytesIO

from openpyxl import Workbook

from app.core.resultados_import import load_excel_rows


def test_load_excel_rows_normalizes_headers_and_values():
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Resultados"
    sheet.append(["id_lma", "posicion_final", "puntos_liga"])
    sheet.append(["LMA001", 1, 10])
    sheet.append(["LMA002", 2, 8])

    buffer = BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    rows = load_excel_rows(buffer.getvalue())

    assert rows[0]["id_lma"] == "LMA001"
    assert rows[0]["posicion_final"] == 1
    assert rows[0]["puntos_liga"] == 10
