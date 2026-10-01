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
export function studioNotification(record,origin,approvalToken) {
 const {summary}=details(record), url=approvalToken ? origin+'/editions-editor/approve/#id='+record.id+'&token='+approvalToken : origin+'/editions-editor/#requests';
 const next='Studio notification only — no collector password has been issued for this request. Use the secure button below to review this request and send the collector their invitation. No GitHub sign-in is needed. This private link expires in 48 hours and can approve only this request. Do not forward it.';
 return {subject:'Studio action required — '+record.name,text:`STUDIO NOTIFICATION\n\n${record.name}\n${record.email}\n${summary}\n${record.message||'—'}\n\n${next}\n\nReview this request:\n${url}`,html:shell({title:'Collector request',intro:next,body:p(record.name)+p(record.email)+p(summary)+p(record.message||'—'),label:approvalToken ? 'Review & approve request' : 'Review collector requests',url})};
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

export function acquisitionEnquiry({name,email,work,format,sold,soldOut,price,currency,message,issued}) {
 const image='https://talmonphoto.com/_images/work/'+work.id.split('/').map(encodeURIComponent).join('/')+'-640.webp';
 const url='https://talmonphoto.com/en/editions/?work='+encodeURIComponent(work.id);
 const dimension=(w,h)=>`${w} × ${h} cm (${(w/2.54).toFixed(2)} × ${(h/2.54).toFixed(2)} in)`;
 const edition=soldOut?'Sold out':sold===null?'To be confirmed by the studio':`#${sold+1}/${format.edition}`;
 const amount=price===null?'Price on enquiry':new Intl.NumberFormat('en-GB',{style:'currency',currency}).format(price);
 const rows=[['Collector',name],['Email',email],['Collection',work.collection.toUpperCase()],['Photograph',work.title],['Image file',work.filename],['Format',format.label],['Next available edition',edition],['Acquisition price',amount],['Print process',work.printType],['Image size (W × H)',dimension(format.width,format.height)],['Finished paper (W × H)',dimension(Number((format.width+14).toFixed(2)),Number((format.height+17).toFixed(2)))],['Paper margins','Top, left and right: 7 cm; bottom: 10 cm'],['Received (UTC)',issued]];
 const note='Selection enquiry only. Price and next available edition recorded at submission; no edition has been reserved or sold. Confirm allocation and payment before authorizing production. Framing and shipping are not included.';
 const table='<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0">'+rows.map(([label,value])=>`<tr><td style="padding:10px 8px;border-bottom:1px solid #cbc7bd;font:12px Arial,sans-serif;vertical-align:top;color:#64625b">${escape(label)}</td><td style="padding:10px 8px;border-bottom:1px solid #cbc7bd;font:15px/1.5 Arial,sans-serif;color:#24231f">${escape(value)}</td></tr>`).join('')+'</table>';
 return {subject:'Acquisition enquiry — '+work.title+' — '+format.label+' — '+edition,text:rows.map(([k,v])=>`${k}: ${v}`).join('\n')+`\n\nPhotograph: ${image}\n\nCollector message: ${message||'—'}\n\n${note}\n\n${url}`,html:shell({title:'Acquisition enquiry',intro:'A collector has selected the following photograph.',body:`<img src="${escape(image)}" alt="${escape(work.title)}" width="560" style="display:block;width:100%;max-width:560px;height:auto" />`+table+p('Collector message')+p(message||'—')+p(note),label:'View photograph details',url})};
}
