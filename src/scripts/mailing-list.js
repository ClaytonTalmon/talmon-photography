import { collectorText } from '../i18n/collector.mjs';
const locale=location.pathname.split('/')[1], t=(text)=>collectorText(locale,text);
const $=id=>document.getElementById(id), params=new URLSearchParams(location.search);
const status=$('signup-status');
function notice(message,error=false) { status.textContent=t(message); status.classList.toggle('error',error); }
async function api(action,data) {
 const response=await fetch('/.netlify/functions/editions?action='+action,{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,locale}),cache:'no-store'
 });
 if(response.status>=500 || response.status===404) throw Error(t('The request service is temporarily unavailable. Please try again shortly.'));
 const result=await response.json();
 if(!response.ok) throw Error(t(result.error || 'Please try again.'));
 return result;
}
for (const [id,action,success] of [
 ['mailing-signup','subscribe','Please check your email to confirm your subscription.'],
 ['unsubscribe-form','request-unsubscribe','If this email is subscribed, an unsubscribe link will arrive shortly.']
]) {
 const form=$(id);
 form.onsubmit=async event=>{
  event.preventDefault();
  const button=form.querySelector('button');button.disabled=true;notice('Sending…');
  try {
   await api(action,{...Object.fromEntries(new FormData(form)),consent:form.querySelector('[name="consent"]')?.checked===true});
   form.reset();notice(success);
  } catch(error) { notice(error.message,true); }
  finally {button.disabled=false;}
 };
}
const unsubscribe=params.has('unsubscribe');
if(params.has('confirm') || unsubscribe) {
 $('subscription-confirmation').hidden=false;
 $('mailing-signup').hidden=true;
 const button=$('subscription-confirm');
 if(unsubscribe) {
  button.textContent=t('Unsubscribe');
  $('confirmation-description').textContent=t('Unsubscribe');
 }
 button.onclick=async()=>{
  button.disabled=true;
  try {
   await api(unsubscribe?'unsubscribe':'confirm-subscription',{subscriber:params.get('subscriber'),token:params.get(unsubscribe?'unsubscribe':'confirm')});
   $('subscription-confirmation').hidden=true;
   notice(unsubscribe?'Your subscription has been removed.':'You are on the studio mailing list. Thank you.');
   history.replaceState({},'',location.pathname);
  } catch(error) {notice(error.message,true);button.disabled=false;}
 };
}
if(location.hash==='#unsubscribe-details') $('unsubscribe-details').open=true;
