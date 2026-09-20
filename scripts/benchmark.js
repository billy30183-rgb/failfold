'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {performance}=require('node:perf_hooks');const core=require('../src/core');
// Synthetic repeated setup failures. Measures parsing + grouping only, not human triage.
const records=10000,signatures=20,repeats=7;
let body='';for(let i=0;i<records;i++)body+=`<testcase name="synthetic-${i}" classname="Benchmark"><failure type="SyntheticSetupError" message="fixture-${i%signatures}">at sharedSetup (fixture-${i%signatures}.js:10)</failure></testcase>`;
const text=`<testsuite tests="${records}" failures="${records}">${body}</testsuite>`;
const files=[{name:'synthetic-benchmark.xml',text}];core.analyze(files);
const elapsed=[];let report;for(let i=0;i<repeats;i++){const start=performance.now();report=core.analyze(files);elapsed.push(performance.now()-start);}
if(report.counts.failureRecords!==records||report.summary.groups!==signatures)throw Error('Unexpected benchmark output');
const sorted=[...elapsed].sort((a,b)=>a-b);
const result={synthetic:true,measures:'UTF-8 byte validation, XML parse, limits, summary validation and exact-signature grouping; excludes input generation, disk IO, Markdown, browser rendering and human triage',node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model||'unknown',logicalCPUs:os.cpus().length,inputBytes:Buffer.byteLength(text),failureRecords:records,signatureGroups:signatures,warmups:1,repeats,elapsedMs:elapsed.map(n=>+n.toFixed(3)),medianMs:+sorted[Math.floor(sorted.length/2)].toFixed(3),minMs:+sorted[0].toFixed(3),maxMs:+sorted.at(-1).toFixed(3),caveat:'Single synthetic workload on the recorded host; neither a cross-product benchmark nor a human time-savings measurement.'};
fs.mkdirSync(path.join(__dirname,'../docs'),{recursive:true});fs.writeFileSync(path.join(__dirname,'../docs/benchmark-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
