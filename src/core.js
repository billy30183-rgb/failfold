/* FailFold - MIT. One parser and grouping engine shared by CLI and browser. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../vendor/xmldom/lib').DOMParser);
  else root.FailFold = factory(root.FailFoldXML.DOMParser);
})(globalThis, function (DOMParser) {
  'use strict';
  const VERSION = '0.1.1';
  const LIMITS = Object.freeze({ files: 100, fileBytes: 5 * 1024 * 1024, totalBytes: 20 * 1024 * 1024, cases: 50000, results: 50000, elements: 250000, depth: 64 });
  const byteLength = s => new TextEncoder().encode(s).length;
  const cmp = (a,b) => a < b ? -1 : a > b ? 1 : 0;
  const tag = e => e.localName || e.nodeName;
  const attr = (e,n) => e.getAttribute(n) || '';
  const children = e => { const a = []; for (let n=e.firstChild;n;n=n.nextSibling) if(n.nodeType===1) a.push(n); return a; };
  const countTemplate = () => ({ files:0, tests:0, passed:0, skipped:0, failedCases:0, failureRecords:0 });
  function fail(message) { throw new Error(message); }
  function validateFiles(files) {
    if (!Array.isArray(files) || !files.length) fail('Select at least one current JUnit XML report.');
    if (files.length > LIMITS.files) fail(`At most ${LIMITS.files} reports can be analyzed together.`);
    let total=0;
    for (const f of files) {
      if (!f || typeof f.name !== 'string' || !f.name || f.name.length>2000 || typeof f.text !== 'string') fail('Each report needs a name and UTF-8 XML text.');
      const size=byteLength(f.text); total+=size;
      if (size>LIMITS.fileBytes) fail(`${f.name}: report exceeds 5 MiB.`);
      if (total>LIMITS.totalBytes) fail('Reports exceed 20 MiB in total.');
    }
  }
  function parseFile(file, budget) {
    const xml=file.text.replace(/^\uFEFF/, '');
    if (!xml.trim()) fail(`${file.name}: empty XML.`);
    if (/<!\s*(DOCTYPE|ENTITY)\b/i.test(xml)) fail(`${file.name}: DTD/entity declarations are not accepted (including declaration-like text inside CDATA).`);
    if (/\u0000/.test(xml)) fail(`${file.name}: NUL bytes or non-UTF-8 input.`);
    const enc=xml.match(/^\s*<\?xml[^?]*\bencoding\s*=\s*["']([^"']+)["']/i);
    if (enc && !/^utf-?8$/i.test(enc[1])) fail(`${file.name}: only UTF-8 reports are supported.`);
    let doc;
    try {
      doc = new DOMParser({onError: (level,message) => { throw new Error(`${level}: ${message}`); }, normalizeLineEndings: s => s.replace(/\r\n?/g,'\n')}).parseFromString(xml,'application/xml');
    } catch (_) { fail(`${file.name}: malformed XML; no partial analysis was returned.`); }
    const root=doc.documentElement;
    if (!root || !['testsuite','testsuites'].includes(tag(root))) fail(`${file.name}: expected a testsuite or testsuites root.`);
    // Bound the entire DOM, including ignored metadata, not only selected result nodes.
    const allNodes=[{node:root,depth:0}], postorder=[];
    while(allNodes.length){const item=allNodes.pop();postorder.push(item.node);if(++budget.elements>LIMITS.elements||item.depth>LIMITS.depth)fail(`${file.name}: XML structure exceeds the supported limits.`);for(const child of children(item.node))allNodes.push({node:child,depth:item.depth+1});}
    const records=[], warnings=[]; const counts=countTemplate(); counts.files=1;
    let stack=[{node:root, suites:[], depth:0}], caseIndex=0;
    while (stack.length) {
      const {node,suites,depth}=stack.pop();
      if (depth>LIMITS.depth) fail(`${file.name}: XML structure exceeds the supported limits.`);
      const name=tag(node), kids=children(node);
      if (name==='testsuite' || name==='testsuites') {
        const next=name==='testsuite' ? [...suites,attr(node,'name')] : suites;
        if (kids.some(k=>['failure','error'].includes(tag(k)))) fail(`${file.name}: suite-level failure/error elements are unsupported; refusing an incomplete report.`);
        for (let i=kids.length-1;i>=0;i--) {
          const k=kids[i], t=tag(k);
          if (['testsuite','testsuites','testcase'].includes(t)) stack.push({node:k,suites:next,depth:depth+1});
          else if (!['properties','system-out','system-err'].includes(t)) fail(`${file.name}: unsupported suite child ${t}.`);
        }
      } else if (name==='testcase') {
        if (++budget.cases>LIMITS.cases) fail('More than 50,000 testcase records.');
        caseIndex++; counts.tests++;
        const failures=kids.filter(k=>['failure','error'].includes(tag(k)));
        const skipped=kids.some(k=>tag(k)==='skipped');
        if (kids.some(k=>!['failure','error','skipped','system-out','system-err','properties'].includes(tag(k)))) {
          fail(`${file.name}: unsupported testcase result/extension (for example retry metadata); refusing to label it passed.`);
        }
        if (failures.length) counts.failedCases++; else if(skipped) counts.skipped++; else counts.passed++;
        if (skipped && failures.length) warnings.push(`${file.name}: testcase ${caseIndex} contains both skipped and failing results; counted as failing.`);
        for (let resultIndex=0;resultIndex<failures.length;resultIndex++) {
          if (++budget.results>LIMITS.results) fail('More than 50,000 failure/error records.');
          const f=failures[resultIndex];
          if (children(f).length) fail(`${file.name}: nested markup inside failure/error is unsupported; use escaped text or CDATA.`);
          counts.failureRecords++;
          records.push({ source:file.name, suite:suites.join(' / '), classname:attr(node,'classname'), test:attr(node,'name'), file:attr(node,'file'), line:attr(node,'line'), xmlLine:f.lineNumber||null, caseIndex,resultIndex,
            kind:tag(f), type:attr(f,'type'), message:attr(f,'message'), trace:f.textContent||'' });
        }
      }
    }
    // Check nested summaries too: otherwise a testsuites wrapper can hide missing evidence.
    const subtreeCounts=new Map();
    for (const node of postorder.reverse()) {
      const t=tag(node), kids=children(node);
      if(t==='testcase') subtreeCounts.set(node,{tests:1,failures:kids.filter(k=>['failure','error'].includes(tag(k))).length});
      else if(['testsuite','testsuites'].includes(t)) {
        const tally={tests:0,failures:0};
        for(const k of kids){const n=subtreeCounts.get(k);if(n){tally.tests+=n.tests;tally.failures+=n.failures;}}
        subtreeCounts.set(node,tally);
        for(const key of ['tests','failures','errors']) { const value=attr(node,key);if(value && !/^\d+$/.test(value))fail(`${file.name}: invalid nonnegative integer summary counter ${key}.`); }
        const declaredTests=attr(node,'tests'), declaredFail=Number(attr(node,'failures'))+Number(attr(node,'errors'));
        if(!tally.tests && (declaredFail>0 || Number(declaredTests)>0))fail(`${file.name}: summary declares results but there are no testcase elements.`);
        if(declaredTests && Number(declaredTests)!==tally.tests)warnings.push(`${file.name}: declared tests differ from parsed testcase records in suite ${attr(node,'name') || '(unnamed)'}; input may be incomplete.`);
        if(declaredFail>tally.failures)fail(`${file.name}: summary declares more failures/errors than were parsed; refusing incomplete evidence.`);
      }
    }
    return {records,counts,warnings};
  }
  function parseSet(files,budget) {
    const all=[], counts=countTemplate(), warnings=[], contentNames=new Map(), names=new Set();
    for(const f of [...files].sort((a,b)=>cmp(a.name,b.name))) {
      if(names.has(f.name))fail(`${f.name}: duplicate source name within one report set.`);names.add(f.name);
      const prev=contentNames.get(f.text);
      if(prev) warnings.push(`${f.name}: XML is identical to ${prev}; both are counted as reported occurrences, not unique tests.`);
      else contentNames.set(f.text,f.name);
      const r=parseFile(f,budget); all.push(...r.records); warnings.push(...r.warnings);
      for(const k of Object.keys(counts)) counts[k]+=r.counts[k];
    }
    return {records:all,counts,warnings};
  }
  function normalize(text,mode) {
    // Optional and explicit. Numbers, paths, status codes and stack line numbers are never masked.
    return mode==='formatting' ? text.replace(/\u001b\[[0-9;:]*m/g,'').replace(/\r\n?/g,'\n').replace(/[ \t]+$/gm,'').replace(/^\n+|\n+$/g,'') : text;
  }
  function group(records,options,side) {
    const map=new Map();
    for(const r of records) {
      const fields=[r.kind,r.type,r.message,r.trace].map(x=>normalize(x,options.mode));
      // A type alone is not sufficient evidence. Do not merge blank-error events.
      const informative=!!(fields[2].trim() || fields[3].trim());
      const key=JSON.stringify([...fields,...(options.scope==='class'?[r.classname]:[]),...(informative?[]:[side,r.source,r.caseIndex,r.resultIndex])]);
      let g=map.get(key);
      if(!g) {g={key,informative,normalized:{kind:fields[0],type:fields[1],message:fields[2],trace:fields[3]},occurrences:[],variants:new Set()};map.set(key,g);}
      g.occurrences.push(r);g.variants.add(JSON.stringify([r.kind,r.type,r.message,r.trace]));
    }
    return map;
  }
  function analyze(current,baseline=null,rawOptions={}) {
    const options={mode:rawOptions.mode||'exact',scope:rawOptions.scope||'all'};
    if (!['exact','formatting'].includes(options.mode) || !['all','class'].includes(options.scope)) fail('Unknown grouping options.');
    validateFiles(current); if(baseline!==null) validateFiles(baseline);
    validateFiles([...current,...(baseline||[])]);
    const budget={elements:0,cases:0,results:0}; const cur=parseSet(current,budget); const old=baseline===null?null:parseSet(baseline,budget);
    const nowGroups=group(cur.records,options,'current'), oldGroups=group(old?old.records:[],options,'baseline');
    const sorted=[...nowGroups.values()].sort((a,b)=>b.occurrences.length-a.occurrences.length || cmp(a.key,b.key));
    const materialize=(g,id,status,baselineMatch=null)=>({id,status,informative:g.informative,count:g.occurrences.length,variantCount:g.variants.size,normalized:g.normalized,occurrences:g.occurrences,baselineOccurrences:baselineMatch?baselineMatch.occurrences:[]});
    const groups=sorted.map((g,i)=>materialize(g,`G${String(i+1).padStart(3,'0')}`,!g.informative?'unknown':!old?'uncompared':oldGroups.has(g.key)?'seen':'new',g.informative?oldGroups.get(g.key):null));
    const absent=[...oldGroups.values()].filter(g=>!nowGroups.has(g.key)).sort((a,b)=>b.occurrences.length-a.occurrences.length||cmp(a.key,b.key)).map((g,i)=>materialize(g,`B${String(i+1).padStart(3,'0')}`,g.informative?'not-observed':'unknown'));
    return {schemaVersion:1,version:VERSION,options,hasBaseline:!!old,counts:cur.counts,baselineCounts:old?old.counts:null,groups,baselineOnly:absent,
      summary:{groups:groups.length,newGroups:old?groups.filter(g=>g.status==='new').length:null,seenGroups:old?groups.filter(g=>g.status==='seen').length:null,unknownGroups:groups.filter(g=>g.status==='unknown').length,foldedRecords:cur.counts.failureRecords-groups.length,foldingPercent:cur.counts.failureRecords?100*(1-groups.length/cur.counts.failureRecords):0},
      warnings:[...cur.warnings,...(old?old.warnings:[])],
      limitations:['Groups mean matching reported failure signatures, not proven common root causes.','New/seen is relative only to the reports supplied as baseline, not a claim about when a bug began.','Not observed in current reports does not mean fixed.','All counts are reported testcase/failure occurrences, not globally unique tests.','Original failure text is retained after XML decoding; system-out, properties and other attachments are not exported.','Exports can contain secrets and personal data. Review before sharing; no automatic redaction is performed.']};
  }
  function fence(text) {const runs=text.match(/`+/g)||[];const mark='`'.repeat(Math.max(3,...runs.map(x=>x.length+1)));return `${mark}text\n${text}\n${mark}`;}
  function markdown(report) {
    const s=report.summary, c=report.counts;
    const a=['# FailFold report','',`${c.failureRecords} failure/error records → ${s.groups} signature groups; ${s.foldedRecords} records folded (${s.foldingPercent.toFixed(1)}%).`,'',
      `Parsed testcase records: ${c.tests}; failed cases: ${c.failedCases}; passed: ${c.passed}; skipped: ${c.skipped}.`,
      `Mode: ${report.options.mode}; scope: ${report.options.scope}.`,
      report.hasBaseline?`Relative to supplied baseline: ${s.newGroups} new groups, ${s.seenGroups} seen groups, ${s.unknownGroups} unknown.`:'No baseline supplied.','',...report.limitations.map(x=>`- ${x}`)];
    if(report.warnings.length) a.push('','## Input warnings',fence(report.warnings.join('\n')));
    for(const g of [...report.groups,...report.baselineOnly]) {
      a.push('',`## ${g.id} · ${g.status} · ${g.count} occurrences · ${g.variantCount} raw variants`,'',
        'Matching signature:',fence(JSON.stringify(g.normalized,null,2)),'','All original failure records (XML-decoded):',fence(JSON.stringify(g.occurrences,null,2)));
      if(g.baselineOccurrences && g.baselineOccurrences.length) a.push('','Matching baseline failure records (XML-decoded):',fence(JSON.stringify(g.baselineOccurrences,null,2)));
    }
    return a.join('\n')+'\n';
  }
  return {VERSION,LIMITS,analyze,markdown,normalize,fence};
});
