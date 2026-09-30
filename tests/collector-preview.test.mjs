import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewApi} from '../src/scripts/collector-preview-api.js';
test('client preview uses only fixtures, restricts collections, and never calls the network',async()=>{
 const old={document:globalThis.document,location:globalThis.location,parent:globalThis.parent,fetch:globalThis.fetch};
 const events=[];
 try {
  globalThis.location={search:'?stage=request&collections=flow',origin:'https://example.com'};
  globalThis.parent={postMessage:data=>events.push(data)};
  globalThis.document={addEventListener(){},querySelectorAll:()=>[],getElementById:()=>({elements:{namedItem:()=>({value:''})}})};
  globalThis.fetch=()=>{throw Error('Preview must never access the network');};
  const api=createPreviewApi();
  await assert.rejects(api('catalog'));
  await assert.rejects(api('unlock',{password:'real-password'}));
  await api('unlock',{password:'PREVIEW-ONLY'});
  const data=await api('catalog');
  assert.ok(data.works.length>0);
  assert.ok(data.works.every(w=>w.collection==='flow'));
  assert.ok(data.works.every(w=>w.formats.every(f=>f.sold===2&&f.price===2500)));
  await api('request',{name:'Sample',email:'sample@example.com',collections:['flow']});
  await api('enquiry');await api('subscribe');
  assert.deepEqual(events.map(e=>e.event),['unlocked','requested','enquired']);
  await api('logout');await assert.rejects(api('catalog'));
 }finally{Object.assign(globalThis,old);}
});
