import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/scripts/collection-bridge.js',import.meta.url),'utf8');
function setup() {
 const sent=[], listeners={}, elements=new Map();
 const parent={postMessage:(data,origin)=>sent.push({data,origin})};
 let selected='';
 const element=id=>{if(!elements.has(id))elements.set(id,{value:'',textContent:''});return elements.get(id);};
 const context=vm.createContext({
  window:{parent,addEventListener:(name,fn)=>listeners[name]=fn},
  URLSearchParams,location:{origin:'https://studio.example.com',search:'?studioChild=1'},
  document:{createElement:()=>({}),head:{append(){}},body:{scrollHeight:1200},querySelector:selector=>selector.includes('button[data-slug=')?{click:()=>selected=selector}:element(selector),querySelectorAll:()=>[]},
  $:element,render:()=>{},ready:false,token:'',slugs:['form','flow','flight','world'],
  ResizeObserver:class {observe(){}},requestAnimationFrame:fn=>fn(),
 });
 vm.runInContext(source,context);
 return {context,sent,parent,element,selected:()=>selected,receive:(data,origin='https://studio.example.com',sender=parent)=>listeners.message({data,origin,source:sender})};
}
test('collection bridge accepts credentials only from its same-origin parent and clears them on sign-out',()=>{
 const s=setup();
 s.receive({type:'studio-connect',token:'untrusted'},'https://other.example.com');
 assert.equal(s.context.token,'');
 s.receive({type:'studio-connect',token:'untrusted'},'https://studio.example.com',{});
 assert.equal(s.context.token,'');
 s.receive({type:'studio-connect',token:'test-token'});
 assert.equal(s.context.token,'test-token');
 assert.equal(s.element('token').value,'');
 s.receive({type:'studio-disconnect'});
 assert.equal(s.context.token,'');
 assert.ok(s.sent.every(x=>x.origin==='https://studio.example.com'));
});
test('collection selection accepts only existing collections',()=>{
 const s=setup();
 s.receive({type:'studio-select-collection',collection:'form'});
 assert.match(s.selected(),/data-slug="form"/);
 s.receive({type:'studio-select-collection',collection:'unrecognized'});
 assert.match(s.selected(),/data-slug="form"/);
});
