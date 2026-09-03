/* V31 · Ficha técnica amigable del local educativo
   Mejora la vista Datos generales sin alterar el detalle censal ni FUIE.
*/
(function(){
  'use strict';
  const fmt=n=>new Intl.NumberFormat('es-PE',{maximumFractionDigits:2}).format(Number(n)||0);
  const cleanService=v=>String(v||'—').replace(/^\d+\./,'');
  const yes=v=>/^si$/i.test(String(v||'').trim());
  const P=()=>window.DRELM_PADRON||[];
  const R=()=>window.DRELM_SERVICES||[];
  const F=()=>window.DRELM_FUIE_CORE||{};
  const C=()=>window.DRELM_CAREERS||[];

  function careerRows(cm){return C().filter(x=>String(x.cod_mod||'')===String(cm||'') && String(x.programa||'').trim());}
  function careerTable(rows){
    if(!rows.length)return '';
    const a=[...rows].sort((x,y)=>(Number(y.matricula)||0)-(Number(x.matricula)||0));
    const total=a.reduce((s,x)=>s+(Number(x.matricula)||0),0);
    return `<div class="v31-career-wrap"><div class="v31-section-title"><div><small>OFERTA FORMATIVA</small><h3>Programas de estudios / carreras</h3></div><span>${a.length} programas · ${fmt(total)} matriculados 2026-1</span></div>
      <div class="matrix-wrap"><table class="matrix-table v31-career-table"><thead><tr><th>Programa de estudios</th><th>Matrícula 2026-1</th><th>Participación</th></tr></thead><tbody>
      ${a.map(x=>`<tr><td><b>${x.programa}</b></td><td class="num">${fmt(x.matricula)}</td><td class="num">${total?((Number(x.matricula||0)/total)*100).toFixed(1):'0.0'}%</td></tr>`).join('')}
      </tbody><tfoot><tr><td><b>Total</b></td><td class="num"><b>${fmt(total)}</b></td><td class="num"><b>100%</b></td></tr></tfoot></table></div></div>`;
  }

  function build(codlocal){
    const pl=P().filter(x=>String(x.l||'')===String(codlocal));
    const codes=new Set(pl.map(x=>String(x.c||'')).filter(Boolean));
    const rs=R().filter(x=>String(x.codlocal||'')===String(codlocal)||codes.has(String(x.cod_mod||'')));
    const fc=F()[codlocal]||null;
    const base=pl[0]||{};
    const students=rs.reduce((s,x)=>s+(Number(x.estudiantes)||0),0);
    const teachers=rs.reduce((s,x)=>s+(Number(x.docentes)||0),0);
    const serviceCodes=[...new Set([...pl.map(x=>String(x.c||'')).filter(Boolean),...rs.map(x=>String(x.cod_mod||'')).filter(Boolean)])];
    const tech=rs.filter(x=>x.source==='6A');
    const careers=tech.flatMap(x=>careerRows(x.cod_mod));
    const careerTotal=careers.reduce((s,x)=>s+(Number(x.matricula)||0),0);
    const name=[...new Set(pl.map(x=>x.n).filter(Boolean))].join(' / ') || rs[0]?.nombre || 'Local educativo';
    const levels=[...new Set(pl.map(x=>x.niv||x.mod).filter(Boolean))];
    const gest=[...new Set(pl.map(x=>x.g).filter(Boolean))];
    const sfl=fc?(yes(fc.sfl1)||yes(fc.sfl2)):false;
    const aulaState=fc ? (Number(fc.aulas_malo)>0?'Requiere atención':Number(fc.aulas_regular)>0?'Regular':Number(fc.aulas_bueno)>0?'Bueno':'Sin dato') : 'Sin dato';
    const kpi4=careers.length?`${fmt(careerTotal)}<small>Matrícula carreras 2026-1</small>`:(fc?`${fmt(fc.area_terreno)} m²<small>Área del terreno</small>`:`${serviceCodes.length}<small>Servicios educativos</small>`);

    const services=serviceCodes.map(cm=>{
      const p=pl.find(x=>String(x.c||'')===cm)||{}; const r=rs.find(x=>String(x.cod_mod||'')===cm)||{};
      const cr=careerRows(cm);
      return `<div class="v31-service-card"><div class="v31-service-icon">${r.source==='6A'?'⚙️':r.source==='5A'?'🎓':r.source==='9A'?'🛠️':'🏫'}</div><div><b>${p.niv||r.modalidad||p.mod||'Servicio educativo'}</b><span>${p.n||r.nombre||name}</span><small>CM ${cm} · ${p.g||r.gestion||'—'}</small></div><div class="v31-service-stats"><b>${fmt(r.estudiantes||0)}</b><small>estudiantes</small>${cr.length?`<em>${cr.length} carreras</em>`:''}</div></div>`;
    }).join('');

    return `<section class="v31-tech-sheet">
      <div class="v31-hero"><div><small>FICHA TÉCNICA DEL LOCAL EDUCATIVO</small><h2>${name}</h2><p>CL ${codlocal} · ${base.u||rs[0]?.ugel||'—'} · ${base.d||rs[0]?.distrito||'—'} · ${gest.join(' / ')||'—'}</p></div><div class="v31-badge">${levels.join(' · ')||'Local educativo'}</div></div>
      <div class="v31-kpis"><div><b>${fmt(students)}</b><small>Estudiantes · Censo 2025</small></div><div><b>${fmt(teachers)}</b><small>Docentes · Censo 2025</small></div><div><b>${fc?fmt(fc.aulas):'—'}</b><small>Aulas</small></div><div><b>${kpi4}</b></div></div>
      <div class="v31-grid">
        <div class="v31-panel"><div class="v31-section-title"><div><small>IDENTIFICACIÓN</small><h3>Datos del local</h3></div></div><dl><dt>Código local</dt><dd>${codlocal}</dd><dt>Dirección</dt><dd>${base.dir||rs[0]?.direccion||'—'}</dd><dt>Distrito</dt><dd>${base.d||rs[0]?.distrito||'—'}</dd><dt>UGEL / DRE</dt><dd>${base.u||rs[0]?.ugel||'—'}</dd><dt>Gestión</dt><dd>${gest.join(' / ')||'—'}</dd><dt>Servicios educativos</dt><dd>${serviceCodes.length}</dd></dl></div>
        <div class="v31-panel"><div class="v31-section-title"><div><small>INFRAESTRUCTURA</small><h3>Estado general</h3></div></div>${fc?`<div class="v31-status-grid"><div><span>Aulas</span><b>${fmt(fc.aulas)}</b></div><div><span>Conservación</span><b class="${aulaState==='Bueno'?'ok':aulaState==='Regular'?'warn':'bad'}">${aulaState}</b></div><div><span>Internet</span><b class="${yes(fc.internet)?'ok':'bad'}">${fc.internet||'—'}</b></div><div><span>Saneamiento físico-legal</span><b class="${sfl?'ok':'bad'}">${sfl?'Sí':'No / sin dato'}</b></div></div><dl><dt>Agua</dt><dd>${cleanService(fc.agua)}</dd><dt>Energía eléctrica</dt><dd>${cleanService(fc.luz)}</dd><dt>Desagüe</dt><dd>${cleanService(fc.desague)}</dd><dt>Terrenos</dt><dd>${fmt(fc.terrenos)}</dd><dt>Área total</dt><dd>${fmt(fc.area_terreno)} m²</dd></dl>`:'<div class="v31-empty">No se encontró FUIE vinculada a este código local.</div>'}</div>
      </div>
      <div class="v31-section-title v31-services-head"><div><small>SERVICIOS EDUCATIVOS</small><h3>Servicios que funcionan en este local</h3></div><span>Seleccione “Detalle de la ficha” para revisar la cédula censal</span></div>
      <div class="v31-services">${services||'<div class="v31-empty">Sin servicios censales vinculados.</div>'}</div>
      ${tech.map(x=>careerTable(careerRows(x.cod_mod))).join('')}
      <div class="v31-source"><b>Fuentes:</b> Padrón Educativo DRELM 2026 · Censo Educativo 2025 · FUIE 2025${careers.length?' · Matrícula por programas 2026-1':''}.</div>
    </section>`;
  }


  function esc(v){return String(v??'—').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  async function ensureFuieDetail(codlocal){
    codlocal=String(codlocal||'').trim();
    const existing=(window.DRELM_FUIE_DETAIL||window.DRELM_FUIE_DETAILS||{})[codlocal];
    if(existing)return existing;
    const index=window.DRELM_FUIE_INDEX||{};
    const archivo=index[codlocal];
    if(!archivo)return null;
    try{
      await new Promise((resolve,reject)=>{
        const sc=document.createElement('script');
        sc.src=`details/fuie_ugel/${archivo}?pdf=${Date.now()}`;
        sc.dataset.fuiePdf='1';
        sc.onload=resolve; sc.onerror=reject;
        document.body.appendChild(sc);
      });
      return (window.DRELM_FUIE_DETAIL||window.DRELM_FUIE_DETAILS||{})[codlocal]||null;
    }catch(e){console.warn('No se pudo cargar detalle FUIE para PDF',e);return null;}
  }

  function detailMap(detail){
    const out={};
    (detail?.groups||[]).forEach(g=>(g.fields||[]).forEach(([label,value])=>{
      const all=[...String(label||'').matchAll(/\[([^\]]+)\]/g)];
      if(all.length)out[all[all.length-1][1]]=String(value??'').trim();
    }));
    return out;
  }
  function tidy(v){
    return String(v??'—').replace(/^\d+[.:]\s*/,'').replace(/^\[[A-Z0-9]+\s*-\s*/,'').replace(/\]$/,'').trim()||'—';
  }
  // Limpia etiquetas de catálogos que llegan con códigos/corchetes, por ejemplo:
  // "Mañana] [I1 - Mañana" o "Convenio con Sector Educación] [A4 - ...".
  function cleanCatalog(v){
    let s=String(v??'').replace(/\s+/g,' ').trim();
    if(!s) return '—';
    // Cuando existe texto legible antes de un corchete, ese es el valor principal.
    const firstBracket=s.search(/[\[\]]/);
    if(firstBracket>0){
      const base=s.slice(0,firstBracket).trim();
      if(base) s=base;
    } else {
      // Si solo viene el catálogo entre corchetes, conserva la descripción y elimina el código.
      s=s.replace(/^\[?\s*[A-Z0-9]+\s*-\s*/i,'');
    }
    s=s.replace(/[\[\]]/g,'').trim();
    // Códigos territoriales/catalogales al inicio: 15-LIMA, 1501 DRE..., I1 - Mañana, A4 - ...
    s=s.replace(/^\d+\s*-\s*/,'')
       .replace(/^\d{3,}\s+(?=[A-Za-zÁÉÍÓÚÑ])/,'')
       .replace(/^[A-Z]\d+\s*-\s*/i,'')
       .trim();
    return s||'—';
  }
  function nval(v){const n=Number(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:0;}
  function personnelStats(sd){
    const detail=sd?.__detail;
    const result={directivos:null,administrativos:null,otro:null,noDocente:null};
    if(!detail) return result;

    let totalNoDoc=null;
    let directivos=0;
    let administrativos=0;
    let hasPersonnel=false;

    const norm=t=>String(t||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^A-Za-z0-9]+/g,' ')
      .replace(/\s+/g,' ').trim().toUpperCase();

    (detail.groups||[]).forEach(g=>{
      const title=norm(g.title);
      const isDoc=title.includes('CANTIDAD DE PERSONAL DOCENTE');
      const isNoDoc=title.includes('CANTIDAD DE PERSONAL NO DOCENTE');
      if(!isDoc && !isNoDoc) return;
      hasPersonnel=true;

      (g.fields||[]).forEach(([label,value])=>{
        const raw=String(label||'');
        const lab=norm(raw);
        const val=nval(value);

        // Total real de personal no docente registrado en la cédula de matrícula.
        if(isNoDoc && /^TOTAL\s*\[/i.test(raw.trim())) totalNoDoc=val;

        if(!lab.includes('FUNCION O CARGO')) return;

        // DIRECTIVOS: únicamente categorías que la cédula denomina Director/Sub Director.
        // Se excluyen asistentes, coordinadores y jefaturas para no inferir cargos.
        if(isDoc){
          const path=lab.replace(/^FUNCION O CARGO\s*/,'');
          const directivoExplicito =
            /(^| )DIRECTOR GENERAL( |$)/.test(path) ||
            /(^| )SUB DIRECTOR( |$)/.test(path) ||
            /(^| )DIRECTOR ACADEMICO( |$)/.test(path) ||
            /(^| )DIRECTOR DE BIENESTAR( |$)/.test(path) ||
            /^DIRECTOR( |$)/.test(path);
          if(directivoExplicito) directivos+=val;
        }

        // ADMINISTRATIVOS: categorías administrativas expresamente nombradas por la cédula.
        // Incluye los cargos que aparecen bajo la ruta "Otros Administrativos ...".
        if(isNoDoc){
          const adminExplicito =
            /ADMINISTRADOR|ADMINSITRADOR|CONTADOR|SECRETARIA|OFICINISTA|ASISTENTE ADMINISTRATIVO/.test(lab) ||
            lab.includes('OTROS ADMINISTRATIVOS');
          if(adminExplicito) administrativos+=val;
        }
      });
    });

    if(!hasPersonnel) return result;
    result.directivos=directivos;
    result.administrativos=administrativos;
    result.noDocente=totalNoDoc;
    // "Otro personal" = personal no docente registrado menos los cargos administrativos explícitos.
    // No incluye auxiliares de educación cuando la cédula los registra en un bloque independiente.
    result.otro=totalNoDoc===null?null:Math.max(0,totalNoDoc-administrativos);
    return result;
  }
  function yesText(v){return /^si$/i.test(String(v||'').trim())?'Sí':(/^no$/i.test(String(v||'').trim())?'No':tidy(v));}
  function section(title,body,extraClass=''){return `<section class="sec ${extraClass}"><div class="sec-title">${title}</div>${body}</section>`;}
  function kv(rows){return `<table class="kv"><tbody>${rows.filter(x=>x[1]!==undefined&&x[1]!==null&&String(x[1]).trim()!=='').map(([a,b])=>`<tr><th>${esc(a)}</th><td>${esc(tidy(b))}</td></tr>`).join('')}</tbody></table>`;}
  function dataTable(headers,rows,foot=''){
    return `<table class="data"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}${foot}</tbody></table>`;
  }
  function materialPred(m,prefix,items){
    let best=null;
    items.forEach(([code,label])=>{const v=nval(m[`${prefix}${code}`]);if(v>0&&(!best||v>best.v))best={v,label};});
    return best?best.label:'Sin dato';
  }
  function spaceRows(detail){
    const g=(detail?.groups||[]).find(x=>/Otros espacios/i.test(x.title||''));
    if(!g)return [];
    return (g.fields||[]).map(([lab,v])=>{
      const n=nval(v); if(n<=0)return null;
      const txt=String(lab).split('›').pop().replace(/\[[^\]]+\]/g,'').replace(/^\s*\d+\s*/,'').trim();
      return [txt,n];
    }).filter(Boolean).slice(0,14);
  }

  async function ensureServiceDetails(rs){
    const sources=[...new Set(rs.map(x=>String(x.source||'')).filter(Boolean))];
    for(const src of sources){
      const key=`DRELM_DETAIL_${src}`;
      if(window[key]) continue;
      try{
        await new Promise((resolve,reject)=>{
          const sc=document.createElement('script');
          sc.src=`details/${src}.js?pdf=${Date.now()}`;
          sc.onload=resolve; sc.onerror=reject;
          document.body.appendChild(sc);
        });
      }catch(e){ console.warn('No se pudo cargar detalle '+src,e); }
    }
    const out={};
    rs.forEach(r=>{
      const d=(window[`DRELM_DETAIL_${r.source}`]||{})[String(r.cod_mod||'')];
      if(d){ const dm=detailMap(d); dm.__detail=d; out[String(r.cod_mod||'')]=dm; }
    });
    return out;
  }

  function pdfDocument(codlocal,detail,serviceDetails={}){
    const pl=P().filter(x=>String(x.l||'')===String(codlocal));
    const codes=new Set(pl.map(x=>String(x.c||'')).filter(Boolean));
    const rs=R().filter(x=>String(x.codlocal||'')===String(codlocal)||codes.has(String(x.cod_mod||'')));
    const fc=F()[codlocal]||null, base=pl[0]||{}, first=rs[0]||{};
    const m=detailMap(detail);
    const censusStudents=nval(m.Tot_alum)||rs.reduce((s,x)=>s+(Number(x.estudiantes)||0),0);
    const censusTeachers=nval(m.tot_doc)||rs.reduce((s,x)=>s+(Number(x.docentes)||0),0);
    const name=[...new Set(pl.map(x=>x.n).filter(Boolean))].join(' / ')||first.nombre||tidy(m.cen_edul)||'Local educativo';
    const gest=[...new Set(pl.map(x=>x.g).filter(Boolean))].join(' / ')||first.gestion||tidy(m.des_gesl)||'—';
    const levels=[...new Set(pl.map(x=>x.niv||x.mod).filter(Boolean))].join(' / ')||first.modalidad||tidy(m.des_nivl)||'—';
    const serviceCodes=[...new Set([...pl.map(x=>String(x.c||'')).filter(Boolean),...rs.map(x=>String(x.cod_mod||'')).filter(Boolean)])];
    const careers=rs.filter(x=>x.source==='6A').flatMap(x=>careerRows(x.cod_mod));
    const careerTotal=careers.reduce((s,x)=>s+(Number(x.matricula)||0),0);
    const isInstitute=/instituto|superior|tecnol[oó]g|pedag[oó]g|art[ií]st/i.test(`${levels} ${m.des_nivl||''}`);
    const isMixed=serviceCodes.length>1 && rs.some(x=>x.source==='6A') && rs.some(x=>x.source!=='6A');
    const title=(isInstitute&&!isMixed)?'FICHA TÉCNICA DEL INSTITUTO':'FICHA TÉCNICA DEL LOCAL EDUCATIVO';
    const displayName=(isInstitute&&!isMixed)?`INSTITUTO DE EDUCACIÓN SUPERIOR ${/tecnol/i.test(levels+m.des_nivl)?'TECNOLÓGICO ':''}${name}`.replace(/\s+/g,' ').trim():name;
    const area=nval(m.area_terr)||Number(fc?.area_terreno)||0;
    const aulas=nval(m.tot_aula)||Number(fc?.aulas)||0;
    const kpiStudents=careers.length?careerTotal:censusStudents;
    const kpiStudentLabel=careers.length?'MATRÍCULA 2026':'ESTUDIANTES';
    const kpi2=careers.length?careers.length:censusTeachers;
    const kpi2Label=careers.length?'PROGRAMAS DE ESTUDIOS':'DOCENTES';
    const rawMod=String(m.cod_modl??'').trim();
    const modular=(rawMod && !/[\[\]]/.test(rawMod) && tidy(rawMod)!=='—')?tidy(rawMod):serviceCodes.join(' / ');
    const district=base.d||first.distrito||'—';
    const ugel=base.u||first.ugel||tidy(m.Ugel);

    const ident=kv([
      ['Institución educativa',name],['Código de local',codlocal],['Código modular',modular],
      ['Tipo de servicio',cleanCatalog(levels)],['Tipo de local',cleanCatalog(m.tip_loc||'Local principal')],['Gestión',cleanCatalog(m.des_gesl||gest)],
      ['Turno',cleanCatalog(m.turcenl||[...new Set(rs.map(x=>x.turno).filter(Boolean))].join(' / '))],['DRE / órgano intermedio',cleanCatalog(m.Region||ugel)]
    ]);
    const ubic=kv([
      ['Departamento / Provincia',m.Dp?`${cleanCatalog(m.Dp)} / Lima`:'Lima / Lima'],['Distrito',district],
      ['Dirección',m.dir_cen||base.dir||first.direccion],['Localidad',m.localidad||first.localidad],['Centro poblado',m.cen_pob],
      ['Área geográfica',m.Area||first.area],['Coordenadas',(m.nlong_ie||m.nlat_ie)?`Latitud: ${m.nlong_ie||'—'} | Longitud: ${m.nlat_ie||'—'}`:''],
      ['Altitud',m.altura?`${m.altura} m s. n. m.`:'']
    ]);

    const communityData=serviceCodes.map(cm=>{
      const p=pl.find(x=>String(x.c||'')===cm)||{}, r=rs.find(x=>String(x.cod_mod||'')===cm)||{};
      const sd=serviceDetails[cm]||{};
      const st=Number(r.estudiantes)||nval(sd.tot_alu)||0;
      const dc=Number(r.docentes)||nval(sd.tot_doc)||0;
      const ps=personnelStats(sd);
      const level=p.niv||r.modalidad||p.mod||'Servicio educativo';
      return {cm,level,st,dc,dir:ps.directivos,adm:ps.administrativos,other:ps.otro};
    });
    const communityRows=communityData.map(x=>`<tr><td class="label">${esc(x.level)}</td><td class="num">${fmt(x.st)}</td><td class="num">${fmt(x.dc)}</td><td class="num">${x.dir===null?'—':fmt(x.dir)}</td><td class="num">${x.adm===null?'—':fmt(x.adm)}</td><td class="num">${x.other===null?'—':fmt(x.other)}</td><td class="num">${censusStudents?((x.st/censusStudents)*100).toFixed(1):'0.0'}%</td></tr>`);
    const communityTotals=communityData.reduce((a,x)=>{
      a.st+=x.st; a.dc+=x.dc;
      if(x.dir!==null){a.dir+=x.dir;a.hasDir=true;}
      if(x.adm!==null){a.adm+=x.adm;a.hasAdm=true;}
      if(x.other!==null){a.other+=x.other;a.hasOther=true;}
      return a;
    },{st:0,dc:0,dir:0,adm:0,other:0,hasDir:false,hasAdm:false,hasOther:false});
    const communitySec=section('3. COMUNIDAD EDUCATIVA POR NIVEL / SERVICIO',
      dataTable(['Nivel / modalidad','Estudiantes','Docentes','Directivos','Administrativos','Otro personal','Participación'],communityRows,
      `<tr class="total"><td>TOTAL DEL LOCAL</td><td class="num">${fmt(communityTotals.st)}</td><td class="num">${fmt(communityTotals.dc)}</td><td class="num">${communityTotals.hasDir?fmt(communityTotals.dir):'—'}</td><td class="num">${communityTotals.hasAdm?fmt(communityTotals.adm):'—'}</td><td class="num">${communityTotals.hasOther?fmt(communityTotals.other):'—'}</td><td class="num">100.0%</td></tr>`)+
      `<p class="ref"><b>Nota:</b> Fuente: Censo Educativo 2025 - cédula de matrícula de cada servicio educativo. “Directivos” y “Administrativos” se obtienen únicamente de las categorías de función/cargo registradas expresamente en la cédula; no se estiman ni se completan valores. “Otro personal” corresponde al total de personal no docente menos los cargos administrativos explícitos. Los auxiliares de educación no se incluyen cuando están registrados en un bloque independiente.</p>`
    );
    const careerSec=careers.length?section('4. MATRÍCULA 2026 POR PROGRAMA DE ESTUDIOS',
      dataTable(['Programa de estudios','Matrícula 2026','Participación'],[...careers].sort((a,b)=>(+b.matricula||0)-(+a.matricula||0)).map(x=>`<tr><td class="label">${esc(x.programa)}</td><td class="num">${fmt(x.matricula)}</td><td class="num">${careerTotal?((+x.matricula/careerTotal)*100).toFixed(1):'0.0'}%</td></tr>`),`<tr class="total"><td>TOTAL PROGRAMAS</td><td class="num">${fmt(careerTotal)}</td><td class="num">100.0%</td></tr>`)+`<p class="ref"><b>Importante:</b> Este cuadro corresponde únicamente al servicio de educación superior. La matrícula de Secundaria se muestra en el cuadro de comunidad educativa.</p>`
    ):'';

    const paredes=materialPred(m,'par_m',[['01','Ladrillo o concreto'],['02','Adobe o tapial'],['03','Quincha'],['05','Madera'],['07','Eternit o fibra de concreto']]);
    const techos=materialPred(m,'te_m',[['01','Concreto armado'],['02','Madera'],['03','Teja'],['04','Fibra de cemento'],['05','Calamina'],['07','Eternit']]);
    const pisos=materialPred(m,'pi_m',[['01','Parquet o madera pulida'],['02','Vinílico o similar'],['03','Loseta, cerámico o similar'],['04','Cemento'],['05','Madera entablada'],['06','Tierra']]);
    const spaces=spaceRows(detail);
    const infraRows=[['Situación FUIE 2025',m.tip_envio],['En construcción / reconstrucción',m.cons_recons],['Aulas',aulas?`${fmt(aulas)}${nval(m.aula_bue)===aulas?' - todas en buen estado':''}`:''],['Material predominante de paredes',paredes],['Material predominante de techos',techos],['Material predominante de pisos',pisos]];
    const infra=section(`${careers.length?'5':'4'}. INFRAESTRUCTURA Y AMBIENTES`,kv(infraRows)+(spaces.length?dataTable(['Ambiente / espacio','Cantidad'],spaces.map(([a,b])=>`<tr><td class="label">${esc(a)}</td><td class="num">${fmt(b)}</td></tr>`)):'') );

    const techItems=[['PC de escritorio',m.pc_tot||m.pc_totop,m.pc_totop],['Laptop convencional',m.lc_tot,m.lc_totop],['Proyector multimedia',m.prm_tot,m.prm_totop],['Switch para red',m.eq_sw_tot,m.eq_sw_ope],['Módem',m.eq_mo_tot,m.eq_mo_ope],['Estabilizadores',m.est_tot||m.eq_est_tot,m.est_totop||m.eq_est_ope]].filter(x=>nval(x[1])||nval(x[2]));
    const equip=techItems.length?section(`${careers.length?'6':'5'}. EQUIPAMIENTO TECNOLÓGICO`,dataTable(['Recurso','Total','Operativos'],techItems.map(x=>`<tr><td class="label">${esc(x[0])}</td><td class="num">${fmt(x[1])}</td><td class="num">${fmt(x[2])}</td></tr>`)),'keep-together'):'';

    const internet=section(`${careers.length?'7':'6'}. CONECTIVIDAD`,kv([
      ['¿Cuenta con internet?',yesText(m.Internet||fc?.internet)],['Número de líneas',m.nro_lin_inter],['Estado de la línea',m.l1_act],['Medio de transmisión',m.l1_conex],['Proveedor',m.l1_provee],['Financiamiento',m.l1_finan],['Ancho de banda contratado',m.l1_ancho?`${m.l1_ancho} Mbps`:''],['Velocidad de bajada',m.l1_ve_ba?`${m.l1_ve_ba} Mbps`:''],['Velocidad de subida',m.l1_ve_su?`${m.l1_ve_su} Mbps`:''],['Filtros de contenido web',yesText(m.l1_filtro)]
    ]));
    const sfl=yesText(m.cta_sfl1||m.sfl1||fc?.sfl1);
    const terrain=section(`${careers.length?'8':'7'}. TERRENO Y SITUACIÓN FÍSICO-LEGAL`,kv([
      ['Cantidad de terrenos',m.can_terr||fc?.terrenos],['Área total',area?`${fmt(area)} m²`:'' ],['Condición de tenencia',m.con_te1],['Propietario',m.propie1],['Saneamiento físico-legal',sfl],['Inscrito en Registros Públicos',yesText(m.ins_rp1)],['Partida registral',m.nrp_pr1]
    ])+`<div class="legal ${sfl==='Sí'?'ok':''}"><b>SITUACIÓN FÍSICO-LEGAL</b><span>${sfl==='Sí'?'CUENTA CON SANEAMIENTO E INSCRIPCIÓN REGISTRAL':sfl==='No'?'NO CUENTA CON SANEAMIENTO FÍSICO-LEGAL':'SIN INFORMACIÓN COMPLETA'}</span></div>`);
    const quick=isInstitute&&careers.length?`El ${esc(displayName.replace(/^INSTITUTO DE EDUCACIÓN SUPERIOR\s*/i,'Instituto de Educación Superior '))} es de ${esc(gest.toLowerCase())} y se ubica en el distrito de ${esc(district)}. Para 2026 registra ${fmt(careerTotal)} estudiantes distribuidos en ${careers.length} programas de estudios. Según el Censo Educativo 2025, el local registró ${fmt(censusStudents)} estudiantes y ${fmt(censusTeachers)} docentes. Cuenta con ${fmt(aulas)} aulas y ambientes especializados; ${yesText(m.Internet||fc?.internet)==='Sí'?'dispone de servicio de internet':'no registra servicio de internet'}. El local ocupa un terreno de ${fmt(area)} m²${m.propie1?`, de propiedad de ${esc(m.propie1)}`:''}, y ${sfl==='Sí'?'cuenta':'no registra'} saneamiento físico-legal.`:`${esc(name)} registra ${fmt(censusStudents)} estudiantes y ${fmt(censusTeachers)} docentes según el Censo Educativo 2025. El local cuenta con ${fmt(aulas)} aulas y ocupa un terreno de ${fmt(area)} m². ${yesText(m.Internet||fc?.internet)==='Sí'?'Dispone de servicio de internet.':'No registra servicio de internet.'} ${sfl==='Sí'?'Cuenta con saneamiento físico-legal.':sfl==='No'?'No registra saneamiento físico-legal.':''}`;
    const lectura=section(`${careers.length?'9':'8'}. LECTURA RÁPIDA`,`<div class="quick">${quick}</div>`);

    return `<!doctype html><html><head><meta charset="utf-8"><title>Ficha técnica CL ${esc(codlocal)}</title><style>
      @page{size:A4;margin:10mm 10mm 10mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff}body{font-family:Arial,Helvetica,sans-serif;color:#183957;font-size:8.5px;line-height:1.18}.page{width:100%;background:#fff}.topline{text-align:right;font-size:7px;color:#7c9ab2;margin-bottom:3px}.doc-title{text-align:center;color:#173d68;font-size:18px;font-weight:700;margin:2px 0 5px}.doc-name{text-align:center;color:#006a75;font-size:12.5px;font-weight:700;margin:0 0 3px;text-transform:uppercase}.meta{text-align:center;color:#222;font-size:8px;margin-bottom:9px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #b9d0e3;margin-bottom:10px}.kpi{height:50px;display:flex;flex-direction:column;align-items:center;justify-content:end;padding:4px 5px;border-right:1px solid #b9d0e3;background:#edf5f8}.kpi:nth-child(odd){background:#e6f1dc}.kpi:last-child{border-right:0}.kpi b{font-size:15px;color:#173d68;line-height:1}.kpi span{font-family:Arial,Helvetica,sans-serif;font-size:6.2px;font-weight:800;color:#006a75;margin-top:5px;text-align:center}.sec{margin:0 0 8px;break-inside:auto}.sec-title{background:#20577f;color:#fff;font-weight:700;font-size:9.5px;padding:3px 6px;margin-bottom:5px}.kv,.data{width:100%;border-collapse:collapse;table-layout:fixed}.kv th,.kv td,.data th,.data td{border:1px solid #c7d8e8;padding:2.5px 5px;vertical-align:top}.kv th{width:50%;background:#dbeaf6;text-align:left;font-weight:700}.kv td{background:#fff;color:#222}.data thead th{background:#20577f;color:#fff;text-align:center;font-weight:700}.data td{color:#222}.data td.label{background:#dbeaf6;font-weight:700}.data td.num{text-align:center}.data .total td{background:#e8f3df;font-weight:700}.ref{font-size:7.4px;color:#222;margin:3px 0 0}.legal{display:grid;grid-template-columns:1fr 1fr;border:1px solid #9ec77f;margin-top:-1px;background:#f8fbf5}.legal b,.legal span{padding:4px 6px;text-align:center}.legal b{background:#e8f3df}.legal.ok span{background:#e8f3df;color:#395f21;font-weight:700}.quick{color:#111;font-size:8.4px;line-height:1.35;padding:4px 1px}.source{font-size:6.8px;color:#6c8397;border-top:1px solid #d6e2eb;padding-top:4px;margin-top:5px}.footer{text-align:right;color:#7894aa;font-size:6.5px;margin-top:3px}.kpis,.kv tr,.data tr,.legal,.keep-together{page-break-inside:avoid!important;break-inside:avoid!important}.sec-title{page-break-after:avoid;break-after:avoid}.data thead{display:table-header-group}.data tbody tr{page-break-inside:avoid!important;break-inside:avoid!important}.keep-together{display:block}
    </style></head><body><div class="page"><div class="topline">DRELM | OPP | Equipo de Estadística y Monitoreo</div><div class="doc-title">${title}</div><div class="doc-name">${esc(displayName)}</div><div class="meta">Código de local ${esc(codlocal)} &nbsp;|&nbsp; ${esc(district)} &nbsp;|&nbsp; ${esc(gest)}</div><div class="kpis"><div class="kpi"><b>${fmt(kpiStudents)}</b><span>${kpiStudentLabel}</span></div><div class="kpi"><b>${fmt(kpi2)}</b><span>${kpi2Label}</span></div><div class="kpi"><b>${fmt(aulas)}</b><span>AULAS</span></div><div class="kpi"><b>${fmt(area)} m²</b><span>ÁREA DEL TERRENO</span></div></div>${section('1. IDENTIFICACIÓN',ident)}${section('2. UBICACIÓN',ubic)}${communitySec}${careerSec}${infra}${equip}${internet}${terrain}${lectura}<div class="source"><b>Fuente:</b> Censo Educativo 2025 - FUIE / Padrón de Servicios Educativos - ESCALE${careers.length?' | Matrícula 2026 por programa: información incorporada en la ficha':''}. <b>Elaboración:</b> EEM-OPP-DRELM.</div><div class="footer">DRELM | OPP | Equipo de Estadística y Monitoreo</div></div></body></html>`;
  }

  window.v31FichaPdf=async function(codlocal){
    codlocal=String(codlocal);
    const detail=await ensureFuieDetail(codlocal);
    const pl=P().filter(x=>String(x.l||'')===codlocal);
    const codes=new Set(pl.map(x=>String(x.c||'')).filter(Boolean));
    const rs=R().filter(x=>String(x.codlocal||'')===codlocal||codes.has(String(x.cod_mod||'')));
    const serviceDetails=await ensureServiceDetails(rs);
    const html=pdfDocument(codlocal,detail,serviceDetails);
    if(typeof window.html2pdf==='function'){
      // V36: renderizar en el MISMO documento. html2canvas no calcula bien
      // coordenadas cuando el nodo fuente pertenece a un iframe diferente;
      // eso producía PDFs vacíos/recortados hacia la izquierda.
      const parsed=new DOMParser().parseFromString(html,'text/html');
      const stage=document.createElement('div');
      stage.id='v36-pdf-stage';
      stage.setAttribute('aria-hidden','true');
      stage.style.cssText='position:fixed;left:0;top:0;width:718px;min-height:1047px;background:#fff;z-index:2147483646;pointer-events:none;overflow:visible;';
      // Neutralizar estilos globales de la app que puedan desplazar/escalar la ficha.
      const reset=document.createElement('style');
      reset.textContent=`#v36-pdf-stage{all:initial;display:block;position:fixed;left:0;top:0;width:718px;min-height:1047px;background:#fff;z-index:2147483646;pointer-events:none;overflow:visible;}#v36-pdf-stage *{box-sizing:border-box;}#v36-pdf-stage .page{transform:none!important;zoom:1!important;margin:0!important;position:static!important;left:auto!important;right:auto!important;top:auto!important;}`;
      stage.appendChild(reset);
      parsed.querySelectorAll('style').forEach(st=>{const c=document.createElement('style');c.textContent=st.textContent;stage.appendChild(c);});
      const page=parsed.querySelector('.page');
      if(page) stage.appendChild(document.importNode(page,true));
      else Array.from(parsed.body.childNodes).forEach(n=>stage.appendChild(document.importNode(n,true)));
      document.body.appendChild(stage);
      try{
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        if(document.fonts&&document.fonts.ready) await document.fonts.ready;
        const root=stage.querySelector('.page')||stage;
        root.style.width='718px';
        root.style.maxWidth='718px';
        const opt={margin:[10,10,10,10],filename:`Ficha_tecnica_CL_${codlocal}.pdf`,image:{type:'jpeg',quality:.98},html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff',scrollX:0,scrollY:0,windowWidth:718,windowHeight:1047,x:0,y:0,letterRendering:true},jsPDF:{unit:'mm',format:'a4',orientation:'portrait',hotfixes:['px_scaling']},pagebreak:{mode:['css','legacy'],avoid:['.kpis','.legal','.keep-together']}};
        await window.html2pdf().set(opt).from(root).save();
      }catch(e){
        console.error('Error PDF V36',e);
        const w=window.open('','_blank'); if(w){w.document.open();w.document.write(html+`<script>setTimeout(()=>window.print(),300)<\/script>`);w.document.close();}
        else alert('No fue posible generar el PDF.');
      }finally{stage.remove();}
      return;
    }
    const w=window.open('','_blank');
    if(!w){alert('El navegador bloqueó la ventana del PDF.');return;}
    w.document.open();w.document.write(html+`<script>setTimeout(()=>window.print(),300)<\/script>`);w.document.close();
  };

  const original=window.openLocalFicha;
  if(typeof original==='function'){
    window.openLocalFicha=function(codlocal){
      original(codlocal);
      const head=document.querySelector('#ficha .fichahead');
      if(head){let b=head.querySelector('.v31-pdf-btn');if(!b){b=document.createElement('button');b.type='button';b.className='v31-pdf-btn';b.textContent='PDF ↓';b.title='Descargar ficha técnica en PDF';head.appendChild(b);}b.onclick=()=>window.v31FichaPdf(codlocal);}
      const tab=document.getElementById('generalTab');
      if(!tab)return;
      const old=tab.querySelector('.v31-tech-sheet'); if(old)old.remove();
      tab.insertAdjacentHTML('afterbegin',build(String(codlocal)));
      const title=document.getElementById('fTitle');
      const p=P().find(x=>String(x.l||'')===String(codlocal));
      if(title&&p?.n) title.textContent=p.n;
      const kicker=document.querySelector('#ficha .fichahead small');
      if(kicker) kicker.textContent='FICHA TÉCNICA DEL LOCAL EDUCATIVO';
    };
  }
})();
