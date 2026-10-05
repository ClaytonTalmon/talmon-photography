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
 const copy = {
  en: ['Hello {name},', 'Thank you for your interest in the collections. Your message has been received.', 'You will receive a 24 hour password after our team reviews your request.', 'Best regards,', 'The Talmon Studio Team'],
  fr: ['Bonjour {name},', 'Merci de votre intérêt pour les collections. Nous avons bien reçu votre message.', 'Vous recevrez un mot de passe valable 24 heures après examen de votre demande par notre équipe.', 'Bien cordialement,', 'L’équipe du studio Talmon'],
  de: ['Hallo {name},', 'Vielen Dank für Ihr Interesse an den Kollektionen. Wir haben Ihre Nachricht erhalten.', 'Nachdem unser Team Ihre Anfrage geprüft hat, erhalten Sie ein Passwort, das 24 Stunden gültig ist.', 'Mit freundlichen Grüßen', 'Das Talmon Studio Team'],
  es: ['Hola {name},', 'Gracias por su interés en las colecciones. Hemos recibido su mensaje.', 'Recibirá una contraseña válida durante 24 horas después de que nuestro equipo revise su solicitud.', 'Un cordial saludo,', 'El equipo de Talmon Studio'],
  it: ['Buongiorno {name},', 'Grazie per il suo interesse per le collezioni. Abbiamo ricevuto il suo messaggio.', 'Riceverà una password valida per 24 ore dopo che il nostro team avrà esaminato la sua richiesta.', 'Cordiali saluti,', 'Il team di Talmon Studio'],
  ja: ['{name}様', 'コレクションにご関心をお寄せいただきありがとうございます。メッセージを受け付けました。', 'チームがリクエストを確認した後、24時間有効なパスワードをお送りします。', 'どうぞよろしくお願いいたします。', 'Talmon Studio チーム'],
  zh: ['{name}，您好！', '感谢您对摄影系列的关注。我们已收到您的留言。', '团队审核您的申请后，您将收到一个有效期为24小时的密码。', '谨致问候，', 'Talmon Studio 团队'],
 };
 const [greeting, message, next, closing, team] = copy[validLocale(record.locale)] || copy.en;
 const firstName=String(record.name || '').trim().split(/\s+/u)[0];
 const intro=greeting.replace('{name}',firstName);
 const signature=`<p style="font:16px/1.7 Arial,sans-serif;margin:0 0 22px;color:#45443f">${escape(closing)}<br>${escape(team)}<br><a href="mailto:studio@talmonphoto.com" style="color:#45443f">studio@talmonphoto.com</a></p>`;
 return {subject:title+' — Talmon de l’Armée',text:`${intro}\n\n${message}\n${next}\n\n${closing}\n${team}\nstudio@talmonphoto.com\n\n${summary}\nhttps://talmonphoto.com`,html:shell({locale:record.locale,title,intro,body:p(message)+p(next)+signature+p(summary),label:t('View the photographs'),url:'https://talmonphoto.com/'+validLocale(record.locale)+'/work/'})};
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
 const copy = {
  en: ['Hello {name},', 'Please find your invitation password and paste it into the Personal Password box found on the Acquisition page.', 'If you would like to discuss a specific print or collection do not hesitate to reach out to our team.', 'Best regards,', 'The Talmon Studio Team'],
  fr: ['Bonjour {name},', 'Vous trouverez ci-dessous votre mot de passe d’invitation. Copiez-le dans le champ « Mot de passe personnel » de la page Acquisition.', 'Si vous souhaitez discuter d’un tirage ou d’une collection en particulier, n’hésitez pas à contacter notre équipe.', 'Bien cordialement,', 'L’équipe du studio Talmon'],
  de: ['Hallo {name},', 'Unten finden Sie Ihr Einladungspasswort. Kopieren Sie es in das Feld „Persönliches Passwort“ auf der Seite Erwerb.', 'Wenn Sie einen bestimmten Abzug oder eine Kollektion besprechen möchten, wenden Sie sich gerne an unser Team.', 'Mit freundlichen Grüßen', 'Das Talmon Studio Team'],
  es: ['Hola {name},', 'A continuación encontrará su contraseña de invitación. Péguela en el campo «Contraseña personal» de la página Adquisición.', 'Si desea hablar sobre una copia o colección en particular, no dude en ponerse en contacto con nuestro equipo.', 'Un cordial saludo,', 'El equipo de Talmon Studio'],
  it: ['Buongiorno {name},', 'Di seguito trova la sua password di invito. La incolli nel campo «Password personale» della pagina Acquisizione.', 'Se desidera parlare di una stampa o di una collezione in particolare, non esiti a contattare il nostro team.', 'Cordiali saluti,', 'Il team di Talmon Studio'],
  ja: ['{name}様', '以下の招待パスワードを、購入ページの「個人パスワード」欄に貼り付けてください。', '特定のプリントやコレクションについてご相談をご希望の場合は、お気軽にチームまでお問い合わせください。', 'どうぞよろしくお願いいたします。', 'Talmon Studio チーム'],
  zh: ['{name}，您好！', '请将下方的邀请密码复制并粘贴到购藏页面的“个人密码”栏中。', '如果您想了解某幅摄影作品或某个系列，欢迎随时与我们的团队联系。', '谨致问候，', 'Talmon Studio 团队'],
 };
 const [greeting, message, discussion, closing, team] = copy[locale] || copy.en;
 const intro=greeting.replace('{name}',String(record.name || '').trim().split(/\s+/u)[0]);
 const signature=`<p style="font:16px/1.7 Arial,sans-serif;margin:0 0 22px;color:#45443f">${escape(closing)}<br>${escape(team)}<br><a href="mailto:studio@talmonphoto.com" style="color:#45443f">studio@talmonphoto.com</a></p>`;
 const expiresText=t('Your private access expires {date}.',{date:new Date(expires).toLocaleString(locale,{timeZone:'UTC',timeZoneName:'short'})});
 const passwordHtml=`<div style="background:#faf9f5;border:1px solid #cbc7bd;padding:20px;margin:22px 0"><div style="font:12px Arial,sans-serif;margin-bottom:12px">${escape(t('Personal password'))}</div><div style="font:18px/1.6 monospace;color:#24231f;word-break:break-all;overflow-wrap:anywhere">${escape(password)}</div></div>`;
 return {subject:t('Your private editions access — 24 hours'),text:`${intro}\n\n${message}\n\n${t('Password')}: ${password}\n\n${t('View the collection')}:\n${url.href}\n${summary}\n\n${expiresText}\n\n${discussion}\n\n${closing}\n${team}\nstudio@talmonphoto.com\n\n${t('Framing and shipping are not included.')}`,html:shell({locale,title,intro,body:p(message)+passwordHtml+p(summary)+p(expiresText)+p(discussion)+signature+p(t('Framing and shipping are not included.')),label:t('View the collection'),url:url.href})};
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

export function contactReceipt({name, locale}) {
 const copy = {
  en: ['Thank you for getting in touch', 'Hello {name},', "Thank you for contacting Talmon Photo. Your message has been received.", 'Best regards,', 'The Talmon Studio Team', 'View the photographs'],
  fr: ['Merci de nous avoir contactés', 'Bonjour {name},', 'Merci de contacter Talmon Photo. Nous avons bien reçu votre message.', 'Bien cordialement,', 'L’équipe du studio Talmon', 'Voir les photographies'],
  de: ['Vielen Dank für Ihre Nachricht', 'Hallo {name},', 'Vielen Dank, dass Sie Talmon Photo kontaktiert haben. Wir haben Ihre Nachricht erhalten.', 'Mit freundlichen Grüßen', 'Das Talmon Studio Team', 'Fotografien ansehen'],
  es: ['Gracias por ponerse en contacto', 'Hola {name},', 'Gracias por contactar con Talmon Photo. Hemos recibido su mensaje.', 'Un cordial saludo,', 'El equipo de Talmon Studio', 'Ver las fotografías'],
  it: ['Grazie per averci contattato', 'Buongiorno {name},', 'Grazie per aver contattato Talmon Photo. Abbiamo ricevuto il suo messaggio.', 'Cordiali saluti,', 'Il team di Talmon Studio', 'Guarda le fotografie'],
  ja: ['お問い合わせありがとうございます', '{name}様', 'Talmon Photoにお問い合わせいただきありがとうございます。メッセージを受け付けました。', 'どうぞよろしくお願いいたします。', 'Talmon Studio チーム', '写真を見る'],
  zh: ['感谢您的联系', '{name}，您好！', '感谢您联系 Talmon Photo。我们已收到您的留言。', '谨致问候，', 'Talmon Studio 团队', '查看摄影作品'],
 };
 const [title, greeting, message, closing, team, label] = copy[validLocale(locale)] || copy.en;
 const firstName = String(name || '').trim().split(/\s+/u)[0];
 const intro = greeting.replace('{name}', firstName);
 const signature = `<p style="font:16px/1.7 Arial,sans-serif;margin:0 0 22px;color:#45443f">${escape(closing)}<br>${escape(team)}<br><a href="mailto:studio@talmonphoto.com" style="color:#45443f">studio@talmonphoto.com</a></p>`;
 return {subject:title + ' — Talmon de l’Armée',
  text: `${intro}\n\n${message}\n\n${closing}\n${team}\nstudio@talmonphoto.com\nhttps://talmonphoto.com`,
  html:shell({locale,title,intro,body:p(message)+signature,label,url:'https://talmonphoto.com/'+validLocale(locale)+'/work/'})};
}

export function mailingListConfirmation({name,locale,url}) {
 const t=text=>collectorText(locale,text);
 const copy={
  en:['Hello {name},','Thank you for your interest in Talmon Photo. Please confirm your email address below to receive occasional news of new work and exhibitions.','Confirm subscription','Best regards,','The Talmon Studio Team'],
  fr:['Bonjour {name},','Merci de votre intérêt pour Talmon Photo. Veuillez confirmer votre adresse e-mail ci-dessous pour recevoir occasionnellement des nouvelles des œuvres et des expositions.','Confirmer mon inscription','Bien cordialement,','L’équipe du studio Talmon'],
  de:['Hallo {name},','Vielen Dank für Ihr Interesse an Talmon Photo. Bitte bestätigen Sie unten Ihre E-Mail-Adresse, um gelegentlich Neuigkeiten zu neuen Arbeiten und Ausstellungen zu erhalten.','Anmeldung bestätigen','Mit freundlichen Grüßen','Das Talmon Studio Team'],
  es:['Hola {name},','Gracias por su interés en Talmon Photo. Confirme su dirección de correo electrónico a continuación para recibir noticias ocasionales sobre nuevas obras y exposiciones.','Confirmar suscripción','Un cordial saludo,','El equipo de Talmon Studio'],
  it:['Buongiorno {name},','Grazie per il suo interesse per Talmon Photo. Confermi il suo indirizzo e-mail qui sotto per ricevere occasionalmente notizie su nuove opere e mostre.','Conferma iscrizione','Cordiali saluti,','Il team di Talmon Studio'],
  ja:['{name}様','Talmon Photoにご関心をお寄せいただきありがとうございます。新作や展覧会のお知らせを受け取るには、下のボタンからメールアドレスをご確認ください。','登録を確認','どうぞよろしくお願いいたします。','Talmon Studio チーム'],
  zh:['{name}，您好！','感谢您关注 Talmon Photo。请点击下方按钮确认您的电子邮箱，以便偶尔收到新作与展览的消息。','确认订阅','谨致问候，','Talmon Studio 团队'],
 };
 const [greeting,message,label,closing,team]=copy[validLocale(locale)]||copy.en;
 const intro=greeting.replace('{name}',String(name||'').trim().split(/\s+/u)[0]);
 const title=t('Confirm your studio updates subscription');
 const notice=t('This link expires in 48 hours. If you did not request this, no action is needed.');
 const signature=`<p style="font:16px/1.7 Arial,sans-serif;margin:0 0 22px;color:#45443f">${escape(closing)}<br>${escape(team)}<br><a href="mailto:studio@talmonphoto.com" style="color:#45443f">studio@talmonphoto.com</a></p>`;
 return {subject:title,text:`${intro}\n\n${message}\n\n${label}:\n${url}\n\n${notice}\n\n${closing}\n${team}\nstudio@talmonphoto.com`,html:shell({locale,title,intro,body:p(message)+p(notice)+signature,label,url})};
}
