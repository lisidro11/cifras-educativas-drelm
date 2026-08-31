import json
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
RUTA = os.path.join(BASE, "details", "FUIE.js")
SALIDA = os.path.join(BASE, "details", "fuie_ugel")

os.makedirs(SALIDA, exist_ok=True)

print("Leyendo FUIE.js...")

with open(RUTA, "r", encoding="utf-8-sig") as f:
    texto = f.read()

# Elimina espacios o caracteres invisibles al inicio
texto = texto.lstrip()

prefijo = "window.DRELM_FUIE_DETAIL="

pos = texto.find(prefijo)

if pos == -1:
    raise ValueError(
        "No se encontró window.DRELM_FUIE_DETAIL dentro del archivo."
    )

# Tomamos solamente el JSON
json_texto = texto[pos + len(prefijo):].strip()

if json_texto.endswith(";"):
    json_texto = json_texto[:-1]

print("Convirtiendo información...")

datos = json.loads(json_texto)

print(f"Locales encontrados: {len(datos):,}")

ugel_data = {
    "01": {},
    "02": {},
    "03": {},
    "04": {},
    "05": {},
    "06": {},
    "07": {},
}

sin_ugel = {}


def detectar_ugel(registro):
    contenido = json.dumps(
        registro,
        ensure_ascii=False
    ).upper()

    # Ejemplo real:
    # 150103-UGEL 02 RÍMAC
    patrones = [
        r"UGEL\s*0?([1-7])",
        r"UGEL\s*N[°º]?\s*0?([1-7])",
    ]

    for patron in patrones:
        resultado = re.search(patron, contenido)

        if resultado:
            return f"0{resultado.group(1)}"

    return None


print("Separando por UGEL...")

for codlocal, registro in datos.items():

    ugel = detectar_ugel(registro)

    if ugel in ugel_data:
        ugel_data[ugel][codlocal] = registro
    else:
        sin_ugel[codlocal] = registro


print("")
print("GENERANDO ARCHIVOS")
print("-------------------")

for ugel, registros in ugel_data.items():

    archivo = os.path.join(
        SALIDA,
        f"FUIE_UGEL{ugel}.js"
    )

    with open(archivo, "w", encoding="utf-8") as f:

        f.write("window.DRELM_FUIE_DETAILS=")

        json.dump(
            registros,
            f,
            ensure_ascii=False,
            separators=(",", ":")
        )

        f.write(";")

    peso_mb = os.path.getsize(archivo) / 1024 / 1024

    print(
        f"UGEL {ugel}: "
        f"{len(registros):,} locales | "
        f"{peso_mb:.2f} MB"
    )


if sin_ugel:

    archivo = os.path.join(
        SALIDA,
        "FUIE_SIN_UGEL.js"
    )

    with open(archivo, "w", encoding="utf-8") as f:

        f.write("window.DRELM_FUIE_DETAILS=")

        json.dump(
            sin_ugel,
            f,
            ensure_ascii=False,
            separators=(",", ":")
        )

        f.write(";")

    peso_mb = os.path.getsize(archivo) / 1024 / 1024

    print(
        f"SIN UGEL: "
        f"{len(sin_ugel):,} locales | "
        f"{peso_mb:.2f} MB"
    )


print("")
print("================================")
print("PROCESO TERMINADO CORRECTAMENTE")
print("================================")
print("")
print("Archivos creados en:")
print(SALIDA)
