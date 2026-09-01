import zipfile, xml.etree.ElementTree as ET, re, json, os, collections
BASE=os.path.dirname(os.path.abspath(__file__))
XLSX=os.path.join(BASE,'PW_DRELM.xlsx')
OUT=os.path.join(os.path.dirname(BASE),'padron.js')
NS='{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
def read_xlsx(path):
    with zipfile.ZipFile(path) as z:
        ss=[]; root=ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in root.findall(NS+'si'): ss.append(''.join((t.text or '') for t in si.iter(NS+'t')))
        rows=[]
        for ev,e in ET.iterparse(z.open('xl/worksheets/sheet1.xml'),events=('end',)):
            if e.tag!=NS+'row': continue
            d={}
            for c in e.findall(NS+'c'):
                m=re.match(r'[A-Z]+',c.attrib.get('r',''))
                if not m: continue
                col=m.group(0); typ=c.attrib.get('t'); vv=c.find(NS+'v'); val='' if vv is None else (vv.text or '')
                if typ=='s' and val!='': val=ss[int(val)]
                d[col]=val
            rows.append(d); e.clear()
    idx={v:k for k,v in rows[0].items()}; return rows[1:],idx
def short_ugel(s):
    m=re.search(r'UGEL\s*0?([1-7])',s or '',re.I); return f'UGEL 0{m.group(1)}' if m else ('DRELM' if 'DRE LIMA' in (s or '').upper() else (s or ''))
def fnum(s):
    try:return round(float(s),7)
    except:return None
rows,idx=read_xlsx(XLSX)
def v(r,h): return str(r.get(idx.get(h,''),'') or '').strip()
p=[]
for r in rows:
    if v(r,'D_ESTADO').lower()!='activo': continue
    p.append({'i':v(r,'CODINST'),'c':v(r,'COD_MOD'),'a':v(r,'ANEXO'),'l':v(r,'CODLOCAL'),'n':v(r,'CEN_EDU'),'mod':v(r,'MODALIDAD'),'niv':v(r,'Nivel') or v(r,'D_NIV_MOD'),'g':('Pública' if v(r,'D_GESTION').startswith('Pública') else 'Privada' if v(r,'D_GESTION')=='Privada' else v(r,'D_GESTION')),'gr':v(r,'D_GESTION'),'dep':v(r,'D_GES_DEP'),'d':v(r,'D_DIST'),'geo':v(r,'CODGEO'),'u':short_ugel(v(r,'D_DREUGEL')),'uo':v(r,'D_DREUGEL'),'lat':fnum(v(r,'NLAT_IE')),'lon':fnum(v(r,'NLONG_IE')),'rei':v(r,'REI'),'dir':v(r,'DIR_CEN'),'fa':v(r,'FECHA_ACT')})
services=len({r['c'] for r in p if r['c']}); locals_=len({r['l'] for r in p if r['l']}); insts=len({r['i'] for r in p if r['i']}); cut=collections.Counter(r['fa'] for r in p if r['fa']).most_common(1)[0][0]
eligible_mods={'EBR','PRONOEI','EBA','EBE','PRITE','ETP'}
eligible_codes={r['c'] for r in p if r['c'] and r['mod'] in eligible_mods}
with_codinst={r['c'] for r in p if r['c'] and r['mod'] in eligible_mods and r['i']}
rie_pct=round(len(with_codinst)/len(eligible_codes)*100,1) if eligible_codes else 0
meta={'cut':cut,'services':services,'locals':locals_,'institutions':insts,'rieEligibleServices':len(eligible_codes),'rieWithCodinst':len(with_codinst),'riePct':rie_pct,'rows':len(p),'update':'Quincenal'}
with open(OUT,'w',encoding='utf-8') as f:
    f.write('window.DRELM_PADRON_META='+json.dumps(meta,ensure_ascii=False,separators=(',',':'))+';\n')
    f.write('window.DRELM_PADRON='+json.dumps(p,ensure_ascii=False,separators=(',',':'))+';\n')
print('PADRÓN ACTUALIZADO')
print('Corte:',cut)
print('Servicios educativos:',services)
print('Locales educativos:',locals_)
print('Códigos modulares elegibles RIE (Básica + CETPRO):',len(eligible_codes))
print('Códigos modulares con CODINST:',len(with_codinst))
print('Avance RIE:',str(rie_pct)+'%')
input('\nPresione ENTER para cerrar...')
