from pathlib import Path
import json, re
from datetime import datetime

BASE = Path(__file__).resolve().parent.parent
PADRON = BASE / 'padron.js'
if not PADRON.is_file():
    raise FileNotFoundError(f'No se encuentra {PADRON}')
text = PADRON.read_text(encoding='utf-8')
m = re.search(r'window\.DRELM_PADRON_META\s*=\s*(\{[^;]*\})\s*;', text)
if not m:
    raise ValueError('No se encontro DRELM_PADRON_META en padron.js')
cut = str(json.loads(m.group(1)).get('cut', '')).strip()
if not cut:
    raise ValueError('El padron.js no contiene fecha de corte')
# La fecha proviene del campo FECHA_ACT que ya determina el actualizador original.
for fmt in ('%d-%m-%Y','%d/%m/%Y','%Y-%m-%d','%Y/%m/%d'):
    try:
        fecha = datetime.strptime(cut, fmt).strftime('%d/%m/%Y')
        break
    except ValueError:
        continue
else:
    raise ValueError(f'Formato de fecha de corte no reconocido: {cut!r}')

files = [BASE / 'index.html', BASE / 'app.js']
# Sustituye exclusivamente fechas dentro de referencias a ESCALE/Padrón Web IE,
# sin modificar las referencias al Censo Educativo 2025.
pattern = re.compile(r'(ESCALE\s*[–-]\s*Padr[oó]n Web IE\s*\(actualizado al\s*)\d{1,2}[/-]\d{1,2}[/-]\d{4}(\s*\))', re.I)
changed = 0
for file in files:
    if not file.exists():
        continue
    old = file.read_text(encoding='utf-8')
    new, count = pattern.subn(lambda m: m.group(1) + fecha + m.group(2), old)
    if count:
        file.write_text(new, encoding='utf-8')
        changed += count
        print(f'Fuente actualizada: {file.name} ({count} referencia(s))')
if not changed:
    print('AVISO: No se encontraron referencias fijas que actualizar. Compruebe las fuentes visibles.')
print('Fecha de corte del Padron:', fecha)
