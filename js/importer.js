// Flexible, auditable CSV/TSV importer. All parsing takes place inside the browser.
const FIELDS=['Sample','Site','Geography','Tissue','Chronology','Species','d13C','d15N','d34S','Notes','Reference','CN','CollagenYield','CS','NS'];
const NUMERIC=new Set(['d13C','d15N','d34S','CN','CollagenYield','CS','NS']);
const ALIASES={
Sample:['sample','sampleid','sampleidentifier','specimen','specimenid','specimenno','specimenidentifier','individual','individualid','labid','laboratoryid','id'],
Site:['site','sitename','locality','archaeologicalsite','findspot'],
Geography:['geography','country','region','area','location'],
Tissue:['tissue','material','samplematerial','sampletype'],
Chronology:['chronology','period','archaeologicalperiod','phase','dateperiod'],
Species:['species','taxon','taxa','scientificname','speciesname','identification'],
d13C:['d13c','δ13c','delta13c','carbon13','carbonisotope','δ13cpermil','d13cpermil'],
d15N:['d15n','δ15n','delta15n','nitrogen15','nitrogenisotope','δ15npermil','d15npermil'],
d34S:['d34s','δ34s','delta34s','sulfur34','sulphur34','sulfurisotope','sulphurisotope','δ34spermil','d34spermil'],
Notes:['notes','note','comments','comment','remarks'],Reference:['reference','citation','source','publication','bibliography'],
CN:['cn','cnratio','atomiccn','atomiccnratio','carbonnitrogenratio','c:n'],
CollagenYield:['collagenyield','yieldcollagen','collagenpercentage'],CS:['cs','csratio','c:s'],NS:['ns','nsratio','n:s']};
const normalized=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[δΔ]/g,'delta').replace(/‰/g,'permil').replace(/[^a-z0-9]/g,'');
const ALIAS_LOOKUP={};Object.entries(ALIASES).forEach(([target,aliases])=>aliases.forEach(a=>{const key=normalized(a);if(!ALIAS_LOOKUP[key])ALIAS_LOOKUP[key]=target}));
function inferMapping(headers){const used=new Set();return headers.map(h=>{let k=normalized(h),found=ALIAS_LOOKUP[k]||'';if(found&&used.has(found))found='';if(found)used.add(found);return found})}
function readMatrix(text){text=text.replace(/^\ufeff/,'');const lines=text.split(/\r?\n/).filter(x=>x.trim()).slice(0,12);if(!lines.length)throw Error('The file is empty.');
 const delimiters=['\t',';',',','|'];const score=d=>lines.map(x=>{let quote=false,n=0;for(let i=0;i<x.length;i++){if(x[i]==='"'){if(quote&&x[i+1]==='"')i++;else quote=!quote}else if(!quote&&x[i]===d)n++}return n}).filter(n=>n>0);const ranked=delimiters.map(d=>{const a=score(d),avg=a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);const stability=a.length?Math.max(...a)-Math.min(...a):100;return {d,score:(a.length>=Math.min(2,lines.length)?100:0)+avg*3-stability*20}}).sort((a,b)=>b.score-a.score);const d=ranked[0].d;
 let rows=[],row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){let c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===d&&!quoted){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell=''}else cell+=c}row.push(cell);if(row.some(v=>v.trim()))rows.push(row);if(quoted)throw Error('Unclosed quote in delimited file.');return {delimiter:d,rows};}
function parseNumeric(raw){let s=String(raw??'').trim();if(!s||/^(n\/a|na|null|none|missing|nd|n\.d\.|—|–|-|\.)$/i.test(s))return {value:null};s=s.replace(/[−–]/g,'-').replace(/‰/g,'').replace(/\s/g,'');if(/^[-+]?\d{1,3}(?:\.\d{3})+,\d+$/.test(s))s=s.replace(/\./g,'').replace(',','.');else if(/^[-+]?\d{1,3}(?:,\d{3})+\.\d+$/.test(s))s=s.replace(/,/g,'');else if(s.includes(',')&&!s.includes('.'))s=s.replace(',','.');if(!/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(s))return {value:null,error:true};let value=Number(s);return Number.isFinite(value)?{value}:{value:null,error:true};}
function convertMatrix(matrix,headerIndex,map){const rawHeaders=matrix[headerIndex]||[];const names=rawHeaders.map((h,i)=>String(h).trim()||`Column ${i+1}`);let rows=[],errors=[],warnings=[],ids=new Map();const invalidLimit=50;
 matrix.slice(headerIndex+1).forEach((cells,pos)=>{const sourceRow=headerIndex+pos+2;const record=Object.fromEntries(FIELDS.map(f=>[f,NUMERIC.has(f)?null:'']));const raw={};names.forEach((header,i)=>{const field=map[i];if(!field)return;raw[field]=cells[i]??'';if(NUMERIC.has(field)){const parsed=parseNumeric(cells[i]);record[field]=parsed.value;if(parsed.error&&errors.length<invalidLimit)errors.push(`Row ${sourceRow}: invalid ${field} value “${String(cells[i]).slice(0,60)}”`)}else record[field]=String(cells[i]??'').trim()});record._sourceRow=sourceRow;record._raw=raw;
 if(!record.Sample){record.Sample=`ROW-${sourceRow}`;warnings.push(`Row ${sourceRow}: no Sample ID; generated ${record.Sample}`)}if(ids.has(record.Sample))warnings.push(`Duplicate sample ID “${record.Sample}” (rows ${ids.get(record.Sample)} and ${sourceRow})`);else ids.set(record.Sample,sourceRow);
 rows.push(record)});
 const isotopes=['d13C','d15N','d34S'];const measurements=rows.reduce((n,r)=>n+isotopes.filter(f=>r[f]!==null).length,0);const missing=rows.reduce((n,r)=>n+isotopes.filter(f=>r[f]===null).length,0);
 if(!map.some(f=>isotopes.includes(f)))errors.unshift('Map at least one isotope field (δ¹³C, δ¹⁵N, or δ³⁴S).');if(!measurements)errors.unshift('No usable isotope measurements found.');if(!rows.length)errors.unshift('No data rows were found.');return {rows,errors,warnings,measurements,missing,rawHeaders:names};}
// Compatibility for future batch import; direct CSV import is handled by the wizard.
