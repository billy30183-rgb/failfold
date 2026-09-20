'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
// This tiny bundler handles only the vendored, static, sibling CommonJS modules.
// It does not parse user code and never resolves a network or filesystem module at runtime.
const mods=fs.readdirSync(path.join(root,'vendor/xmldom/lib')).filter(f=>f.endsWith('.js')).sort();
const bundle=`(function(){const modules={${mods.map(f=>`${JSON.stringify('./'+f.slice(0,-3))}:function(require,module,exports){\n${read('vendor/xmldom/lib/'+f)}\n}`).join(',\n')}};const cache={};function req(id){if(cache[id])return cache[id].exports;if(!modules[id])throw Error('Unknown bundled module');const m={exports:{}};cache[id]=m;modules[id](req,m,m.exports);return m.exports;}globalThis.FailFoldXML=req('./index');})();\n`;
const worker=bundle+read('src/core.js')+'\n'+read('web/worker.js');
const safeScript=s=>s.replace(/<\/script/gi,'<\\/script');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const notices=read('LICENSE')+'\n\n@xmldom/xmldom '+JSON.parse(read('vendor/xmldom/package.json')).version+' (vendored, unmodified)\n'+read('vendor/xmldom/LICENSE');
const html=read('web/template.html').replace('/*__STYLE__*/',()=>read('web/style.css')).replace('/*__WORKER__*/',()=>JSON.stringify(worker).replaceAll('<','\\u003c')).replace('/*__NOTICES__*/',()=>escape(notices)).replace('/*__APP__*/',()=>safeScript(read('src/demo.js')+'\n'+read('web/app.js')));
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/index.html'),html);fs.writeFileSync(path.join(root,'dist/LICENSE.txt'),notices);
const demo=require('../src/demo').create();for(const side of ['current','baseline']){fs.mkdirSync(path.join(root,'examples',side),{recursive:true});for(const f of demo[side])fs.writeFileSync(path.join(root,'examples',side,f.name),f.text+'\n');}
console.log(`Built dist/index.html (${Buffer.byteLength(html)} bytes). No network assets.`);
