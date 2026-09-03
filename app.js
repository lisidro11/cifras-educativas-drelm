
const R=window.DRELM_SERVICES,S=window.DRELM_SUMMARY,SRC=window.DRELM_SOURCES,FCORE=window.DRELM_FUIE_CORE,LOCS=window.DRELM_FUIE_LOCATIONS||[],CAREERS=window.DRELM_CAREERS||[];
const P=window.DRELM_PADRON||[],PMETA=window.DRELM_PADRON_META||{};
const PADRON_MODULES={EBR:["EBR","PRONOEI"],EBA:["EBA"],EBE:["EBE","PRITE"],Superior:["SUPERIOR"],ETP:["ETP"]};
const PADRON_MODAL_ORDER=["EBR","PRONOEI","EBA","EBE","PRITE","ETP","SUPERIOR"];
const PADRON_MODAL_LABELS={EBR:"Educación Básica Regular (EBR)",PRONOEI:"PRONOEI",EBA:"Educación Básica Alternativa (EBA)",EBE:"Educación Básica Especial (EBE)",PRITE:"PRITE",ETP:"Educación Técnico-Productiva (CETPRO)",SUPERIOR:"Educación Superior no universitaria"};
function padronAgg(a){return {servicios:new Set(a.map(x=>x.c).filter(Boolean)).size,locales:new Set(a.map(x=>x.l).filter(Boolean)).size,instituciones:new Set(a.map(x=>x.i).filter(Boolean)).size}}
function scopedPadron(rows=P){if(scope==="publica")return rows.filter(x=>x.g==="Pública");if(scope==="privada")return rows.filter(x=>x.g==="Privada");return rows}
function padronForModule(sector,gestion="",ugel=""){const mods=PADRON_MODULES[sector]||[];return P.filter(x=>mods.includes(x.mod)&&(!gestion||x.g===gestion)&&(!ugel||x.u===ugel))}
function rowsByPadronCodes(prows){const codes=new Set(prows.map(x=>String(x.c)).filter(Boolean));return R.filter(x=>codes.has(String(x.cod_mod)))}
function combinedStats(prows){const rr=rowsByPadronCodes(prows),r=agg(rr),p=padronAgg(prows);return {...r,servicios:p.servicios,locales:p.locales,instituciones:p.instituciones}}
const RIE_ELIGIBLE_MODS=["EBR","EBA","EBE","PRITE","ETP"];
function padronRieStats(rows=P){
  const eligible=rows.filter(x=>RIE_ELIGIBLE_MODS.includes(x.mod));
  const totalCodes=new Set(eligible.map(x=>String(x.c||"")).filter(Boolean));
  const withCodinst=new Set(eligible.filter(x=>String(x.i||"").trim()).map(x=>String(x.c||"")).filter(Boolean));
  const total=totalCodes.size,con=withCodinst.size;
  return {total,con,pendientes:Math.max(0,total-con),pct:total?con/total*100:0};
}
function padronDistrict(x){return normDistrict(x?.d||"")}
function padronRowsForDistrict(d){return scopedPadron().filter(x=>padronDistrict(x)===d)}
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>new Intl.NumberFormat("es-PE",{maximumFractionDigits:0}).format(n||0);
const moduleNames={EBR:"Educación Básica Regular (EBR)",EBA:"Educación Básica Alternativa (EBA)",EBE:"Educación Básica Especial (EBE)",Superior:"Educación Superior no universitaria",ETP:"Educación Técnico-Productiva (CETPRO)"};
const moduleIcons={EBR:"🎓",EBA:"📘",EBE:"🧩",Superior:"🏛️",ETP:"🛠️"};
let scope="total",current=null,currentLocalServices=null,selectedDistrict="",selectedDistrictLocals=[];
const institutionMapRegistry=new Map();

function refreshInstitutionMapView(id){
  const entry=institutionMapRegistry.get(id);
  if(!entry)return;
  entry.start?.();
  if(entry.map){
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      try{entry.map.invalidateSize(true);if(!entry.hasFitted)entry.fit?.();}catch(e){}
    }));
  }
}

function showView(id){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  $$(".side-item").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
  $$("#topnav button").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
  window.scrollTo(0,0);
  setTimeout(()=>refreshInstitutionMapView(id),80);
}
$$(".side-item").forEach(b=>b.onclick=()=>showView(b.dataset.view));
$$("#topnav button").forEach(b=>b.onclick=()=>showView(b.dataset.view));

function iconForKpi(k){
  const x=String(k||"").toLowerCase();
  if(x.includes("estudiante")||x.includes("matrícula"))return "👨‍🎓";
  if(x.includes("docente"))return "👩‍🏫";
  if(x.includes("servicio"))return "🏫";
  if(x.includes("local"))return "🏢";
  if(x.includes("código de ie")||x.includes("rie"))return "🔗";
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


const UGEL_COLORS={"UGEL 01":"#e8b800","UGEL 02":"#2baa57","UGEL 03":"#0d568b","UGEL 04":"#72b5e8","UGEL 05":"#7B8794","UGEL 06":"#e34755","UGEL 07":"#7044c6"};
const LIMA_GEOJSON_URL="https://raw.githubusercontent.com/joseluisq/peru-geojson-datasets/master/lima_callao_distritos_simple.geojson";
let limaGeoJSONCache=null;
function normDistrict(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim()}
function districtNameFromRow(r){const p=String(r.distrito||"").split("/");return normDistrict((p[p.length-1]||"").trim())}
function districtStats(rows=scopedRows(),pdRows=scopedPadron()){
  const out={};
  const byDistrict={};

  // El padrón filtrado define servicios/locales/UGEL/distrito.
  pdRows.forEach(p=>{
    const d=padronDistrict(p);
    if(!d)return;
    (byDistrict[d]??=[]).push(p);
  });

  Object.entries(byDistrict).forEach(([d,prows])=>{
    const codes=new Set(prows.map(p=>String(p.c||"")).filter(Boolean));
    // rows ya viene filtrado por gestión. Además se restringe a códigos del padrón filtrado.
    const rr=rows.filter(r=>codes.has(String(r.cod_mod||"")));
    const rs=agg(rr);
    const ps=padronAgg(prows);
    out[d]={
      distrito:d,
      rows:rr,
      ugel:prows.map(p=>p.u).find(u=>/^UGEL 0[1-7]$/.test(u||""))||"",
      estudiantes:rs.estudiantes,
      docentes:rs.docentes,
      secciones:rs.secciones,
      servicios:ps.servicios,
      locales:ps.locales
    };
  });

  return out;
}
function ugelBox(ugel,stats){
  const rows=Object.values(stats).filter(x=>x.ugel===ugel).sort((a,b)=>a.distrito.localeCompare(b.distrito,"es"));
  const totals={locales:0,servicios:0,estudiantes:0,docentes:0};
  rows.forEach(x=>{
    totals.locales+=x.locales;
    totals.servicios+=x.servicios;
    totals.estudiantes+=x.estudiantes||0;
    totals.docentes+=x.docentes||0;
  });
  return `<div class="ugel-summary-box" style="--ugel-color:${UGEL_COLORS[ugel]}"><div class="ugel-summary-title">${ugel}</div><div class="ugel-summary-scroll"><table><thead><tr><th>Distrito</th><th title="Servicios educativos">SS.EE.</th><th title="Locales educativos">L.E.</th><th>Estudiantes</th><th>Docentes</th></tr></thead><tbody>${rows.map(x=>`<tr data-map-district="${x.distrito}"><td>${x.distrito}</td><td>${fmt(x.servicios)}</td><td>${fmt(x.locales)}</td><td>${fmt(x.estudiantes||0)}</td><td>${fmt(x.docentes||0)}</td></tr>`).join("")}</tbody><tfoot><tr><td>Total</td><td>${fmt(totals.servicios)}</td><td>${fmt(totals.locales)}</td><td>${fmt(totals.estudiantes)}</td><td>${fmt(totals.docentes)}</td></tr></tfoot></table></div></div>`;
}
function projectGeoJSON(features,w=520,h=500,pad=12){
  const pts=[];features.forEach(f=>{const g=f.geometry;if(!g)return;const polys=g.type==="Polygon"?[g.coordinates]:g.coordinates;polys.flat(2).forEach(p=>{if(Array.isArray(p)&&typeof p[0]==="number")pts.push(p)})});
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);const sx=(w-pad*2)/(maxX-minX),sy=(h-pad*2)/(maxY-minY),sc=Math.min(sx,sy),ox=(w-(maxX-minX)*sc)/2,oy=(h-(maxY-minY)*sc)/2;
  const P=p=>[(p[0]-minX)*sc+ox,h-((p[1]-minY)*sc+oy)];
  const ring=r=>r.map((p,i)=>`${i?"L":"M"}${P(p)[0].toFixed(1)},${P(p)[1].toFixed(1)}`).join(" ")+" Z";
  const pathFor=f=>{const g=f.geometry;if(g.type==="Polygon")return g.coordinates.map(ring).join(" ");return g.coordinates.map(poly=>poly.map(ring).join(" ")).join(" ")};
  pathFor.point=P;
  return pathFor;
}

function districtLocalRows(district){
  const allowed=scopedPadron();
  const prows=padronRowsForDistrict(district).filter(p=>allowed.includes(p)),byLocal=new Map();
  prows.forEach(x=>{if(!x.l)return;const k=String(x.l);if(!byLocal.has(k))byLocal.set(k,[]);byLocal.get(k).push(x)});
  return [...byLocal.entries()].map(([codlocal,services])=>{
    const codes=new Set(services.map(x=>String(x.c)).filter(Boolean)),rr=scopedRows().filter(r=>codes.has(String(r.cod_mod))),rs=agg(rr),pp=padronAgg(services),base=services[0];
    return {codlocal,services,total:{...rs,servicios:pp.servicios,locales:1},base,nombre:services.map(x=>x.n).find(Boolean)||"Local educativo",gestion:[...new Set(services.map(x=>x.g).filter(Boolean))].join(" / "),niveles:[...new Set(services.map(x=>x.mod).filter(Boolean))].join(" · "),direccion:base.dir||"—"};
  }).sort((a,b)=>a.nombre.localeCompare(b.nombre,"es"));
}
function renderDistrictSchoolRows(query=""){
  const body=document.getElementById("districtSchoolRows"),count=document.getElementById("districtSchoolCount");if(!body)return;
  const q=normDistrict(query);
  const rows=selectedDistrictLocals.filter(x=>!q||normDistrict([x.codlocal,x.nombre,x.gestion,x.niveles,x.direccion].join(" ")).includes(q));
  if(count)count.textContent=`${fmt(rows.length)} locales educativos`;
  body.innerHTML=rows.slice(0,150).map(x=>`<tr>
    <td><b>${x.codlocal}</b></td><td><b>${x.nombre}</b></td><td>${x.gestion}</td><td>${x.niveles||"—"}</td>
    <td class="num">${fmt(x.total.estudiantes)}</td><td class="num">${fmt(x.total.docentes)}</td><td>${x.direccion}</td>
    <td><div class="district-actions"><button type="button" class="district-ficha-btn" data-local="${x.codlocal}">Ver ficha</button><button type="button" class="district-pdf-btn" data-pdf-local="${x.codlocal}" title="Descargar ficha técnica en PDF">PDF ↓</button></div></td>
  </tr>`).join("")||`<tr><td colspan="8" class="district-no-results">No se encontraron instituciones con ese criterio.</td></tr>`;
  body.querySelectorAll("[data-local]").forEach(b=>b.addEventListener("click",()=>{showView("buscar");window.openLocalFicha?.(b.dataset.local)}));
  body.querySelectorAll("[data-pdf-local]").forEach(b=>b.addEventListener("click",()=>window.v31FichaPdf?.(b.dataset.pdfLocal)));
}
function selectDistrict(district){
  const stats=districtStats(scopedRows()),x=stats[district];if(!x)return;
  selectedDistrict=district;selectedDistrictLocals=districtLocalRows(district);
  const panel=document.getElementById("districtDetail");if(!panel)return;
  panel.hidden=false;
  document.getElementById("districtDetailTitle").textContent=district;
  document.getElementById("districtDetailUgel").textContent=x.ugel||"Sin UGEL";
  const k=document.getElementById("districtDetailKpis");
  if(k)k.innerHTML=[
    ["Locales educativos",x.locales],["Servicios educativos",x.servicios],["Estudiantes",x.estudiantes],["Docentes",x.docentes]
  ].map(([a,b])=>`<div><span>${a}</span><b>${fmt(b)}</b></div>`).join("");
  const search=document.getElementById("districtSchoolSearch");if(search)search.value="";
  renderDistrictSchoolRows();
  document.querySelectorAll(".district-shape.is-selected").forEach(el=>el.classList.remove("is-selected"));
  document.querySelector(`[data-district="${district}"]`)?.classList.add("is-selected");
  document.querySelectorAll("[data-map-district].is-selected").forEach(el=>el.classList.remove("is-selected"));
  document.querySelector(`[data-map-district="${district}"]`)?.classList.add("is-selected");
  panel.scrollIntoView({behavior:"smooth",block:"start"});
}
window.selectDistrict=selectDistrict;
function renderDistrictTables(rows=scopedRows(),pRows=scopedPadron()){
  const left=document.getElementById("ugelTablesLeft"),right=document.getElementById("ugelTablesRight");
  if(!left||!right)return null;
  const stats=districtStats(rows,pRows);
  left.innerHTML=["UGEL 02","UGEL 03","UGEL 07"].map(u=>ugelBox(u,stats)).join("");
  right.innerHTML=["UGEL 04","UGEL 05","UGEL 06","UGEL 01"].map(u=>ugelBox(u,stats)).join("");
  left.querySelectorAll("[data-map-district]").forEach(tr=>tr.addEventListener("click",()=>selectDistrict(tr.dataset.mapDistrict)));
  right.querySelectorAll("[data-map-district]").forEach(tr=>tr.addEventListener("click",()=>selectDistrict(tr.dataset.mapDistrict)));
  return stats;
}
async function renderDistrictDashboard(rows=scopedRows(),pRows=scopedPadron()){
  const left=document.getElementById("ugelTablesLeft"),right=document.getElementById("ugelTablesRight"),map=document.getElementById("realDistrictMap"),legend=document.getElementById("districtMapLegend"),tt=document.getElementById("districtTooltip"); if(!left||!right||!map)return;
  const stats=renderDistrictTables(rows,pRows)||districtStats(rows,pRows);
  legend.innerHTML=Object.entries(UGEL_COLORS).map(([u,c])=>`<span><i style="background:${c}"></i>${u}</span>`).join("");
  try{
    if(!limaGeoJSONCache){const r=await fetch(LIMA_GEOJSON_URL);if(!r.ok)throw new Error("GeoJSON");limaGeoJSONCache=await r.json()}
    const fs=limaGeoJSONCache.features.filter(f=>normDistrict(f.properties?.provincia)==="LIMA");const pathFor=projectGeoJSON(fs);
    map.innerHTML=`<svg viewBox="0 0 520 500" role="img" aria-label="Mapa real de los distritos de Lima Metropolitana">${fs.map(f=>{const d=normDistrict(f.properties?.distrito),x=stats[d],u=x?.ugel||"",c=UGEL_COLORS[u]||"#d9e2ec";return `<path class="district-shape" data-district="${d}" d="${pathFor(f)}" fill="${c}"></path>`}).join("")}</svg><div class="map-source-note">Límites distritales: GeoJSON Lima/Callao · fuente cartográfica IGN/MINAM</div>`;
    const show=(d,e)=>{const x=stats[d]||{distrito:d,ugel:"Sin UGEL",locales:0,servicios:0,estudiantes:0,docentes:0};tt.innerHTML=`<b>${d}</b><div class="tt-ugel" style="color:${UGEL_COLORS[x.ugel]||"#fff"}">${x.ugel||"Sin UGEL"}</div><div class="district-tooltip-grid"><span>Locales educativos</span><strong>${fmt(x.locales)}</strong><span>Instituciones</span><strong>${fmt(x.servicios)}</strong><span>Estudiantes</span><strong>${fmt(x.estudiantes)}</strong><span>Docentes</span><strong>${fmt(x.docentes)}</strong></div>`;tt.classList.add("show");tt.style.left=(e.clientX+14)+"px";tt.style.top=(e.clientY+14)+"px"};
    map.querySelectorAll(".district-shape").forEach(p=>{
      p.onmousemove=e=>show(p.dataset.district,e);p.onmouseleave=()=>tt.classList.remove("show");
      p.onclick=()=>selectDistrict(p.dataset.district);
      if(p.dataset.district===selectedDistrict)p.classList.add("is-selected");
    });
    document.querySelectorAll("[data-map-district]").forEach(tr=>{
      tr.onmouseenter=()=>map.querySelector(`[data-district="${tr.dataset.mapDistrict}"]`)?.classList.add("is-hover");
      tr.onmouseleave=()=>map.querySelector(`[data-district="${tr.dataset.mapDistrict}"]`)?.classList.remove("is-hover");
      tr.onclick=()=>selectDistrict(tr.dataset.mapDistrict);
      if(tr.dataset.mapDistrict===selectedDistrict)tr.classList.add("is-selected");
    });
  }catch(e){map.innerHTML=`<div class="map-loading">No se pudo cargar el mapa geográfico. Verifica la conexión a internet.</div>`}
}
function excelSafe(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function exportExcelFile(filename,headers,rows){
  const html=`<html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>${headers.map(h=>`<th>${excelSafe(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${excelSafe(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
  const blob=new Blob(["\ufeff",html],{type:"application/vnd.ms-excel;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename.endsWith(".xls")?filename:filename+".xls";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},300);
}
function localExportRows(rows){
  const locIndex=new Map(LOCS.map(x=>[String(x.codlocal),x])),groups=new Map();
  rows.forEach(r=>{if(!r.codlocal)return;const k=String(r.codlocal);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r)});
  return [...groups.entries()].map(([codlocal,services])=>{const t=agg(services),b=services[0],loc=locIndex.get(codlocal)||{};return [codlocal,services.map(x=>x.nombre).find(Boolean)||loc.nombre||"",b.ugel||"",districtNameFromRow(b)||"",[...new Set(services.map(x=>x.gestion).filter(Boolean))].join(" / "),[...new Set(services.map(x=>x.modalidad).filter(Boolean))].join(" / "),t.estudiantes,t.docentes,t.servicios,loc.direccion||b.direccion||""]});
}
function renderReiOverview(pRows){
  const el=document.getElementById("reiOverview");if(!el)return;
  const total=padronRieStats(pRows),ugels=["UGEL 01","UGEL 02","UGEL 03","UGEL 04","UGEL 05","UGEL 06","UGEL 07"];
  const rows=ugels.map(u=>({u,...padronRieStats(pRows.filter(x=>x.u===u))}));
  el.innerHTML=`<div class="rei-head"><div><small>REGISTRO DE INSTITUCIONES EDUCATIVAS</small><h2>Servicios educativos con código de IE${scope==="total"?"":` · ${scope==="publica"?"Gestión pública":"Gestión privada"}`}</h2><p>Registrados con código de IE en el Sistema de Registro de Instituciones Educativas (RIE).</p></div><div class="rei-big"><span>Avance DRELM</span><b>${total.pct.toFixed(1)}%</b><small>${fmt(total.con)} de ${fmt(total.total)} códigos modulares</small></div></div>
  <div class="rei-formula">Cálculo: códigos modulares únicos con <b>CODINST</b> ÷ total de códigos modulares únicos del ámbito considerado.</div>
  <div class="rei-table-wrap"><table class="rei-table"><thead><tr><th>UGEL</th><th>Total cód. mod.</th><th>Con código de IE</th><th>Pendientes</th><th>% avance</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.u}</b></td><td>${fmt(r.total)}</td><td>${fmt(r.con)}</td><td>${fmt(r.pendientes)}</td><td><div class="rei-progress"><span style="width:${Math.min(100,r.pct)}%"></span></div><b>${r.pct.toFixed(1)}%</b></td></tr>`).join("")}</tbody><tfoot><tr><td>DRELM</td><td>${fmt(total.total)}</td><td>${fmt(total.con)}</td><td>${fmt(total.pendientes)}</td><td><b>${total.pct.toFixed(1)}%</b></td></tr></tfoot></table></div>
  <small class="rei-note">Unidad de conteo: código modular único. Los anexos no incrementan el total.</small>`;
}
function renderSummary(){
  const a=scopedRows(),rt=agg(a),pa=scopedPadron(),pt=padronAgg(pa),rie=padronRieStats(pa);
  const scopeText=scope==="publica"?"Gestión pública":scope==="privada"?"Gestión privada":"Gestión total";
  const title=document.getElementById("summaryMainTitle");
  const sub=document.getElementById("summaryScopeSubtitle");
  const mapTitle=document.getElementById("districtMapMainTitle");
  const modalTitle=document.getElementById("summaryModalCardTitle");
  if(title)title.textContent="Resumen de cifras educativas";
  if(sub)sub.textContent=`Lima Metropolitana · ${scopeText}`;
  if(mapTitle)mapTitle.textContent=`Mapa distrital de Lima Metropolitana · ${scopeText}`;
  if(modalTitle)modalTitle.textContent=`Resumen por modalidad · ${scopeText}`;
  kpis($("#mainKpis"),[
    ["Servicios educativos",fmt(pt.servicios),"Códigos modulares únicos · Padrón"],
    ["Locales educativos",fmt(pt.locales),"Códigos de local únicos · Padrón"],
    ["Estudiantes",fmt(rt.estudiantes),"Censo Educativo 2025"],
    ["Docentes",fmt(rt.docentes),"Censo Educativo 2025"],
    ["Servicios educativos con código de IE",rie.pct.toFixed(1)+"%",`${fmt(rie.con)} de ${fmt(rie.total)} códigos modulares · Básica + CETPRO · sin PRONOEI`]
  ]);
  const note=document.getElementById("padronSourceNote");if(note)note.innerHTML=`<b>Fuente institucional:</b> Padrón Educativo DRELM · fecha de corte <b>${PMETA.cut||"13-08-2026"}</b> · actualización quincenal. Servicios educativos = códigos modulares únicos activos; locales = códigos de local únicos.`;
  const sec={};["EBR","EBA","EBE","Superior","ETP"].forEach(s=>sec[moduleNames[s]]=a.filter(x=>x.sector===s).reduce((z,x)=>z+x.estudiantes,0));
  bars($("#sectorBars"),sec);
  const modalRows=PADRON_MODAL_ORDER.map(mod=>{
    const pr=pa.filter(x=>x.mod===mod);
    const ps=padronAgg(pr);
    const codes=new Set(pr.map(x=>String(x.c||"")).filter(Boolean));
    const rr=a.filter(x=>codes.has(String(x.cod_mod||"")));
    const rs=agg(rr);
    return {mod,nombre:PADRON_MODAL_LABELS[mod]||mod,...rs,servicios:ps.servicios,locales:ps.locales};
  });
  const ugelBarsEl=$("#ugelBars");
  if(ugelBarsEl){
    ugelBarsEl.innerHTML=`<div class="summary-modal-table-wrap"><table class="summary-modal-table"><thead><tr><th>Modalidad del padrón</th><th>Estudiantes*</th><th>Docentes*</th><th>Servicios</th><th>Locales</th></tr></thead><tbody>${modalRows.map(r=>`<tr><td><span class="modal-table-name"><b>${r.nombre}</b></span></td><td>${fmt(r.estudiantes)}</td><td>${fmt(r.docentes)}</td><td>${fmt(r.servicios)}</td><td>${fmt(r.locales)}</td></tr>`).join("")}</tbody><tfoot><tr><td>Total DRELM</td><td>${fmt(rt.estudiantes)}</td><td>${fmt(rt.docentes)}</td><td>${fmt(pt.servicios)}</td><td>${fmt(pt.locales)}</td></tr></tfoot></table><small class="table-footnote">* Estudiantes y docentes se vinculan por código modular con las fuentes estadísticas disponibles.</small></div>`;
  }
  const pubR=agg(R.filter(x=>x.gestion==="Pública")),priR=agg(R.filter(x=>x.gestion==="Privada")),pubP=padronAgg(P.filter(x=>x.g==="Pública")),priP=padronAgg(P.filter(x=>x.g==="Privada"));
  const mg=document.getElementById("summaryManagement");
  if(mg){const items=[["Estudiantes",pubR.estudiantes,priR.estudiantes],["Docentes",pubR.docentes,priR.docentes],["Servicios educativos",pubP.servicios,priP.servicios],["Locales educativos",pubP.locales,priP.locales]];mg.innerHTML=`<div class="management-donut-grid">${items.map(([label,pv,qv])=>{const total=pv+qv,pp=total?pv/total*100:0,qp=100-pp;return `<div class="management-donut-item"><div class="management-donut" style="--public-pct:${pp.toFixed(2)}%"><div class="management-donut-hole"><b>${pp.toFixed(1)}%</b><small>Pública</small></div></div><div class="management-donut-copy"><b>${label}</b><span><i class="public"></i>Pública ${fmt(pv)} · ${pp.toFixed(1)}%</span><span><i class="private"></i>Privada ${fmt(qv)} · ${qp.toFixed(1)}%</span></div></div>`}).join("")}</div><div class="management-donut-note"><span><i class="public"></i>Pública</span><span><i class="private"></i>Privada</span></div>`;}
  renderReiOverview(pa);
  renderDistrictDashboard(a,pa);
  // V60 reemplaza el cuadro lateral original; por eso debe redibujarse
  // explícitamente con la gestión seleccionada.
  v60RenderResumenModalidad();
  const ex=document.getElementById("exportSummaryExcel");if(ex)ex.onclick=()=>{
    const statByCode=new Map();
    a.forEach(r=>{
      const code=String(r.cod_mod||"");
      if(!code)return;
      if(!statByCode.has(code))statByCode.set(code,{estudiantes:0,docentes:0,secciones:0});
      const s=statByCode.get(code);
      s.estudiantes+=Number(r.estudiantes)||0;
      s.docentes+=Number(r.docentes)||0;
      s.secciones+=Number(r.secciones)||0;
    });
    const rows=pa.map(x=>{
      const s=statByCode.get(String(x.c||""))||{estudiantes:0,docentes:0,secciones:0};
      return [x.u||"",x.d||"",x.l||"",x.c||"",x.i||"",x.n||"",x.g||"",x.mod||"",x.niv||"",s.estudiantes,s.docentes,s.secciones,x.rei||"",x.geo||""];
    });
    exportExcelFile(
      "Padron_Educativo_DRELM_"+(PMETA.cut||"corte"),
      ["UGEL","Distrito","Código local","Código modular","Código IE (CODINST)","Institución educativa","Gestión","Modalidad","Nivel","Estudiantes","Docentes","Secciones","REI","Código geográfico"],
      rows
    )
  };
  const ps=document.getElementById("printSummary");
  if(ps)ps.onclick=()=>{document.body.classList.add("print-summary-view");window.print();setTimeout(()=>document.body.classList.remove("print-summary-view"),500)};
}
$$("#scope button").forEach(b=>{
  b.onclick=()=>{
    $$("#scope button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    scope=b.dataset.scope||"total";
    renderDistrictTables(scopedRows(),scopedPadron());
    renderSummary();
  };
});
const districtSearch=document.getElementById("districtSchoolSearch");if(districtSearch)districtSearch.addEventListener("input",e=>renderDistrictSchoolRows(e.target.value));
const districtExport=document.getElementById("exportDistrictExcel");if(districtExport)districtExport.addEventListener("click",()=>{if(!selectedDistrict)return;exportExcelFile("Instituciones_"+selectedDistrict,["Código local","Institución educativa","UGEL","Distrito","Gestión","Modalidad","Estudiantes","Docentes","Servicios","Dirección"],selectedDistrictLocals.map(x=>[x.codlocal,x.nombre,x.base.u||"",selectedDistrict,x.gestion,x.niveles,x.total.estudiantes,x.total.docentes,x.total.servicios,x.direccion]));});
const closeDistrict=document.getElementById("closeDistrictDetail");if(closeDistrict)closeDistrict.addEventListener("click",()=>{const p=document.getElementById("districtDetail");if(p)p.hidden=true;selectedDistrict="";document.querySelectorAll(".district-shape.is-selected,[data-map-district].is-selected").forEach(el=>el.classList.remove("is-selected"))});

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

async function renderInstitutionMap(view,sector,rows){
  const previous=institutionMapRegistry.get(view);if(previous?.map){try{previous.map.remove()}catch(e){}}if(previous?.observer){try{previous.observer.disconnect()}catch(e){}}institutionMapRegistry.delete(view);
  const mapEl=document.getElementById(view+"InstitutionMap"),count=document.getElementById(view+"InstitutionCount"),search=document.getElementById(view+"MapSearch"),ug=document.getElementById(view+"MapUgel"),di=document.getElementById(view+"MapDistrict"),ge=document.getElementById(view+"MapGestion"),exp=document.getElementById(view+"MapExport"),reset=document.getElementById(view+"MapReset"),resultBox=document.getElementById(view+"MapSearchResults");if(!mapEl)return;
  const prows=padronForModule(sector),rByCode=new Map();R.forEach(r=>{const k=String(r.cod_mod||"");if(!rByCode.has(k))rByCode.set(k,[]);rByCode.get(k).push(r)});
  // El Padrón Educativo es la base maestra del mapa. Las demás fuentes solo complementan
  // estudiantes/docentes cuando existe correspondencia por código modular.
  // Para evitar que una coordenada errónea aleje el mapa hasta otra región del país,
  // solo se dibujan puntos cuya ubicación geográfica corresponde a Lima provincia
  // y cuyas coordenadas caen dentro del ámbito razonable de Lima Metropolitana.
  const isValidLimaMapPoint=x=>{
    const lat=Number(x.lat),lon=Number(x.lon),geo=String(x.geo||"").replace(/\D/g,"");
    return !!x.l && geo.startsWith("1501") && Number.isFinite(lat) && Number.isFinite(lon) && lat>=-12.65 && lat<=-11.45 && lon>=-77.45 && lon<=-76.45;
  };
  const byLocal=new Map();prows.forEach(x=>{if(!x.l)return;const k=String(x.l);if(!byLocal.has(k))byLocal.set(k,[]);byLocal.get(k).push(x)});
  const padronLocalTotal=byLocal.size;
  const allPts=[...byLocal.entries()].map(([codlocal,services])=>{
    const valid=services.filter(isValidLimaMapPoint);
    if(!valid.length)return null;
    const base=valid[0],codes=[...new Set(services.map(x=>String(x.c)).filter(Boolean))],rr=codes.flatMap(c=>rByCode.get(c)||[]),rs=agg(rr),pp=padronAgg(services);
    return {codlocal,lat:Number(base.lat),lon:Number(base.lon),ugel:base.u,nombre:services.map(x=>x.n).find(Boolean)||"Local educativo",gestion:[...new Set(services.map(x=>x.g).filter(Boolean))].join(" / "),distrito:padronDistrict(base),modalidades:[...new Set(services.map(x=>x.mod).filter(Boolean))].join(" / "),estudiantes:rs.estudiantes,docentes:rs.docentes,servicios:pp.servicios,direccion:base.dir||""};
  }).filter(Boolean);
  const omittedMapLocals=Math.max(0,padronLocalTotal-allPts.length);
  if(ug){ug.innerHTML='<option value="">Todas</option>';[...new Set(allPts.map(p=>p.ugel).filter(Boolean))].sort().forEach(u=>ug.add(new Option(u,u)))}
  let leafletMap=null,markers=null,districtLayer=null,searchTimer=null,observer=null,started=false,markerByCode=new Map();const limaFallback=typeof L!=="undefined"?L.latLngBounds([[-12.55,-77.35],[-11.55,-76.55]]):null;const entry={map:null,observer:null,hasFitted:false,start:null,fit:null};institutionMapRegistry.set(view,entry);
  function activePoints(){const q=(search?.value||"").trim().toLowerCase(),uv=ug?.value||"",dv=di?.value||"",gv=ge?.value||"";return allPts.filter(p=>(!uv||p.ugel===uv)&&(!dv||p.distrito===dv)&&(!gv||p.gestion.includes(gv))&&(!q||(`${p.nombre} ${p.codlocal} ${p.distrito} ${p.ugel}`).toLowerCase().includes(q)))}
  function refreshDistricts(){if(!di)return;const current=di.value,uv=ug?.value||"",gv=ge?.value||"";const ds=[...new Set(allPts.filter(p=>(!uv||p.ugel===uv)&&(!gv||p.gestion.includes(gv))).map(p=>p.distrito).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));di.innerHTML='<option value="">Todos los distritos</option>'+ds.map(d=>`<option value="${d}">${d}</option>`).join('');if(ds.includes(current))di.value=current}refreshDistricts();
  function schoolIcon(p,selected=false){const c=UGEL_COLORS[p.ugel]||'#73859a',size=24;return L.divIcon({className:'school-div-icon',html:`<span class="school-map-marker${selected?' selected':''}" style="--marker-color:${c};width:${size}px;height:${size}px"><span class="school-glyph">🏫</span></span>`,iconSize:[size,size],iconAnchor:[size/2,size/2],popupAnchor:[0,-size/2]})}
  function popupHtml(p){return `<div class="school-popup"><b>${p.nombre}</b><span>${p.distrito} · ${p.ugel||'Sin UGEL'}</span><div><span>Código local</span><strong>${p.codlocal}</strong><span>Gestión</span><strong>${p.gestion||'-'}</strong><span>Modalidad</span><strong>${p.modalidades||'-'}</strong><span>Servicios</span><strong>${fmt(p.servicios)}</strong><span>Estudiantes</span><strong>${fmt(p.estudiantes)}</strong><span>Docentes</span><strong>${fmt(p.docentes)}</strong></div><div class="school-popup-actions"><button type="button" data-open-local="${p.codlocal}">Ver ficha de la IE</button><button type="button" class="school-popup-pdf" data-pdf-local="${p.codlocal}" title="Descargar ficha técnica en PDF">PDF ↓</button></div></div>`}
  async function drawDistrictOutline(district){if(!leafletMap)return null;if(districtLayer){leafletMap.removeLayer(districtLayer);districtLayer=null}if(!district)return null;try{if(!limaGeoJSONCache){const r=await fetch(LIMA_GEOJSON_URL);if(!r.ok)throw new Error('GeoJSON');limaGeoJSONCache=await r.json()}const fs=limaGeoJSONCache.features.filter(f=>normDistrict(f.properties?.provincia)==='LIMA'&&normDistrict(f.properties?.distrito)===district);if(fs.length){districtLayer=L.geoJSON({type:'FeatureCollection',features:fs},{style:{color:'#154d79',weight:3,fillColor:'#ffffff',fillOpacity:.04,dashArray:'6 4'}}).addTo(leafletMap);return districtLayer.getBounds()}}catch(e){}return null}
  async function fitCurrent(pts,polyBounds=null,animate=false){if(!leafletMap)return;leafletMap.invalidateSize(true);if(polyBounds?.isValid())leafletMap.fitBounds(polyBounds.pad(.06),{maxZoom:15,animate});else if(pts.length===1)leafletMap.setView([pts[0].lat,pts[0].lon],17,{animate});else if(pts.length>1)leafletMap.fitBounds(L.latLngBounds(pts.map(p=>[p.lat,p.lon])).pad(.08),{maxZoom:(ug?.value?14:12),animate});else if(allPts.length)leafletMap.fitBounds(L.latLngBounds(allPts.map(p=>[p.lat,p.lon])).pad(.06),{maxZoom:11,animate});else if(limaFallback)leafletMap.fitBounds(limaFallback,{animate});entry.hasFitted=true}entry.fit=()=>fitCurrent(activePoints(),null,false);
  async function paint(opts={fit:true,focusLocal:null}){if(!leafletMap||!markers)return;const pts=activePoints();markers.clearLayers();markerByCode=new Map();if(count){const extra=omittedMapLocals?` · ${fmt(omittedMapLocals)} sin ubicación cartográfica válida`:"";count.textContent=`${fmt(pts.length)} locales mostrados · ${fmt(pts.reduce((s,p)=>s+(p.servicios||0),0))} servicios${extra} · Padrón ${PMETA.cut||''}`}pts.forEach(p=>{const m=L.marker([p.lat,p.lon],{icon:schoolIcon(p,p.codlocal===opts.focusLocal),riseOnHover:true,keyboard:true,title:p.nombre});m.bindPopup(popupHtml(p),{maxWidth:320});m.on('popupopen',ev=>{const node=ev.popup.getElement(),b=node?.querySelector('[data-open-local]'),pdf=node?.querySelector('[data-pdf-local]');if(b)b.onclick=()=>{showView('buscar');window.openLocalFicha?.(p.codlocal)};if(pdf)pdf.onclick=async()=>{pdf.disabled=true;const oldText=pdf.textContent;pdf.textContent='Generando…';try{if(typeof window.v31FichaPdf==='function')await window.v31FichaPdf(p.codlocal);else if(typeof v31FichaPdf==='function')await v31FichaPdf(p.codlocal)}finally{pdf.disabled=false;pdf.textContent=oldText}}});m.addTo(markers);markerByCode.set(String(p.codlocal),m)});const polyBounds=await drawDistrictOutline(di?.value||"");if(opts.focusLocal&&markerByCode.has(String(opts.focusLocal))){const m=markerByCode.get(String(opts.focusLocal));leafletMap.invalidateSize(true);leafletMap.setView(m.getLatLng(),17,{animate:true});m.openPopup();entry.hasFitted=true;return}if(opts.fit!==false)await fitCurrent(pts,polyBounds,true)}
  function renderMatches(){if(!resultBox||!search)return;const q=search.value.trim().toLowerCase();if(q.length<2){resultBox.innerHTML='';resultBox.hidden=true;return}const matches=activePoints().slice(0,8);if(!matches.length){resultBox.innerHTML='<div class="map-search-empty">Sin coincidencias</div>';resultBox.hidden=false;return}resultBox.innerHTML=matches.map(p=>`<button type="button" data-local="${p.codlocal}"><b>${p.nombre}</b><span>${p.codlocal} · ${p.distrito} · ${p.ugel}</span></button>`).join('');resultBox.hidden=false;resultBox.querySelectorAll('button[data-local]').forEach(b=>b.onclick=()=>{const p=allPts.find(x=>String(x.codlocal)===String(b.dataset.local));if(!p)return;search.value=p.nombre;resultBox.hidden=true;paint({fit:false,focusLocal:p.codlocal})})}
  function startMap(){if(started){if(leafletMap)requestAnimationFrame(()=>leafletMap.invalidateSize(true));return}const viewEl=mapEl.closest('.view'),box=mapEl.getBoundingClientRect();if(viewEl&&!viewEl.classList.contains('active'))return;if(box.width<300||box.height<250){setTimeout(startMap,120);return}if(typeof L==='undefined'){mapEl.innerHTML='<div class="map-loading">No se pudo iniciar el mapa con calles. Verifica la conexión a internet.</div>';return}started=true;mapEl.innerHTML='';leafletMap=L.map(mapEl,{zoomControl:true,preferCanvas:true,minZoom:8,maxZoom:19,zoomSnap:.25});entry.map=leafletMap;L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{subdomains:'abc',maxZoom:19,attribution:'&copy; OpenStreetMap contributors',crossOrigin:true,updateWhenIdle:true,keepBuffer:3}).addTo(leafletMap);markers=L.layerGroup().addTo(leafletMap);leafletMap.on('click',()=>{if(resultBox)resultBox.hidden=true});if('ResizeObserver' in window){observer=new ResizeObserver(()=>{if(!leafletMap)return;requestAnimationFrame(()=>leafletMap.invalidateSize(false))});observer.observe(mapEl);entry.observer=observer}requestAnimationFrame(()=>requestAnimationFrame(()=>{leafletMap.invalidateSize(true);paint({fit:true})}))}entry.start=startMap;
  if(search)search.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{renderMatches();if(started){const pts=activePoints();if(pts.length===1)paint({fit:false,focusLocal:pts[0].codlocal});else paint({fit:true})}},180)});if(ug)ug.addEventListener('change',()=>{refreshDistricts();startMap();if(started)paint({fit:true})});if(di)di.addEventListener('change',()=>{startMap();if(started)paint({fit:true})});if(ge)ge.addEventListener('change',()=>{refreshDistricts();startMap();if(started)paint({fit:true})});if(reset)reset.addEventListener('click',()=>{if(search)search.value='';if(ug)ug.value='';if(di)di.value='';if(ge)ge.value='';refreshDistricts();if(resultBox){resultBox.hidden=true;resultBox.innerHTML=''}startMap();if(started)paint({fit:true})});if(exp)exp.onclick=()=>{const pts=activePoints();exportExcelFile(`${sector}_Padron_instituciones_filtradas`,["Código local","Institución educativa","UGEL","Distrito","Gestión","Modalidad","Estudiantes","Docentes","Servicios","Dirección"],pts.map(p=>[p.codlocal,p.nombre,p.ugel,p.distrito,p.gestion,p.modalidades,p.estudiantes,p.docentes,p.servicios,p.direccion]))};startMap();
}

function renderModule(view,sector){
  const container=document.getElementById(view);
  container.innerHTML=`<div class="page-head"><div><small>${sector}</small><h1>${moduleNames[sector]}</h1><p>Resumen consolidado de gestión pública y privada. Servicios, locales, modalidad y ubicación según Padrón Educativo DRELM.</p></div>
  <div class="module-header-actions">
    <div class="module-export-actions">
      <button type="button" class="module-export-btn" id="${view}ExportExcel">↓ Exportar Excel</button>
      <button type="button" class="module-export-btn" id="${view}Print">🖨 Imprimir</button>
    </div>
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
    </div>
  </div></div>
  <div id="${view}Content"></div>`;

  const gestionSel=document.getElementById(view+"Gestion");
  const ugelSel=document.getElementById(view+"Ugel");
  const exportBtn=document.getElementById(view+"ExportExcel");
  const printBtn=document.getElementById(view+"Print");

  [...new Set(padronForModule(sector).map(x=>x.u).filter(Boolean))].sort().forEach(u=>{
    const o=document.createElement("option");o.value=u;o.textContent=u;ugelSel.appendChild(o);
  });

  function filtered(){
    const pr=padronForModule(sector,gestionSel.value,ugelSel.value);
    return rowsByPadronCodes(pr);
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

  const MODULE_LEVEL_COLORS=["#2F80ED","#8E44AD","#27AE60","#E67E22","#D94F8A","#16A085","#6C5CE7","#F2C94C"];

  function moduleBreakdownGroups(prows){
    const groups=[];

    function add(label,rows){
      if(!rows.length)return;
      groups.push({label,rows});
    }

    if(sector==="EBR"){
      const base=prows.filter(x=>x.mod==="EBR");
      [...new Set(base.map(x=>x.niv).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"))
        .forEach(n=>add(n,base.filter(x=>x.niv===n)));
      add("PRONOEI",prows.filter(x=>x.mod==="PRONOEI"));
    }else if(sector==="EBE"){
      const base=prows.filter(x=>x.mod==="EBE");
      [...new Set(base.map(x=>x.niv).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"))
        .forEach(n=>add(n,base.filter(x=>x.niv===n)));
      // PRITE pertenece a EBE, pero se muestra con su propio nombre, no como "Básica Especial".
      add("PRITE",prows.filter(x=>x.mod==="PRITE"));
    }else{
      const mods=[...new Set(prows.map(x=>x.mod).filter(Boolean))];
      mods.forEach(mod=>{
        const mr=prows.filter(x=>x.mod===mod);
        const levels=[...new Set(mr.map(x=>x.niv).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
        if(levels.length){
          levels.forEach(n=>add(n,mr.filter(x=>x.niv===n)));
        }else{
          add(PADRON_MODAL_LABELS[mod]||mod,mr);
        }
      });
    }
    return groups;
  }

  function moduleMetric(prows,metric){
    const codes=new Set(prows.map(x=>String(x.c||"")).filter(Boolean));
    if(metric==="servicios")return codes.size;
    if(metric==="locales")return new Set(prows.map(x=>String(x.l||"")).filter(Boolean)).size;
    const rr=R.filter(x=>codes.has(String(x.cod_mod||"")));
    return rr.reduce((s,x)=>s+(Number(x[metric])||0),0);
  }

  function moduleMetricLabel(metric){
    return ({estudiantes:"Estudiantes",docentes:"Docentes",servicios:"Servicios",locales:"Locales",secciones:"Secciones"})[metric]||metric;
  }

  function moduleShortName(){
    return sector==="ETP" ? "CETPRO" : sector==="Superior" ? "Superior" : sector;
  }

  function moduleFilterSuffix(){
    const parts=[];
    if(ugelSel.value) parts.push(ugelSel.value);
    if(gestionSel.value) parts.push("Gestión "+gestionSel.value.toLowerCase());
    return parts.length ? " – "+parts.join(" – ") : "";
  }

  function moduleDynamicTitle(metric,kind){
    const lab=moduleMetricLabel(metric);
    return `${moduleShortName()} – ${lab} por UGEL y nivel/programa${moduleFilterSuffix()}`;
  }

  function renderCetproDirectTable(el,prows){
    if(!el)return;
    const ugels=ugelSel.value ? [ugelSel.value] : [...new Set(prows.map(x=>x.u).filter(Boolean))].sort();
    const title=`CETPRO – Indicadores por UGEL${moduleFilterSuffix()}`;
    const rows=ugels.map(u=>{
      const ur=prows.filter(x=>x.u===u);
      return `<tr>
        <td>${u}</td>
        <td>${fmt(moduleMetric(ur,"estudiantes"))}</td>
        <td>${fmt(moduleMetric(ur,"docentes"))}</td>
        <td>${fmt(moduleMetric(ur,"servicios"))}</td>
        <td>${fmt(moduleMetric(ur,"locales"))}</td>
        <td>${fmt(moduleMetric(ur,"secciones"))}</td>
      </tr>`;
    }).join("");
    el.innerHTML=`
      <div class="cardhead module-table-dynamic-head">
        <h2>${title}</h2><span>Todos los indicadores</span>
      </div>
      <div class="table-scroll">
        <table class="summary-table module-cetpro-direct-table">
          <thead>
            <tr><th>UGEL</th><th>Estudiantes</th><th>Docentes</th><th title="Servicios educativos">SS.EE.</th><th title="Locales educativos">L.E.</th><th>Secciones</th></tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td>Total CETPRO</td>
              <td>${fmt(moduleMetric(prows,"estudiantes"))}</td>
              <td>${fmt(moduleMetric(prows,"docentes"))}</td>
              <td>${fmt(moduleMetric(prows,"servicios"))}</td>
              <td>${fmt(moduleMetric(prows,"locales"))}</td>
              <td>${fmt(moduleMetric(prows,"secciones"))}</td>
            </tr>
          </tfoot>
        </table>
      </div>`;
  }

  function renderModuleUgelLevelTable(el,prows,metric){
    if(!el)return;
    const groups=moduleBreakdownGroups(prows);
    const ugels=ugelSel.value ? [ugelSel.value] : [...new Set(prows.map(x=>x.u).filter(Boolean))].sort();
    const title=moduleDynamicTitle(metric,"table");

    const body=ugels.map(u=>{
      const ur=prows.filter(x=>x.u===u);
      const vals=groups.map(g=>{
        const allowed=new Set(g.rows.map(x=>String(x.c||"")));
        return moduleMetric(ur.filter(x=>allowed.has(String(x.c||""))),metric);
      });
      const total=moduleMetric(ur,metric);
      return `<tr><td>${u}</td>${vals.map(v=>`<td>${fmt(v)}</td>`).join("")}<td class="module-ugel-total">${fmt(total)}</td></tr>`;
    }).join("");

    const totals=groups.map(g=>moduleMetric(g.rows,metric));
    const grand=moduleMetric(prows,metric);

    el.innerHTML=`
      <div class="cardhead module-table-dynamic-head">
        <h2>${title}</h2><span>${moduleMetricLabel(metric)}</span>
      </div>
      <div class="table-scroll">
        <table class="summary-table module-ugel-level-table">
          <thead><tr><th>UGEL</th>${groups.map(g=>`<th>${g.label}</th>`).join("")}<th class="module-ugel-total">Total</th></tr></thead>
          <tbody>${body}</tbody>
          <tfoot><tr><td>Total ${moduleShortName()}</td>${totals.map(v=>`<td>${fmt(v)}</td>`).join("")}<td class="module-ugel-total">${fmt(grand)}</td></tr></tfoot>
        </table>
      </div>`;
  }

  function drawStackedModuleChart(el,prows,metric){
    const ugels=[...new Set(prows.map(x=>x.u).filter(Boolean))].sort();
    const groups=moduleBreakdownGroups(prows);

    const rows=ugels.map(u=>{
      const ur=prows.filter(x=>x.u===u);
      const values=groups.map(g=>{
        const allowed=new Set(g.rows.map(x=>String(x.c||"")));
        const rr=ur.filter(x=>allowed.has(String(x.c||"")));
        return moduleMetric(rr,metric);
      });
      return {u,values,total:values.reduce((a,b)=>a+b,0)};
    });

    const max=Math.max(...rows.map(r=>r.total),1);
    const legend=groups.map((g,i)=>`<span><i style="background:${MODULE_LEVEL_COLORS[i%MODULE_LEVEL_COLORS.length]}"></i>${g.label}</span>`).join("");

    const chartTitle=document.getElementById(view+"DynamicChartTitle");
    if(chartTitle) chartTitle.textContent=moduleDynamicTitle(metric,"chart");

    el.innerHTML=`
      <div class="module-stack-legend">${legend}</div>
      <div class="module-stack-chart">
        ${rows.map(r=>`
          <div class="module-stack-col">
            <b class="module-stack-total">${fmt(r.total)}</b>
            <div class="module-stack-track" style="height:${Math.max(18,r.total/max*220)}px">
              ${r.values.map((v,i)=>{
                const pct=r.total?v/r.total*100:0;
                return v?`<span class="module-stack-seg" style="height:${pct}%;background:${MODULE_LEVEL_COLORS[i%MODULE_LEVEL_COLORS.length]}" title="${groups[i].label}: ${fmt(v)}"><em>${v>=Math.max(1,r.total*.08)?fmt(v):""}</em></span>`:"";
              }).join("")}
            </div>
            <span class="module-stack-ugel">${r.u}</span>
          </div>`).join("")}
      </div>`;

    const detail=document.getElementById(view+"LevelDetail");
    if(detail) detail.innerHTML="";
  }

  function moduleExportTitle(){
    const mod=sector==="ETP"?"CETPRO":sector==="Superior"?"Superior":sector;
    const parts=[mod];
    if(gestionSel.value)parts.push("Gestión "+gestionSel.value.toLowerCase());
    if(ugelSel.value)parts.push(ugelSel.value);
    return parts.join(" – ");
  }

  function exportModuleExcel(){
    const content=document.getElementById(view+"Content");
    if(!content)return;

    const title=moduleExportTitle();
    const tables=[...content.querySelectorAll("table")].map((t,i)=>{
      const heading=t.closest(".card,.table-card,.superior-table-wrap")?.parentElement?.querySelector("h2")?.textContent?.trim()
        || t.closest(".card,.table-card")?.querySelector("h2")?.textContent?.trim()
        || `Cuadro ${i+1}`;
      return `<h2>${heading}</h2>${t.outerHTML}`;
    }).join("<br><br>");

    const html=`<html><head><meta charset="UTF-8"><style>
      body{font-family:Arial,sans-serif;font-size:10pt;color:#173f61}
      h1,h2{color:#064779}
      .meta{margin-bottom:12px;padding:8px;background:#eef4f8}
      table{border-collapse:collapse;width:100%;margin-bottom:14px}
      th,td{border:1px solid #b9c8d6;padding:5px}
      th{background:#0b4ca3;color:#fff;font-weight:bold}
      tfoot td{font-weight:bold;background:#d9e9f7}
    </style></head><body>
      <h1>${title}</h1>
      <div class="meta">
        <b>Gestión:</b> ${gestionSel.value||"Total"} &nbsp;&nbsp;
        <b>UGEL:</b> ${ugelSel.value||"Todas"}
      </div>
      ${tables}
      <p><b>Fuente:</b> Censo Educativo 2025 y ESCALE – Padrón Web IE.</p>
      <p><b>Elaborado por:</b> EEM-OPP-DRELM</p>
    </body></html>`;

    const blob=new Blob(["\ufeff",html],{type:"application/vnd.ms-excel"});
    const a=document.createElement("a");
    const url=URL.createObjectURL(blob);
    a.href=url;
    a.download=`${title}.xls`.replace(/[^\wÁÉÍÓÚÜÑáéíóúüñ-]+/g,"_");
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function printModule(){
    document.body.dataset.printModule=view;
    document.body.classList.add("print-module-view");
    window.print();
    setTimeout(()=>{
      document.body.classList.remove("print-module-view");
      delete document.body.dataset.printModule;
    },500);
  }

  function draw(){
    const pr=padronForModule(sector,gestionSel.value,ugelSel.value),a=rowsByPadronCodes(pr),t=combinedStats(pr);
    const allPr=padronForModule(sector),allSector=rowsByPadronCodes(allPr),pubPr=padronForModule(sector,"Pública"),priPr=padronForModule(sector,"Privada");
    const pubRows=rowsByPadronCodes(pubPr),priRows=rowsByPadronCodes(priPr);
    const pub=combinedStats(pubPr),pri=combinedStats(priPr),totalAll=combinedStats(allPr);

    const ugels=[...new Set(pr.map(x=>x.u).filter(Boolean))].sort();
    const ugRows=ugels.map(u=>({u,...combinedStats(pr.filter(x=>x.u===u))}));

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

      ${sector==="Superior"?"":sector==="ETP"?`
      <div class="module-analysis-shell">
        <article class="card module-cetpro-direct-card" id="${view}UgelLevelCard">
          ${tableUgel}
        </article>
      </div>
      </div>`:`
      <div class="module-analysis-shell">
        <div class="module-analysis-toolbar">
          <div>
            <small>ANÁLISIS POR UGEL Y NIVEL / PROGRAMA</small>
            <h2>${sector} – Seleccione el indicador</h2>
          </div>
          <div class="module-metric-tabs" id="${view}MetricTabs">
            <button type="button" class="active" data-metric="estudiantes">Estudiantes</button>
            <button type="button" data-metric="docentes">Docentes</button>
            <button type="button" data-metric="servicios">Servicios</button>
            <button type="button" data-metric="locales">Locales</button>
            <button type="button" data-metric="secciones">Secciones</button>
          </div>
        </div>

        <div class="analytics-grid exact-layout">
          <article class="card module-ugel-level-card" id="${view}UgelLevelCard">
            <div class="cardhead"><h2>${sector} – Estudiantes por UGEL y nivel/programa</h2><span>Estudiantes</span></div>
            ${tableUgel}
          </article>
          <article class="card module-distribution-card">
            <div class="cardhead module-dist-head">
              <div><h2 id="${view}DynamicChartTitle">${sector} – Estudiantes por UGEL y nivel/programa</h2><span>Distribución por nivel / programa</span></div>
            </div>
            <div id="${view}ColumnChart"></div>
            <div class="module-level-detail" id="${view}LevelDetail"></div>
          </article>
        </div>
      </div>
      </div>`}

      <article class="card module-management-compact module-management-donuts-card">
        <div class="cardhead"><h2>Composición por tipo de gestión</h2><span>Pública / Privada</span></div>
        <div class="module-management-donuts">${[
          ["Estudiantes",pub.estudiantes,pri.estudiantes],
          ["Docentes",pub.docentes,pri.docentes],
          ["Servicios educativos",pub.servicios,pri.servicios]
        ].map(([lab,pv,qv])=>{
          const z=pv+qv,pc=z?pv/z*100:0,prc=z?qv/z*100:0;
          return `<div class="module-management-donut-item">
            <div class="module-management-donut" style="--public-pct:${pc.toFixed(2)}%">
              <div class="module-management-donut-center"><b>${pc.toFixed(1)}%</b><small>Pública</small></div>
            </div>
            <div class="module-management-donut-copy">
              <strong>${lab}</strong>
              <span><i class="module-dot module-dot-public"></i>Pública ${fmt(pv)} · ${pc.toFixed(1)}%</span>
              <span><i class="module-dot module-dot-private"></i>Privada ${fmt(qv)} · ${prc.toFixed(1)}%</span>
            </div>
          </div>`;
        }).join("")}</div>
        <div class="module-management-legend"><span><i class="module-dot module-dot-public"></i>Pública</span><span><i class="module-dot module-dot-private"></i>Privada</span></div>
      </article>

      <section class="institution-map-section">
        <div class="section-inline-head"><div><small>DISTRIBUCIÓN TERRITORIAL</small><h2>Ubicación de instituciones educativas</h2></div><span id="${view}InstitutionCount"></span></div>
        <div class="institution-map-toolbar">
          <div class="map-search-wrap"><label class="map-search">Buscar institución o código local<input id="${view}MapSearch" type="search" placeholder="Nombre, código local o distrito..." autocomplete="off"></label><div id="${view}MapSearchResults" class="map-search-results" hidden></div></div>
          <label>UGEL<select id="${view}MapUgel"><option value="">Todas</option></select></label>
          <label>Distrito<select id="${view}MapDistrict"><option value="">Todos los distritos</option></select></label>
          <label>Gestión<select id="${view}MapGestion"><option value="">Todas</option><option>Pública</option><option>Privada</option></select></label>
          <button type="button" class="map-reset-btn" id="${view}MapReset">↺ Ver toda Lima</button>
          <button type="button" class="export-excel-btn" id="${view}MapExport">⬇ Exportar Excel</button>
        </div>
        <div class="institution-map-shell"><div id="${view}InstitutionMap" class="institution-map"><div class="map-loading">Cargando ubicaciones…</div></div><div id="${view}InstitutionTooltip" class="institution-map-tooltip"></div></div>
        <div class="institution-map-note">Mapa navegable con calles reales. Ubicación, UGEL, distrito y modalidad según Padrón Educativo DRELM; actualización quincenal.</div>
      </section>

      <article class="card detail-card">
        <div class="cardhead"><h2>Detalle por gestión (Total)</h2><span>${srcs.map(s=>`Ficha ${s.code}`).join(" · ")}</span></div>
        ${detailTable}
      </article>
    `;

    const chartEl=document.getElementById(view+"ColumnChart");
    const tableEl=document.getElementById(view+"UgelLevelCard");

    if(sector==="ETP"){
      renderCetproDirectTable(tableEl,pr);
    }else if(sector!=="Superior"){
      let currentMetric="estudiantes";
      if(chartEl) drawStackedModuleChart(chartEl,pr,currentMetric);
      renderModuleUgelLevelTable(tableEl,pr,currentMetric);

      const metricTabs=document.getElementById(view+"MetricTabs");
      if(metricTabs){
        metricTabs.querySelectorAll("button").forEach(btn=>{
          btn.addEventListener("click",()=>{
            currentMetric=btn.dataset.metric||"estudiantes";
            metricTabs.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===btn));
            drawStackedModuleChart(chartEl,pr,currentMetric);
            renderModuleUgelLevelTable(tableEl,pr,currentMetric);
          });
        });
      }
    }
    renderInstitutionMap(view,sector,a);
  }

  gestionSel.onchange=draw;
  ugelSel.onchange=draw;
  if(exportBtn)exportBtn.addEventListener("click",exportModuleExcel);
  if(printBtn)printBtn.addEventListener("click",printModule);
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
  const rawQ=$("#q").value.trim(),rawLocal=String($("#localQ").value||"").trim(),q=norm(rawQ),lq=rawLocal,gf=$("#gestionFilter").value;
  if(!q&&!lq){$("#resultInfo").textContent="Ingrese un nombre de institución o código local para realizar la búsqueda.";$("#results").innerHTML=`<div class="search-empty"><div class="search-empty-icon">⌕</div><b>Busque un local educativo</b><span>Puede escribir el nombre de la IE, código modular o código local.</span></div>`;return}
  const filtered=P.filter(x=>{const okGestion=!gf||x.g===gf,okLocal=!lq||String(x.l||"").includes(lq),okText=!q||norm([x.n,x.l,x.c,x.i,x.u,x.d,x.dir,x.mod,x.niv,x.rei].join(" ")).includes(q);return okGestion&&okLocal&&okText&&x.l});
  const localCodes=[...new Set(filtered.map(x=>String(x.l)))],locals=localCodes.map(codlocal=>{const ps=P.filter(x=>String(x.l||"")===codlocal),codes=new Set(ps.map(x=>String(x.c)).filter(Boolean)),rs=R.filter(r=>codes.has(String(r.cod_mod))),total=agg(rs),pp=padronAgg(ps),base=ps[0],nombres=[...new Set(ps.map(x=>x.n).filter(Boolean))],niveles=[...new Set(ps.map(x=>x.mod).filter(Boolean))],gestiones=[...new Set(ps.map(x=>x.g).filter(Boolean))];return {codlocal,ps,rs,total:{...total,servicios:pp.servicios,locales:1},base,nombres,niveles,gestiones}}).sort((a,b)=>(a.nombres[0]||"").localeCompare(b.nombres[0]||"","es"));
  $("#resultInfo").textContent=locals.length?`${fmt(locals.length)} locales educativos encontrados en el Padrón Educativo.`:"No se encontraron coincidencias.";
  $("#results").innerHTML=locals.slice(0,30).map(l=>`<div class="result local-result"><div class="local-result-main"><div class="local-code-badge">CL ${l.codlocal}</div><h4>${l.nombres[0]||"Local educativo"}</h4><p>${l.base.u||"—"} · ${l.base.d||"—"} · ${l.base.dir||"Dirección no disponible"}</p><div class="chips">${l.niveles.map(n=>`<span class="chip">${n}</span>`).join("")}${l.gestiones.map(g=>`<span class="chip">${g}</span>`).join("")}</div><div class="local-result-stats"><span><b>${fmt(l.total.servicios)}</b> servicios</span><span><b>${fmt(l.total.estudiantes)}</b> estudiantes</span><span><b>${fmt(l.total.docentes)}</b> docentes</span></div></div><div class="result-actions"><button onclick="openLocalFicha('${l.codlocal}')">Ver ficha del local</button><button type="button" class="pdf-direct-btn" onclick="v31FichaPdf('${l.codlocal}')">Ficha PDF</button></div></div>`).join("")||`<div class="search-empty compact"><b>Sin resultados</b><span>Revise el nombre o código ingresado.</span></div>`;
}
$("#q").oninput=doSearch;
$("#localQ").oninput=doSearch;
$("#gestionFilter").onchange=doSearch;
doSearch();


window.openLocalFicha=codlocal=>{
  const pLocal=P.filter(x=>String(x.l||"")===String(codlocal)),codes=new Set(pLocal.map(x=>String(x.c)).filter(Boolean));
  const localServices=R.filter(x=>String(x.codlocal||"")===String(codlocal)||codes.has(String(x.cod_mod)));
  if(!pLocal.length&&!localServices.length)return;
  currentLocalServices=localServices.slice();const pb=pLocal[0]||null,base=localServices[0]||null,totalR=agg(localServices),pp=padronAgg(pLocal),publicP=pLocal.filter(x=>x.g==="Pública"),privateP=pLocal.filter(x=>x.g==="Privada"),fc=FCORE[codlocal]||null;
  current=base;$("#ficha").hidden=false;$("#fTitle").textContent=`Ficha del local educativo · CL ${codlocal}`;$("#fSub").textContent=`${pb?.u||base?.ugel||"—"} · ${pb?.d||base?.distrito||"—"} · ${fmt(pp.servicios||uniqueCount(localServices,"cod_mod"))} servicio(s)`;
  kpis($("#fKpis"),[["Servicios educativos",fmt(pp.servicios||uniqueCount(localServices,"cod_mod")),"Padrón Educativo"],["Matrícula total",fmt(totalR.estudiantes),"Censo Educativo 2025"],["Docentes",fmt(totalR.docentes),"Censo Educativo 2025"],["Código local",codlocal,"Padrón Educativo"]]);
  const coord=pb&&Number.isFinite(Number(pb.lat))&&Number.isFinite(Number(pb.lon))?{lat:Number(pb.lat),lon:Number(pb.lon)}:(LOCS||[]).find(x=>String(x.codlocal)===String(codlocal))||null;
  const reiVals=[...new Set(pLocal.map(x=>x.rei).filter(Boolean))];
  const localInfo=[["Código local",codlocal],["UGEL",pb?.u||base?.ugel||"—"],["Distrito",pb?.d||base?.distrito||"—"],["Código geográfico",pb?.geo||"—"],["Dirección",pb?.dir||base?.direccion||"—"],["Servicios públicos",fmt(new Set(publicP.map(x=>x.c).filter(Boolean)).size)],["Servicios privados",fmt(new Set(privateP.map(x=>x.c).filter(Boolean)).size)],["REI",reiVals.join(" / ")||"No registrado"],["Fecha de padrón",PMETA.cut||pb?.fa||"—"]];
  const pByCode=new Map();pLocal.forEach(x=>{if(x.c&&!pByCode.has(String(x.c)))pByCode.set(String(x.c),x)});
  const serviceCodes=[...new Set([...pLocal.map(x=>String(x.c)).filter(Boolean),...localServices.map(x=>String(x.cod_mod)).filter(Boolean)])];
  const levelRows=serviceCodes.map((cm,i)=>{const z=localServices.find(r=>String(r.cod_mod)===cm),px=pByCode.get(cm);return `<tr class="${i===0?'selected-level-row':''}" ${z?`onclick="selectLocalLevel(${localServices.indexOf(z)})"`:''}><td><b>${px?.mod||z?.modalidad||'—'}</b><small>${px?.niv||z?.nivel_raw||''}</small></td><td>${cm}</td><td>${px?.g||z?.gestion||'—'}</td><td>${fmt(z?.estudiantes||0)}</td><td>${fmt(z?.docentes||0)}</td><td>${fmt(z?.secciones||0)}</td></tr>`}).join("");
  const levelsTable=`<div class="local-level-summary"><div class="related-head"><h3>Servicios educativos que funcionan en el local</h3><span>${fmt(pp.servicios||serviceCodes.length)} servicio(s) · modalidad según padrón</span></div><div class="matrix-wrap"><table class="matrix-table local-level-table"><thead><tr><th>Modalidad / nivel</th><th>Código modular</th><th>Gestión</th><th>Estudiantes</th><th>Docentes</th><th>Secciones</th></tr></thead><tbody>${levelRows}</tbody><tfoot><tr><td><b>Total local</b></td><td>—</td><td>—</td><td><b>${fmt(totalR.estudiantes)}</b></td><td><b>${fmt(totalR.docentes)}</b></td><td><b>${fmt(totalR.secciones)}</b></td></tr></tfoot></table></div></div>`;
  const infraBlock=fc?`<div class="public-infra-summary"><div class="related-head"><h3>Infraestructura FUIE del local</h3><span>Vinculada por código local</span></div><div class="fcore"><div><small>Aulas</small><b>${fmt(fc.aulas)}</b></div><div><small>Buen estado</small><b>${fmt(fc.aulas_bueno)}</b></div><div><small>Regular</small><b>${fmt(fc.aulas_regular)}</b></div><div><small>Mal estado</small><b>${fmt(fc.aulas_malo)}</b></div><div><small>Internet</small><b>${fc.internet||"—"}</b></div><div><small>SFL</small><b>${(yes(fc.sfl1)||yes(fc.sfl2))?"Sí":"No / sin dato"}</b></div></div></div>`:`<div class="private-note"><b>Sin FUIE vinculada</b><span>La ficha conserva la información institucional del padrón y muestra datos censales cuando existe vínculo por código modular.</span></div>`;
  const locationAction=coord?`<div class="general-location-action"><div><small>Ubicación geográfica vigente del padrón</small><b>${coord.lat}, ${coord.lon}</b></div><a href="https://www.google.com/maps?q=${encodeURIComponent(coord.lat)},${encodeURIComponent(coord.lon)}" target="_blank" rel="noopener">📍 Ver ubicación</a></div>`:"";
  $("#generalTab").innerHTML=`<div class="source-box"><div><small>Fuente maestra institucional</small><b>Padrón Educativo DRELM · corte ${PMETA.cut||"—"}</b><span>Modalidad, gestión, UGEL, distrito, dirección y ubicación se toman del padrón vigente.</span></div><span class="source-tag">Actualización quincenal</span></div><div class="generalgrid">${localInfo.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join("")}</div>${locationAction}${levelsTable}${(()=>{const tech=localServices.filter(x=>x.source==="6A");if(!tech.length)return "";return `<div class="local-careers-summary"><div class="related-head"><h3>Carreras registradas en el local</h3><span>Solo servicios tecnológicos</span></div>${tech.map(z=>`<div class="career-service-card"><div><b>${z.modalidad}</b><small>CM ${z.cod_mod}</small></div><span>${careersForService(z.cod_mod).length} programa(s)</span></div>`).join("")}</div>`})()}${infraBlock}`;
  $("#detailGroups").innerHTML=`<div class="loading">${localServices.length?'Abra “Detalle de la ficha” para consultar la información censal disponible.':'Este local está en el padrón, pero no tiene detalle censal vinculado en la base actual.'}</div>`;$("#detailLoading").textContent="";$("#infraTabBtn").style.display=fc?"":"none";$("#fuieGroups").innerHTML="";$("#fuieLoading").textContent=fc?"Abra esta pestaña para ver la FUIE completa del local.":"No hay FUIE para este local.";setTab("general");if(localServices.length)selectLocalLevel(0);$("#ficha").scrollIntoView({behavior:"smooth"});
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
async function loadFuie(codlocal){
  if(!codlocal || !FCORE[codlocal]) return;

  const loading = $("#fuieLoading");
  const container = $("#fuieGroups");
  const codigo = String(codlocal).trim();

  loading.textContent = "Cargando FUIE…";
  container.innerHTML = "";

  try{

    // Consultar el índice exacto de los 2,027 locales
    const indice = window.DRELM_FUIE_INDEX || {};
    const archivo = indice[codigo];

    if(!archivo){
      loading.textContent =
        `No se encontró información FUIE para el código local ${codigo}.`;
      return;
    }

    console.log(`CL ${codigo} → ${archivo}`);

    // Retirar cualquier detalle FUIE cargado anteriormente
    document
      .querySelectorAll('script[data-fuie-detail="1"]')
      .forEach(s => s.remove());

    window.DRELM_FUIE_DETAIL = undefined;
    window.DRELM_FUIE_DETAILS = undefined;

    // Cargar únicamente el archivo donde está realmente el local
    await new Promise((resolve,reject)=>{

      const script = document.createElement("script");

      script.src =
        `details/fuie_ugel/${archivo}`;

      script.dataset.fuieDetail = "1";

      script.onload = resolve;

      script.onerror = () =>
        reject(
          new Error(`No se pudo cargar ${archivo}`)
        );

      document.body.appendChild(script);
    });

    // Obtener el registro exacto del código local
    const detalle = (window.DRELM_FUIE_DETAIL || window.DRELM_FUIE_DETAILS)?.[codigo];

    if(!detalle){
      loading.textContent =
        `Se cargó ${archivo}, pero no se encontró el local ${codigo}.`;
      return;
    }

    loading.textContent = "";

    // Mantener el mismo diseño FUIE de tu aplicación
    const grupos =
      filterZeroOnlyGroups(
        detalle.groups || []
      );

    renderGroups(
      container,
      grupos
    );

  }catch(error){

    console.error("Error FUIE V30:", error);

    loading.textContent =
      "No se pudo cargar la información FUIE.";

    container.innerHTML = "";
  }
}





/* V59 — Indicadores con Pública / Privada / Total y totales por modalidad. */
const IND_MOD_ORDER=["EBR","PRONOEI","EBA","EBE","PRITE","ETP","SUPERIOR"];

function indModLabel(mod){
  return PADRON_MODAL_LABELS[mod]||mod||"Sin modalidad";
}

function indFilteredPadron(){
  const g=document.getElementById("indGestion")?.value||"";
  const u=document.getElementById("indUgel")?.value||"";
  return P.filter(x=>(!g||x.g===g)&&(!u||x.u===u));
}

function indPadronByGestion(rows,gestion){
  if(!gestion)return rows;
  return rows.filter(x=>x.g===gestion);
}

function indMetric(rows,metric){
  const codes=new Set(rows.map(x=>String(x.c||"")).filter(Boolean));
  if(metric==="servicios") return codes.size;
  if(metric==="locales") return new Set(rows.map(x=>String(x.l||"")).filter(Boolean)).size;
  const rr=R.filter(x=>codes.has(String(x.cod_mod||"")));
  return rr.reduce((s,x)=>s+(Number(x[metric])||0),0);
}

function indHierarchy(rows){
  const mods=[...new Set(rows.map(x=>x.mod).filter(Boolean))].sort((a,b)=>{
    const ia=IND_MOD_ORDER.indexOf(a), ib=IND_MOD_ORDER.indexOf(b);
    return (ia<0?99:ia)-(ib<0?99:ib);
  });
  return mods.map(mod=>{
    const mr=rows.filter(x=>x.mod===mod);
    const levels=[...new Set(mr.map(x=>x.niv).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
    return {
      mod,
      label:indModLabel(mod),
      rows:mr,
      levels:levels.map(niv=>({niv,rows:mr.filter(x=>x.niv===niv)}))
    };
  });
}

function indMetric3(rows,metric){
  const pub=indMetric(indPadronByGestion(rows,"Pública"),metric);
  const pri=indMetric(indPadronByGestion(rows,"Privada"),metric);
  const tot=indMetric(rows,metric);
  return {pub,pri,tot};
}

function indHierRowsV59(rows,metric){
  const defs=[
    {label:"Educación Básica Regular (EBR)",mods:["EBR","PRONOEI"]},
    {label:"Educación Básica Alternativa (EBA)",mods:["EBA"]},
    {label:"Educación Básica Especial (EBE)",mods:["EBE","PRITE"]},
    {label:"Educación Técnico-Productiva (CETPRO)",mods:["ETP"]},
    {label:"Educación Superior no universitaria",mods:["SUPERIOR"]}
  ];
  return defs.map(d=>{
    const gr=rows.filter(x=>d.mods.includes(x.mod));
    if(!gr.length)return "";
    const p=indMetric3(gr,metric);
    let html=`<tr class="ind-parent">
      <td>${d.label}</td><td>${fmt(p.pub)}</td><td>${fmt(p.pri)}</td><td>${fmt(p.tot)}</td>
    </tr>`;

    d.mods.forEach(mod=>{
      const mr=gr.filter(x=>x.mod===mod);
      if(!mr.length)return;

      if(mod==="PRONOEI"){
        const q=indMetric3(mr,metric);
        html+=`<tr class="ind-child ind-subprogram">
          <td>PRONOEI</td><td>${fmt(q.pub)}</td><td>${fmt(q.pri)}</td><td>${fmt(q.tot)}</td>
        </tr>`;
        return;
      }
      if(mod==="PRITE"){
        const q=indMetric3(mr,metric);
        html+=`<tr class="ind-child ind-subprogram">
          <td>PRITE</td><td>${fmt(q.pub)}</td><td>${fmt(q.pri)}</td><td>${fmt(q.tot)}</td>
        </tr>`;
        return;
      }

      const levels=[...new Set(mr.map(x=>x.niv).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
      levels.forEach(niv=>{
        const lr=mr.filter(x=>x.niv===niv);
        const q=indMetric3(lr,metric);
        html+=`<tr class="ind-child">
          <td>${niv}</td><td>${fmt(q.pub)}</td><td>${fmt(q.pri)}</td><td>${fmt(q.tot)}</td>
        </tr>`;
      });
    });
    return html;
  }).join("");
}

function populateIndUgelV59(){
  const el=document.getElementById("indUgel"); if(!el)return;
  const keep=el.value;
  const vals=[...new Set(P.map(x=>x.u).filter(Boolean))].sort();
  el.innerHTML='<option value="">Todas</option>'+vals.map(x=>`<option>${x}</option>`).join("");
  if(vals.includes(keep)) el.value=keep;
}

function renderIndCardsV59(){
  const rows=indFilteredPadron();
  const defs=[
    ["estudiantes","indMatriculaRows","indMatriculaTotal"],
    ["docentes","indDocentesRows","indDocentesTotal"],
    ["servicios","indServiciosRows","indServiciosTotal"],
    ["locales","indLocalesRows","indLocalesTotal"]
  ];
  defs.forEach(([metric,bodyId,totalId])=>{
    const body=document.getElementById(bodyId), foot=document.getElementById(totalId);
    if(!body||!foot)return;
    body.innerHTML=indHierRowsV59(rows,metric)||'<tr><td colspan="4">Sin información</td></tr>';
    const z=indMetric3(rows,metric);
    foot.innerHTML=`<tr><td>TOTAL GENERAL</td><td>${fmt(z.pub)}</td><td>${fmt(z.pri)}</td><td>${fmt(z.tot)}</td></tr>`;
  });
}

function indMatrixGroups(rows){
  return indHierarchy(rows).map(g=>({
    ...g,
    hasTotal:g.levels.length>1
  }));
}

function renderIndUgelMatrixV59(){
  const gestion=document.getElementById("indGestion")?.value||"";
  const metric=document.getElementById("indUgelMetric")?.value||"estudiantes";

  // Comparativo UGEL: conserva todas las UGEL; el filtro de gestión sí aplica.
  const base=P.filter(x=>!gestion||x.g===gestion);
  const groups=indMatrixGroups(base);
  const ugels=[...new Set(base.map(x=>x.u).filter(Boolean))].sort();

  const head1=['<tr><th rowspan="2">UGEL</th>'];
  const head2=['<tr>'];
  groups.forEach(g=>{
    const span=g.levels.length+(g.hasTotal?1:0);
    head1.push(`<th colspan="${span}">${g.label}</th>`);
    g.levels.forEach(l=>head2.push(`<th>${l.niv}</th>`));
    if(g.hasTotal) head2.push(`<th class="ind-mod-total-head">Total</th>`);
  });
  head1.push('<th rowspan="2" class="ind-grand-total-head">TOTAL GENERAL</th></tr>');
  head2.push('</tr>');

  document.getElementById("indUgelMatrixHead").innerHTML=head1.join("")+head2.join("");

  function rowForScope(label,rows){
    let tds=`<td><b>${label}</b></td>`;
    groups.forEach(g=>{
      const gr=rows.filter(x=>x.mod===g.mod);
      g.levels.forEach(l=>{
        const lr=gr.filter(x=>x.niv===l.niv);
        tds+=`<td>${fmt(indMetric(lr,metric))}</td>`;
      });
      if(g.hasTotal){
        tds+=`<td class="ind-mod-total-cell">${fmt(indMetric(gr,metric))}</td>`;
      }
    });
    tds+=`<td class="ind-grand-total-cell">${fmt(indMetric(rows,metric))}</td>`;
    return `<tr>${tds}</tr>`;
  }

  document.getElementById("indUgelMatrixRows").innerHTML=
    ugels.map(u=>rowForScope(u,base.filter(x=>x.u===u))).join("");

  document.getElementById("indUgelMatrixTotal").innerHTML=
    rowForScope("DRELM",base);
}

function renderIndicatorsV59(){
  renderIndCardsV59();
  renderIndUgelMatrixV59();
}

function initIndicatorsV59(){
  populateIndUgelV59();

  // Replace table headers of the four cards to Pública / Privada / Total
  document.querySelectorAll(".ind-hier-table thead tr").forEach(tr=>{
    tr.innerHTML='<th>Modalidad / nivel</th><th>Pública</th><th>Privada</th><th>Total</th>';
  });

  ["indGestion","indUgel"].forEach(id=>{
    document.getElementById(id)?.addEventListener("change",renderIndicatorsV59);
  });
  document.getElementById("indUgelMetric")?.addEventListener("change",renderIndUgelMatrixV59);
  renderIndicatorsV59();
}
setTimeout(initIndicatorsV59,0);


/* V60 — Resumen: cuadro de matrícula por modalidad/nivel y gestión.
   Indicadores: exportación Excel/PDF respetando filtros. */

function v60FindResumenModalidadCard(){
  const heads=[...document.querySelectorAll("#resumen h2, #resumen h3, #resumen .cardhead h2, #resumen .cardhead h3")];
  const h=heads.find(x=>/Resumen por modalidad/i.test(x.textContent||""));
  return h ? (h.closest(".card") || h.parentElement?.parentElement) : null;
}

function v60ResumenRows(){
  return P;
}

function v60GestionMetric(rows,metric,gestion){
  const rr=gestion ? rows.filter(x=>x.g===gestion) : rows;
  return indMetric(rr,metric);
}



function v62SummaryGroups(rows=P){
  // Business hierarchy for the executive summary:
  // PRONOEI belongs under EBR; PRITE belongs under EBE.
  const defs=[
    {key:"EBR",label:"EBR",mods:["EBR","PRONOEI"]},
    {key:"EBA",label:"EBA",mods:["EBA"]},
    {key:"EBE",label:"EBE",mods:["EBE","PRITE"]},
    {key:"ETP",label:"CETPRO",mods:["ETP"]},
    {key:"SUPERIOR",label:"Superior",mods:["SUPERIOR"]}
  ];
  return defs.map(d=>{
    const gr=rows.filter(x=>d.mods.includes(x.mod));
    const children=[];

    // Build children from Padron modality + level, avoiding duplicate labels.
    d.mods.forEach(mod=>{
      const mr=gr.filter(x=>x.mod===mod);
      if(!mr.length)return;

      if(mod==="PRONOEI"){
        children.push({label:"PRONOEI",rows:mr});
        return;
      }
      if(mod==="PRITE"){
        children.push({label:"PRITE",rows:mr});
        return;
      }

      [...new Set(mr.map(x=>x.niv).filter(Boolean))]
        .sort((a,b)=>a.localeCompare(b,"es"))
        .forEach(niv=>children.push({label:niv,rows:mr.filter(x=>x.niv===niv)}));
    });

    return {...d,rows:gr,children};
  }).filter(g=>g.rows.length);
}

function v62MetricCells(rows){
  return [
    indMetric(rows,"estudiantes"),
    indMetric(rows,"docentes"),
    indMetric(rows,"servicios"),
    indMetric(rows,"locales")
  ].map(v=>`<td>${fmt(v)}</td>`).join("");
}

function v62ResumenHierarchyHTML(rows=scopedPadron()){
  const groups=v62SummaryGroups(rows);
  let html="";
  groups.forEach((g,i)=>{
    const id=`v62grp${i}`;
    html+=`<tr class="v60-parent v62-parent" data-v62-toggle="${id}" title="Clic para desplegar niveles">
      <td><button class="v62-toggle" type="button" aria-expanded="false">▶</button>${g.label}</td>
      ${v62MetricCells(g.rows)}
    </tr>`;
    g.children.forEach(ch=>{
      html+=`<tr class="v62-child" data-v62-child="${id}" hidden>
        <td>${ch.label}</td>${v62MetricCells(ch.rows)}
      </tr>`;
    });
  });

  html+=`<tr class="v60-total">
    <td>TOTAL DRELM</td>${v62MetricCells(rows)}
  </tr>`;
  return html;
}

function v62BindSummaryToggles(card){
  card.querySelectorAll("[data-v62-toggle]").forEach(row=>{
    row.addEventListener("click",()=>{
      const id=row.dataset.v62Toggle;
      const children=[...card.querySelectorAll(`[data-v62-child="${id}"]`)];
      if(!children.length)return;
      const open=children[0].hidden;
      children.forEach(x=>x.hidden=!open);
      const btn=row.querySelector(".v62-toggle");
      if(btn){
        btn.textContent=open?"▼":"▶";
        btn.setAttribute("aria-expanded",String(open));
      }
    });
  });
}

function v60RenderResumenModalidad(){
  const card=v60FindResumenModalidadCard();
  if(!card)return;
  const rows=scopedPadron();
  const scopeText=scope==="publica"?"Gestión pública":scope==="privada"?"Gestión privada":"Gestión total";
  card.classList.add("v60-resumen-modalidad");
  card.innerHTML=`
    <div class="cardhead">
      <h2>Resumen por modalidad · ${scopeText}</h2>
      <span>Según Padrón Educativo</span>
    </div>
    <div class="table-scroll">
      <table class="v60-summary-table">
        <thead>
          <tr>
            <th>Modalidad</th>
            <th>Estudiantes*</th>
            <th>Docentes*</th>
            <th>Servicios</th>
            <th>Locales</th>
          </tr>
        </thead>
        <tbody>${v62ResumenHierarchyHTML(rows)}</tbody>
      </table>
    </div>
    <div class="v60-source">* Estudiantes y docentes: Censo Educativo 2025. Servicios y locales: Padrón Web IE. Clic en una modalidad para ver sus niveles.</div>`;
  v62BindSummaryToggles(card);
}

/* Exportación Excel compatible con navegador, sin librerías externas:
   genera un .xls que Excel abre directamente y conserva formato de tablas. */
function v60ExportIndicadoresExcel(){
  const view=document.getElementById("indicadores");
  if(!view)return;
  const gestion=document.getElementById("indGestion")?.value||"Total";
  const ugel=document.getElementById("indUgel")?.value||"Todas";
  const metricEl=document.getElementById("indUgelMetric");
  const indicador=metricEl?.options?.[metricEl.selectedIndex]?.text||"Estudiantes";

  const cards=[...view.querySelectorAll(".ind-summary-card")].map(card=>{
    const title=card.querySelector("h2")?.textContent?.trim()||"Indicador";
    return `<h2>${title}</h2>${card.querySelector("table")?.outerHTML||""}`;
  }).join("<br>");

  const matrix=view.querySelector(".ind-ugel-detail table")?.outerHTML||"";
  const html=`<html><head><meta charset="UTF-8"><style>
  body{font-family:Arial,sans-serif;font-size:10pt;color:#173f61}
  h1,h2{color:#064779}.meta{margin-bottom:14px;padding:8px;background:#eef4f8}
  table{border-collapse:collapse;width:100%;margin-bottom:14px}
  th,td{border:1px solid #b9c8d6;padding:5px}
  th{background:#0b4ca3;color:#fff;font-weight:bold}
  .ind-parent td{font-weight:bold;background:#eef4f8}
  .ind-mod-total-cell{background:#edf4fa;font-weight:bold}
  tfoot td{font-weight:bold;background:#d9e9f7}
  </style></head><body>
  <h1>Indicadores educativos - DRELM</h1>
  <div class="meta"><b>Gestión:</b> ${gestion} &nbsp;&nbsp; <b>UGEL:</b> ${ugel} &nbsp;&nbsp;
  <b>Indicador del cuadro por UGEL:</b> ${indicador}</div>
  ${cards}
  <h2>Información por UGEL y nivel educativo — Indicador: ${indicador}</h2>
  ${matrix}
  <p><b>Fuente:</b> Estudiantes y docentes: Censo Educativo 2025. Servicios y locales educativos: ESCALE – Padrón Web IE (actualizado al 13/08/2026).</p>
  <p><b>Elaborado por:</b> EEM-OPP-DRELM</p></body></html>`;

  const blob=new Blob(["\ufeff",html],{type:"application/vnd.ms-excel"});
  const a=document.createElement("a"),url=URL.createObjectURL(blob);
  a.href=url;
  a.download=`Indicadores_DRELM_${indicador}_${gestion}_${ugel}.xls`.replace(/\s+/g,"_");
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/* PDF: abre una vista de impresión limpia con los cuadros visibles.
   El usuario elige "Guardar como PDF" en el diálogo del navegador. */
function v60ExportIndicadoresPdf(){
  document.body.classList.add("print-indicadores");
  window.print();
  setTimeout(()=>document.body.classList.remove("print-indicadores"),500);
}

function v60Init(){
  v60RenderResumenModalidad();
  document.getElementById("btnIndExcel")?.addEventListener("click",v60ExportIndicadoresExcel);
  document.getElementById("btnIndPdf")?.addEventListener("click",v60ExportIndicadoresPdf);
}
setTimeout(v60Init,100);
