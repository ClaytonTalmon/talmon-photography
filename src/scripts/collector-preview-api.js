import catalog from '../data/edition-catalog.mjs';
export function createPreviewApi() {
 const params=new URLSearchParams(location.search);
 // Keep every action inside the preview, including navigation away from forms.
 document.addEventListener('click',event=>{if(event.target.closest('a'))event.preventDefault();},true);
 if(params.get('stage')==='expired')document.getElementById('notice').textContent='Your 24-hour access has expired. You may request a new invitation.';
 const form=document.getElementById('access-request');
 form.elements.namedItem('name').value='Sample Collector';
 form.elements.namedItem('email').value='collector@example.com';
 const collections=(params.get('collections') || 'flow,form').split(',').filter(c=>catalog.some(w=>w.collection===c));
 for(const input of document.querySelectorAll('[name="collections"]'))input.checked=collections.includes(input.value);
 let unlocked=params.get('stage')==='acquisition';
 const announce=(event,data={})=>parent.postMessage({type:'collector-preview',event,...data},location.origin);
 return async (action,data={})=>{
  if(action==='catalog') {
   if(!unlocked) throw Error('Private access is required.');
   return {expires:Date.now()+86400000,works:catalog.filter(w=>collections.includes(w.collection)).map(w=>({...w,formats:w.formats.map(f=>({...f,sold:2,soldOut:false,price:2500,currency:'EUR'}))}))};
  }
  if(action==='unlock') {
   if(data.password!=='PREVIEW-ONLY') throw Error('For this preview, enter PREVIEW-ONLY. This is not a real access password.');
   unlocked=true;announce('unlocked');return {ok:true};
  }
  if(action==='logout'){unlocked=false;return {ok:true};}
  if(action==='request'){announce('requested',{record:{name:data.name,email:data.email,collections:data.collections,message:data.message,locale:'en'}});return {ok:true};}
  if(action==='enquiry'){announce('enquired');return {ok:true};}
  if(action==='subscribe'||action==='confirm-subscription')return {ok:true};
  throw Error('This action is not part of the preview.');
 };
}
