// Carry only public artwork context across language switches, never access tokens.
export function localizedContextLink(href, search, hash) {
 const source=new URLSearchParams(search), target=new URL(href, 'https://talmonphoto.com');
 for(const key of ['work','collection']) if(source.has(key)) target.searchParams.set(key,source.get(key));
 if(['#artwork','#unsubscribe-details'].includes(hash))target.hash=hash;
 return target.pathname+target.search+target.hash;
}
if(typeof document!=='undefined')for(const link of document.querySelectorAll('[data-language-link]')){
 link.setAttribute('href',localizedContextLink(link.getAttribute('href'),location.search,location.hash));
}
