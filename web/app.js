(function(){
'use strict';
const $=id=>document.getElementById(id);
const state={current:[],baseline:null,report:null,markdown:'',worker:null,timer:null,generation:0,displayed:40};
const status=(text,error=false)=>{$('status').textContent=text;$('status').classList.toggle('error',error);};
const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
function stop(){if(state.worker)state.worker.terminate();state.worker=null;clearTimeout(state.timer);state.timer=null;$('cancel').hidden=true;}
function invalidate(){state.generation++;stop();state.report=null;state.markdown='';$('results').hidden=true;$('groups').replaceChildren();$('absent-groups').replaceChildren();}
function options(){return{mode:$('mode').value,scope:$('scope').value};}
function labels(){
  $('current-label').textContent=state.current.length?state.current.map(f=>f.name).join(' · '):'or choose files · multiple reports supported';
  $('baseline-label').textContent=state.baseline?state.baseline.map(f=>f.name).join(' · '):'Choose XML files from a comparable run';
}
function analyze(){
  invalidate();if(!state.current.length){status('Choose current reports or try the synthetic demo.');return;}
  const generation=state.generation;status('Analyzing locally in a worker…');$('cancel').hidden=false;
  const source=JSON.parse($('worker-source').textContent);const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  try{state.worker=new Worker(url);}catch(e){URL.revokeObjectURL(url);stop();status('This browser blocked the local worker. Use a current browser or serve this file locally.',true);return;}URL.revokeObjectURL(url);
  state.worker.onmessage=e=>{if(generation!==state.generation)return;stop();if(e.data.error){status(e.data.error,true);return;}state.report=e.data.report;state.markdown=e.data.markdown;render();status(`Analysis complete. ${state.report.counts.files} current reports processed locally. No data uploaded.`);};
  state.worker.onerror=()=>{if(generation!==state.generation)return;stop();status('Analysis worker failed. No partial results are shown.',true);};
  state.timer=setTimeout(()=>{invalidate();status('Stopped after 15 seconds. Select fewer/smaller reports and try again.',true);},15000);
  state.worker.postMessage({current:state.current,baseline:state.baseline,options:options()});
}
async function load(files,side){
  invalidate();const generation=state.generation;state[side]=side==='baseline'?null:[];labels();status('Reading selected local files…');
  try{
    const selected=[...files];if(!selected.length){status('No files selected.');return;}
    const other=side==='current'?(state.baseline||[]):state.current;
    if(selected.length+other.length>100)throw Error('At most 100 reports combined.');
    const total=selected.reduce((n,f)=>n+f.size,0)+other.reduce((n,f)=>n+new TextEncoder().encode(f.text).length,0);
    if(selected.some(f=>f.size>5*1024*1024)||total>20*1024*1024)throw Error('Report size limit: 5 MiB each, 20 MiB combined.');
    const names=new Set();const loaded=[];
    for(const f of selected){if(names.has(f.name))throw Error('Duplicate filenames in one selection. Rename reports so their sources remain distinct.');names.add(f.name);loaded.push({name:f.name,text:new TextDecoder('utf-8',{fatal:true}).decode(await f.arrayBuffer())});}
    if(generation!==state.generation)return;state[side]=loaded;labels();analyze();
  }catch(e){if(generation!==state.generation)return;status(`Could not read reports: ${e.message}`,true);}
}
function download(name,text,mime){const url=URL.createObjectURL(new Blob([text],{type:mime}));const a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const badgeText={new:'NEW',seen:'SEEN',unknown:'UNKNOWN',uncompared:'NO BASELINE','not-observed':'NOT OBSERVED'};
function card(g){
  const box=el('details',undefined,'group');const head=el('summary');
  const title=el('span',undefined,'group-title');title.append(el('strong',g.normalized.message.trim()||g.normalized.type||'Failure without explanatory text'),el('small',`${g.id} · ${g.normalized.type||g.normalized.kind} · ${new Set(g.occurrences.map(r=>r.source)).size} source reports · ${g.variantCount} raw variants`));
  head.append(title,el('span',badgeText[g.status],`badge ${g.status}`),el('span',String(g.count),'group-number'));box.append(head);
  box.addEventListener('toggle',()=>{if(!box.open||box.dataset.loaded)return;box.dataset.loaded='1';
    const body=el('div',undefined,'group-body');body.append(el('h3',g.informative?'Why these records are together':'Insufficient evidence — this record is not merged'),el('p',`Exact equality of kind, type, message and trace after mode “${state.report.options.mode}”. Scope: ${state.report.options.scope}. Different numbers, paths and stack line numbers stay different.`,'small'),el('pre',JSON.stringify(g.normalized,null,2)));
    const exportButton=el('button','Export this group');exportButton.onclick=()=>download(`failfold-${g.id}.json`,JSON.stringify(g,null,2),'application/json');body.append(exportButton,el('h3','Original failure records — expand to inspect'));
    let shown=0;const list=el('div');const more=el('button','Show more occurrences');
    const add=()=>{const end=Math.min(shown+30,g.occurrences.length);for(;shown<end;shown++){const r=g.occurrences[shown],d=el('details',undefined,'occurrence');d.append(el('summary',`${r.source}:${r.xmlLine??'?'} · ${r.classname} · ${r.test||`case ${r.caseIndex}`}`));d.addEventListener('toggle',()=>{if(d.open&&!d.dataset.loaded){d.dataset.loaded='1';d.append(el('pre',JSON.stringify(r,null,2)));}});list.append(d);}more.hidden=shown>=g.occurrences.length;more.textContent=`Show more (${shown}/${g.occurrences.length})`;};
    more.onclick=add;body.append(list,more);add();box.append(body);
  });return box;
}
function filtered(){const q=$('search').value.toLowerCase(),f=$('filter').value;return state.report.groups.filter(g=>(f==='all'||g.status===f)&&(!q||[g.normalized.type,g.normalized.message,g.normalized.trace,...g.occurrences.map(r=>`${r.source} ${r.test} ${r.classname}`)].some(x=>x.toLowerCase().includes(q))));}
function renderGroups(reset=true){if(!state.report)return;if(reset)state.displayed=40;const groups=filtered();$('groups').replaceChildren(...groups.slice(0,state.displayed).map(card));$('group-count').textContent=`${groups.length} matching groups · sorted by reported occurrences`;$('more-groups').hidden=groups.length<=state.displayed;if(!groups.length)$('groups').append(el('p',state.report.counts.failureRecords?'No groups match these filters.':'No failure/error records in the supplied reports.','muted'));}
function render(){
  const r=state.report,s=r.summary;$('results').hidden=false;$('metric-records').textContent=r.counts.failureRecords.toLocaleString();$('metric-tests').textContent=`${r.counts.tests} testcase records · ${r.counts.failedCases} failing`;$('metric-groups').textContent=s.groups.toLocaleString();$('metric-folded').textContent=`${s.foldingPercent.toFixed(1)}%`;$('metric-folded-count').textContent=`${s.foldedRecords} repeated records kept inside groups`;$('metric-new').textContent=s.newGroups===null?'—':String(s.newGroups);
  $('warning-box').hidden=!r.warnings.length;$('warning-box').textContent=r.warnings.join('\n');
  $('absent-groups').replaceChildren(...r.baselineOnly.slice(0,40).map(card));$('baseline-only').hidden=!r.hasBaseline;$('baseline-only-title').textContent=`${r.baselineOnly.length} baseline-only / unknown signatures — not marked fixed`;
  if(r.baselineOnly.length>40)$('absent-groups').append(el('p','Showing the first 40; all baseline records are in the JSON/Markdown export.','small'));
  renderGroups();
}
for(const side of ['current','baseline']){$(side).onchange=e=>load(e.target.files,side);const drop=$(side+'-drop');drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag');});drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');load(e.dataTransfer.files,side);});}
$('demo').onclick=()=>{invalidate();const d=FailFoldDemo.create();state.current=d.current;state.baseline=d.baseline;$('mode').value='exact';$('scope').value='all';$('filter').value='all';$('search').value='';labels();analyze();};
$('mode').onchange=analyze;$('scope').onchange=analyze;$('filter').onchange=()=>renderGroups();$('search').oninput=()=>renderGroups();$('more-groups').onclick=()=>{state.displayed+=40;renderGroups(false);};
$('clear-baseline').onclick=()=>{state.baseline=null;$('baseline').value='';labels();analyze();};
$('reset').onclick=()=>{invalidate();state.current=[];state.baseline=null;$('current').value='';$('baseline').value='';labels();status('All reports cleared from this page.');};
$('cancel').onclick=()=>{invalidate();status('Analysis cancelled. No partial report is shown.');};
$('download-md').onclick=()=>{if(state.report)download('failfold-report.md',state.markdown,'text/markdown;charset=utf-8');};
$('download-json').onclick=()=>{if(state.report)download('failfold-report.json',JSON.stringify(state.report,null,2),'application/json');};
})();
