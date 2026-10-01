import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {collectorText} from '../src/i18n/collector.mjs';

test('format buttons redraw the selected price, edition and dimensions in both directions',()=>{
 const source=readFileSync(new URL('../src/scripts/collector.js',import.meta.url),'utf8');
 const render=source.slice(source.indexOf('function render()'),source.indexOf('async function load()'));
 const element=()=>({textContent:'',children:[],append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=nodes;},setAttribute(){}});
 const nodes=new Map();
 const $=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
 $('work-select').value='form/test.jpg';
 const work={id:'form/test.jpg',title:'Test',collection:'form',printType:'Silver Gelatin',formats:[
  {key:'standard',label:'Standard Format',edition:8,editionLabel:'8',sold:2,price:2750,currency:'EUR',width:75,height:105},
  {key:'large',label:'Large Format',edition:5,editionLabel:'5',sold:0,price:4250,currency:'EUR',width:100,height:150}
 ]};
 const context=vm.createContext({$,works:[work],selected:'standard',locale:'en',t:(s,v)=>collectorText('en',s,v),document:{createElement:element},Intl});
 vm.runInContext(render+';render();',context);
 assert.equal($('price').textContent,'€2,750 EUR');
 assert.equal($('availability').textContent,'Next available edition: 3 / 8');
 $('formats').children[1].onclick();
 assert.equal($('price').textContent,'€4,250 EUR');
 assert.equal($('availability').textContent,'Next available edition: 1 / 5');
 assert.equal($('dimensions').children[0].children[1].textContent,'100 × 150 cm');
 $('formats').children[0].onclick();
 assert.equal($('price').textContent,'€2,750 EUR');
 work.formats[1].price=null;
 $('formats').children[1].onclick();
 assert.equal($('price').textContent,'Price on enquiry');
 work.formats[1].soldOut=true;
 vm.runInContext('render()',context);
 assert.equal($('price').textContent,'Edition sold out');
});
