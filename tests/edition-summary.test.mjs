import test from 'node:test';
import assert from 'node:assert/strict';
import {editionSummaries} from '../src/scripts/edition-summary.js';
const catalog=[{id:'flow/test.jpg',formats:[{key:'standard',label:'Standard Format',edition:8}]}];
const summarize=entry=>editionSummaries(catalog,{items:{'flow/test.jpg::standard':entry}})['flow/test.jpg'][0];
test('saved pricing uses next edition and its correct price band',()=>{
 assert.match(summarize({sold:2,currency:'EUR',bands:[2000,2500,3000,3500]}),/€2,500.*#3\/8/);
 assert.match(summarize({sold:0,currency:'EUR',bands:[2000]}),/€2,000.*#1\/8/);
});
test('unknown, enquiry and sold-out availability never fabricate an edition',()=>{
 assert.match(summarize({sold:null,bands:[2000]}),/confirm availability/);
 assert.match(summarize(undefined),/confirm availability/);
 assert.match(summarize({sold:8,bands:[2000]}),/Sold out.*Edition complete/);
 assert.match(summarize({sold:3,bands:[2000,null]}),/Price on enquiry.*#4\/8/);
});
test('unrecorded sales still show saved starting price without claiming edition one',()=>{
 const text=summarize({sold:null,currency:'EUR',bands:[2750,3000]});
 assert.match(text,/Starting price: €2,750/);assert.match(text,/confirm availability/);assert.doesNotMatch(text,/#1\/8/);
});
