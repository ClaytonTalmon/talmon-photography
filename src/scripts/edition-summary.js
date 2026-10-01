// Display-only summary of saved studio prices; never infer unrecorded sales.
export function editionSummaries(catalog, prices) {
 return Object.fromEntries(catalog.map(work=>[work.id,work.formats.map(format=>{
  const entry=prices?.items?.[work.id+'::'+format.key];
  const sold=entry?.sold;
  const known=Number.isInteger(sold)&&sold>=0;
  const soldOut=known&&sold>=format.edition;
  const amount=known&&!soldOut?entry?.bands?.[Math.floor(sold/2)]:null;
  const price=soldOut?'Sold out':!known?'Price pending availability':amount==null?'Price on enquiry':new Intl.NumberFormat('en',{style:'currency',currency:entry.currency||'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(amount);
  const edition=soldOut?'Edition complete':known?`Next available: #${sold+1}/${format.edition}`:'Next edition: confirm availability';
  return `${format.label} · ${price} · ${edition}`;
 })]));
}
