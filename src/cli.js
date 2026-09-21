#!/usr/bin/env node
'use strict';
const fs=require('node:fs'); const path=require('node:path'); const core=require('./core');
function run(argv) {
  const usage=`FailFold ${core.VERSION}\nUsage: node src/cli.js <xml-file-or-directory>... [options]\n\n  --baseline PATH    Compare with XML file/directory (repeatable)\n  --mode MODE        exact (default) or formatting\n  --scope SCOPE      all (default) or class\n  --output FILE      Write Markdown (otherwise stdout)\n  --json FILE        Also write a complete JSON report\n  --fail-on-new      Exit 1 for a new signature; requires baseline\n  --fail-on-failure  Exit 1 for any current failure/error\n  --force           Allow overwriting output files, never input files\n  --help            Show this help\n\nExit 0: analyzed successfully (unless a selected gate failed).\nExit 1: a selected gate failed. Exit 2: invalid/incomplete/inconclusive input.\nFiles are read locally. Symlinks, non-UTF-8 input, DTDs and unsupported retry extensions are rejected.\n`;
  const optionEnd=argv.indexOf('--');
  const optionArgs=argv.slice(0,optionEnd<0?argv.length:optionEnd);
  if(optionArgs.includes('--help')||optionArgs.includes('-h')){process.stdout.write(usage);return 0;}
  const input=[],base=[],opts={};let output=null,json=null,gate=null,force=false;
  for(let i=0;i<argv.length;i++) {
    const v=argv[i];
    if(v==='--'){input.push(...argv.slice(i+1));break;}
    if(['--baseline','--mode','--scope','--output','--json'].includes(v)) {
      const value=argv[++i];if(!value||value.startsWith('--')) throw new Error(`Missing value for ${v}.`);
      if(v==='--baseline')base.push(value);if(v==='--mode')opts.mode=value;if(v==='--scope')opts.scope=value;if(v==='--output')output=value;if(v==='--json')json=value;
    } else if(v==='--fail-on-new'||v==='--fail-on-failure') {if(gate)throw new Error('Choose only one gate.');gate=v;}
    else if(v==='--force')force=true;else if(v.startsWith('-'))throw new Error(`Unknown flag ${v}.`);else input.push(v);
  }
  if(!input.length)throw new Error('Provide at least one XML file or directory. Use --help for usage.');
  if(gate==='--fail-on-new'&&!base.length)throw new Error('--fail-on-new requires --baseline.');
  const seen=new Set(),paths=[],basePaths=[];let bytes=0,visited=0;
  function collect(target,arr) {
    if(++visited>10000)throw new Error('Directory scan exceeds 10,000 entries; select a narrower reports directory.');
    const abs=path.resolve(target),st=fs.lstatSync(abs);
    if(st.isSymbolicLink())throw new Error('Symlink input is not supported.');
    if(st.isDirectory()) {for(const ent of fs.readdirSync(abs,{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)) {
      if(ent.isDirectory() || /\.xml$/i.test(ent.name))collect(path.join(abs,ent.name),arr);
    }return;}
    if(!st.isFile())throw new Error('Input must be a regular file or reports directory.');
    if(seen.has(abs))throw new Error('The same input file was supplied more than once (possibly on both sides).');
    seen.add(abs);if(seen.size>core.LIMITS.files)throw new Error('At most 100 XML files are supported.');
    if(st.size>core.LIMITS.fileBytes)throw new Error('An input exceeds 5 MiB.');
    bytes+=st.size;if(bytes>core.LIMITS.totalBytes)throw new Error('Inputs exceed 20 MiB.');arr.push(abs);
  }
  input.forEach(p=>collect(p,paths));base.forEach(p=>collect(p,basePaths));
  const outputs=[output,json].filter(Boolean).map(p=>path.resolve(p));
  if(new Set(outputs).size!==outputs.length)throw new Error('Markdown and JSON must use different output paths.');
  for(const p of outputs) {const entry=fs.lstatSync(p,{throwIfNoEntry:false});if(entry&&entry.isSymbolicLink())throw new Error('Refusing symlink output.');}
  const outputFiles=outputs.filter(p=>fs.existsSync(p)).map(p=>fs.statSync(p));
  if(outputFiles.some((a,i)=>outputFiles.slice(i+1).some(b=>a.dev===b.dev&&a.ino===b.ino)))throw new Error('Markdown and JSON must not refer to the same file or hard link.');
  for(const p of outputs) {
    if(seen.has(p))throw new Error('Refusing to overwrite an input file.');
    if(fs.existsSync(p)) {const os=fs.statSync(p);if([...seen].some(x=>{const ins=fs.statSync(x);return os.dev===ins.dev&&os.ino===ins.ino;}))throw new Error('Refusing to overwrite an input file or hard link.');if(!force)throw new Error('Output already exists; use a new name or --force.');}
    if(!fs.statSync(path.dirname(p)).isDirectory())throw new Error('Output parent must exist.');
  }
  const decode=p=>({name:path.relative(process.cwd(),p).split(path.sep).join('/'),text:new TextDecoder('utf-8',{fatal:true}).decode(fs.readFileSync(p))});
  const report=core.analyze(paths.map(decode),base.length?basePaths.map(decode):null,opts);
  const md=core.markdown(report);
  if(output)fs.writeFileSync(output,md,{flag:force?'w':'wx'});else process.stdout.write(md);
  if(json)fs.writeFileSync(json,JSON.stringify(report,null,2)+'\n',{flag:force?'w':'wx'});
  process.stderr.write(`FailFold: ${report.counts.failureRecords} records -> ${report.summary.groups} groups; ${report.warnings.length} warnings.\n`);
  if(gate==='--fail-on-new' && (report.summary.unknownGroups || report.baselineOnly.some(g=>g.status==='unknown') || report.warnings.length))return 2;
  if(gate==='--fail-on-new'&&report.summary.newGroups>0)return 1;
  if(gate==='--fail-on-failure'&&report.counts.failureRecords>0)return 1;
  return 0;
}
if(require.main===module){try{process.exitCode=run(process.argv.slice(2));}catch(e){process.stderr.write(`FailFold error: ${String(e.message).replace(/[\u0000-\u001f\u007f]/g,' ')}\n`);process.exitCode=2;}}
module.exports={run};
