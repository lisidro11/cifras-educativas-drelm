from pathlib import Path
import re
import json

BASE = Path(__file__).resolve().parent
CARPETA = BASE / "details" / "fuie_ugel"
SALIDA = CARPETA / "FUIE_INDEX.js"

archivos = [
    "FUIE_UGEL01.js",
    "FUIE_UGEL02.js",
    "FUIE_UGEL03.js",
    "FUIE_UGEL04.js",
    "FUIE_UGEL05.js",
    "FUIE_UGEL06.js",
    "FUIE_UGEL07.js",
    "FUIE_SIN_UGEL.js",
]

indice = {}
duplicados = []

print("Generando índice FUIE...")
print("-----------------------")

for nombre in archivos:
    ruta = CARPETA / nombre

    if not ruta.exists():
        print(f"NO ENCONTRADO: {nombre}")
        continue

    texto = ruta.read_text(encoding="utf-8-sig", errors="replace")

    # Los archivos tienen esta forma:
    # window.DRELM_FUIE_DETAIL={"320577":{...},"...":{...}};
    # Capturamos claves de 6 dígitos que aparecen como propiedad JSON.
    claves = re.findall(r'"(\d{6})"\s*:', texto)

    # Evitar capturar códigos internos repetidos dentro de los grupos:
    # solo una aparición por código local por archivo.
    claves_unicas = []
    vistos = set()
    for clave in claves:
        if clave not in vistos:
            vistos.add(clave)
            claves_unicas.append(clave)

    agregados = 0
    for clave in claves_unicas:
        # Validación adicional: la estructura inmediatamente posterior
        # debe parecer un registro FUIE con "groups".
        patron = rf'"{re.escape(clave)}"\s*:\s*\{{\s*"groups"\s*:'
        if not re.search(patron, texto):
            continue

        if clave in indice and indice[clave] != nombre:
            duplicados.append((clave, indice[clave], nombre))
        else:
            indice[clave] = nombre
            agregados += 1

    print(f"{nombre}: {agregados} locales")

contenido = "window.DRELM_FUIE_INDEX=" + json.dumps(
    indice,
    ensure_ascii=False,
    separators=(",", ":")
) + ";\n"

SALIDA.write_text(contenido, encoding="utf-8")

print("-----------------------")
print(f"TOTAL LOCALES INDEXADOS: {len(indice)}")
print(f"ARCHIVO CREADO: {SALIDA}")

if duplicados:
    print("")
    print("ADVERTENCIA - códigos duplicados:")
    for d in duplicados[:20]:
        print(d)

print("")
print("PRUEBA CL 288493:")
print(indice.get("288493", "NO ENCONTRADO"))
