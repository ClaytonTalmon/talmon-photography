import { collectorText, validLocale } from '../../src/i18n/collector.mjs';
import catalog from '../../src/data/edition-catalog.mjs';
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p = text => `<p style="font:16px/1.7 Arial,sans-serif;margin:0 0 22px;color:#45443f">${escape(text)}</p>`;
function shell({locale='en',title,intro,body,label,url}) {
 return `<!doctype html><html lang="${validLocale(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f2f0e9;color:#24231f"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px"><tr><td style="padding:0 8px 26px;border-bottom:1px solid #cbc7bd"><div style="font:26px Georgia,serif">Talmon de l’Armée</div><div style="font:10px Arial,sans-serif;letter-spacing:3px;margin-top:6px">PHOTOGRAPHY</div></td></tr><tr><td style="padding:32px 8px"><h1 style="font:normal 32px/1.2 Georgia,serif;margin:0 0 24px">${escape(title)}</h1>${p(intro)}${body}<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#24231f" style="padding:15px 24px"><a href="${escape(url)}" style="font:14px Arial,sans-serif;color:#ffffff;text-decoration:none;display:inline-block">${escape(label)}</a></td></tr></table></td></tr><tr><td style="padding:24px 8px;border-top:1px solid #cbc7bd;font:12px/1.7 Arial,sans-serif;color:#64625b">Talmon de l’Armée Photography<br><a href="https://talmonphoto.com" style="color:#64625b">talmonphoto.com</a></td></tr></table></td></tr></table></body></html>`;
}
function details(record) {
 const work=catalog.find(w=>w.id===record.work);
 return {work, summary:[record.collections?.map(c=>c.toUpperCase()).join(', '),work?.title].filter(Boolean).join(' · ')};
}
export function collectorReceipt(record) {
 const t=text=>collectorText(record.locale,text),{summary}=details(record);
 const title=t('Your request has been received');
 const intro=t('Thank you for your interest in the photographs of Talmon de l’Armée.');
 const next=t('The studio will review your request. Once reviewed, a separate invitation will contain your personal password and a link to the collection. Access will be valid for 24 hours from the time that invitation is issued.');
 return {subject:title+' — Talmon de l’Armée',text:`${record.name},\n\n${intro}\n${summary}\n\n${next}\n\nTalmon de l’Armée Photography\nhttps://talmonphoto.com`,html:shell({locale:record.locale,title,intro,body:p(record.name)+p(summary)+p(next),label:t('View the photographs'),url:'https://talmonphoto.com/'+validLocale(record.locale)+'/work/'})};
}
export function studioNotification(record,origin) {
 const {summary}=details(record), url=origin+'/editions-editor/#requests';
 const next='Studio notification only — no collector password has been issued for this request. Open Collector Requests and choose “Approve & email password” to send the collector their invitation.';
 return {subject:'Studio action required — '+record.name,text:`STUDIO NOTIFICATION\n\n${record.name}\n${record.email}\n${summary}\n${record.message||'—'}\n\n${next}\n\nReview collector requests:\n${url}`,html:shell({title:'Collector request',intro:next,body:p(record.name)+p(record.email)+p(summary)+p(record.message||'—'),label:'Review collector requests',url})};
}
export function collectorInvitation(record,origin,password,expires) {
 const t=(text,values)=>collectorText(record.locale,text,values),locale=validLocale(record.locale),{work,summary}=details(record);
 const url=new URL(`/${locale}/editions/`,'https://talmonphoto.com');
 if(work) url.searchParams.set('work',work.id);
 else if(record.collections?.length===1) url.searchParams.set('collection',record.collections[0]);
 const title=t('Your private collection access');
 const intro=t('You are invited to view editions and acquisition details.');
 const expiresText=t('Your private access expires {date}.',{date:new Date(expires).toLocaleString(locale,{timeZone:'UTC',timeZoneName:'short'})});
 const instructions=t('Open the collection and enter the personal password below. Your invitation is valid for 24 hours from issue.');
 const passwordHtml=`<div style="background:#faf9f5;border:1px solid #cbc7bd;padding:20px;margin:22px 0"><div style="font:12px Arial,sans-serif;margin-bottom:12px">${escape(t('Personal password'))}</div><div style="font:18px/1.6 monospace;color:#24231f;word-break:break-all;overflow-wrap:anywhere">${escape(password)}</div></div>`;
 return {subject:t('Your private editions access — 24 hours'),text:`${record.name},\n\n${intro}\n${summary}\n\n${instructions}\n\n${t('Password')}: ${password}\n\n${t('View the collection')}:\n${url.href}\n\n${expiresText}\n\n${t('Framing and shipping are not included.')}\n\nTalmon de l’Armée Photography`,html:shell({locale,title,intro,body:p(record.name)+p(summary)+p(instructions)+passwordHtml+p(expiresText)+p(t('Framing and shipping are not included.')),label:t('View the collection'),url:url.href})};
}
