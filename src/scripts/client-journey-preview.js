import {collectorReceipt,studioNotification,collectorInvitation} from '../../netlify/lib/collector-emails.mjs';
const $=id=>document.getElementById(id);
const frame=$('journey-frame');
const sample=()=>({id:'preview',name:'Sample Collector',email:'collector@example.com',locale:'en',collections:['flow','form'],message:'I would like to enquire about works with matching edition numbers.'});
let record=sample(),index=0;
const steps=[
 ['Request','The collector requests access','Use the real request form below with sample details, or select Next to continue with the sample FORM and FLOW request.'],
 ['Receipt','The collector receives an acknowledgement','The actual acknowledgement email template, using the preview request details.'],
 ['Studio email','The studio receives the request','This email is for you. Its private review link normally opens approval without a GitHub sign-in. Links are disabled here; use Next.'],
 ['Approval','The studio approves access','Preview the approval action. Clicking the button here advances to the invitation; it sends nothing.'],
 ['Invitation','The collector receives a password','The actual invitation email template. PREVIEW-ONLY is a demonstration password and grants no real access.'],
 ['Password','The collector opens their invitation','Enter PREVIEW-ONLY to open the sample private view. Only the requested collections will appear.'],
 ['Acquisition','The collector views editions and prices','Illustrative example: next available edition 3, with a sample price of €2,500. Change photographs or formats and try “Enquire about this work”. Matching numbers are arranged with the studio.'],
 ['Expiry','Access ends after 24 hours','The private view closes and the collector can request a new invitation. This preview shows that return to the access form.']
];
function show(i){
 index=i;
 $('preview-status').textContent='';
 $('step-title').textContent=steps[i][1];$('step-description').textContent=steps[i][2];
 $('previous-step').disabled=i===0;$('next-step').disabled=i===steps.length-1;
 for(const [n,b] of [...$('preview-steps').children].entries()) n===i?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current');
 frame.hidden=false;
 frame.removeAttribute('srcdoc');frame.removeAttribute('src');
 if(i===3){
  frame.setAttribute('sandbox','allow-scripts allow-same-origin');
  frame.src='/editions-editor/preview/approval/?'+new URLSearchParams({name:record.name,email:record.email,collections:record.collections.join(' · ').toUpperCase(),message:record.message});return;
 }
 if([1,2,4].includes(i)){
  frame.setAttribute('sandbox','');
  const mail=i===1?collectorReceipt(record):i===2?studioNotification(record,location.origin,'PREVIEW-ONLY'):collectorInvitation(record,location.origin,'PREVIEW-ONLY',Date.now()+86400000);
  const emailDocument=new DOMParser().parseFromString(mail.html,'text/html');
  for(const link of emailDocument.querySelectorAll('a')){link.removeAttribute('href');link.setAttribute('aria-disabled','true');}
  frame.srcdoc='<!doctype html>'+emailDocument.documentElement.outerHTML;return;
 }
 frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms');
 const query=new URLSearchParams({stage:i===6?'acquisition':i===7?'expired':'request',collections:record.collections.join(',')});
 frame.src='/editions-editor/preview/collection/?'+query;
}
for(const [i,step] of steps.entries()){const b=document.createElement('button');b.type='button';b.textContent=(i+1)+'. '+step[0];b.onclick=()=>show(i);$('preview-steps').append(b);}
$('next-step').onclick=()=>show(Math.min(index+1,steps.length-1));$('previous-step').onclick=()=>show(Math.max(index-1,0));

$('preview-reset').onclick=()=>{record=sample();show(0);};
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='collector-preview')return;
 if(event.data.event==='approved'){show(4);$('preview-status').textContent='Preview: invitation issued. No email has been sent.';}
 if(event.data.event==='requested'){record={...sample(),...event.data.record};show(1);}
 if(event.data.event==='unlocked')$('preview-status').textContent='Preview unlocked. The collector can now view their requested collections.';
 if(event.data.event==='enquired')$('preview-status').textContent='Preview complete: the studio would receive this acquisition enquiry. Nothing was sent.';
});
show(0);
