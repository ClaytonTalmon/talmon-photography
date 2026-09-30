import type { APIRoute } from 'astro';
import { collectorReceipt,collectorInvitation } from '../../../netlify/lib/collector-emails.mjs';
import catalog from '../../data/edition-catalog.mjs';
export const prerender = true;
const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export const GET: APIRoute = () => {
 const record={name:'Collector Name',locale:'en',collections:['flow'],work:catalog.find(w=>w.collection==='flow')?.id};
 const invitation=collectorInvitation(record,'https://willowy-pika-c392c9.netlify.app','PREVIEW-ONLY-NOT-A-VALID-PASSWORD',Date.UTC(2026,9,1,12));
 const receipt=collectorReceipt(record);
 return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Collector email previews</title></head><body style="margin:0;padding:24px;background:#e6e3db;color:#24231f;font:15px Arial,sans-serif"><main style="max-width:720px;margin:auto"><h1 style="font:32px Georgia,serif">Collector emails</h1><p>Design previews only. This example password does not grant access.</p><h2>After approval: personal invitation</h2><iframe title="Collector invitation preview" sandbox style="width:100%;height:920px;border:1px solid #cbc7bd" srcdoc="${escape(invitation.html)}"></iframe><h2>On request: acknowledgement</h2><iframe title="Request acknowledgement preview" sandbox style="width:100%;height:740px;border:1px solid #cbc7bd" srcdoc="${escape(receipt.html)}"></iframe></main></body></html>`,{headers:{'Content-Type':'text/html; charset=utf-8'}});
};
