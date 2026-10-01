import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/scripts/editions-editor.js',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('async function refreshSavedPrices(){'),source.indexOf("window.addEventListener('focus'"));
function setup(){
 let resolve,calls=0,published=0;
 const context=vm.createContext({state:{prices:{version:1}},priceDirty:false,priceRefreshPending:false,lastPriceRefresh:0,Date,
 api:()=>{calls++;return new Promise(r=>resolve=r)},publishPriceSummaries:()=>published++,pricing:()=>{},status:()=>{}});
 vm.runInContext(fn,context);
 return {context,run:()=>vm.runInContext('refreshSavedPrices()',context),complete:version=>resolve({prices:{version}}),calls:()=>calls,published:()=>published};
}
test('automatic refresh skips unsaved edits and duplicate requests',async()=>{
 const s=setup();s.context.priceDirty=true;await s.run();assert.equal(s.calls(),0);
 s.context.priceDirty=false;const pending=s.run();await s.run();assert.equal(s.calls(),1);
 s.complete(2);await pending;assert.equal(s.context.state.prices.version,2);assert.equal(s.published(),1);
});
test('late refresh never replaces a newer save or a signed-out session',async()=>{
 const s=setup();const pending=s.run();s.context.state.prices.version=3;s.complete(2);await pending;assert.equal(s.context.state.prices.version,3);
 const t=setup();const late=t.run();t.context.state=null;t.complete(2);await late;assert.equal(t.context.state,null);assert.equal(t.published(),0);
});
