const params = new URLSearchParams(location.hash.slice(1));
const credentials = {id:params.get('id'),token:params.get('token')};
// Keep the capability out of subsequent URLs and referrers.
history.replaceState({}, '', location.pathname);
const status = document.getElementById('approval-status');
const details = document.getElementById('approval-details');
const button = document.getElementById('approve-request');
async function api(action) {
 const response = await fetch('/.netlify/functions/editions?action='+action, {
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(credentials),cache:'no-store'
 });
 if (response.status >= 500 || response.status === 404)
  throw Error('The request service is temporarily unavailable. If you already clicked Approve, check the Studio Editor before trying again.');
 const data = await response.json();
 if (!response.ok) throw Error(data.error || 'Unable to open this request. Please use the Studio Editor.');
 return data;
}
async function review() {
 if (!credentials.id || !credentials.token) throw Error('Open the private review link in your latest studio notification email.');
 const record = await api('email-review');
 document.getElementById('collector-name').textContent = record.name;
 document.getElementById('collector-email').textContent = record.email;
 document.getElementById('collector-work').textContent = [...(record.collections || []).map(c=>c.toUpperCase()),record.work].filter(Boolean).join(' · ');
 document.getElementById('collector-message').textContent = record.message || '';
 status.textContent = 'Review the request below, then send the invitation.';
 details.hidden = false;
}
button.onclick = async () => {
 button.disabled = true;
 status.textContent = 'Sending the invitation…';
 try {
  await api('email-approve');
  details.hidden = true;
  status.textContent = 'Invitation sent. The collector has been emailed their personal password and collection link, with access valid for 24 hours.';
  credentials.token = null;
 } catch(error) {
  status.textContent = error.message;
  // A delivery failure may occur after the one-use link is consumed.
  details.hidden = true;
 }
};
review().catch(error=>{status.textContent=error.message;});
