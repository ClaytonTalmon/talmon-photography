import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {collectorText,supportedLocales} from '../src/i18n/collector.mjs';
import {localizedContextLink} from '../src/scripts/language-links.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const copy=JSON.parse(read('src/i18n/collector-copy.json'));
const variables=s=>[...s.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();
test('all collector translations preserve placeholders in all six translated languages',()=>{
 for(const [source,locales] of Object.entries(copy))for(const locale of supportedLocales.filter(l=>l!=='en')){
  assert.ok(locales[locale]?.trim(),`${locale}: ${source}`);
  assert.deepEqual(variables(locales[locale]),variables(source),`${locale}: ${source}`);
 }
});
test('public collector templates, forms, navigation and email copy have translations',()=>{
 for(const file of ['src/components/CollectorExperience.astro','src/components/Header.astro','src/components/Footer.astro','src/pages/[locale]/mailing-list.astro','src/scripts/collector.js','src/scripts/mailing-list.js','netlify/lib/collector-emails.mjs']){
  for(const match of read(file).matchAll(/\b(?:ct|t)\(\s*(["'])(.*?)\1/g))assert.ok(copy[match[2]],`${file}: ${match[2]}`);
 }
});
function loadTs(file){
 const module={exports:{}};
 const code=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 vm.runInNewContext(code,{exports:module.exports,module,require:name=>name==='./de'?loadTs('src/i18n/de.ts'):{default:JSON.parse(read('src/i18n/updates.json'))}});
 return module.exports;
}
test('main page dictionaries, collections and process captions cover every locale',()=>{
 const {getTranslations}=loadTs('src/i18n/translations.ts');
 function leaves(value,prefix=''){return Object.entries(value).flatMap(([k,v])=>typeof v==='object'&&v!==null?leaves(v,prefix+k+'.'):[prefix+k]);}
 const baseline=leaves(getTranslations('en'));
 for(const locale of supportedLocales){
  const value=getTranslations(locale);
  assert.deepEqual(leaves(value).sort(),[...baseline].sort(),locale);
  for(const key of baseline){const text=key.split('.').reduce((v,k)=>v[k],value);const original=key.split('.').reduce((v,k)=>v[k],getTranslations('en'));assert.ok(typeof text==='string'&&(!original.trim()||text.trim()),`${locale}:${key}`);}
 }
 for(const file of readdirSync(new URL('../src/content/series/',import.meta.url))){
  const value=JSON.parse(read('src/content/series/'+file));
  for(const key of ['title','subtitle','description'])for(const locale of supportedLocales)assert.equal(typeof value[key][locale],'string',`${file}:${key}:${locale}`);
 }
 const process=JSON.parse(read('src/data/process-layout.json'));
 for(const item of [...process.squares,...process.gallery])if(item.captions)for(const locale of supportedLocales)assert.equal(typeof item.captions[locale],'string',`${item.id}:${locale}`);
});
test('language switching retains the photograph but never copies credentials',()=>{
 const path=localizedContextLink('/fr/editions/','?work=flow%2FFAULT%20II.jpg&collection=flow&token=secret&confirm=secret&subscriber=private','#artwork');
 assert.equal(path,'/fr/editions/?work=flow%2FFAULT+II.jpg&collection=flow#artwork');
 assert.equal(localizedContextLink('/de/editions/','?password=secret','#token=secret'),'/de/editions/');
 assert.equal(collectorText('fr','Next available edition: {next} / {total}',{next:3,total:8}),'Prochain exemplaire disponible : 3 / 8');
});
