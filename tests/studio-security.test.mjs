import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {collectorReceipt,studioNotification} from '../netlify/lib/collector-emails.mjs';
test('embedded studio fetches omit ambient cookies and use only their explicit in-memory session',async()=>{
 const source=readFileSync(new URL('../src/scripts/editions-editor.js',import.meta.url),'utf8');
 const api=source.slice(source.indexOf('async function api('),source.indexOf('const option ='));
 const calls=[];
 const context=vm.createContext({embedded:true,embeddedSession:'',fetch:async(...args)=>{calls.push(args);return{ok:true,status:200,json:async()=>({ok:true})};}});
 vm.runInContext(api,context);
 await vm.runInContext("api('data')",context);
 assert.equal(calls[0][1].credentials,'omit');
 assert.equal(calls[0][1].headers['X-Studio-Session'],undefined);
 context.embeddedSession='explicit-test-session';
 await vm.runInContext("api('data')",context);
 assert.equal(calls[1][1].credentials,'omit');
 assert.equal(calls[1][1].headers['X-Studio-Session'],'explicit-test-session');
 context.embedded=false;
 await vm.runInContext("api('data')",context);
 assert.equal(calls[2][1].credentials,'same-origin');
});
test('untrusted collector text is escaped in branded email HTML',()=>{
 const record={id:'test',name:'<img src=x onerror=alert(1)>',email:'collector@example.com',message:'<script>alert(1)</script>',collections:['flow'],locale:'fr'};
 for(const email of [collectorReceipt(record),studioNotification(record,'https://talmonphoto.com','sample-token')]){
  assert.ok(!email.html.includes('<img src=x'));
  assert.ok(!email.html.includes('<script>'));
  assert.ok(email.html.includes('&lt;img'));
 }
});
