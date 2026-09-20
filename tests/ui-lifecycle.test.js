'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');

function harness() {
  class Element {
    constructor(){this.textContent='';this.value='';this.hidden=false;this.checked=false;this.dataset={};this.classList={toggle(){}};}
    addEventListener(type,handler){this[type]=handler;}
    append(){}
    replaceChildren(){}
    querySelectorAll(){return[];}
  }
  const ids=['status','current','baseline','current-drop','baseline-drop','demo','mode','scope','filter','search','more-groups','clear-baseline','reset','cancel','worker-source','results','groups','absent-groups','current-label','baseline-label'];
  const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
  elements['worker-source'].textContent=JSON.stringify('');
  elements.mode.value='exact';elements.scope.value='all';elements.filter.value='all';
  const workers=[];
  class Worker {
    constructor(){this.terminated=false;workers.push(this);}
    postMessage(){}
    terminate(){this.terminated=true;}
  }
  const document={getElementById:id=>elements[id]||(elements[id]=new Element()),createElement:()=>new Element(),body:new Element()};
  const context={document,Worker,Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},FailFoldDemo:{create:()=>({current:[{name:'current.xml',text:'<testsuite/>'}],baseline:null})},TextEncoder,setTimeout:()=>1,clearTimeout(){},console};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../web/app.js'),'utf8'),context,{filename:'web/app.js'});
  return {elements,workers,start:()=>elements.demo.onclick(),cancel:()=>elements.cancel.onclick()};
}

test('late Worker error cannot replace explicit cancellation status',()=>{
  const h=harness();h.start();const old=h.workers[0];h.cancel();
  assert.equal(h.elements.status.textContent,'Analysis cancelled. No partial report is shown.');
  old.onerror();
  assert.equal(h.elements.status.textContent,'Analysis cancelled. No partial report is shown.');
});

test('late Worker error cannot stop a newer analysis',()=>{
  const h=harness();h.start();const old=h.workers[0];h.start();const current=h.workers[1];
  old.onerror();
  assert.equal(current.terminated,false);
  assert.equal(h.elements.status.textContent,'Analyzing locally in a worker…');
});
