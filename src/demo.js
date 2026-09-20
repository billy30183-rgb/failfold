/* Synthetic examples. Not adoption data or measured human time savings. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FailFoldDemo=factory();})(globalThis,function(){
  const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  const patterns=[
    ['ConnectionError','Connection refused: fixture database on localhost:5432','Fixture startup failed\n  at connect (src/db/client.js:42:9)\n  at setup (tests/shared/fixture.js:18:3)'],
    ['AssertionError','Expected status 200, received 503','Response validation failed\n  at assertStatus (tests/helpers/http.js:27:5)'],
    ['ModuleNotFoundError',"No module named 'demo_optional_codec'","Import failed in shared setup\n  File \"tests/shared/plugins.py\", line 12"],
    ['TimeoutError','Timed out waiting for demo cache','Cache initialization exceeded timeout\n  at initCache (tests/shared/cache.js:61:4)']
  ];
  function file(name,counts,passed,skipped){let cases='',n=0;
    counts.forEach((count,p)=>{for(let i=0;i<count;i++){const [type,msg,trace]=patterns[p];cases+=`<testcase classname="demo.Component${p}" name="case_${n++}"><failure type="${type}" message="${escape(msg)}">${escape(trace)}</failure></testcase>\n`;}});
    for(let i=0;i<passed;i++)cases+=`<testcase classname="demo.Healthy" name="passed_${i}"/>\n`;
    for(let i=0;i<skipped;i++)cases+=`<testcase classname="demo.Optional" name="skipped_${i}"><skipped/></testcase>\n`;
    return {name,text:`<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="${name}" tests="${n+passed+skipped}" failures="${n}" errors="0">\n${cases}</testsuite>`};
  }
  function create(){return {current:[file('linux.xml',[60,20,7,0],20,4),file('macos.xml',[50,20,7,0],15,3),file('windows.xml',[50,20,6,0],15,3)],baseline:[file('previous.xml',[110,45,0,5],35,5)]};}
  return {create};
});
