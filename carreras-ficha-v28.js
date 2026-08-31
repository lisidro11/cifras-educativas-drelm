
/* V28 - Mejora de carreras en ficha local DRELM
   Se carga DESPUÉS de app.js.
   Mantiene app.js original y mejora la visualización de carreras en Datos generales.
*/
(function () {
  "use strict";

  const fmtV28 = n => new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

  const services = () => window.DRELM_SERVICES || [];
  const careers = () => window.DRELM_CAREERS || [];

  function careersForServiceV28(codMod) {
    return careers().filter(x =>
      String(x.cod_mod || "") === String(codMod || "")
    );
  }

  function renderCareerTableV28(rows) {
    const valid = (rows || []).filter(x =>
      String(x.programa || "").trim() !== "" &&
      (Number(x.matricula) || 0) > 0
    );

    if (!valid.length) return "";

    const sorted = [...valid].sort(
      (a, b) => (Number(b.matricula) || 0) - (Number(a.matricula) || 0)
    );

    const total = sorted.reduce(
      (s, x) => s + (Number(x.matricula) || 0), 0
    );

    return `
      <div class="matrix-wrap career-table-wrap">
        <table class="matrix-table career-table">
          <thead>
            <tr>
              <th>Programa de estudios / carrera</th>
              <th>Matrícula 2026-1</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map(x => `
              <tr>
                <td><b>${x.programa}</b></td>
                <td class="num">${fmtV28(x.matricula)}</td>
                <td class="num">${total ? ((Number(x.matricula || 0) / total) * 100).toFixed(1) : "0.0"}%</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td><b>Total</b></td>
              <td class="num"><b>${fmtV28(total)}</b></td>
              <td class="num"><b>100%</b></td>
            </tr>
          </tfoot>
        </table>
      </div>`;
  }

  function improveLocalCareers(codlocal) {
    const block = document.querySelector(".local-careers-summary");
    if (!block) return;

    const tech = services().filter(x =>
      String(x.codlocal || "") === String(codlocal || "") &&
      x.source === "6A"
    );

    const techWithCareers = tech
      .map(z => ({
        service: z,
        careers: careersForServiceV28(z.cod_mod)
          .filter(c => (Number(c.matricula) || 0) > 0)
      }))
      .filter(x => x.careers.length > 0);

    if (!techWithCareers.length) {
      block.remove();
      return;
    }

    block.innerHTML = `
      <div class="related-head">
        <h3>Carreras / programas de estudio registrados</h3>
        <span>Matrícula 2026-1</span>
      </div>

      ${techWithCareers.map(({service, careers}) => `
        <div class="career-service-block">
          <div class="career-service-card">
            <div>
              <b>${service.modalidad || "Tecnológica"}</b>
              <small>CM ${service.cod_mod}</small>
            </div>
            <span>${careers.length} programa(s)</span>
          </div>

          ${renderCareerTableV28(careers)}
        </div>
      `).join("")}
    `;
  }

  const originalOpenLocalFicha = window.openLocalFicha;

  if (typeof originalOpenLocalFicha === "function") {
    window.openLocalFicha = function (codlocal) {
      originalOpenLocalFicha(codlocal);
      improveLocalCareers(codlocal);
    };
  }
})();
