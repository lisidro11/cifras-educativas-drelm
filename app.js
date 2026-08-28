
const R=window.DRELM_SERVICES,S=window.DRELM_SUMMARY,SRC=window.DRELM_SOURCES,FCORE=window.DRELM_FUIE_CORE,LOCS=window.DRELM_FUIE_LOCATIONS||[],CAREERS=window.DRELM_CAREERS||[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>new Intl.NumberFormat("es-PE",{maximumFractionDigits:0}).format(n||0);
const moduleNames={EBR:"Educación Básica Regular (EBR)",EBA:"Educación Básica Alternativa (EBA)",EBE:"Educación Básica Especial (EBE)",Superior:"Educación Superior no universitaria",ETP:"Educación Técnico-Productiva (CETPRO)"};
const moduleIcons={EBR:"🎓",EBA:"📘",EBE:"🧩",Superior:"🏛️",ETP:"🛠️"};
let scope="total",current=null,currentLocalServices=null;

function showView(id){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  $$(".side-item").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
  $$("#topnav button").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
  window.scrollTo(0,0);
}
$$(".side-item").forEach(b=>b.onclick=()=>showView(b.dataset.view));
$$("#topnav button").forEach(b=>b.onclick=()=>showView(b.dataset.view));

function iconForKpi(k){
  const x=String(k||"").toLowerCase();
  if(x.includes("estudiante")||x.includes("matrícula"))return "👨‍🎓";
  if(x.includes("docente"))return "👩‍🏫";
  if(x.includes("servicio"))return "🏫";
  if(x.includes("local"))return "🏢";
  if(x.includes("seccion"))return "👥";
  if(x.includes("promotor"))return "🧑‍🤝‍🧑";
  if(x.includes("aula"))return "🚪";
  if(x.includes("terreno")||x.includes("área"))return "📐";
  return "📊";
}
function kpis(el,a){el.innerHTML=a.map(([k,v,s])=>`<div class="kpi kpi-icon-card"><div class="kpi-icon">${iconForKpi(k)}</div><div class="kpi-copy"><span>${k}</span><b>${v}</b>${s?`<small>${s}</small>`:""}</div></div>`).join("")}
function bars(el,obj){const e=Object.entries(obj).filter(x=>x[1]>0),mx=Math.max(...e.map(x=>x[1]),1);el.innerHTML=e.map(([k,v])=>`<div class="bar"><span>${k}</span><div class="track"><div class="fill" style="width:${v/mx*100}%"></div></div><b>${fmt(v)}</b></div>`).join("")}
function uniqueCount(a,k){return new Set(a.map(x=>x[k]).filter(Boolean)).size}
function agg(a){return {estudiantes:a.reduce((s,x)=>s+x.estudiantes,0),docentes:a.reduce((s,x)=>s+x.docentes,0),promotores:a.reduce((s,x)=>s+x.promotores,0),secciones:a.reduce((s,x)=>s+x.secciones,0),servicios:uniqueCount(a,"cod_mod"),locales:uniqueCount(a,"codlocal")}}
function scopedRows(rows=R){if(scope==="publica")return rows.filter(x=>x.gestion==="Pública");if(scope==="privada")return rows.filter(x=>x.gestion==="Privada");return rows}

function renderSummary(){
  const a=scopedRows(),t=agg(a);
  kpis($("#mainKpis"),[
    ["Estudiantes",fmt(t.estudiantes),"Gestión seleccionada"],
    ["Docentes",fmt(t.docentes),"No incluye promotores"],
    ["Servicios educativos",fmt(t.servicios),"Códigos modulares únicos"],
    ["Locales educativos",fmt(t.locales),"Códigos de local únicos"],
    ["Promotores",fmt(t.promotores),"Inicial no escolarizado"]
  ]);
  const sec={};["EBR","EBA","EBE","Superior","ETP"].forEach(s=>sec[moduleNames[s]]=a.filter(x=>x.sector===s).reduce((z,x)=>z+x.estudiantes,0));
  bars($("#sectorBars"),sec);
  const modalOrder=["EBR","EBA","EBE","Superior","ETP"];
  const modalRows=modalOrder.map(s=>{
    const z=agg(a.filter(x=>x.sector===s));
    return {s,nombre:moduleNames[s],...z};
  });
  const mt=agg(a);
  $("#ugelBars").innerHTML=`<div class="summary-modal-table-wrap"><table class="summary-modal-table">
    <thead><tr><th>Modalidad</th><th>Estudiantes</th><th>Docentes</th><th>Servicios</th><th>Locales</th><th>Secciones</th></tr></thead>
    <tbody>
      ${modalRows.map(r=>`<tr>
        <td><span class="modal-icon">${moduleIcons[r.s]}</span><b>${r.nombre}</b></td>
        <td>${fmt(r.estudiantes)}</td><td>${fmt(r.docentes)}</td><td>${fmt(r.servicios)}</td><td>${fmt(r.locales)}</td><td>${fmt(r.secciones)}</td>
      </tr>`).join("")}
      <tr class="total-row"><td><b>Total DRELM</b></td><td><b>${fmt(mt.estudiantes)}</b></td><td><b>${fmt(mt.docentes)}</b></td><td><b>${fmt(mt.servicios)}</b></td><td><b>${fmt(mt.locales)}</b></td><td><b>${fmt(mt.secciones)}</b></td></tr>
    </tbody>
  </table></div>`;
}
$$("#scope button").forEach(b=>b.onclick=()=>{$$("#scope button").forEach(x=>x.classList.remove("active"));b.classList.add("active");scope=b.dataset.scope;renderSummary()});

$("#moduleCards").innerHTML=["EBR","EBA","EBE","Superior","ETP"].map(s=>{
  const a=R.filter(x=>x.sector===s),t=agg(a);
  const view=s==="ETP"?"cetpro":s.toLowerCase();
  return `<article class="modulecard" onclick="showView('${view}')"><div>${moduleIcons[s]}</div><h3>${moduleNames[s]}</h3><p>${SRC.filter(x=>x.sector===s).map(x=>x.modalidad).join(" · ")}</p><strong>${fmt(t.estudiantes)} estudiantes</strong></article>`;
}).join("");

function pct(part,total){return total?Math.round(part/total*100):0}
function moduleRows(sector,gestion=""){let a=R.filter(x=>x.sector===sector);if(gestion)a=a.filter(x=>x.gestion===gestion);return a}



const UGEL_MAP_POS={
 "UGEL 01":[48,76],"UGEL 02":[47,35],"UGEL 03":[40,48],"UGEL 04":[53,22],
 "UGEL 05":[66,43],"UGEL 06":[78,49],"UGEL 07":[55,61],"DRELM":[48,52]
};
function renderUgelMap(el,rows,metric="estudiantes"){
  const vals=Object.fromEntries(rows.map(r=>[r.u,r[metric]||0]));
  const max=Math.max(...Object.values(vals),1);
  const names=["UGEL 01","UGEL 02","UGEL 03","UGEL 04","UGEL 05","UGEL 06","UGEL 07"];
  el.innerHTML=`<div class="lima-map">
    <div class="map-title-mini">Lima Metropolitana</div>
    <svg viewBox="0 0 100 100" aria-label="Mapa esquemático por UGEL">
      <path class="lm-shape" d="M34 7 L48 6 L59 13 L68 24 L83 33 L91 46 L84 58 L76 65 L70 78 L59 91 L48 96 L39 87 L33 74 L25 63 L19 50 L23 38 L27 25 Z"/>
      <path class="coast" d="M34 7 L27 25 L23 38 L19 50 L25 63 L33 74 L39 87 L48 96"/>
      ${names.map(u=>{
        const p=UGEL_MAP_POS[u],v=vals[u]||0,r=3.5+7*(v/max);
        return `<g class="ugel-point" data-ugel="${u}">
          <circle cx="${p[0]}" cy="${p[1]}" r="${r}" style="opacity:${0.35+0.65*(v/max)}"></circle>
          <text x="${p[0]}" y="${p[1]+1}" text-anchor="middle">${u.replace("UGEL ","")}</text>
          <title>${u}: ${fmt(v)} estudiantes</title>
        </g>`;
      }).join("")}
    </svg>
    <div class="map-legend">Tamaño del punto = estudiantes</div>
  </div>`;
}


function careersForService(codMod){
  return CAREERS.filter(x=>String(x.cod_mod||"")===String(codMod||""));
}
function careerAgg(rows){
  return {
    programas:rows.length,
    matricula:rows.reduce((s,x)=>s+(Number(x.matricula)||0),0)
  };
}
function renderCareerTable(rows){
  if(!rows.length) return `<div class="career-empty">No se registran programas de estudio en la hoja de carreras proporcionada.</div>`;
  const sorted=[...rows].sort((a,b)=>(b.matricula||0)-(a.matricula||0));
  const total=careerAgg(sorted).matricula;
  return `<div class="matrix-wrap career-table-wrap">
    <table class="matrix-table career-table">
      <thead><tr><th>Programa de estudios / carrera</th><th>Matrícula 2026-1</th><th>%</th></tr></thead>
      <tbody>${sorted.map(x=>`<tr>
        <td><b>${x.programa}</b></td>
        <td class="num">${fmt(x.matricula)}</td>
        <td class="num">${total?((x.matricula/total)*100).toFixed(1):"0.0"}%</td>
      </tr>`).join("")}</tbody>
      <tfoot><tr><td><b>Total</b></td><td class="num"><b>${fmt(total)}</b></td><td class="num"><b>100%</b></td></tr></tfoot>
    </table>
  </div>`;
}
function renderModule(view,sector){
  const container=document.getElementById(view);
  container.innerHTML=`<div class="page-head"><div><small>${sector}</small><h1>${moduleNames[sector]}</h1><p>Resumen consolidado de gestión pública y privada.</p></div>
  <div class="module-filters">
    <label>Gestión
      <select id="${view}Gestion">
        <option value="">Total</option>
        <option>Pública</option>
        <option>Privada</option>
      </select>
    </label>
    <label>UGEL
      <select id="${view}Ugel"><option value="">Todas</option></select>
    </label>
  </div></div>
  <div id="${view}Content"></div>`;

  const gestionSel=document.getElementById(view+"Gestion");
  const ugelSel=document.getElementById(view+"Ugel");

  [...new Set(R.filter(x=>x.sector===sector).map(x=>x.ugel))].sort().forEach(u=>{
    const o=document.createElement("option");o.value=u;o.textContent=u;ugelSel.appendChild(o);
  });

  function filtered(){
    let a=R.filter(x=>x.sector===sector);
    if(gestionSel.value)a=a.filter(x=>x.gestion===gestionSel.value);
    if(ugelSel.value)a=a.filter(x=>x.ugel===ugelSel.value);
    return a;
  }

  function donutCard(title,pubv,priv,total){
    const p=total?Math.round(pubv/total*100):0;
    return `<article class="manage-card">
      <h3>${title}</h3>
      <div class="donut-wrap">
        <div class="donut" style="--pct:${p}%"></div>
        <div class="legend-mini">
          <div><span class="dot blue"></span><b>Pública</b>${fmt(pubv)}<small>${total?p.toFixed(1):"0.0"}%</small></div>
          <div><span class="dot green"></span><b>Privada</b>${fmt(priv)}<small>${total?(100-p).toFixed(1):"0.0"}%</small></div>
        </div>
      </div>
    </article>`;
  }

  function drawColumnChart(el, rows, metric){
    const max=Math.max(...rows.map(r=>r[metric]),1);
    el.innerHTML=`<div class="column-chart">
      <div class="ygrid">${[100,75,50,25,0].map(v=>`<span style="bottom:${v}%"></span>`).join("")}</div>
      <div class="columns">
        ${rows.map(r=>`
          <div class="col-item">
            <div class="col-value">${fmt(r[metric])}</div>
            <div class="col-track">
              <div class="col-fill" style="height:${(r[metric]/max)*100}%"></div>
            </div>
            <div class="col-label">${r.u}</div>
          </div>`).join("")}
      </div>
    </div>`;
  }

  function draw(){
    const a=filtered(),t=agg(a);
    const allSector=R.filter(x=>x.sector===sector);
    const pubRows=allSector.filter(x=>x.gestion==="Pública");
    const priRows=allSector.filter(x=>x.gestion==="Privada");
    const pub=agg(pubRows),pri=agg(priRows),totalAll=agg(allSector);

    const ugels=[...new Set(a.map(x=>x.ugel))].sort();
    const ugRows=ugels.map(u=>({u,...agg(a.filter(x=>x.ugel===u))}));

    const srcs=SRC.filter(x=>x.sector===sector);

    const sourceRows = srcs.map(s=>{
      const all=allSector.filter(x=>x.source===s.code);
      const p=all.filter(x=>x.gestion==="Pública");
      const q=all.filter(x=>x.gestion==="Privada");
      const A=agg(all),P=agg(p),Q=agg(q);
      return {name:s.modalidad,code:s.code,all:A,pub:P,pri:Q};
    });

    const tableUgel=`<div class="table-card">
      <table class="summary-table">
        <thead><tr><th>UGEL</th><th>Estudiantes</th><th>Docentes</th><th>Servicios</th><th>Locales</th><th>Secciones</th></tr></thead>
        <tbody>
          ${ugRows.map(r=>`<tr><td>${r.u}</td><td>${fmt(r.estudiantes)}</td><td>${fmt(r.docentes)}</td><td>${fmt(r.servicios)}</td><td>${fmt(r.locales)}</td><td>${fmt(r.secciones)}</td></tr>`).join("")}
        </tbody>
        <tfoot><tr><td>Total</td><td>${fmt(t.estudiantes)}</td><td>${fmt(t.docentes)}</td><td>${fmt(t.servicios)}</td><td>${fmt(t.locales)}</td><td>${fmt(t.secciones)}</td></tr></tfoot>
      </table>
    </div>`;

    const detailTable=`<div class="table-card">
      <table class="detail-management-table">
        <thead>
          <tr>
            <th rowspan="2">Nivel / Modalidad</th>
            <th colspan="4">Estudiantes</th>
            <th colspan="4">Docentes</th>
            <th colspan="4">Servicios educativos</th>
            <th colspan="4">Locales educativos</th>
            <th colspan="4">Secciones</th>
          </tr>
          <tr>
            ${["Estudiantes","Docentes","Servicios","Locales","Secciones"].map(()=>`<th>Pública</th><th>Privada</th><th>Total</th><th>%</th>`).join("")}
          </tr>
        </thead>
        <tbody>
        ${sourceRows.map(r=>{
          const pctE=totalAll.estudiantes?r.all.estudiantes/totalAll.estudiantes*100:0;
          const pctD=totalAll.docentes?r.all.docentes/totalAll.docentes*100:0;
          const pctS=totalAll.servicios?r.all.servicios/totalAll.servicios*100:0;
          const pctL=totalAll.locales?r.all.locales/totalAll.locales*100:0;
          const pctSec=totalAll.secciones?r.all.secciones/totalAll.secciones*100:0;
          return `<tr>
            <td>${r.name}</td>
            <td>${fmt(r.pub.estudiantes)}</td><td>${fmt(r.pri.estudiantes)}</td><td>${fmt(r.all.estudiantes)}</td><td>${pctE.toFixed(1)}%</td>
            <td>${fmt(r.pub.docentes)}</td><td>${fmt(r.pri.docentes)}</td><td>${fmt(r.all.docentes)}</td><td>${pctD.toFixed(1)}%</td>
            <td>${fmt(r.pub.servicios)}</td><td>${fmt(r.pri.servicios)}</td><td>${fmt(r.all.servicios)}</td><td>${pctS.toFixed(1)}%</td>
            <td>${fmt(r.pub.locales)}</td><td>${fmt(r.pri.locales)}</td><td>${fmt(r.all.locales)}</td><td>${pctL.toFixed(1)}%</td>
            <td>${fmt(r.pub.secciones)}</td><td>${fmt(r.pri.secciones)}</td><td>${fmt(r.all.secciones)}</td><td>${pctSec.toFixed(1)}%</td>
          </tr>`;
        }).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td>Total ${sector}</td>
            <td>${fmt(pub.estudiantes)}</td><td>${fmt(pri.estudiantes)}</td><td>${fmt(totalAll.estudiantes)}</td><td>100%</td>
            <td>${fmt(pub.docentes)}</td><td>${fmt(pri.docentes)}</td><td>${fmt(totalAll.docentes)}</td><td>100%</td>
            <td>${fmt(pub.servicios)}</td><td>${fmt(pri.servicios)}</td><td>${fmt(totalAll.servicios)}</td><td>100%</td>
            <td>${fmt(pub.locales)}</td><td>${fmt(pri.locales)}</td><td>${fmt(totalAll.locales)}</td><td>100%</td>
            <td>${fmt(pub.secciones)}</td><td>${fmt(pri.secciones)}</td><td>${fmt(totalAll.secciones)}</td><td>100%</td>
          </tr>
        </tfoot>
      </table>
    </div>`;

    document.getElementById(view+"Content").innerHTML=`
      <div class="module-kpis">
        ${[["Estudiantes",fmt(t.estudiantes)],["Docentes",fmt(t.docentes)],["Servicios educativos",fmt(t.servicios)],["Locales educativos",fmt(t.locales)],["Secciones",fmt(t.secciones)]].map(([k,v])=>`<div class="kpi kpi-icon-card"><div class="kpi-icon">${iconForKpi(k)}</div><div class="kpi-copy"><span>${k}</span><b>${v}</b><small>${gestionSel.value||"Total"}${ugelSel.value?" · "+ugelSel.value:""}</small></div></div>`).join("")}
      </div>

      ${sector==="Superior"?`
      <section class="superior-breakdown">
        <div class="section-inline-head">
          <div>
            <small>MODALIDAD / NIVEL</small>
            <h2>Composición de Educación Superior no universitaria</h2>
          </div>
          <span>${gestionSel.value||"Total"}${ugelSel.value?" · "+ugelSel.value:""}</span>
        </div>

        <div class="superior-table-wrap">
          <table class="superior-table">
            <thead>
              <tr>
                <th>Modalidad / nivel</th>
                <th>Estudiantes</th>
                <th>Docentes</th>
                <th>Servicios</th>
                <th>Locales</th>
                <th>Secciones</th>
                <th>% estudiantes</th>
              </tr>
            </thead>
            <tbody>
              ${srcs.map((s,idx)=>{
                const z=agg(a.filter(x=>x.source===s.code));
                const share=t.estudiantes?z.estudiantes/t.estudiantes*100:0;
                const cls=s.code==="6A"?"tech":(s.code==="5A"?"ped":"art");
                const icon=s.code==="6A"?"⚙️":(s.code==="5A"?"🎓":"🎨");
                return `<tr class="${cls}">
                  <td><div class="sup-mode"><span class="sup-mode-icon">${icon}</span><div><b>${s.modalidad}</b><small>Ficha ${s.code}</small></div></div></td>
                  <td><b>${fmt(z.estudiantes)}</b></td>
                  <td>${fmt(z.docentes)}</td>
                  <td>${fmt(z.servicios)}</td>
                  <td>${fmt(z.locales)}</td>
                  <td>${fmt(z.secciones)}</td>
                  <td><div class="sup-pct"><span style="width:${Math.min(100,share)}%"></span></div><small>${share.toFixed(1)}%</small></td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div class="superior-comparison card">
          <div class="cardhead"><h2>Comparativo por modalidad / nivel</h2><span>Estudiantes</span></div>
          <div class="superior-columns">
            ${srcs.map(s=>{
              const z=agg(a.filter(x=>x.source===s.code));
              const mx=Math.max(...srcs.map(ss=>agg(a.filter(x=>x.source===ss.code)).estudiantes),1);
              const h=z.estudiantes/mx*100;
              return `<div class="sup-col-item">
                <div class="sup-col-value">${fmt(z.estudiantes)}</div>
                <div class="sup-col-track"><div class="sup-col-fill" style="height:${h}%"></div></div>
                <div class="sup-col-label">${s.modalidad}</div>
              </div>`;
            }).join("")}
          </div>
        </div>
      </section>
      `:""}

      ${sector==="Superior"?`
      <section class="superior-careers-panel">
        <div class="section-inline-head">
          <div>
            <small>PROGRAMAS DE ESTUDIO · 2026-1</small>
            <h2>Carreras registradas en institutos tecnológicos</h2>
          </div>
          <span>Fuente: hoja “Institutos carreras”</span>
        </div>
        ${(()=>{
          const techServices=a.filter(x=>x.source==="6A");
          const cms=new Set(techServices.map(x=>String(x.cod_mod)));
          const cr=CAREERS.filter(x=>cms.has(String(x.cod_mod)));
          const ca=careerAgg(cr);
          const institutions=new Set(cr.map(x=>x.cod_mod)).size;
          const byProgram={};
          cr.forEach(x=>byProgram[x.programa]=(byProgram[x.programa]||0)+(Number(x.matricula)||0));
          const top=Object.entries(byProgram).sort((a,b)=>b[1]-a[1]).slice(0,10);
          return `<div class="career-kpis">
            <div><span>Institutos con carreras</span><b>${fmt(institutions)}</b></div>
            <div><span>Programas registrados</span><b>${fmt(ca.programas)}</b></div>
            <div><span>Matrícula carreras 2026-1</span><b>${fmt(ca.matricula)}</b></div>
          </div>
          <article class="card">
            <div class="cardhead"><h2>Programas con mayor matrícula</h2><span>Top 10 · selección actual</span></div>
            <div class="career-ranking">${top.map(([p,v],i)=>`<div><span>${i+1}. ${p}</span><b>${fmt(v)}</b></div>`).join("")||"<p>Sin programas para el filtro seleccionado.</p>"}</div>
          </article>`;
        })()}
      </section>
      `:""}

      ${sector==="Superior"?"":`
      <div class="analytics-grid exact-layout">
        <article class="card">
          <div class="cardhead"><h2>Resumen por UGEL (${gestionSel.value||"Total"})</h2><span>Censo 2025</span></div>
          ${tableUgel}
        </article>
        <article class="card">
          <div class="cardhead"><h2>Distribución de estudiantes por UGEL (${gestionSel.value||"Total"})</h2><span>Estudiantes</span></div>
          <div id="${view}ColumnChart"></div>
        </article>
      </div>
      </div>`}

      <div class="manage-grid exact">
        ${donutCard("Estudiantes por gestión",pub.estudiantes,pri.estudiantes,totalAll.estudiantes)}
        ${donutCard("Docentes por gestión",pub.docentes,pri.docentes,totalAll.docentes)}
        ${donutCard("Servicios educativos por gestión",pub.servicios,pri.servicios,totalAll.servicios)}
        ${donutCard("Locales educativos por gestión",pub.locales,pri.locales,totalAll.locales)}
      </div>

      <article class="card detail-card">
        <div class="cardhead"><h2>Detalle por gestión (Total)</h2><span>${srcs.map(s=>`Ficha ${s.code}`).join(" · ")}</span></div>
        ${detailTable}
      </article>
    `;

    const chartEl=document.getElementById(view+"ColumnChart");
    if(chartEl) drawColumnChart(chartEl,ugRows,"estudiantes");
  }

  gestionSel.onchange=draw;
  ugelSel.onchange=draw;
  draw();
}
// V15: pintar el Resumen inmediatamente al abrir la app.
renderSummary();

renderModule("ebr","EBR");
renderModule("eba","EBA");
renderModule("ebe","EBE");
renderModule("superior","Superior");
renderModule("cetpro","ETP");



function yes(v){v=String(v||"").toLowerCase();return v.includes("si")||v.includes("sí")||v.startsWith("1.")||v==="1"}
const FI=Object.values(FCORE);
const aulas=FI.reduce((s,x)=>s+(x.aulas||0),0);
const ab=FI.reduce((s,x)=>s+(x.aulas_bueno||0),0);
const ar=FI.reduce((s,x)=>s+(x.aulas_regular||0),0);
const am=FI.reduce((s,x)=>s+(x.aulas_malo||0),0);
const totalArea=FI.reduce((s,x)=>s+(x.area_terreno||0),0);
const localWithSFL=FI.filter(x=>yes(x.sfl1)||yes(x.sfl2)).length;
const localWithTerreno=FI.filter(x=>(x.terrenos||0)>0).length;

const codlocalToUgel={};
R.filter(x=>x.gestion==="Pública"&&x.codlocal).forEach(x=>{
  if(!codlocalToUgel[x.codlocal]) codlocalToUgel[x.codlocal]=x.ugel;
});

const infraByUgel={};
Object.entries(FCORE).forEach(([cl,x])=>{
  const u=codlocalToUgel[cl]||"DRELM";
  infraByUgel[u]??={locales:0,aulas:0,buenas:0,regulares:0,malas:0};
  const z=infraByUgel[u];
  z.locales++;
  z.aulas+=x.aulas||0;
  z.buenas+=x.aulas_bueno||0;
  z.regulares+=x.aulas_regular||0;
  z.malas+=x.aulas_malo||0;
});

kpis($("#infraKpis"),[
  ["Locales con FUIE",fmt(FI.length),"Infraestructura pública"],
  ["Aulas",fmt(aulas),"Total reportado"],
  ["Buen estado",fmt(ab),aulas?((ab/aulas)*100).toFixed(1)+"% de aulas":"0%"],
  ["Regular",fmt(ar),aulas?((ar/aulas)*100).toFixed(1)+"% de aulas":"0%"],
  ["Mal estado",fmt(am),aulas?((am/aulas)*100).toFixed(1)+"% de aulas":"0%"]
]);

function cleanAnswer(v){
  const s=String(v??"").trim();
  return s || "Sin dato";
}
function answerCounts(field){
  const c={};
  FI.forEach(x=>{
    const v=cleanAnswer(x[field]);
    c[v]=(c[v]||0)+1;
  });
  return c;
}
function sortAnswerEntries(obj){
  return Object.entries(obj).sort((a,b)=>b[1]-a[1]);
}
function answerChart(title,obj){
  let rows=sortAnswerEntries(obj);
  const total=FI.length || 1;
  if(rows.length>6){
    const top=rows.slice(0,6);
    const otros=rows.slice(6).reduce((s,x)=>s+x[1],0);
    rows=otros>0?[...top,["Otros / respuestas menos frecuentes",otros]]:top;
  }
  const max=Math.max(...rows.map(x=>x[1]),1);
  return `<div class="answer-chart">
    <h3>${title}</h3>
    ${rows.map(([k,v])=>`<div class="answer-row">
      <div class="answer-label" title="${k}">${k}</div>
      <div class="answer-track"><div class="answer-fill" style="width:${v/max*100}%"></div></div>
      <div class="answer-metric"><b>${fmt(v)}</b><small>${(v/total*100).toFixed(1)}%</small></div>
    </div>`).join("")}
    <div class="answer-foot">Porcentaje respecto de ${fmt(total)} locales FUIE.</div>
  </div>`;
}

function renderConservationByUgel(el){
  const rows=Object.entries(infraByUgel).sort(([a],[b])=>a.localeCompare(b));
  const max=Math.max(...rows.map(([,z])=>z.aulas),1);
  el.innerHTML=`<div class="stack-legend">
      <span><i class="good"></i>Buen estado</span>
      <span><i class="regular"></i>Regular</span>
      <span><i class="bad"></i>Mal estado</span>
    </div>
    <div class="stack-bars">
      ${rows.map(([u,z])=>{
        const total=z.aulas||1;
        const gw=z.buenas/total*100, rw=z.regulares/total*100, bw=z.malas/total*100;
        const scale=z.aulas/max*100;
        return `<div class="stack-row">
          <div class="stack-name">${u}</div>
          <div class="stack-outer">
            <div class="stack-scaled" style="width:${scale}%">
              <span class="seg good" style="width:${gw}%" title="Buen estado: ${fmt(z.buenas)}"></span>
              <span class="seg regular" style="width:${rw}%" title="Regular: ${fmt(z.regulares)}"></span>
              <span class="seg bad" style="width:${bw}%" title="Mal estado: ${fmt(z.malas)}"></span>
            </div>
          </div>
          <div class="stack-total"><b>${fmt(z.aulas)}</b><small>${fmt(z.locales)} locales</small></div>
        </div>`;
      }).join("")}
    </div>`;
}

$("#infra").querySelector(".grid.two").outerHTML=`
<div class="infra-v9">
  <article class="card conservation-main">
    <div class="cardhead">
      <h2>Estado de conservación de aulas por UGEL</h2>
      <span>Total de aulas en locales FUIE</span>
    </div>
    <div id="conservationByUgel"></div>
  </article>

  <article class="card">
    <div class="cardhead">
      <h2>Servicios básicos: respuestas registradas</h2>
      <span>Distribución de locales</span>
    </div>
    <div class="answer-grid">
      ${answerChart("Abastecimiento de agua",answerCounts("agua"))}
      ${answerChart("Energía eléctrica",answerCounts("luz"))}
      ${answerChart("Desagüe",answerCounts("desague"))}
      ${answerChart("Internet",answerCounts("internet"))}
    </div>
  </article>

  <article class="card">
    <div class="cardhead">
      <h2>Terrenos y saneamiento: respuestas registradas</h2>
      <span>FUIE 2025</span>
    </div>
    <div class="answer-grid two">
      ${answerChart("Cantidad de terrenos por local",(()=>{
        const c={};
        FI.forEach(x=>{
          const v=(x.terrenos||0)>0?String(x.terrenos):"Sin terreno / sin dato";
          c[v]=(c[v]||0)+1;
        });
        return c;
      })())}
      ${answerChart("Saneamiento físico legal - Terreno 1",answerCounts("sfl1"))}
      ${answerChart("Saneamiento físico legal - Terreno 2",answerCounts("sfl2"))}
      <div class="terrain-summary">
        <h3>Resumen de terreno</h3>
        <div><span>Locales con terreno reportado</span><b>${fmt(localWithTerreno)}</b></div>
        <div><span>Locales con SFL afirmativo</span><b>${fmt(localWithSFL)}</b></div>
        <div><span>Área total reportada</span><b>${fmt(totalArea)} m²</b></div>
      </div>
    </div>
  </article>

  <article class="card infra-table-card">
    <div class="cardhead">
      <h2>Detalle de conservación por UGEL</h2>
      <span>Buen estado / Regular / Mal estado / Total</span>
    </div>
    <div class="table-card">
      <table class="summary-table">
        <thead>
          <tr><th>UGEL</th><th>Locales FUIE</th><th>Buen estado</th><th>Regular</th><th>Mal estado</th><th>Total aulas</th></tr>
        </thead>
        <tbody>
          ${Object.entries(infraByUgel).sort().map(([u,z])=>`
            <tr><td>${u}</td><td>${fmt(z.locales)}</td><td>${fmt(z.buenas)}</td><td>${fmt(z.regulares)}</td><td>${fmt(z.malas)}</td><td>${fmt(z.aulas)}</td></tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr><td>Total</td><td>${fmt(FI.length)}</td><td>${fmt(ab)}</td><td>${fmt(ar)}</td><td>${fmt(am)}</td><td>${fmt(aulas)}</td></tr>
        </tfoot>
      </table>
    </div>
  </article>
</div>`;

renderConservationByUgel($("#conservationByUgel"));

// V26: módulo de mapa estático retirado completamente.
function norm(v){return String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
function doSearch(){
  const rawQ=$("#q").value.trim();
  const rawLocal=String($("#localQ").value||"").trim();
  const q=norm(rawQ), lq=rawLocal, gf=$("#gestionFilter").value;

  if(!q && !lq){
    $("#resultInfo").textContent="Ingrese un nombre de institución o código local para realizar la búsqueda.";
    $("#results").innerHTML=`<div class="search-empty">
      <div class="search-empty-icon">⌕</div>
      <b>Busque un local educativo</b>
      <span>Puede escribir el nombre de la IE o el código local.</span>
    </div>`;
    return;
  }

  // Primero filtrar servicios; luego consolidar por código local.
  const filtered=R.filter(x=>{
    const okGestion=!gf||x.gestion===gf;
    const okLocal=!lq||String(x.codlocal||"").includes(lq);
    const okText=!q||norm([
      x.nombre,x.codlocal,x.ugel,x.distrito,x.direccion,
      x.modalidad,x.cod_mod
    ].join(" ")).includes(q);
    return okGestion&&okLocal&&okText&&x.codlocal;
  });

  const localMap=new Map();
  filtered.forEach(x=>{
    if(!localMap.has(x.codlocal)){
      // Todos los servicios del local, no solo los que coincidieron con el texto.
      const all=R.filter(z=>String(z.codlocal||"")===String(x.codlocal));
      localMap.set(x.codlocal,all);
    }
  });

  const locals=[...localMap.entries()].map(([codlocal,services])=>{
    const total=agg(services);
    const base=services[0];
    const nombres=[...new Set(services.map(z=>z.nombre).filter(Boolean))];
    const niveles=[...new Set(services.map(z=>z.modalidad).filter(Boolean))];
    const gestiones=[...new Set(services.map(z=>z.gestion).filter(Boolean))];
    return {codlocal,services,total,base,nombres,niveles,gestiones};
  }).sort((a,b)=>(a.nombres[0]||"").localeCompare(b.nombres[0]||""));

  $("#resultInfo").textContent=locals.length
    ? `${fmt(locals.length)} locales educativos encontrados.`
    : "No se encontraron coincidencias.";

  $("#results").innerHTML=locals.slice(0,30).map(l=>`
    <div class="result local-result">
      <div class="local-result-main">
        <div class="local-code-badge">CL ${l.codlocal}</div>
        <h4>${l.nombres[0]||"Local educativo"}</h4>
        <p>${l.base.ugel} · ${l.base.distrito||"—"} · ${l.base.direccion||"Dirección no disponible"}</p>
        <div class="chips">
          ${l.niveles.map(n=>`<span class="chip">${n}</span>`).join("")}
          ${l.gestiones.map(g=>`<span class="chip">${g}</span>`).join("")}
        </div>
        <div class="local-result-stats">
          <span><b>${fmt(l.services.length)}</b> niveles/servicios</span>
          <span><b>${fmt(l.total.estudiantes)}</b> estudiantes</span>
          <span><b>${fmt(l.total.docentes)}</b> docentes</span>
        </div>
      </div>
      <div class="result-actions">
        <button onclick="openLocalFicha('${l.codlocal}')">Ver ficha del local</button>
      </div>
    </div>`).join("")||`<div class="search-empty compact"><b>Sin resultados</b><span>Revise el nombre o código local ingresado.</span></div>`;
}
$("#q").oninput=doSearch;
$("#localQ").oninput=doSearch;
$("#gestionFilter").onchange=doSearch;
doSearch();


window.openLocalFicha=codlocal=>{
  const localServices=R.filter(x=>String(x.codlocal||"")===String(codlocal));
  if(!localServices.length)return;

  currentLocalServices=localServices.slice();
  const base=localServices[0];
  const total=agg(localServices);
  const publicServices=localServices.filter(x=>x.gestion==="Pública");
  const privateServices=localServices.filter(x=>x.gestion==="Privada");
  const fc=FCORE[codlocal]||null;

  current=base;
  $("#ficha").hidden=false;
  $("#fTitle").textContent=`Ficha del local educativo · CL ${codlocal}`;
  $("#fSub").textContent=`${base.ugel} · ${base.distrito||"—"} · ${localServices.length} servicio(s) / nivel(es)`;

  kpis($("#fKpis"),[
    ["Servicios / niveles",fmt(localServices.length)],
    ["Matrícula total",fmt(total.estudiantes)],
    ["Docentes",fmt(total.docentes)],
    ["Código local",codlocal]
  ]);

  const coord=(LOCS||[]).find(x=>String(x.codlocal)===String(codlocal))||null;
  const localInfo=[
    ["Código local",codlocal],["UGEL",base.ugel],["Distrito",base.distrito||"—"],
    ["Dirección",base.direccion||"—"],["Servicios públicos",fmt(publicServices.length)],
    ["Servicios privados",fmt(privateServices.length)]
  ];

  const levelRows=localServices.map((z,i)=>`
    <tr class="${i===0?"selected-level-row":""}" onclick="selectLocalLevel(${i})">
      <td><b>${z.modalidad}</b><small>Ficha ${z.source}</small></td>
      <td>${z.cod_mod}</td>
      <td>${z.gestion}</td>
      <td>${fmt(z.estudiantes)}</td>
      <td>${fmt(z.docentes)}</td>
      <td>${fmt(z.secciones)}</td>
    </tr>`).join("");

  const levelsTable=`<div class="local-level-summary">
    <div class="related-head"><h3>Niveles / servicios educativos que funcionan en el local</h3><span>${localServices.length} servicio(s)</span></div>
    <div class="matrix-wrap"><table class="matrix-table local-level-table">
      <thead><tr><th>Nivel / modalidad</th><th>Código modular</th><th>Gestión</th><th>Estudiantes</th><th>Docentes</th><th>Secciones</th></tr></thead>
      <tbody>${levelRows}</tbody>
      <tfoot><tr><td><b>Total local</b></td><td>—</td><td>—</td><td><b>${fmt(total.estudiantes)}</b></td><td><b>${fmt(total.docentes)}</b></td><td><b>${fmt(total.secciones)}</b></td></tr></tfoot>
    </table></div>
  </div>`;

  const infraBlock=fc?`<div class="public-infra-summary">
    <div class="related-head"><h3>Infraestructura FUIE del local</h3><span>Vinculada por código local</span></div>
    <div class="fcore">
      <div><small>Aulas</small><b>${fmt(fc.aulas)}</b></div>
      <div><small>Buen estado</small><b>${fmt(fc.aulas_bueno)}</b></div>
      <div><small>Regular</small><b>${fmt(fc.aulas_regular)}</b></div>
      <div><small>Mal estado</small><b>${fmt(fc.aulas_malo)}</b></div>
      <div><small>Internet</small><b>${fc.internet||"—"}</b></div>
      <div><small>SFL</small><b>${(yes(fc.sfl1)||yes(fc.sfl2))?"Sí":"No / sin dato"}</b></div>
    </div>
  </div>`:`<div class="private-note"><b>Sin FUIE vinculada</b><span>Para este local se mostrará la información de las cédulas censales de cada nivel/modalidad disponible.</span></div>`;

  const locationAction=coord?`<div class="general-location-action">
    <div><small>Ubicación geográfica</small><b>${coord.lat}, ${coord.lon}</b></div>
    <a href="https://www.google.com/maps?q=${encodeURIComponent(coord.lat)},${encodeURIComponent(coord.lon)}" target="_blank" rel="noopener">📍 Ver ubicación</a>
  </div>`:"";
  $("#generalTab").innerHTML=`
    <div class="generalgrid">${localInfo.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join("")}</div>
    ${locationAction}
    ${levelsTable}
    ${(()=>{
      const tech=currentLocalServices?currentLocalServices.filter(x=>x.source==="6A"):[];
      if(!tech.length) return "";
      return `<div class="local-careers-summary">
        <div class="related-head"><h3>Carreras registradas en el local</h3><span>Solo servicios tecnológicos</span></div>
        ${tech.map(z=>`<div class="career-service-card">
          <div><b>${z.modalidad}</b><small>CM ${z.cod_mod}</small></div>
          <span>${careersForService(z.cod_mod).length} programa(s)</span>
        </div>`).join("")}
      </div>`;
    })()}
    ${infraBlock}
  `;

  $("#detailGroups").innerHTML=`<div class="loading">Abra “Detalle de la ficha” para consultar la información por nivel / modalidad.</div>`;
  $("#detailLoading").textContent="";
  $("#infraTabBtn").style.display=fc?"":"none";
  $("#fuieGroups").innerHTML="";
  $("#fuieLoading").textContent=fc?"Abra esta pestaña para ver la FUIE completa del local.":"No hay FUIE para este local.";
  setTab("general");
  selectLocalLevel(0);
  $("#ficha").scrollIntoView({behavior:"smooth"});
};

window.selectLocalLevel=i=>{
  if(!currentLocalServices||!currentLocalServices[i])return;
  const z=currentLocalServices[i];
  current=z;

  document.querySelectorAll(".local-level-table tbody tr").forEach((r,idx)=>r.classList.toggle("selected-level-row",idx===i));

  if($("#censoTab").classList.contains("active")){
    loadSelectedLocalLevel(z);
  }
};

function setTab(tab){
  $$("#fTabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  $$(".tabpage").forEach(p=>p.classList.remove("active"));
  $("#"+tab+"Tab").classList.add("active");
  if(tab==="censo"){
    if(currentLocalServices&&current) loadSelectedLocalLevel(current);
    else if(current) loadDetail(current.source,current.cod_mod);
  }
  if(tab==="fuie"&&current) loadFuie(current.codlocal);
}
$$('#fTabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));

window.openFicha=i=>{
  currentLocalServices=null;
  current=R[i];const x=current;
  $("#ficha").hidden=false;$("#fTitle").textContent=x.nombre||("Servicio "+x.cod_mod);$("#fSub").textContent=`${x.modalidad} · ${x.gestion} · ${x.ugel}`;
  kpis($("#fKpis"),[["Matrícula",fmt(x.estudiantes)],["Docentes",fmt(x.docentes)],["Secciones",fmt(x.secciones)],["Código modular",x.cod_mod]]);
  const vals=[["Código modular",x.cod_mod],["Anexo",x.anexo||"—"],["Código local",x.codlocal||"—"],["Modalidad / nivel",x.modalidad],["Nivel fuente",x.nivel_raw||"—"],["Gestión",x.gestion],["Dependencia",x.dependencia||"—"],["UGEL",x.ugel],["Distrito",x.distrito||"—"],["Dirección",x.direccion||"—"],["Turno",x.turno||"—"],["Área",x.area||"—"],["Centro poblado",x.centro_poblado||"—"],["Localidad",x.localidad||"—"],["Promotores",x.promotores?fmt(x.promotores):"—"]];
  const fc=FCORE[x.codlocal]||{};
  const sameLocal=R.filter(z=>x.codlocal&&z.codlocal===x.codlocal).sort((a,b)=>a.modalidad.localeCompare(b.modalidad));
  const sourceInfo=SRC.find(s=>s.code===x.source);
  const fichaSource=`<div class="source-box">
    <div><small>Fuente principal del servicio</small><b>Ficha ${x.source} · ${sourceInfo?sourceInfo.modalidad:x.modalidad}</b><span>El detalle se carga respetando los encabezados y columnas combinadas de esta cédula.</span></div>
    <span class="source-tag">${x.gestion}</span>
  </div>`;
  const related=`<div class="related-services">
    <div class="related-head"><h3>Servicios educativos en el mismo local</h3><span>${sameLocal.length} servicio(s)</span></div>
    <div class="related-grid">${sameLocal.map(z=>{const zi=R.indexOf(z);return `<div class="related-item ${z.cod_mod===x.cod_mod?"current":""}" ${z.cod_mod===x.cod_mod?"":`onclick="openFicha(${zi})"`}>
      <b>${z.modalidad}</b><span>CM ${z.cod_mod}</span><small>${z.gestion} · ${fmt(z.estudiantes)} estudiantes · ${fmt(z.docentes)} docentes</small>
      ${z.cod_mod===x.cod_mod?`<em>Nivel actual</em>`:`<em>Ver ficha de este nivel →</em>`}
    </div>`}).join("")||"<p>No se identificaron otros servicios vinculados.</p>"}</div>
  </div>`;
  const infraSummary=(x.gestion==="Pública"&&FCORE[x.codlocal])?`<div class="public-infra-summary">
    <div class="related-head"><h3>Resumen de infraestructura FUIE</h3><span>Vinculado por código local</span></div>
    <div class="fcore">
      <div><small>Aulas</small><b>${fmt(fc.aulas)}</b></div>
      <div><small>Buen estado</small><b>${fmt(fc.aulas_bueno)}</b></div>
      <div><small>Regular</small><b>${fmt(fc.aulas_regular)}</b></div>
      <div><small>Mal estado</small><b>${fmt(fc.aulas_malo)}</b></div>
      <div><small>Internet</small><b>${fc.internet||"—"}</b></div>
      <div><small>SFL</small><b>${(yes(fc.sfl1)||yes(fc.sfl2))?"Sí":"No / sin dato"}</b></div>
    </div>
  </div>`:`<div class="private-note"><b>${x.gestion==="Privada"?"Servicio privado":"Servicio sin FUIE vinculada"}</b><span>${x.gestion==="Privada"?"La ficha se construye con la cédula de matrícula correspondiente a su modalidad; FUIE no aplica.":"No se encontró registro FUIE para este código local."}</span></div>`;
  $("#generalTab").innerHTML=`<div class="generalgrid">${vals.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join("")}</div>${fichaSource}${related}${infraSummary}`;
  $("#detailGroups").innerHTML="";$("#fuieGroups").innerHTML="";
  $("#detailLoading").textContent="Abra esta pestaña para cargar la estructura combinada de la ficha "+x.source+".";
  const hasF=!!FCORE[x.codlocal]&&x.gestion==="Pública";$("#infraTabBtn").style.display=hasF?"":"none";
  $("#fuieLoading").textContent=hasF?"Abra esta pestaña para cargar la FUIE vinculada por código local.":"Este servicio no tiene FUIE vinculada.";
  setTab("general");$("#ficha").scrollIntoView({behavior:"smooth"});
};

function loadScript(src,id){return new Promise((resolve,reject)=>{if(document.getElementById(id)){resolve();return}const s=document.createElement("script");s.src=src;s.id=id;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})}
function cleanQuestionLabel(s){
  return String(s||"")
    .replace(/\s*\[[^\]]+\]\s*/g," ")
    .replace(/^\s*\(?\d+\)?[\.\-]\s*/,"")
    .replace(/\s+/g," ")
    .replace(/\s*:\s*$/,"")
    .trim();
}
function normText(s){
  return cleanQuestionLabel(s).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g," ").trim();
}
function isRedundantRoot(part,title){
  const p=normText(part),t=normText(title);
  if(!p||!t)return false;
  const pw=p.split(" ").filter(x=>x.length>2);
  const tw=t.split(" ").filter(x=>x.length>2);
  const common=pw.filter(x=>tw.includes(x)).length;
  return common>=2 || p.includes(t) || t.includes(p);
}
function fieldPath(label,title){
  let parts=String(label||"").split("›").map(cleanQuestionLabel).filter(Boolean);
  if(parts.length>1 && isRedundantRoot(parts[0],title)) parts.shift();
  return parts.length?parts:["Dato"];
}

function numberVal(v){
  const n=Number(String(v??"").replace(/,/g,"").trim());
  return Number.isFinite(n)?n:null;
}
function isEnrollmentGenderGroup(g){
  const t=normText(g.title);
  return t.includes("cantidad de matricula") && t.includes("grado") && (t.includes("genero")||t.includes("sexo"));
}
function renderEnrollmentGenderTable(g){
  const rows={};
  let grand=null;
  (g.fields||[]).forEach(([k,v])=>{
    const raw=String(k||"");
    const code=(raw.match(/\[([^\]]+)\]/)||[])[1]||"";
    const clean=cleanQuestionLabel(raw);
    const parts=clean.split("›").map(x=>x.trim()).filter(Boolean);
    if(code==="tot_alu" || (parts.length===1 && normText(parts[0])==="total")){grand=v;return}
    if(parts.length>=2){
      const grade=parts[0], sex=normText(parts[parts.length-1]);
      rows[grade]??={h:null,m:null,total:null};
      if(sex==="hom"||sex.includes("hombre")) rows[grade].h=v;
      else if(sex==="muj"||sex.includes("mujer")) rows[grade].m=v;
    }
  });
  Object.values(rows).forEach(r=>{
    const h=numberVal(r.h),m=numberVal(r.m);
    r.total=(h!==null||m!==null)?String((h||0)+(m||0)):"—";
  });
  const totalRow=rows["Total"]||rows["TOTAL"]||null;
  const gradeEntries=Object.entries(rows).filter(([k])=>normText(k)!=="total");
  const totalH=totalRow?.h ?? gradeEntries.reduce((s,[,r])=>s+(numberVal(r.h)||0),0);
  const totalM=totalRow?.m ?? gradeEntries.reduce((s,[,r])=>s+(numberVal(r.m)||0),0);
  const total=grand ?? ((numberVal(totalH)||0)+(numberVal(totalM)||0));
  return `<div class="enrollment-summary-cards">
      <div class="enroll-card total"><span>Total</span><b>${total}</b></div>
      <div class="enroll-card men"><span>Hombres</span><b>${totalH??"—"}</b></div>
      <div class="enroll-card women"><span>Mujeres</span><b>${totalM??"—"}</b></div>
    </div>
    <div class="matrix-wrap"><table class="matrix-table enrollment-table">
      <thead><tr><th>Grado / ciclo</th><th>Total</th><th>Hombres</th><th>Mujeres</th></tr></thead>
      <tbody>
        <tr class="matrix-total"><td>Total</td><td>${total}</td><td>${totalH??"—"}</td><td>${totalM??"—"}</td></tr>
        ${gradeEntries.map(([grade,r])=>`<tr><td>${grade}</td><td><b>${r.total}</b></td><td>${r.h??"—"}</td><td>${r.m??"—"}</td></tr>`).join("")}
      </tbody>
    </table></div>`;
}
function isSimpleByGradeGroup(g){
  const t=normText(g.title);
  return t.includes("por grado") && !isEnrollmentGenderGroup(g);
}
function renderSimpleGradeTable(g){
  const data=(g.fields||[]).map(([k,v])=>[cleanQuestionLabel(k),v]);
  const total=data.find(([k])=>normText(k)==="total");
  const rows=data.filter(([k])=>normText(k)!=="total");
  return `<div class="matrix-wrap"><table class="matrix-table">
    <thead><tr><th>Grado</th><th>Cantidad</th></tr></thead>
    <tbody>${total?`<tr class="matrix-total"><td>Total</td><td>${total[1]}</td></tr>`:""}${rows.map(([k,v])=>`<tr><td>${k}</td><td><b>${v}</b></td></tr>`).join("")}</tbody>
  </table></div>`;
}

function isTeachingPersonnelGroup(g){
  const t=normText(g.title);
  return t.includes("cantidad de personal docente") || (t.includes("personal docente") && t.includes("segun"));
}
function renderTeachingPersonnelTable(g){
  let totalGeneral=null;
  const rows=[];
  const rowMap={};

  (g.fields||[]).forEach(([k,v])=>{
    const clean=cleanQuestionLabel(k);
    const parts=clean.split("›").map(x=>x.trim()).filter(Boolean);

    if(parts.length===1 && normText(parts[0])==="total"){
      totalGeneral=v;
      return;
    }

    let role="", metric="";
    if(parts.length>=2){
      const p0=parts[0];
      if(normText(p0).includes("funcion") || normText(p0).includes("cargo")){
        role=parts[1]||"Otros";
        metric=parts.slice(2).join(" › ");
      }else{
        role=p0;
        metric=parts.slice(1).join(" › ");
      }
    }else{
      role=parts[0]||"Otros";
      metric="";
    }

    // When the header only says FUNCIÓN O CARGO and the leaf is the actual role.
    if((normText(role).includes("funcion") || normText(role).includes("cargo")) && !metric){
      role=clean;
    }

    // If there is no metric, use the leaf itself as role and store as cantidad.
    if(!metric){
      metric="Cantidad";
    }

    const key=role;
    if(!rowMap[key]){
      rowMap[key]={role,con:null,sin:null,cantidad:null,otros:[]};
      rows.push(rowMap[key]);
    }
    const r=rowMap[key], nm=normText(metric);
    if(nm.includes("con horas de clase")) r.con=v;
    else if(nm.includes("sin horas de clase")) r.sin=v;
    else if(nm==="cantidad") r.cantidad=v;
    else r.otros.push([metric,v]);
  });

  rows.forEach(r=>{
    const c=numberVal(r.con),s=numberVal(r.sin),q=numberVal(r.cantidad);
    if(q!==null) r.total=q;
    else if(c!==null||s!==null) r.total=(c||0)+(s||0);
    else r.total=null;
  });

  return `<div class="matrix-wrap personnel-matrix">
    <table class="matrix-table">
      <thead><tr><th>Función / cargo</th><th>Total</th><th>Con horas de clase</th><th>Sin horas de clase</th></tr></thead>
      <tbody>
        ${totalGeneral!==null?`<tr class="matrix-total"><td>Total personal docente</td><td>${totalGeneral}</td><td>—</td><td>—</td></tr>`:""}
        ${rows.map(r=>`<tr>
          <td>${r.role}</td>
          <td><b>${r.total!==null?r.total:"—"}</b></td>
          <td>${r.con??"—"}</td>
          <td>${r.sin??"—"}</td>
        </tr>${r.otros.map(([k,v])=>`<tr class="personnel-extra"><td>↳ ${k}</td><td><b>${v}</b></td><td>—</td><td>—</td></tr>`).join("")}`).join("")}
      </tbody>
    </table>
  </div>`;
}
function groupsToHtml(groups){
  return (groups||[]).map((g,idx)=>`
    <div class="group ${idx<2?"open":""}">
      <button onclick="this.parentElement.classList.toggle('open')">
        <span>${g.title}</span><span>＋</span>
      </button>
      <div class="groupbody">${renderFieldsHierarchical(g)}</div>
    </div>`).join("")||"<div class='loading'>No hay campos adicionales con información.</div>";
}

function isNonTeachingPersonnelGroup(g){
  const t=normText(g.title);
  return t.includes("cantidad de personal no docente");
}
function renderNonTeachingPersonnelTable(g){
  let totalGeneral=null;
  const rows=[];
  (g.fields||[]).forEach(([k,v])=>{
    const clean=cleanQuestionLabel(k);
    const parts=clean.split("›").map(x=>x.trim()).filter(Boolean);
    if(parts.length===1 && normText(parts[0])==="total"){totalGeneral=v;return;}
    let role=parts[parts.length-1]||clean;
    // Si existe "Personal de servicio > Mantenimiento", conservar jerarquía en el nombre.
    if(parts.length>=2 && !normText(parts[0]).includes("funcion") && !normText(parts[0]).includes("cargo")){
      role=parts.slice(-2).join(" › ");
    }
    rows.push([role,v]);
  });
  return `<div class="matrix-wrap"><table class="matrix-table compact-personnel">
    <thead><tr><th>Función / cargo</th><th>Cantidad</th></tr></thead>
    <tbody>
      ${totalGeneral!==null?`<tr class="matrix-total"><td>Total personal no docente</td><td>${totalGeneral}</td></tr>`:""}
      ${rows.map(([r,v])=>`<tr><td>${r}</td><td><b>${v}</b></td></tr>`).join("")}
    </tbody>
  </table></div>`;
}
function isAuxiliaryGroup(g){
  const t=normText(g.title);
  return t.includes("cantidad de auxiliares de educacion");
}
function renderAuxiliaryTable(g){
  let total=null;
  const categories={};
  (g.fields||[]).forEach(([k,v])=>{
    const clean=cleanQuestionLabel(k);
    const parts=clean.split("›").map(x=>x.trim()).filter(Boolean);
    if(parts.length===1 && normText(parts[0])==="total"){total=v;return;}
    const group=parts.length>1?parts.slice(0,-1).join(" › "):"Otros";
    const item=parts[parts.length-1]||clean;
    categories[group]??=[];
    categories[group].push([item,v]);
  });
  return `<div class="aux-summary">
    ${total!==null?`<div class="aux-total"><span>Total auxiliares</span><b>${total}</b></div>`:""}
    ${Object.entries(categories).map(([cat,items])=>`
      <div class="matrix-wrap aux-table-wrap">
        <table class="matrix-table">
          <thead><tr><th>${cat}</th><th>Cantidad</th></tr></thead>
          <tbody>${items.map(([k,v])=>`<tr><td>${k}</td><td><b>${v}</b></td></tr>`).join("")}</tbody>
        </table>
      </div>`).join("")}
  </div>`;
}
function isLocationGroup(g){
  const t=normText(g.title);
  return t==="latitud" || t==="longitud" || t.includes("ubicacion geografica") ||
         t.includes("ubicación geográfica") || t==="direccion" || t==="dirección";
}
function serviceGroupsWithoutLocalData(groups){
  // Latitud, longitud y otros datos físicos corresponden al LOCAL y se muestran una sola vez arriba.
  return (groups||[]).filter(g=>!isLocationGroup(g));
}

function isDurationCycleGenderGroup(g){
  const t=normText(g.title);
  return t.includes("matricula por duracion") && t.includes("ciclo") && (t.includes("genero")||t.includes("sexo"));
}
function normalizeCycleLabel(s){
  const x=cleanQuestionLabel(s).replace(/^ciclo\s*/i,"").trim();
  return x||s;
}
function renderDurationCycleGenderTable(g){
  let grandTotal=null, grandH=null, grandM=null;
  const durations={};

  (g.fields||[]).forEach(([k,v])=>{
    const raw=String(k||"");
    const code=(raw.match(/\[([^\]]+)\]/)||[])[1]||"";
    const clean=cleanQuestionLabel(raw);
    const parts=clean.split("›").map(x=>x.trim()).filter(Boolean);

    if(code==="tot_alu" || (parts.length===1 && normText(parts[0])==="total")){
      grandTotal=v; return;
    }
    if(parts.length>=2 && normText(parts[0])==="total"){
      const sex=normText(parts[parts.length-1]);
      if(sex==="hom"||sex.includes("hombre")) grandH=v;
      else if(sex==="muj"||sex.includes("mujer")) grandM=v;
      return;
    }

    if(parts.length>=3){
      const duration=parts[0];
      const cycle=normalizeCycleLabel(parts[1]);
      const sex=normText(parts[parts.length-1]);
      durations[duration]??={};
      durations[duration][cycle]??={h:null,m:null};
      if(sex==="hom"||sex.includes("hombre")) durations[duration][cycle].h=v;
      else if(sex==="muj"||sex.includes("mujer")) durations[duration][cycle].m=v;
    }
  });

  const durationBlocks=Object.entries(durations).map(([duration,cycles])=>{
    const rows=Object.entries(cycles).map(([cycle,r])=>{
      const h=numberVal(r.h)||0, m=numberVal(r.m)||0, total=h+m;
      return {cycle,h,m,total};
    }).filter(r=>r.total>0);

    const totalH=rows.reduce((s,r)=>s+r.h,0);
    const totalM=rows.reduce((s,r)=>s+r.m,0);
    const total=totalH+totalM;

    if(total<=0) return "";

    return `<section class="duration-block">
      <div class="duration-title"><span>Duración de carrera</span><b>${duration}</b><em>${fmt(total)} estudiantes</em></div>
      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead><tr><th>Ciclo</th><th>Total</th><th>Hombres</th><th>Mujeres</th></tr></thead>
          <tbody>
            ${rows.map(r=>`<tr><td>${r.cycle}</td><td><b>${fmt(r.total)}</b></td><td>${fmt(r.h)}</td><td>${fmt(r.m)}</td></tr>`).join("")}
          </tbody>
          <tfoot><tr><td><b>Total</b></td><td><b>${fmt(total)}</b></td><td><b>${fmt(totalH)}</b></td><td><b>${fmt(totalM)}</b></td></tr></tfoot>
        </table>
      </div>
    </section>`;
  }).filter(Boolean).join("");

  const gt=grandTotal??((numberVal(grandH)||0)+(numberVal(grandM)||0));
  return `<div class="enrollment-summary-cards">
      <div class="enroll-card total"><span>Total</span><b>${fmt(numberVal(gt)??gt)}</b></div>
      <div class="enroll-card men"><span>Hombres</span><b>${fmt(numberVal(grandH)??grandH)}</b></div>
      <div class="enroll-card women"><span>Mujeres</span><b>${fmt(numberVal(grandM)??grandM)}</b></div>
    </div>
    <div class="duration-list">${durationBlocks||"<div class='loading'>No hay ciclos con matrícula registrada.</div>"}</div>`;
}

function isAgeGenderGroup(g){
  const t=normText(g.title);
  return t.includes("matricula por edad") && (t.includes("genero")||t.includes("sexo"));
}
function renderAgeGenderTable(g){
  let grandTotal=null,grandH=null,grandM=null;
  const ages={};

  (g.fields||[]).forEach(([k,v])=>{
    const raw=String(k||"");
    const code=(raw.match(/\[([^\]]+)\]/)||[])[1]||"";
    const clean=cleanQuestionLabel(raw);
    const parts=clean.split("›").map(x=>x.trim()).filter(Boolean);

    if(code==="tot_alu" || (parts.length===1 && normText(parts[0])==="total")){
      grandTotal=v; return;
    }
    if(parts.length>=2 && normText(parts[0])==="total"){
      const sex=normText(parts[parts.length-1]);
      if(sex==="hom"||sex.includes("hombre")) grandH=v;
      else if(sex==="muj"||sex.includes("mujer")) grandM=v;
      return;
    }

    if(parts.length>=2){
      const age=parts[0];
      const sex=normText(parts[parts.length-1]);
      ages[age]??={h:null,m:null};
      if(sex==="hom"||sex.includes("hombre")) ages[age].h=v;
      else if(sex==="muj"||sex.includes("mujer")) ages[age].m=v;
    }
  });

  const rows=Object.entries(ages).map(([age,r])=>{
    const h=numberVal(r.h)||0,m=numberVal(r.m)||0,total=h+m;
    return {age,h,m,total};
  }).filter(r=>r.total>0);

  const totalH=grandH??rows.reduce((s,r)=>s+r.h,0);
  const totalM=grandM??rows.reduce((s,r)=>s+r.m,0);
  const total=grandTotal??((numberVal(totalH)||0)+(numberVal(totalM)||0));

  return `<div class="enrollment-summary-cards">
      <div class="enroll-card total"><span>Total</span><b>${fmt(numberVal(total)??total)}</b></div>
      <div class="enroll-card men"><span>Hombres</span><b>${fmt(numberVal(totalH)??totalH)}</b></div>
      <div class="enroll-card women"><span>Mujeres</span><b>${fmt(numberVal(totalM)??totalM)}</b></div>
    </div>
    <div class="matrix-wrap">
      <table class="matrix-table">
        <thead><tr><th>Edad</th><th>Total</th><th>Hombres</th><th>Mujeres</th></tr></thead>
        <tbody>${rows.map(r=>`<tr><td>${r.age}</td><td><b>${fmt(r.total)}</b></td><td>${fmt(r.h)}</td><td>${fmt(r.m)}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td><b>Total</b></td><td><b>${fmt(numberVal(total)??total)}</b></td><td><b>${fmt(numberVal(totalH)??totalH)}</b></td><td><b>${fmt(numberVal(totalM)??totalM)}</b></td></tr></tfoot>
      </table>
    </div>`;
}

function shouldCompactAsMatrix(g){
  const t=normText(g.title);
  if(isDurationCycleGenderGroup(g)||isAgeGenderGroup(g)||isEnrollmentGenderGroup(g)||isTeachingPersonnelGroup(g)) return false;
  return (
    t.includes("secciones por edad") ||
    t.includes("secciones por ciclo") ||
    t.includes("secciones por grado") ||
    t.includes("secciones por ciclo y grado") ||
    t.includes("docentes segun") ||
    t.includes("personal docente") ||
    t.includes("personal no docente") ||
    t.includes("auxiliares") ||
    t.includes("por condicion laboral") ||
    t.includes("por genero")
  );
}
function renderCompactMatrix(g){
  let total=null;
  const rows=[];
  (g.fields||[]).forEach(([k,v])=>{
    const clean=cleanQuestionLabel(String(k||""));
    const parts=clean.split("›").map(x=>x.trim()).filter(Boolean);
    const n=numberVal(v);
    if(parts.length===1 && normText(parts[0])==="total"){ total=v; return; }
    if(n===null || n===0) return; // no mostrar categorías sin información
    rows.push({parts,value:n});
  });

  if(!rows.length){
    const tn=numberVal(total);
    return tn>0 ? `<div class="enrollment-summary-cards"><div class="enroll-card total"><span>Total</span><b>${fmt(tn)}</b></div></div>` : "";
  }

  const maxDepth=Math.max(...rows.map(r=>r.parts.length));
  const headers=[];
  if(maxDepth===1) headers.push("Categoría");
  else {
    for(let i=0;i<maxDepth-1;i++) headers.push(i===0?"Agrupación":`Subgrupo ${i}`);
    headers.push("Detalle");
  }
  headers.push("Total");

  const body=rows.map(r=>{
    const p=[...r.parts];
    while(p.length<maxDepth) p.push("");
    return `<tr>${p.map(x=>`<td>${x}</td>`).join("")}<td class="num"><b>${fmt(r.value)}</b></td></tr>`;
  }).join("");

  const tn=numberVal(total);
  return `${tn!==null?`<div class="enrollment-summary-cards"><div class="enroll-card total"><span>Total</span><b>${fmt(tn)}</b></div></div>`:""}
    <div class="matrix-wrap compact-matrix">
      <table class="matrix-table">
        <thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${body}</tbody>
        ${tn!==null?`<tfoot><tr><td colspan="${maxDepth}"><b>Total</b></td><td class="num"><b>${fmt(tn)}</b></td></tr></tfoot>`:""}
      </table>
    </div>`;
}

function isFUIEMatriculaGroup(g){
  const t=normText(g.title);
  return t==="matricula" || t.includes("matricula del local");
}
function renderFUIEMatriculaTable(g){
  let total=null;
  const rows=[];
  (g.fields||[]).forEach(([k,v])=>{
    const clean=cleanQuestionLabel(String(k||""));
    const parts=clean.split("›").map(x=>x.trim()).filter(Boolean);
    const n=numberVal(v);

    if(parts.length===1 && normText(parts[0]).includes("total matricula")){
      total=v; return;
    }
    if(n===null || n===0) return;

    const group=parts.length>1?parts[0]:"";
    const detail=parts.length>1?parts.slice(1).join(" › "):parts[0];
    rows.push({group,detail,value:n});
  });

  if(!rows.length && (numberVal(total)||0)===0) return "";

  return `<div class="fui-matricula-summary">
    ${numberVal(total)!==null?`<div class="enrollment-summary-cards"><div class="enroll-card total"><span>Total matrícula del local</span><b>${fmt(numberVal(total))}</b></div></div>`:""}
    ${rows.length?`<div class="matrix-wrap"><table class="matrix-table">
      <thead><tr><th>Modalidad / nivel</th><th>Detalle</th><th>Estudiantes</th></tr></thead>
      <tbody>${rows.map(r=>`<tr><td>${r.group||"—"}</td><td><b>${r.detail}</b></td><td class="num"><b>${fmt(r.value)}</b></td></tr>`).join("")}</tbody>
    </table></div>`:""}
  </div>`;
}
function isFUIELocationGroup(g){
  const t=normText(g.title);
  return t==="ubicacion" || t.includes("ubicacion del local");
}
function renderFUIELocationCard(g){
  let lat=null,lon=null;
  const others=[];
  (g.fields||[]).forEach(([k,v])=>{
    const label=cleanQuestionLabel(k);
    const t=normText(label);
    if(t==="latitud" || t.includes("latitud")) lat=v;
    else if(t==="longitud" || t.includes("longitud")) lon=v;
    else if(String(v??"").trim()!=="") others.push([label,v]);
  });
  const hasCoords=lat!==null&&lon!==null&&String(lat).trim()!==""&&String(lon).trim()!=="";
  return `<div class="fui-location-card">
    <div class="fui-location-data">
      ${others.slice(0,6).map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join("")}
      ${lat!==null?`<div><small>Latitud</small><b>${lat}</b></div>`:""}
      ${lon!==null?`<div><small>Longitud</small><b>${lon}</b></div>`:""}
    </div>
    ${hasCoords?`<a class="location-link" href="https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lon)}" target="_blank" rel="noopener"><span>📍</span><div><b>Ver ubicación del local</b><small>Abrir coordenadas en Google Maps</small></div></a>`:""}
  </div>`;
}
function filterZeroOnlyGroups(groups){
  return (groups||[]).map(g=>{
    if(isFUIEMatriculaGroup(g)||isFUIELocationGroup(g)) return g;
    const kept=(g.fields||[]).filter(([k,v])=>{
      const n=numberVal(v);
      return n===null || n!==0;
    });
    return {...g,fields:kept};
  }).filter(g=>(g.fields||[]).length>0);
}
function renderFieldsHierarchical(g){
  if(isFUIEMatriculaGroup(g)) return renderFUIEMatriculaTable(g);
  if(isFUIELocationGroup(g)) return renderFUIELocationCard(g);
  if(isDurationCycleGenderGroup(g)) return renderDurationCycleGenderTable(g);
  if(isAgeGenderGroup(g)) return renderAgeGenderTable(g);
  if(shouldCompactAsMatrix(g)) return renderCompactMatrix(g);
  if(isEnrollmentGenderGroup(g)) return renderEnrollmentGenderTable(g);
  if(isTeachingPersonnelGroup(g)) return renderTeachingPersonnelTable(g);
  if(isNonTeachingPersonnelGroup(g)) return renderNonTeachingPersonnelTable(g);
  if(isAuxiliaryGroup(g)) return renderAuxiliaryTable(g);
  if(isSimpleByGradeGroup(g)) return renderSimpleGradeTable(g);
  const items=(g.fields||[]).map(([k,v])=>({path:fieldPath(k,g.title),value:v}));
  const blocks=[];
  let currentKey=null,currentBlock=null;

  items.forEach(it=>{
    const leaf=it.path[it.path.length-1];
    const parents=it.path.slice(0,-1);
    const key=parents.join(" › ");

    if(key!==currentKey){
      currentKey=key;
      currentBlock={parents,fields:[]};
      blocks.push(currentBlock);
    }
    currentBlock.fields.push({label:leaf,value:it.value});
  });

  return blocks.map((b,bi)=>{
    const title=b.parents.length
      ? `<div class="info-card-title">${b.parents.map((p,i)=>`<span>${p}</span>`).join('<b>›</b>')}</div>`
      : "";
    const cls=b.parents.length ? "info-card" : "info-card info-card-simple";
    return `<section class="${cls}">
      ${title}
      <div class="info-card-grid">
        ${b.fields.map(f=>`
          <div class="info-item">
            <div class="info-question">${f.label}</div>
            <div class="info-answer">${f.value}</div>
          </div>`).join("")}
      </div>
    </section>`;
  }).join("");
}
function renderGroups(el,groups){el.innerHTML=groupsToHtml(groups);}



async function loadSelectedLocalLevel(z){
  $("#detailLoading").textContent="Cargando ficha censal del nivel seleccionado…";
  $("#detailGroups").innerHTML="";
  try{
    await loadScript(`details/${z.source}.js`,`detail-${z.source}`);
    const obj=window[`DRELM_DETAIL_${z.source}`];
    const d=obj?obj[z.cod_mod]:null;
    const groups=d?serviceGroupsWithoutLocalData(d.groups):[];

    const index=currentLocalServices?currentLocalServices.indexOf(z):-1;
    const levelSelector=currentLocalServices&&currentLocalServices.length>1?`
      <div class="detail-level-selector">
        <div class="detail-level-title"><b>Niveles / modalidades del local</b><span>Seleccione uno para ver su ficha censal</span></div>
        <div class="detail-level-buttons">
          ${currentLocalServices.map((x,i)=>`
            <button class="${i===index?"active":""}" onclick="selectLocalLevel(${i})">
              <span>${x.source==="3AP"?"📘":x.source==="3AS"?"📗":x.source==="1A"?"🧸":x.source==="2A"?"🌱":x.source.startsWith("4")?"📙":x.source.startsWith("8")?"🧩":x.source==="9A"?"🛠️":x.source==="5A"?"🎓":x.source==="6A"?"⚙️":x.source==="7A"?"🎨":"🏫"}</span>
              <b>${x.modalidad}</b><small>CM ${x.cod_mod}</small>
            </button>`).join("")}
        </div>
      </div>`:"";

    const summaryCards=`
      <div class="detail-summary-cards">
        <div><span>Estudiantes</span><b>${fmt(z.estudiantes)}</b></div>
        <div><span>Docentes</span><b>${fmt(z.docentes)}</b></div>
        <div><span>Secciones</span><b>${fmt(z.secciones)}</b></div>
        <div><span>Gestión</span><b>${z.gestion}</b></div>
      </div>`;

    $("#detailLoading").textContent="";
    $("#detailGroups").innerHTML=`
      ${levelSelector}
      <section class="local-level-detail selected-level-detail">
        <div class="level-detail-head">
          <div class="level-detail-icon">${z.source==="3AP"?"📘":z.source==="3AS"?"📗":z.source==="1A"?"🧸":z.source==="2A"?"🌱":z.source.startsWith("4")?"📙":z.source.startsWith("8")?"🧩":z.source==="9A"?"🛠️":z.source==="5A"?"🎓":z.source==="6A"?"⚙️":z.source==="7A"?"🎨":"🏫"}</div>
          <div>
            <small>Ficha ${z.source} · Código modular ${z.cod_mod}</small>
            <h3>${z.modalidad}</h3>
            <p>${z.nombre||""}</p>
          </div>
        </div>
        ${summaryCards}
        ${z.source==="6A"?`<div class="service-careers-block">
          <div class="related-head"><h3>Carreras / programas de estudio registrados</h3><span>Matrícula 2026-1</span></div>
          ${renderCareerTable(careersForService(z.cod_mod))}
        </div>`:""}
        <div class="local-level-body">${groupsToHtml(groups)}</div>
      </section>`;
  }catch(e){
    $("#detailLoading").textContent="No se pudo cargar la ficha censal del nivel seleccionado.";
  }
}

async function loadDetail(source,cod){$("#detailLoading").textContent="Cargando estructura de la ficha…";try{await loadScript(`details/${source}.js`,`detail-${source}`);const obj=window[`DRELM_DETAIL_${source}`],d=obj?obj[cod]:null;$("#detailLoading").textContent="";renderGroups($("#detailGroups"),d?d.groups:[])}catch(e){$("#detailLoading").textContent="No se pudo cargar el detalle de esta ficha."}}
async function loadFuie(codlocal){if(!codlocal||!FCORE[codlocal])return;$("#fuieLoading").textContent="Cargando FUIE…";try{await loadScript("details/FUIE.js","detail-fuie");const d=window.DRELM_FUIE_DETAIL?window.DRELM_FUIE_DETAIL[codlocal]:null;$("#fuieLoading").textContent="";renderGroups($("#fuieGroups"),d?filterZeroOnlyGroups(d.groups):[])}catch(e){$("#fuieLoading").textContent="No se pudo cargar la FUIE."}}

