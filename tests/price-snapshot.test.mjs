import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../tools/Collection_Editor.html',import.meta.url),'utf8');
const logic=html.slice(html.indexOf("const PRICE_SNAPSHOT_KEY="),html.indexOf('function displayStudioPrices(){'));
test('snapshot survives reopening, is marked offline, and stores only display summaries',()=>{
 const saved=new Map();
 const make=()=>{const c=vm.createContext({localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},Date,displayStudioPrices(){}});vm.runInContext(logic,c);return c;};
 const first=make();vm.runInContext("receiveStudioPrices({'flow/a':['EUR 2500 · #1/8']},1000,true)",first);
 const reopened=make();assert.equal(vm.runInContext('pricesConnected',reopened),false);
 assert.equal(vm.runInContext('priceSnapshotTime',reopened),1000);
 assert.equal(vm.runInContext("studioPriceSummaries['flow/a'][0]",reopened),'EUR 2500 · #1/8');
 vm.runInContext('receiveStudioPrices(null)',reopened);assert.equal(vm.runInContext('priceSnapshotTime',reopened),1000);
 assert.deepEqual(Object.keys(JSON.parse([...saved.values()][0])).sort(),['summaries','time']);
});
