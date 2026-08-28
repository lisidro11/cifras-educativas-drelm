APP DRELM CIFRAS EDUCATIVAS 2025 — V6

Esta versión corrige el diseño de EBR, EBA, EBE, Superior y CETPRO para seguir la pantalla de referencia aprobada:

- KPI superiores.
- Filtro Gestión: Total / Pública / Privada.
- Filtro UGEL.
- Cuadro Resumen por UGEL.
- Gráfico de COLUMNAS verticales para estudiantes por UGEL.
- Cuatro tarjetas de distribución por gestión:
  estudiantes, docentes, servicios educativos y locales educativos.
- Cuadro inferior "Detalle por gestión" con:
  Pública, Privada, Total y porcentaje para cada indicador.
- Se mantienen los datos reales integrados del Censo Educativo 2025.
- Se mantiene la ficha individual y el módulo FUIE.

IMPORTANTE:
Los indicadores se calculan dinámicamente a partir de las fichas integradas.

V7:
- Se incorpora mapa territorial esquemático de Lima Metropolitana por UGEL en EBR, EBA, EBE, Superior y CETPRO.
- El tamaño de cada punto UGEL se actualiza con la cantidad real de estudiantes según los filtros.
- Se incorpora ranking territorial.
- En la ficha individual se agrega bloque de ubicación y coordenadas cuando FUIE las tiene disponibles.

V8:
- Se retira el mapa territorial agregado en V7.
- Infraestructura FUIE pasa a un tablero completo con:
  KPI, estado de aulas, comparación por UGEL, servicios básicos,
  terrenos/SFL y cuadro resumen por UGEL.
- La ficha integral muestra más información:
  * Fuente/cédula correspondiente a la modalidad.
  * Servicios educativos que funcionan en el mismo local.
  * Para servicios públicos con FUIE: resumen de infraestructura + pestaña FUIE completa.
  * Para servicios privados: se usa la ficha censal de matrícula/modalidad correspondiente y no se muestra FUIE.
  * Se conserva el detalle completo basado en encabezados y columnas combinadas de cada cédula.

V9:
- Se elimina el gráfico separado de "Locales FUIE por UGEL".
- Se mantiene un solo gráfico principal de conservación por UGEL:
  Buen estado + Regular + Mal estado, con total de aulas y cantidad de locales.
- Se conserva el cuadro inferior con el detalle por UGEL.
- Servicios básicos ahora muestran gráficos con TODAS las respuestas registradas
  (no solo el conteo afirmativo).
- Terrenos y saneamiento también muestran gráficos de las respuestas/categorías registradas.

V10:
- Buscador con campo específico de CÓDIGO LOCAL.
- Cada resultado permite abrir:
  * ficha del servicio (código modular)
  * ficha del local (código local)
- La ficha de local consolida todos los servicios educativos que funcionan en ese local.
- Cuando existe FUIE, la ficha de local muestra el resumen de infraestructura y la pestaña FUIE.
- En infraestructura, las respuestas se compactan a las 6 categorías más frecuentes + "Otros".
- Cada respuesta muestra cantidad y porcentaje respecto del total de locales FUIE.

V11:
- Se elimina el listado inicial de instituciones/servicios.
- Al ingresar a II.EE. / Ficha solo se muestra el buscador.
- Los resultados aparecen únicamente después de escribir un nombre,
  código modular o código local.
- Se muestran como máximo 30 coincidencias por búsqueda.

V12:
- Nuevo módulo "Mapa educativo".
- Usa coordenadas reales de latitud y longitud de FUIE 2025.
- Se incorporaron 2,026 locales con coordenadas válidas.
- Los puntos se colorean por UGEL 01 a 07.
- Filtros por ámbito (EBR, EBA, EBE, Superior, CETPRO) y UGEL.
- Al pulsar un punto se abre la ficha del código local.
- El mapa actualmente cubre locales públicos con FUIE; para privados se requiere una fuente de coordenadas pública+privada.

V13:
- En el módulo Superior se incorpora un bloque especial por modalidad / nivel:
  * Pedagógica (5A)
  * Tecnológica (6A)
  * Artística / Musical (7A)
- Cada modalidad muestra estudiantes, docentes, servicios, locales y secciones.
- Se muestra el porcentaje de estudiantes de cada modalidad respecto del total filtrado.
- Se agrega un gráfico comparativo vertical entre las tres modalidades.
- Los valores cambian con los filtros de Gestión y UGEL.

V14:
- En Superior se elimina el bloque de Resumen por UGEL + Distribución de estudiantes por UGEL.
- La composición Pedagógica / Tecnológica / Artística se presenta ahora en un CUADRO comparativo.
- Se mantienen los indicadores: estudiantes, docentes, servicios, locales, secciones y porcentaje.
- Se agregan iconos visuales en los KPI principales de todos los módulos:
  estudiantes, docentes, servicios, locales, secciones, aulas, terrenos, etc.
- Las tarjetas de nivel/modalidad también incorporan iconos para hacer la app más visual.

V15:
- Corrige la pantalla inicial: el Resumen se dibuja automáticamente al abrir index.html,
  sin necesidad de presionar Total, Pública o Privada.
- Se fuerza recarga de app.js, data.js y styles.css para evitar caché del navegador.
- Los iconos de Estudiantes, Docentes, Servicios, Locales y Secciones se mantienen
  también en EBR, EBA, EBE, Superior y CETPRO.

V16:
- Corrige el error que detenía JavaScript al entrar/cargar Superior.
- Superior no usa el gráfico UGEL eliminado, por lo que ahora la app valida que el gráfico exista antes de dibujarlo.
- Con esto CETPRO, Infraestructura FUIE, Mapa educativo e II.EE./Ficha vuelven a cargar normalmente.
- Se mantienen los iconos en todas las modalidades.

V17:
- Reestructura la lectura de TODAS las fichas de la app (FUIE y cédulas de matrícula).
- El título principal del bloque ya no se repite dentro de cada pregunta.
- Cuando existe una ruta interna, se crea automáticamente un subgrupo y, si corresponde,
  niveles adicionales (por ejemplo: Líneas de internet > Línea 01 > pregunta).
- Se eliminan de la vista los códigos técnicos entre corchetes, manteniendo intactos los datos fuente.
- La pregunta final queda limpia y debajo se muestra únicamente su respuesta.
- El cambio se aplica de forma genérica a Infraestructura FUIE, EBR, EBA, EBE, Superior y CETPRO.

V18:
- Las fichas se presentan mediante cuadros/tarjetas.
- Se conserva la jerarquía Grupo > Subgrupo > Pregunta > Respuesta.
- Si hay subgrupos naturales (Línea 01, Terreno 01, etc.), cada uno se muestra en su propio cuadro.
- Las preguntas simples se agrupan en cuadros compactos de dos columnas.
- En celular los cuadros pasan automáticamente a una columna.
- Se mantiene la limpieza de códigos técnicos y textos redundantes de V17.
- El cambio se aplica a FUIE y a las fichas de EBR, EBA, EBE, Superior y CETPRO.

V19:
- En Resumen general se reemplaza el cuadro/gráfico por UGEL por un cuadro consolidado por modalidad:
  EBR, EBA, EBE, Superior y CETPRO, con estudiantes, docentes, servicios, locales y secciones.
- En las fichas, Matrícula por grado y género ahora se presenta como matriz:
  filas = grados; columnas = Total, Hombres y Mujeres.
- Los cuadros simples por grado (por ejemplo, secciones por grado) se muestran como tabla compacta.
- Si un mismo código local tiene varios niveles/servicios, aparecen juntos y se puede abrir directamente
  la ficha de cada nivel desde “Servicios educativos en el mismo local”.

V20:
- La ficha pasa a estar centrada en el CÓDIGO LOCAL.
- Un local con varios servicios/niveles muestra un cuadro consolidado con cada nivel:
  modalidad, código modular, gestión, estudiantes, docentes y secciones.
- En “Detalle de la ficha” se cargan automáticamente TODAS las cédulas de matrícula
  vinculadas a ese código local, separadas visualmente por nivel/modalidad.
- Cada nivel mantiene sus propios cuadros (matrícula por grado/sexo, docentes, secciones, etc.).
- “Cantidad de personal docente según función o cargo” se convierte en una matriz compacta:
  filas = función/cargo; columnas = total, con horas de clase, sin horas de clase.
- FUIE sigue vinculada al local, mientras que las fichas de matrícula se vinculan a cada código modular.

V21:
- El buscador ya NO lista servicios/códigos modulares por separado: muestra únicamente códigos de local.
- Cada resultado de búsqueda representa un local educativo único y consolida sus niveles/servicios.
- La ficha principal es del CÓDIGO LOCAL.
- Latitud, longitud, dirección, distrito y UGEL se muestran una sola vez en “Datos del local educativo”.
- Los niveles que funcionan en la misma dirección aparecen como botones dentro de la ficha del local.
- Al hacer clic en Inicial, Primaria, Secundaria, EBA, etc., se selecciona ese nivel.
- En “Detalle de la ficha” se muestra únicamente la cédula censal del nivel seleccionado.
- Se eliminan Latitud/Longitud del detalle modular para evitar duplicidad.
- Personal no docente se presenta como cuadro por función/cargo.
- Auxiliares de educación se agrupan en cuadros por condición laboral, género y nivel educativo alcanzado.

V22:
- Se restaura la presentación de “Datos generales” del local similar a V20:
  datos generales + cuadro consolidado de niveles/servicios + resumen FUIE.
- Las mejoras de selección por nivel se trasladan a “Detalle de la ficha”.
- En Detalle aparece un selector de niveles/modalidades cuando el local tiene más de uno.
- Cada nivel muestra cuadros resumen de estudiantes, docentes, secciones y gestión.
- Matrícula por grado/ciclo y sexo agrega cuadros resumen de Total, Hombres y Mujeres,
  además de la matriz por grado/ciclo.

V23:
- En Institutos/Superior, “Matrícula por duración de carrera, ciclo y género” se convierte en cuadros por duración.
- Las duraciones de carrera cuyo total es 0 NO se muestran.
- Dentro de cada duración solo aparecen los ciclos con estudiantes.
- Cada cuadro muestra: Ciclo | Total | Hombres | Mujeres.
- “Matrícula por edad y género” se convierte en tabla y oculta automáticamente las edades con total 0.
- Se mantienen arriba los cuadros resumen Total | Hombres | Mujeres.
- Se conserva toda la lógica de la V22 para ficha por local y detalle por nivel/modalidad.

V24:
- Secciones por edad: cuadro compacto; se ocultan edades con valor 0.
- Secciones por ciclo/grado: cuadro agrupado; se omiten categorías con 0.
- Docentes, personal no docente, auxiliares y otras distribuciones agrupables se presentan como tablas.
- Regla general: categorías sin información (0) no se muestran en estos cuadros.
- Se conserva V23: duración de carrera/ciclo/género y edad/género.

V25:
- Infraestructura FUIE: Matrícula se presenta como cuadro y solo muestra modalidades/niveles con datos.
- En FUIE se ocultan valores numéricos en cero cuando no aportan información.
- Ubicación usa latitud y longitud y agrega botón “Ver ubicación” hacia Google Maps.
- Datos generales del local mantiene su estructura e incorpora acceso directo a la ubicación geográfica.
- Se elimina el módulo “Mapa educativo” estático de la navegación.

V26:
- Corrige el error de V25 que impedía cargar II.EE. / Ficha.
- En V25 se retiró el módulo “Mapa educativo” del HTML, pero quedó su JavaScript ejecutándose.
- Ese código intentaba acceder a controles inexistentes (#mapUgel y #mapSector) y detenía la ejecución.
- V26 elimina completamente ese bloque residual.
- Se mantienen los cambios de V25: cuadros FUIE, ocultamiento de ceros y botón de ubicación por coordenadas.

V27:
- Se integra la hoja “Institutos carreras” del archivo proporcionado.
- Registros de carreras/programas incorporados: 171.
- En Superior se agrega un panel de programas de estudio con:
  institutos con carreras, programas registrados, matrícula 2026-1 y Top 10 de programas.
- En la ficha de un servicio Tecnológico (Ficha 6A) aparece un cuadro:
  Programa de estudios / carrera | Matrícula 2026-1 | porcentaje.
- En Datos generales del local se indica cuántos programas tiene cada servicio tecnológico.
- Cruce realizado por Código Modular.
